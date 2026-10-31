export type RateLimitEntry = {
  timestamps: number[];
};

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(windowMs = 60_000, maxRequests = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  allow(key: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const existing = this.entries.get(key) ?? { timestamps: [] };
    const recent = existing.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    if (recent.length >= this.maxRequests) {
      const nextReset = recent[0] + this.windowMs;
      this.entries.set(key, { timestamps: recent });
      return { allowed: false, retryAfterMs: Math.max(0, nextReset - now) };
    }

    recent.push(now);
    this.entries.set(key, { timestamps: recent });
    return { allowed: true, retryAfterMs: 0 };
  }
}
