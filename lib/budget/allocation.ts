export type BudgetCategory =
  | 'venue'
  | 'food'
  | 'decor'
  | 'entertainment'
  | 'photography'
  | 'miscellaneous';

export type BudgetBreakdown = Record<BudgetCategory, { amount: number; percent: number }>;

const defaultAllocation: Record<BudgetCategory, number> = {
  venue: 28,
  food: 26,
  decor: 18,
  entertainment: 14,
  photography: 8,
  miscellaneous: 6
};

export function calculateBudgetBreakdown(totalBudget: number): BudgetBreakdown {
  const normalized = Object.entries(defaultAllocation).reduce((acc, [category, percent]) => {
    acc[category as BudgetCategory] = {
      amount: Math.round((totalBudget * percent) / 100),
      percent
    };
    return acc;
  }, {} as BudgetBreakdown);

  const total = Object.values(normalized).reduce((sum, item) => sum + item.amount, 0);
  const difference = totalBudget - total;
  normalized.miscellaneous.amount += difference;

  return normalized;
}

export function isOverBudget(actualSpends: Record<string, number>, totalBudget: number): boolean {
  const totalSpent = Object.values(actualSpends).reduce((sum, amount) => sum + Number(amount || 0), 0);
  return totalSpent > totalBudget;
}

export function getRemainingBudget(actualSpends: Record<string, number>, totalBudget: number): number {
  const totalSpent = Object.values(actualSpends).reduce((sum, amount) => sum + Number(amount || 0), 0);
  return totalBudget - totalSpent;
}
