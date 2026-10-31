import { describe, expect, it, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGeneratePlan = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ai/client', () => ({
  generatePlan: mockGeneratePlan
}));

import { POST as createPlan } from '@/app/api/plan/route';

afterEach(() => {
  vi.clearAllMocks();
});

describe('plan API route', () => {
  it('accepts a valid request', async () => {
    mockGeneratePlan.mockResolvedValue({ plan: { planId: 'p1', eventType: 'birthday', title: 'Test', date: '2030-05-16', guestCount: 20, budget: 120000, city: 'Pune', theme: 'Garden', dietaryNeeds: ['vegetarian'], accessibilityNeeds: 'Ramp', language: 'en', summary: 'Demo', sections: { timeline: [], budget: { venue: { amount: 30000, percent: 25 }, food: { amount: 25000, percent: 21 }, decor: { amount: 20000, percent: 17 }, entertainment: { amount: 15000, percent: 13 }, photography: { amount: 10000, percent: 8 }, miscellaneous: { amount: 10000, percent: 8 } }, menu: { starters: ['x'], mains: ['y'], desserts: ['z'], drinks: ['k'] }, decor: ['a'], invitation: { subject: 'Hi', body: 'Hello', toast: 'Cheers' }, contingency: ['Rain backup'] }, createdAt: '2024-01-01' }, demoMode: false });

    const request = new NextRequest('http://localhost/api/plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventType: 'birthday',
        title: 'Sunset birthday',
        date: '2035-05-16',
        guestCount: 80,
        budget: 250000,
        city: 'Pune',
        theme: 'Garden',
        dietaryNeeds: ['vegetarian'],
        accessibilityNeeds: 'Ramp access',
        language: 'en'
      })
    });

    const response = await createPlan(request);
    expect(response.status).toBe(200);
  });

  it('rejects invalid body', async () => {
    const request = new NextRequest('http://localhost/api/plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventType: 'birthday', title: '', date: '2020-01-01', guestCount: 0, budget: 100, city: '', theme: '', dietaryNeeds: [], accessibilityNeeds: '', language: 'en' })
    });

    const response = await createPlan(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 for malformed JSON', async () => {
    const request = new NextRequest('http://localhost/api/plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{invalid'
    });

    const response = await createPlan(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON' });
  });
});
