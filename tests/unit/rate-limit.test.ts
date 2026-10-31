import { describe, expect, it } from 'vitest';
import { RateLimiter } from '@/lib/rate-limit';

describe('rate limiter', () => {
  it('allows a limited number of requests', () => {
    const limiter = new RateLimiter(60_000, 2);
    expect(limiter.allow('abc').allowed).toBe(true);
    expect(limiter.allow('abc').allowed).toBe(true);
    expect(limiter.allow('abc').allowed).toBe(false);
  });
});
