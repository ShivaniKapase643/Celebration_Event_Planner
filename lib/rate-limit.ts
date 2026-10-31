export type RateLimitEntry = {
  timestamps: number[];
};

export class RateLimiter {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxEntries: number;
  private readonly entries = new Map<string, RateLimitEntry>();

  constructor(windowMs = 60_000, maxRequests = 10, maxEntries = 10_000) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxEntries = maxEntries;
  }

  allow(key: string): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const existing = this.entries.get(key) ?? { timestamps: [] };
    const recent = existing.timestamps.filter((timestamp) => now - timestamp < this.windowMs);

    // Keep the map bounded even if callers can supply arbitrarily many keys.
    // Refresh insertion order so the least recently used key is evicted first.
    this.entries.delete(key);

    if (recent.length >= this.maxRequests) {
      const nextReset = recent[0] + this.windowMs;
      this.entries.set(key, { timestamps: recent });
      return { allowed: false, retryAfterMs: Math.max(0, nextReset - now) };
    }

    recent.push(now);
    if (!existing.timestamps.length && this.entries.size >= this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey !== undefined) this.entries.delete(oldestKey);
    }
    this.entries.set(key, { timestamps: recent });
    return { allowed: true, retryAfterMs: 0 };
  }
}
