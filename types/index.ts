export type EventType =
  | 'birthday'
  | 'wedding'
  | 'anniversary'
  | 'baby_shower'
  | 'housewarming'
  | 'graduation'
  | 'festival_party'
  | 'corporate'
  | 'farewell'
  | 'custom';

export type DietaryNeed =
  | 'vegetarian'
  | 'vegan'
  | 'jain'
  | 'halal'
  | 'gluten_free'
  | 'none';

export type OutputLanguage = 'en' | 'hi' | 'mr';
export type VenueType = 'home' | 'banquet' | 'outdoor' | 'restaurant';

export type TaskPriority = 'low' | 'medium' | 'high';
export type RSVPStatus = 'yes' | 'no' | 'maybe';

export type PlanTask = {
  id: string;
  title: string;
  deadline: string;
  priority: TaskPriority;
  category: string;
  done: boolean;
  dueDate?: string;
};

export type BudgetCategory =
  | 'venue'
  | 'food'
  | 'decor'
  | 'entertainment'
  | 'photography'
  | 'miscellaneous';

export type BudgetBreakdown = {
  venue: { amount: number; percent: number };
  food: { amount: number; percent: number };
  decor: { amount: number; percent: number };
  entertainment: { amount: number; percent: number };
  photography: { amount: number; percent: number };
  miscellaneous: { amount: number; percent: number };
};

export type MenuSection = {
  starters: string[];
  mains: string[];
  desserts: string[];
  drinks: string[];
};

export type PlanSection = {
  timeline: { id: string; title: string; deadline: string; priority: TaskPriority; category: string; done: boolean }[];
  budget: BudgetBreakdown;
  menu: MenuSection;
  decor: string[];
  invitation: {
    subject: string;
    body: string;
    toast: string;
  };
  contingency: string[];
};

export type EventPlan = {
  planId: string;
  eventType: EventType;
  title: string;
  date: string;
  guestCount: number;
  budget: number;
  city: string;
  theme: string;
  dietaryNeeds: DietaryNeed[];
  accessibilityNeeds: string;
  language: OutputLanguage;
  eventTime?: string;
  venueType?: VenueType;
  summary: string;
  sections: PlanSection;
  createdAt: string;
};

export type EventInput = {
  eventType: EventType;
  title: string;
  date: string;
  guestCount: number;
  budget: number;
  city: string;
  theme: string;
  dietaryNeeds: DietaryNeed[];
  accessibilityNeeds: string;
  language: OutputLanguage;
  eventTime?: string;
  venueType?: VenueType;
  description?: string;
};

export type GuestEntry = {
  id: string;
  name: string;
  rsvp: RSVPStatus;
};

export type PlanRequest = EventInput & {
  description?: string;
};

export type ApiPlanResponse = {
  ok: boolean;
  plan: EventPlan;
  demoMode?: boolean;
};
