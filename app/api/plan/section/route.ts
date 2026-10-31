import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eventInputSchema } from '@/lib/validation/schemas';
import { RateLimiter } from '@/lib/rate-limit';
import { generatePlan } from '@/lib/ai/client';

const rateLimiter = new RateLimiter(60_000, 10);

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const rateLimitResult = rateLimiter.allow(ip);
  if (!rateLimitResult.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) } });
  }

  try {
    const body = await request.json();
    const data = eventInputSchema.parse(body);
    const result = await generatePlan(data);
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to regenerate section' }, { status: 500 });
  }
}
