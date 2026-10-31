import { z } from 'zod';

export const dietaryNeedsEnum = ['vegetarian', 'vegan', 'jain', 'halal', 'gluten_free', 'none'] as const;
export const eventTypeEnum = ['birthday', 'wedding', 'anniversary', 'baby_shower', 'housewarming', 'graduation', 'festival_party', 'corporate', 'farewell', 'custom'] as const;
export const outputLanguageEnum = ['en', 'hi', 'mr'] as const;
export const venueTypeEnum = ['home', 'banquet', 'outdoor', 'restaurant'] as const;
export const priorityEnum = ['low', 'medium', 'high'] as const;

export const sanitizeString = (value: string) => value.replace(/[\u0000-\u001F\u007F]/g, '').trim();

const isTodayOrFuture = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected.getFullYear() === year && selected.getMonth() === month - 1 && selected.getDate() === day && selected >= today;
};

export const eventInputSchema = z.object({
  eventType: z.enum(eventTypeEnum),
  title: z.string().trim().min(2).max(120).transform(sanitizeString),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Invalid date'
  }).transform((value) => new Date(value).toISOString().slice(0, 10)),
  guestCount: z.coerce.number().int().min(1).max(2000),
  budget: z.coerce.number().int().positive().max(100000000),
  city: z.string().trim().min(2).max(80).transform(sanitizeString),
  theme: z.string().trim().min(2).max(150).transform(sanitizeString),
  dietaryNeeds: z.array(z.enum(dietaryNeedsEnum)).min(1).max(6),
  accessibilityNeeds: z.string().trim().max(200).transform(sanitizeString),
  language: z.enum(outputLanguageEnum),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).default('18:00'),
  venueType: z.enum(venueTypeEnum).default('outdoor'),
  description: z.string().trim().max(500).optional().transform((value) => value ? sanitizeString(value) : value)
}).refine((data) => isTodayOrFuture(data.date), {
  message: 'Event date must be today or in the future',
  path: ['date']
});

export const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(120),
  deadline: z.string().min(1),
  priority: z.enum(priorityEnum),
  category: z.string().min(1).max(60),
  done: z.boolean(),
  dueDate: z.string().optional()
});

export const budgetBreakdownSchema = z.object({
  venue: z.object({ amount: z.number().nonnegative(), percent: z.number().min(0).max(100) }),
  food: z.object({ amount: z.number().nonnegative(), percent: z.number().min(0).max(100) }),
  decor: z.object({ amount: z.number().nonnegative(), percent: z.number().min(0).max(100) }),
  entertainment: z.object({ amount: z.number().nonnegative(), percent: z.number().min(0).max(100) }),
  photography: z.object({ amount: z.number().nonnegative(), percent: z.number().min(0).max(100) }),
  miscellaneous: z.object({ amount: z.number().nonnegative(), percent: z.number().min(0).max(100) })
});

export const menuSchema = z.object({
  starters: z.array(z.string()),
  mains: z.array(z.string()),
  desserts: z.array(z.string()),
  drinks: z.array(z.string())
});

export const planSectionSchema = z.object({
  timeline: z.array(taskSchema),
  budget: budgetBreakdownSchema,
  menu: menuSchema,
  decor: z.array(z.string()),
  invitation: z.object({
    subject: z.string(),
    body: z.string(),
    toast: z.string()
  }),
  contingency: z.array(z.string())
});

export const eventPlanSchema = z.object({
  planId: z.string().min(1),
  eventType: z.enum(eventTypeEnum),
  title: z.string().min(1).max(120),
  date: z.string().min(1),
  guestCount: z.number().int().min(1).max(2000),
  budget: z.number().int().positive().max(100000000),
  city: z.string().min(1).max(80),
  theme: z.string().min(1).max(150),
  dietaryNeeds: z.array(z.enum(dietaryNeedsEnum)),
  accessibilityNeeds: z.string().max(200),
  language: z.enum(outputLanguageEnum),
  eventTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  venueType: z.enum(venueTypeEnum).optional(),
  summary: z.string().min(1).max(400),
  sections: planSectionSchema,
  createdAt: z.string().min(1)
});
