import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventInputSchema } from '@/lib/validation/schemas';
import { RateLimiter } from '@/lib/rate-limit';
import { InMemoryCache } from '@/lib/cache';
import { generatePlan } from '@/lib/ai/client';

const rateLimiter = new RateLimiter(60_000, 10);
const cache = new InMemoryCache<{ plan: unknown; demoMode: boolean }>(60 * 60 * 1000, 100);

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') ?? 'local';
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > 16_384) {
    return NextResponse.json({ error: 'Request is too large' }, { status: 413 });
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > 16_384) {
    return NextResponse.json({ error: 'Request is too large' }, { status: 413 });
  }
  const ip = getClientIp(request);
  const rateLimitResult = rateLimiter.allow(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) } });
  }

  try {
    const body = JSON.parse(raw);
    const parsedInput = eventInputSchema.parse(body);
    const cacheKey = JSON.stringify({ ...parsedInput, description: parsedInput.description ?? '' });

    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, ...cached });
    }

    const result = await generatePlan(parsedInput);
    cache.set(cacheKey, result);

    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unable to generate plan right now' }, { status: 500 });
  }
}
