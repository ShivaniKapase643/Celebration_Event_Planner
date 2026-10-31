import { describe, expect, it } from 'vitest';
import { calculateDeadlineOffset, createTaskDeadlines } from '@/lib/dates/deadlines';

describe('date logic', () => {
  it('returns a relative countdown string', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(calculateDeadlineOffset(future)).toContain('T-');
  });

  it('returns due now for past dates', () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    expect(calculateDeadlineOffset(past)).toBe('Due now');
  });

  it('creates deadline list for event tasks', () => {
    const tasks = createTaskDeadlines('2030-03-20');
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0].deadline).toContain('T-');
    expect(tasks).toContainEqual({ title: 'Confirm venue', deadline: 'T-30 days' });
  });
});
