import { describe, expect, it } from 'vitest';
import { eventInputSchema } from '@/lib/validation/schemas';

const validInput = {
  eventType: 'birthday',
  title: 'Sunset birthday',
  date: '2030-02-15',
  guestCount: 80,
  budget: 250000,
  city: 'Pune',
  theme: 'Modern sparkle',
  dietaryNeeds: ['vegetarian'],
  accessibilityNeeds: 'Wheelchair access',
  language: 'en' as const,
  description: 'A vibrant indoor celebration with warm lighting.'
};

describe('zod validation', () => {
  it('accepts valid event input', () => {
    const result = eventInputSchema.parse(validInput);
    expect(result.title).toBe('Sunset birthday');
    expect(result.date).toBe('2030-02-15');
  });

  it('strictly validates each field constraint', () => {
    const invalidCases = [
      { field: 'eventType', value: 'invalid_type', expected: 'Invalid enum value' },
      { field: 'title', value: 'A', expected: 'String must contain at least 2 character(s)' },
      { field: 'date', value: '2020-01-01', expected: 'Event date must be in the future' },
      { field: 'date', value: 'not-a-date', expected: 'Invalid date' },
      { field: 'guestCount', value: 0, expected: 'Number must be greater than or equal to 1' },
      { field: 'guestCount', value: 5001, expected: 'Number must be less than or equal to 5000' },
      { field: 'budget', value: 0, expected: 'Number must be greater than 0' },
      { field: 'guestCount', value: 2001, expected: 'Number must be less than or equal to 2000' },
      { field: 'budget', value: 100000001, expected: 'Number must be less than or equal to 100000000' },
      { field: 'city', value: 'P', expected: 'String must contain at least 2 character(s)' },
      { field: 'theme', value: 'T', expected: 'String must contain at least 2 character(s)' },
      { field: 'dietaryNeeds', value: [], expected: 'Array must contain at least 1 element(s)' },
      { field: 'dietaryNeeds', value: ['unknown'], expected: 'Invalid enum value' },
      { field: 'accessibilityNeeds', value: 'x'.repeat(201), expected: 'String must contain at most 200 character(s)' },
      { field: 'language', value: 'fr', expected: 'Invalid enum value' },
      { field: 'description', value: 'x'.repeat(501), expected: 'String must contain at most 500 character(s)' }
    ];

    for (const invalidCase of invalidCases) {
      const payload = { ...validInput, [invalidCase.field]: invalidCase.value };

      expect(() => eventInputSchema.parse(payload), `should reject invalid ${invalidCase.field}`).toThrow();
    }
  });

  it('rejects invalid future date and empty required fields', () => {
    expect(() => eventInputSchema.parse({ ...validInput, title: '' })).toThrow();
    expect(() => eventInputSchema.parse({ ...validInput, city: '' })).toThrow();
    expect(() => eventInputSchema.parse({ ...validInput, theme: '' })).toThrow();
    expect(() => eventInputSchema.parse({ ...validInput, dietaryNeeds: [] })).toThrow();
  });
});
