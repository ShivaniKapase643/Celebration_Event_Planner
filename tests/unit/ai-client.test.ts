import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generatePlan } from '@/lib/ai/client';

describe('AI client', () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
  });

  it('falls back to demo mode when api key is missing', async () => {
    const result = await generatePlan({
      eventType: 'birthday',
      title: 'Demo Birthday',
      date: '2035-02-10',
      guestCount: 45,
      budget: 80000,
      city: 'Nashik',
      theme: 'Rooftop glow',
      dietaryNeeds: ['vegetarian'],
      accessibilityNeeds: 'Step-free venue',
      language: 'en'
    });

    expect(result.demoMode).toBe(true);
    expect(result.plan.title).toBe('Demo Birthday');
    expect(result.plan.eventType).toBe('birthday');
    expect(result.plan.summary).toContain('Nashik');
    expect(Object.values(result.plan.sections.budget).reduce((total, item) => total + item.amount, 0)).toBe(80000);
    expect(result.plan.budget).toBe(80000);
  });

  it('returns a valid plan when forced into demo mode', async () => {
    const result = await generatePlan({
      eventType: 'festival_party',
      title: 'Festival Night',
      date: '2036-11-12',
      guestCount: 300,
      budget: 500000,
      city: 'Pune',
      theme: 'Lantern glow',
      dietaryNeeds: ['vegan', 'halal'],
      accessibilityNeeds: '',
      language: 'mr'
    }, true);

    expect(result.demoMode).toBe(true);
    expect(result.plan.eventType).toBe('festival_party');
    expect(result.plan.summary).toContain('येथे');
    expect(result.plan.sections.budget.venue.amount).toBeGreaterThan(0);
  });
});
