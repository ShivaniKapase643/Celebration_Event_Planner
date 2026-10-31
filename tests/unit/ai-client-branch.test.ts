import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generatePlan } from '@/lib/ai/client';

const mockGeminiGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent: mockGeminiGenerateContent };
  }
}));

describe('AI client branches', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key';
    process.env.GEMINI_MODEL = 'gemini-2.0-flash';
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        planId: 'real-1',
        eventType: 'corporate',
        title: 'Annual event',
        date: '2037-03-20',
        guestCount: 200,
        budget: 400000,
        city: 'Delhi',
        theme: 'Modern corporate',
        dietaryNeeds: ['vegetarian'],
        accessibilityNeeds: 'Elevator access',
        language: 'en',
        summary: 'A polished corporate celebration.',
        sections: {
          timeline: [{ id: 'x1', title: 'Finalize speaker', deadline: 'T-15 days', priority: 'high', category: 'Events', done: false }],
          budget: {
            venue: { amount: 120000, percent: 30 },
            food: { amount: 100000, percent: 25 },
            decor: { amount: 80000, percent: 20 },
            entertainment: { amount: 60000, percent: 15 },
            photography: { amount: 24000, percent: 6 },
            miscellaneous: { amount: 16000, percent: 4 }
          },
          menu: { starters: ['Salad'], mains: ['Pasta'], desserts: ['Cake'], drinks: ['Tea'] },
          decor: ['Minimal lighting'],
          invitation: { subject: 'Invitation', body: 'We invite you', toast: 'Thank you' },
          contingency: ['Weather backup']
        },
        createdAt: new Date().toISOString()
      })
    });
  });

  it('uses the real Gemini path when an API key exists', async () => {
    const result = await generatePlan({
      eventType: 'corporate',
      title: 'Annual event',
      date: '2037-03-20',
      guestCount: 200,
      budget: 400000,
      city: 'Delhi',
      theme: 'Modern corporate',
      dietaryNeeds: ['vegetarian'],
      accessibilityNeeds: 'Elevator access',
      language: 'en'
    });

    expect(result.demoMode).toBe(false);
    expect(result.plan.title).toBe('Annual event');
  });

  it('rejects malformed Gemini JSON instead of returning an unvalidated plan', async () => {
    mockGeminiGenerateContent.mockResolvedValueOnce({ text: 'not JSON' });

    await expect(generatePlan({
      eventType: 'birthday', title: 'Birthday bash', date: '2038-06-10', guestCount: 80,
      budget: 150000, city: 'Mumbai', theme: 'Sunset party', dietaryNeeds: [],
      accessibilityNeeds: 'Ramp access', language: 'en'
    })).rejects.toBeInstanceOf(SyntaxError);
  });

  it('rejects Gemini JSON that does not match the event plan schema', async () => {
    mockGeminiGenerateContent.mockResolvedValueOnce({ text: '{}' });

    await expect(generatePlan({
      eventType: 'birthday', title: 'Birthday bash', date: '2038-06-10', guestCount: 80,
      budget: 150000, city: 'Mumbai', theme: 'Sunset party', dietaryNeeds: [],
      accessibilityNeeds: 'Ramp access', language: 'en'
    })).rejects.toHaveProperty('name', 'ZodError');
  });

  it('falls back to the default Gemini model when GEMINI_MODEL is unset', async () => {
    delete process.env.GEMINI_MODEL;

    const result = await generatePlan({
      eventType: 'birthday',
      title: 'Birthday bash',
      date: '2038-06-10',
      guestCount: 80,
      budget: 150000,
      city: 'Mumbai',
      theme: 'Sunset party',
      dietaryNeeds: ['vegan'],
      accessibilityNeeds: 'Ramp access',
      language: 'en'
    });

    expect(result.demoMode).toBe(false);
    expect(mockGeminiGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-2.0-flash' })
    );
  });

  it('uses demo mode when forceDemo is enabled even with a key', async () => {
    const result = await generatePlan({
      eventType: 'wedding',
      title: 'Wedding weekend',
      date: '2038-12-23',
      guestCount: 180,
      budget: 650000,
      city: 'Jaipur',
      theme: 'Royal elegance',
      dietaryNeeds: [],
      accessibilityNeeds: 'Wheelchair access',
      language: 'hi'
    }, true);

    expect(result.demoMode).toBe(true);
    expect(result.plan.title).toBe('Wedding weekend');
    expect(result.plan.dietaryNeeds).toEqual(expect.arrayContaining(['vegetarian']));
    expect(result.plan.budget).toBe(650000);
    expect(Object.values(result.plan.sections.budget).reduce((total, item) => total + item.amount, 0)).toBe(650000);
  });
});
