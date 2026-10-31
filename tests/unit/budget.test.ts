import { describe, expect, it } from 'vitest';
import { calculateBudgetBreakdown, getRemainingBudget, isOverBudget } from '@/lib/budget/allocation';

describe('budget allocation', () => {
  it('allocates budget and sums to total', () => {
    const result = calculateBudgetBreakdown(250000);
    const total = Object.values(result).reduce((sum, item) => sum + item.amount, 0);
    expect(total).toBe(250000);
    expect(result.venue.percent).toBe(28);
  });

  it('detects over-budget status', () => {
    expect(isOverBudget({ venue: 80000, food: 50000 }, 120000)).toBe(true);
    expect(getRemainingBudget({ venue: 30000, food: 20000 }, 100000)).toBe(50000);
  });
});
