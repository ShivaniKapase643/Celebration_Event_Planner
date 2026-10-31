import type { EventPlan } from '@/types';

export const samplePlan: EventPlan = {
  planId: 'demo-plan-1',
  eventType: 'birthday',
  title: 'Sunset Birthday Bash',
  date: '2027-04-18',
  guestCount: 75,
  budget: 250000,
  city: 'Pune',
  theme: 'Elegant sunset garden',
  dietaryNeeds: ['vegetarian', 'gluten_free'],
  accessibilityNeeds: 'Ramp access and quiet seating area',
  language: 'en',
  summary: 'A warm, vibrant celebration with a sunset garden vibe and comfortable guest flow.',
  createdAt: new Date().toISOString(),
  sections: {
    timeline: [
      { id: 't1', title: 'Book venue', deadline: 'T-30 days', priority: 'high', category: 'Venue', done: false },
      { id: 't2', title: 'Confirm food menu', deadline: 'T-21 days', priority: 'high', category: 'Food', done: true },
      { id: 't3', title: 'Send invitations', deadline: 'T-12 days', priority: 'medium', category: 'Guest Outreach', done: false }
    ],
    budget: {
      venue: { amount: 70000, percent: 28 },
      food: { amount: 65000, percent: 26 },
      decor: { amount: 45000, percent: 18 },
      entertainment: { amount: 35000, percent: 14 },
      photography: { amount: 20000, percent: 8 },
      miscellaneous: { amount: 15000, percent: 6 }
    },
    menu: {
      starters: ['Mini paneer tikka skewers', 'Veg spring rolls'],
      mains: ['Paneer makhani', 'Dal tadka', 'Vegetable biryani'],
      desserts: ['Chocolate mousse cups', 'Fruit tartlets'],
      drinks: ['Lemon mint cooler', 'Coconut water']
    },
    decor: ['Warm fairy lights', 'Floral centerpieces', 'Sunset color palette'],
    invitation: {
      subject: 'You are invited to my birthday celebration',
      body: 'Join us for an evening of music, food and celebration on 18 April 2027 at sunset garden.',
      toast: 'Here is to a night of joy, laughter, and unforgettable memories.'
    },
    contingency: ['Keep a weather backup with indoor seating', 'Confirm vendor contacts 72 hours before the event', 'Prepare an extra 10% food buffer']
  }
};
