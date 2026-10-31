import { describe, expect, it, beforeEach, vi } from 'vitest';
import { readStorage, writeStorage, removeStorage } from '@/lib/storage/helpers';

describe('storage helper', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads and writes safely', () => {
    writeStorage('plan', { a: 1 });
    expect(readStorage('plan', { a: 0 })).toEqual({ a: 1 });
  });

  it('returns a fallback when the stored value is invalid or unavailable', () => {
    expect(readStorage('missing', { a: 0 })).toEqual({ a: 0 });

    window.localStorage.setItem('broken-json', '{');
    expect(readStorage('broken-json', { a: 0 })).toEqual({ a: 0 });

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('read failed');
    });

    expect(readStorage('throws', { a: 0 })).toEqual({ a: 0 });
  });

  it('ignores write and remove failures silently', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('write failed');
    });
    expect(() => writeStorage('plan', { a: 1 })).not.toThrow();

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('remove failed');
    });
    expect(() => removeStorage('plan')).not.toThrow();
  });

  it('returns the fallback when window is unavailable', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true
    });

    try {
      expect(readStorage('plan', { a: 0 })).toEqual({ a: 0 });
      expect(writeStorage('plan', { a: 1 })).toBeUndefined();
      expect(removeStorage('plan')).toBeUndefined();
    } finally {
      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        configurable: true
      });
    }
  });
});
