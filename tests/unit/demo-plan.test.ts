import { describe, expect, it } from 'vitest';
import { buildDemoPlan } from '@/lib/planner/demo-plan';
import type { EventInput } from '@/types';

const eventInput: EventInput = {
  eventType: 'anniversary',
  title: 'Garden anniversary',
  date: '2036-05-15',
  guestCount: 40,
  budget: 90001,
  city: 'Mumbai',
  theme: 'Candlelit garden',
  dietaryNeeds: ['vegetarian'],
  accessibilityNeeds: 'Step-free access',
  language: 'en'
};

describe('localized demo plans', () => {
  it('uses the selected language in fallback summaries', () => {
    const hindiPlan = buildDemoPlan({ ...eventInput, language: 'hi' });
    const marathiPlan = buildDemoPlan({ ...eventInput, language: 'mr' });

    expect(hindiPlan.summary).toContain('में');
    expect(marathiPlan.summary).toContain('येथे');
    expect(hindiPlan.language).toBe('hi');
    expect(marathiPlan.language).toBe('mr');
  });

  it('preserves the event details and exact budget in demo mode', () => {
    const plan = buildDemoPlan(eventInput);
    const allocated = Object.values(plan.sections.budget).reduce((total, item) => total + item.amount, 0);

    expect(plan.title).toBe(eventInput.title);
    expect(plan.eventType).toBe(eventInput.eventType);
    expect(plan.date).toBe(eventInput.date);
    expect(plan.guestCount).toBe(eventInput.guestCount);
    expect(plan.city).toBe(eventInput.city);
    expect(plan.theme).toBe(eventInput.theme);
    expect(allocated).toBe(eventInput.budget);
  });

  it('supplies editable defaults when optional demo form values are empty', () => {
    const plan = buildDemoPlan({
      ...eventInput,
      title: '',
      date: '',
      guestCount: 0,
      budget: 0,
      city: '',
      theme: '',
      dietaryNeeds: [],
      accessibilityNeeds: '',
      eventTime: undefined,
      venueType: undefined
    });

    expect(plan.title).toBe('Sunset Birthday Bash');
    expect(plan.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(plan.guestCount).toBe(60);
    expect(plan.budget).toBe(200000);
    expect(plan.city).toBe('Pune');
    expect(plan.theme).toBe('Warm sunset garden');
    expect(plan.accessibilityNeeds).toBe('Ramp access and quiet seating area');
    expect(plan.eventTime).toBe('18:00');
    expect(plan.venueType).toBe('outdoor');
    expect(plan.dietaryNeeds).toEqual(['vegetarian', 'gluten_free']);
    expect(plan.summary).toContain('your city');
    expect(Object.values(plan.sections.budget).reduce((total, item) => total + item.amount, 0)).toBe(200000);
  });
});
