import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGeneratePlan = vi.hoisted(() => vi.fn());
vi.mock('@/lib/ai/client', () => ({
  generatePlan: mockGeneratePlan
}));

beforeEach(() => {
  mockGeneratePlan.mockResolvedValue({
    plan: {
      planId: 'p2',
      eventType: 'anniversary',
      title: 'Anniversary',
      date: '2035-06-01',
      guestCount: 40,
      budget: 90000,
      city: 'Mumbai',
      theme: 'Classic',
      dietaryNeeds: ['vegetarian'],
      accessibilityNeeds: 'Wheelchair access',
      language: 'hi',
      summary: 'Warm celebration',
      sections: {
        timeline: [{ id: 's1', title: 'Send invites', deadline: 'T-15 days', priority: 'high', category: 'Guests', done: false }],
        budget: {
          venue: { amount: 28000, percent: 31 },
          food: { amount: 22000, percent: 24 },
          decor: { amount: 15000, percent: 17 },
          entertainment: { amount: 12000, percent: 13 },
          photography: { amount: 7000, percent: 8 },
          miscellaneous: { amount: 6000, percent: 7 }
        },
        menu: { starters: ['x'], mains: ['y'], desserts: ['z'], drinks: ['a'] },
        decor: ['Warm lights'],
        invitation: { subject: 'Invitation', body: 'Come join us', toast: 'Cheers' },
        contingency: ['Backup plan']
      },
      createdAt: '2026-01-01'
    },
    demoMode: true
  });
});

import { POST as createPlan } from '@/app/api/plan/route';

describe('demo API route', () => {
  it('handles a valid plan request in demo mode', async () => {
    const request = new NextRequest('http://localhost/api/plan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        eventType: 'wedding',
        title: 'Test wedding',
        date: '2036-05-15',
        guestCount: 120,
        budget: 200000,
        city: 'Nagpur',
        theme: 'Royal',
        dietaryNeeds: ['vegetarian'],
        accessibilityNeeds: '',
        language: 'mr'
      })
    });

    const response = await createPlan(request);
    expect(response.status).toBe(200);
  });
});
