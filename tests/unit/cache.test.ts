import { describe, expect, it } from 'vitest';
import { InMemoryCache } from '@/lib/cache';

describe('cache', () => {
  it('stores and retrieves values', () => {
    const cache = new InMemoryCache<string>(60_000, 10);
    cache.set('abc', 'value');
    expect(cache.get('abc')).toBe('value');
    cache.delete('abc');
    expect(cache.get('abc')).toBeUndefined();
  });
});
