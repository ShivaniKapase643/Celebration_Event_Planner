import { describe, expect, it } from 'vitest';
import { RateLimiter } from '@/lib/rate-limit';

describe('rate limiter', () => {
  it('allows a limited number of requests', () => {
    const limiter = new RateLimiter(60_000, 2);
    expect(limiter.allow('abc').allowed).toBe(true);
    expect(limiter.allow('abc').allowed).toBe(true);
    expect(limiter.allow('abc').allowed).toBe(false);
  });

  it('bounds stored client keys and evicts the least recently used key', () => {
    const limiter = new RateLimiter(60_000, 1, 2);
    expect(limiter.allow('first').allowed).toBe(true);
    expect(limiter.allow('second').allowed).toBe(true);

    // Touch the first key, making the second key the least recently used.
    expect(limiter.allow('first').allowed).toBe(false);
    expect(limiter.allow('third').allowed).toBe(true);

    // The first key is still rate limited, while the evicted second key starts fresh.
    expect(limiter.allow('first').allowed).toBe(false);
    expect(limiter.allow('second').allowed).toBe(true);
  });
});
