"use client";

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { EventInput, EventPlan, GuestEntry, OutputLanguage, RSVPStatus } from '@/types';
import { Badge, Button, Card, CardContent, Checkbox, ChipToggle, EmptyState, Input, ProgressBar, Select, Tabs, Textarea, ThemeToggle, ToastViewport } from '@/components/ui';
import { eventInputSchema, eventPlanSchema } from '@/lib/validation/schemas';
import { calculateBudgetBreakdown } from '@/lib/budget/allocation';
import { buildIcsFile } from '@/lib/ics/generator';


const futureDate = (offset = 30) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const isTodayOrFuture = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const selected = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selected.getFullYear() === year && selected.getMonth() === month - 1 && selected.getDate() === day && selected >= today;
};

const dietaryOptions: EventInput['dietaryNeeds'] = ['vegetarian', 'vegan', 'jain', 'halal', 'gluten_free', 'none'];

function normalizeDietaryNeeds(value: unknown): EventInput['dietaryNeeds'] {
  if (!Array.isArray(value)) return [...emptyForm.dietaryNeeds];
  const valid = value.filter((item): item is EventInput['dietaryNeeds'][number] => dietaryOptions.includes(item));
  if (valid.includes('none')) return ['none'];
  return [...new Set(valid)];
}

const emptyForm: EventInput = {
  eventType: 'birthday',
  title: '',
  date: futureDate(),
  guestCount: 60,
  budget: 200000,
  city: 'Pune',
  theme: 'Warm sunset garden',
  dietaryNeeds: ['vegetarian'],
  accessibilityNeeds: '',
  language: 'en',
  eventTime: '18:00',
  venueType: 'outdoor',
  description: 'Plan a joyful celebration with warm lights, great food and smooth guest flow.'
};

const demoPlans: Record<OutputLanguage, EventPlan> = {
  en: {
    planId: 'demo-en',
    eventType: 'birthday',
    title: 'Sunset Birthday Bash',
    date: futureDate(42),
    guestCount: 60,
    budget: 200000,
    city: 'Pune',
    theme: 'Warm sunset garden',
    dietaryNeeds: ['vegetarian', 'gluten_free'],
    accessibilityNeeds: 'Ramp access and quiet seating area',
    language: 'en',
    summary: 'A warm, vibrant celebration with a sunset garden vibe and a relaxed guest flow.',
    createdAt: new Date().toISOString(),
    sections: {
      timeline: [
        { id: 't1', title: 'Book venue', deadline: 'T-30 days', priority: 'high', category: 'Venue', done: false },
        { id: 't2', title: 'Confirm menu', deadline: 'T-21 days', priority: 'high', category: 'Food', done: true },
        { id: 't3', title: 'Send invitations', deadline: 'T-12 days', priority: 'medium', category: 'Guest outreach', done: false },
        { id: 't4', title: 'Decor final check', deadline: 'T-3 days', priority: 'medium', category: 'Decor', done: false }
      ],
      budget: {
        venue: { amount: 68000, percent: 34 },
        food: { amount: 56000, percent: 28 },
        decor: { amount: 36000, percent: 18 },
        entertainment: { amount: 22000, percent: 11 },
        photography: { amount: 12000, percent: 6 },
        miscellaneous: { amount: 6000, percent: 3 }
      },
      menu: {
        starters: ['Paneer tikka skewers', 'Crispy corn cups'],
        mains: ['Vegetable biryani', 'Paneer makhani', 'Dal tadka'],
        desserts: ['Chocolate mousse cups', 'Fruit tartlets'],
        drinks: ['Lemon mint cooler', 'Coconut water']
      },
      decor: ['Warm fairy lights', 'Floral centerpieces', 'Sunset palette backdrops'],
      invitation: {
        subject: 'You are invited to our sunset celebration',
        body: 'Join us for an evening of music, food and joy on the 10th of June in Pune. We would love to celebrate with you.',
        toast: 'Cheers to a memorable night full of laughter and love.'
      },
      contingency: ['Prepare indoor cover in case of rain', 'Keep a backup generator ready', 'Confirm vendor contacts 72 hours before the event']
    }
  },
  hi: {
    planId: 'demo-hi',
    eventType: 'birthday',
    title: 'सूरज-झिलमिलाता जन्मदिन',
    date: futureDate(42),
    guestCount: 60,
    budget: 200000,
    city: 'पुणे',
    theme: 'गर्म सूर्यास्त उद्यान',
    dietaryNeeds: ['vegetarian', 'gluten_free'],
    accessibilityNeeds: 'रैंप एक्सेस और शांत बैठने की जगह',
    language: 'hi',
    summary: 'गर्मी भरे, सुंदर और आरामदायक उत्सव का आयोजन, जो सूर्यास्त वाली जगह को ध्यान में रखता है।',
    createdAt: new Date().toISOString(),
    sections: {
      timeline: [
        { id: 't1', title: 'वेनेउ बुक करें', deadline: 'T-30 days', priority: 'high', category: 'Venue', done: false },
        { id: 't2', title: 'मेन्यू पुष्टि करें', deadline: 'T-21 days', priority: 'high', category: 'Food', done: true },
        { id: 't3', title: 'निमंत्रण भेजें', deadline: 'T-12 days', priority: 'medium', category: 'Guest outreach', done: false }
      ],
      budget: {
        venue: { amount: 68000, percent: 34 },
        food: { amount: 56000, percent: 28 },
        decor: { amount: 36000, percent: 18 },
        entertainment: { amount: 22000, percent: 11 },
        photography: { amount: 12000, percent: 6 },
        miscellaneous: { amount: 6000, percent: 3 }
      },
      menu: {
        starters: ['पनीर टिक्का स्क्यूअर्स', 'क्रिस्पी कॉर्न कप्स'],
        mains: ['सब्ज़ी बिरयानी', 'पनीर मखाना', 'दल तड़का'],
        desserts: ['चॉकलेट मूस कप्स', 'फ्रूट टार्टलेट्स'],
        drinks: ['नींबू पुदीना कुंजी', 'नारियल पानी']
      },
      decor: ['गर्म फेयरलाइट्स', 'फूलों की सेंटरपीस', 'सूर्यास्त रंग योजना'],
      invitation: {
        subject: 'आपको हमारे उत्सव में आमंत्रित किया जा रहा है',
        body: 'आइए हम साथ मिलकर 10 जून को पुणे में संगीत, भोजन और खुशी का आनंद लें।',
        toast: 'हँसी, प्यार और यादों की रात के लिए जयकारा।'
      },
      contingency: ['बारिश के लिए अंदर की व्यवस्था रखें', '72 घंटे पहले विक्रेता संपर्क सुनिश्चित करें', 'बैकअप जनरेटर तैयार रखें']
    }
  },
  mr: {
    planId: 'demo-mr',
    eventType: 'birthday',
    title: 'सूर्यास्त जन्मदिन साजरा',
    date: futureDate(42),
    guestCount: 60,
    budget: 200000,
    city: 'पुणे',
    theme: 'उष्ण सूर्यास्त बगीचा',
    dietaryNeeds: ['vegetarian', 'gluten_free'],
    accessibilityNeeds: 'रॅम्प प्रवेश आणि शांत बसण्याची जागा',
    language: 'mr',
    summary: 'सूर्यास्ताच्या रंगात भरलेले, नाजूक आणि आरामदायी उत्सव, ज्यात सर्वजण सहज सहभागी होऊ शकतात.',
    createdAt: new Date().toISOString(),
    sections: {
      timeline: [
        { id: 't1', title: 'वेनेउ बुक करा', deadline: 'T-30 days', priority: 'high', category: 'Venue', done: false },
        { id: 't2', title: 'मेन्यूची पुष्टी करा', deadline: 'T-21 days', priority: 'high', category: 'Food', done: true },
        { id: 't3', title: 'निमंत्रणे पाठवा', deadline: 'T-12 days', priority: 'medium', category: 'Guest outreach', done: false }
      ],
      budget: {
        venue: { amount: 68000, percent: 34 },
        food: { amount: 56000, percent: 28 },
        decor: { amount: 36000, percent: 18 },
        entertainment: { amount: 22000, percent: 11 },
        photography: { amount: 12000, percent: 6 },
        miscellaneous: { amount: 6000, percent: 3 }
      },
      menu: {
        starters: ['पनीर टिक्का स्क्वेअर्स', 'क्रिस्पी कॉर्न कप्स'],
        mains: ['भाजी बिर्याणी', 'पनीर मखाना', 'दल तडका'],
        desserts: ['चॉकलेट मूस कप्स', 'फ्रूट टार्टलेट्स'],
        drinks: ['लिंबू पुदीनाई लेमोनेड', 'नारळ पाणी']
      },
      decor: ['उष्ण फेअरलाइट्स', 'फुलांचे सेंटरपीस', 'सूर्यास्त रंग योजना'],
      invitation: {
        subject: 'आपल्याला आमच्या उत्सवासाठी आमंत्रित केले आहे',
        body: 'आम्ही 10 जून रोजी पुण्यात संगीत, जेवण आणि आनंदाचा सोहळा साजरा करत आहोत. आपण यामध्ये सहभागी व्हा.',
        toast: 'हास्य, प्रेम आणि सुंदर आठवणींच्या नात्याने आनंदी रात.'
      },
      contingency: ['पावसासाठी अंतर्गत व्यवस्था ठेवा', '72 तास आधी विक्रेता संपर्क निश्चित करा', 'बॅकअप जनरेटर सज्ज ठेवा']
    }
  }
};

const defaultGuests: GuestEntry[] = [
  { id: 'g1', name: 'Aisha', rsvp: 'yes' },
  { id: 'g2', name: 'Rohan', rsvp: 'maybe' },
  { id: 'g3', name: 'Meera', rsvp: 'no' }
];

const eventTemplates: Array<{ label: string; values: Partial<EventInput> }> = [
  { label: 'Kids birthday', values: { eventType: 'birthday', title: 'Kids birthday party', guestCount: 30, theme: 'Colourful garden games', description: 'A joyful party with kid-friendly food, games, and a quiet rest area.' } },
  { label: 'Anniversary dinner', values: { eventType: 'anniversary', title: 'Intimate anniversary dinner', guestCount: 18, budget: 75000, theme: 'Candlelit garden dinner', description: 'An intimate dinner with warm lighting, a thoughtful toast, and a relaxed meal.' } },
  { label: 'Diwali gathering', values: { eventType: 'festival_party', title: 'Diwali family get-together', guestCount: 45, theme: 'Diwali lights and marigolds', dietaryNeeds: ['vegetarian'], description: 'A family Diwali gathering with festive vegetarian food and accessible lighting.' } },
  { label: 'Office farewell', values: { eventType: 'farewell', title: 'Office farewell celebration', guestCount: 55, venueType: 'restaurant', theme: 'Warm modern evening', description: 'A welcoming team farewell with short speeches, shared food, and easy guest flow.' } }
];

const tabList = [
  { value: 'overview', label: 'Overview' },
  { value: 'timeline', label: 'Timeline & Tasks' },
  { value: 'budget', label: 'Budget' },
  { value: 'menu', label: 'Menu & Decor' },
  { value: 'invitation', label: 'Invitation & Speech' },
  { value: 'guests', label: 'Guests' },
  { value: 'backup', label: 'Backup Plan' }
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}

function buildDemoPlan(input: EventInput): EventPlan {
  const base = demoPlans[input.language] ?? demoPlans.en;
  return {
    ...base,
    title: input.title || base.title,
    date: input.date || base.date,
    city: input.city || base.city,
    budget: input.budget || base.budget,
    guestCount: input.guestCount || base.guestCount,
    theme: input.theme || base.theme,
    dietaryNeeds: input.dietaryNeeds.length ? input.dietaryNeeds : base.dietaryNeeds,
    accessibilityNeeds: input.accessibilityNeeds || base.accessibilityNeeds,
    sections: { ...base.sections, budget: calculateBudgetBreakdown(input.budget) },
    eventTime: input.eventTime ?? '18:00',
    venueType: input.venueType ?? 'outdoor',
    summary: `A polished ${input.eventType} plan tailored for ${input.city || 'your city'} with a ${input.theme || 'warm atmosphere'} experience.`,
    createdAt: new Date().toISOString()
  };
}

export default function PlannerPage() {
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [plan, setPlan] = useState<EventPlan | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateError, setDateError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [savedEvents, setSavedEvents] = useState<Array<{ id: string; title: string }>>([]);
  const [guests, setGuests] = useState<GuestEntry[]>(defaultGuests);
  const [newGuest, setNewGuest] = useState('');
  const [savedStatus, setSavedStatus] = useState('Saved');
  const [actualCosts, setActualCosts] = useState<Record<string, number>>({});
  const [taskTitle, setTaskTitle] = useState('');
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);
  const [guestFilter, setGuestFilter] = useState<'all' | RSVPStatus>('all');
  const [actualCostsPlanId, setActualCostsPlanId] = useState<string | null>(null);

  useEffect(() => {
    const savedPlan = window.localStorage.getItem('celebrate-ai-plan');
    const savedPlanSource = window.localStorage.getItem('celebrate-ai-plan-source');
    const savedForm = window.localStorage.getItem('celebrate-ai-form');
    const savedList = window.localStorage.getItem('celebrate-ai-events');
    const savedGuests = window.localStorage.getItem('celebrate-ai-guests');
    const savedCosts = window.localStorage.getItem('celebrate-ai-costs');

    if (savedPlan) {
      try {
        const restoredPlan = JSON.parse(savedPlan) as EventPlan;
        setPlan(restoredPlan);
        if (savedPlanSource) {
          const source = JSON.parse(savedPlanSource) as { planId?: string; demoMode?: boolean };
          setIsDemoMode(source.planId === restoredPlan.planId && typeof source.demoMode === 'boolean' ? source.demoMode : null);
        }
      } catch {
        setPlan(null);
        setIsDemoMode(null);
      }
    }

    if (savedForm) {
      try {
        const restored = JSON.parse(savedForm) as Partial<EventInput>;
        setForm({ ...emptyForm, ...restored, dietaryNeeds: normalizeDietaryNeeds(restored.dietaryNeeds) });
      } catch {
        setForm(emptyForm);
      }
    }

    if (savedList) {
      try {
        setSavedEvents(JSON.parse(savedList));
      } catch {
        setSavedEvents([]);
      }
    }
    if (savedGuests) { try { setGuests(JSON.parse(savedGuests)); } catch { setGuests([]); } }
    if (savedCosts) { try { const costs = JSON.parse(savedCosts) as { planId?: string; values?: Record<string, number> }; setActualCosts(costs.values ?? {}); setActualCostsPlanId(costs.planId ?? null); } catch { setActualCosts({}); } }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('celebrate-ai-form', JSON.stringify(form));
    const timer = window.setTimeout(() => setSavedStatus('Saved'), 250);
    return () => window.clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    if (!plan) return;
    window.localStorage.setItem('celebrate-ai-plan', JSON.stringify(plan));
    const nextEvent = { id: plan.planId, title: plan.title || form.title || 'New event' };
    setSavedEvents((current) => {
      const filtered = current.filter((item) => item.id !== nextEvent.id);
      return [nextEvent, ...filtered].slice(0, 6);
    });
  }, [plan, form.title]);

  useEffect(() => {
    window.localStorage.setItem('celebrate-ai-events', JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => { window.localStorage.setItem('celebrate-ai-guests', JSON.stringify(guests)); }, [guests]);
  useEffect(() => { window.localStorage.setItem('celebrate-ai-costs', JSON.stringify({ planId: plan?.planId ?? actualCostsPlanId, values: actualCosts })); }, [actualCosts, plan?.planId, actualCostsPlanId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const guestSummary = useMemo(() => {
    const summary = { yes: 0, maybe: 0, no: 0, total: guests.length };
    guests.forEach((guest) => {
      summary[guest.rsvp] += 1;
    });
    return summary;
  }, [guests]);

  const taskProgress = useMemo(() => {
    if (!plan) return 0;
    const tasks = plan.sections.timeline;
    if (!tasks.length) return 0;
    const done = tasks.filter((task) => task.done).length;
    return Math.round((done / tasks.length) * 100);
  }, [plan]);

  const countdown = useMemo(() => {
    if (!plan?.date) return '—';
    const diff = new Date(plan.date).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [plan]);

  const handleFieldChange = <K extends keyof EventInput>(field: K, value: EventInput[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'date' && typeof value === 'string' && value) {
      const future = isTodayOrFuture(value);
      setDateError(future ? '' : 'Please choose a future date.');
    }
  };

  const handleDietary = (item: EventInput['dietaryNeeds'][number]) => {
    setForm((prev) => ({
      ...prev,
      dietaryNeeds: item === 'none'
        ? prev.dietaryNeeds.includes('none') ? [] : ['none']
        : prev.dietaryNeeds.includes(item)
          ? prev.dietaryNeeds.filter((entry) => entry !== item)
          : [...prev.dietaryNeeds.filter((entry) => entry !== 'none'), item]
    }));
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    const inputResult = eventInputSchema.safeParse({ ...form, dietaryNeeds: normalizeDietaryNeeds(form.dietaryNeeds) });
    if (!inputResult.success) {
      const invalidDate = inputResult.error.issues.some((issue) => issue.path.includes('date'));
      const message = invalidDate
        ? 'Please choose today or a future date.'
        : inputResult.error.issues[0]?.message ?? 'Please check the event details and try again.';
      setError(message);
      setDateError(invalidDate ? message : '');
      const field = inputResult.error.issues[0]?.path[0];
      if (field && typeof field === 'string') document.getElementById(field)?.focus();
      return;
    }

    submittingRef.current = true;
    if (!isTodayOrFuture(form.date)) {
      setError('Please choose today or a future date.');
      setDateError('Please choose a future date.');
      document.getElementById('date')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      submittingRef.current = false;
      return;
    }

    setLoading(true);
    setError('');
    setDateError('');
    setPlan(null);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputResult.data)
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.error ?? `Plan generation failed (${response.status})`);
      }
      const validatedPlan = eventPlanSchema.safeParse(data?.plan);
      if (!validatedPlan.success) throw new Error('The planner returned an invalid result. Please try again.');
      const generatedPlan = validatedPlan.data;
      setPlan(generatedPlan);
      setIsDemoMode(Boolean(data.demoMode));
      window.localStorage.setItem('celebrate-ai-plan-source', JSON.stringify({ planId: generatedPlan.planId, demoMode: Boolean(data.demoMode) }));
      if (actualCostsPlanId !== generatedPlan.planId) { setActualCosts({}); setActualCostsPlanId(generatedPlan.planId); }
      setToast(data.demoMode ? 'Demo plan generated' : 'Plan generated');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? `${submissionError.message}. Please try again.` : 'Unable to generate your plan. Please try again.');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setPlan((current) => current ? {
      ...current,
      sections: {
        ...current.sections,
        timeline: current.sections.timeline.map((task) => task.id === taskId ? { ...task, done: !task.done } : task)
      }
    } : current);
  };

  const removeTask = (taskId: string) => setPlan((current) => current ? { ...current, sections: { ...current.sections, timeline: current.sections.timeline.filter((task) => task.id !== taskId) } } : current);

  const addTask = () => {
    const title = taskTitle.trim();
    if (!title) return;
    setPlan((current) => current ? { ...current, sections: { ...current.sections, timeline: [...current.sections.timeline, { id: crypto.randomUUID(), title, deadline: 'Custom task', priority: 'medium', category: 'Personal', done: false }] } } : current);
    setTaskTitle('');
  };

  const downloadFile = (name: string, content: string, type: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
  };

  const exportPlan = () => {
    if (!plan) return;
    downloadFile(`${plan.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-plan.json`, JSON.stringify({ ...plan, guests, actualCosts }, null, 2), 'application/json');
    setToast('Plan exported as JSON');
  };

  const exportCalendar = () => {
    if (!plan) return;
    const time = plan.eventTime ?? '18:00';
    const ics = buildIcsFile({ title: plan.title, date: `${plan.date}T${time}:00`, location: plan.city, description: `${plan.summary} Theme: ${plan.theme}` });
    downloadFile(`${plan.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`, ics, 'text/calendar');
    setToast('Calendar event exported');
  };

  const exportGuests = () => {
    const csv = ['name,rsvp', ...guests.map((guest) => `"${guest.name.replace(/"/g, '""')}",${guest.rsvp}`)].join('\r\n');
    downloadFile('celebrate-ai-guests.csv', `\uFEFF${csv}`, 'text/csv;charset=utf-8');
    setToast('Guest list exported as CSV');
  };

  const importGuests = async (file?: File) => {
    if (!file) return;
    if (file.size > 1_000_000) { setToast('CSV must be smaller than 1 MB'); return; }
    const text = await file.text();
    const rows = text.split(/\r?\n/).slice(1).filter((row) => row.trim());
    const imported: GuestEntry[] = rows.map((row) => {
      const match = row.match(/^\s*(?:"((?:""|[^"])*)"|([^,]*))\s*(?:,\s*([^,]*))?/);
      const rawName = match?.[1]?.replace(/""/g, '"') ?? match?.[2] ?? '';
      const rawRsvp = match?.[3] ?? '';
      const name = rawName.trim().slice(0, 100);
      const rsvp = (['yes', 'no', 'maybe'].includes(rawRsvp.trim().toLowerCase()) ? rawRsvp.trim().toLowerCase() : 'maybe') as RSVPStatus;
      return { id: crypto.randomUUID(), name, rsvp };
    }).filter((guest) => guest.name);
    setGuests((current) => {
      const accepted = imported.slice(0, Math.max(0, 2000 - current.length));
      setToast(`${accepted.length} guests imported${accepted.length < imported.length ? ' (2,000 guest limit reached)' : ''}`);
      return [...current, ...accepted];
    });
  };

  const regenerateSection = (section: 'timeline' | 'budget' | 'menu' | 'decor' | 'invitation' | 'contingency') => {
    setPlan((current) => {
      if (!current) return current;
      const refreshed = buildDemoPlan({ ...form, title: current.title, date: current.date });
      return { ...current, sections: { ...current.sections, [section]: refreshed.sections[section] } };
    });
    setToast('Loaded bundled sample suggestions for this section');
  };

  const copyToClipboard = async (text: string, successLabel: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast(successLabel);
    } catch {
      setToast('Copy failed');
    }
  };

  const updateGuestRsvp = (guestId: string, nextRsvp: RSVPStatus) => {
    setGuests((current) => current.map((guest) => (guest.id === guestId ? { ...guest, rsvp: nextRsvp } : guest)));
  };

  const removeGuest = (guestId: string) => setGuests((current) => current.filter((guest) => guest.id !== guestId));

  const budgetBreakdown = plan?.sections.budget ? Object.entries(plan.sections.budget) : [];
  const budgetTotal = budgetBreakdown.reduce((sum, [, item]) => sum + item.amount, 0);
  const budgetUsed = Math.min(100, Math.round((budgetTotal / (plan?.budget || 1)) * 100));
  const donutGradient = budgetBreakdown.length
    ? `conic-gradient(${budgetBreakdown.map(([, item], index) => {
        const colors = ['#7c3aed', '#f59e0b', '#ec4899', '#10b981', '#38bdf8', '#f97316'];
        const start = budgetBreakdown.slice(0, index).reduce((acc, [, v]) => acc + (v.amount / budgetTotal) * 100, 0);
        return `${colors[index % colors.length]} ${start}% ${start + (item.amount / budgetTotal) * 100}%`;
      }).join(', ')})`
    : 'conic-gradient(#e2e8f0 0 100%)';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1500px] p-4 md:p-6">
        <header className="sticky top-0 z-30 mb-6 rounded-3xl border border-border bg-card/80 px-4 py-3 shadow-sm backdrop-blur-xl md:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-bold text-white">C</div>
                <div>
                  <p className="font-display text-2xl leading-none text-foreground">Celebrate AI</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">{isDemoMode === null ? 'Saved plan · source unknown' : isDemoMode ? 'Demo suggestions' : 'AI generated'}</Badge>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-[2rem] border border-border bg-card p-4 shadow-soft md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-600">Planner</p>
                <h1 className="mt-2 text-2xl font-semibold">New event</h1>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { setForm({ ...emptyForm, date: futureDate() }); setError(''); setDateError(''); }}>Reset</Button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4" aria-label="Event planner form">
              <div aria-label="Event templates" className="rounded-2xl bg-muted/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start with a template</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {eventTemplates.map((template) => (
                    <Button key={template.label} type="button" variant="secondary" size="sm" onClick={() => { setForm((current) => ({ ...current, ...template.values })); setError(''); }}>
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="eventType">Event type</label>
                <Select id="eventType" value={form.eventType} onChange={(e) => handleFieldChange('eventType', e.target.value as EventInput['eventType'])}>
                  <option value="birthday">Birthday</option>
                  <option value="wedding">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="baby_shower">Baby shower</option>
                  <option value="housewarming">Housewarming</option>
                  <option value="graduation">Graduation</option>
                  <option value="festival_party">Festival party</option>
                  <option value="corporate">Corporate</option>
                  <option value="farewell">Farewell</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="title">Title</label>
                <Input id="title" value={form.title} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Sunset anniversary dinner" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="date">Date</label>
                <Input id="date" type="date" value={form.date} onChange={(e) => handleFieldChange('date', e.target.value)} />
                {dateError ? <p className="mt-2 text-sm text-red-600">{dateError}</p> : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="eventTime">Start time</label>
                  <Input id="eventTime" type="time" value={form.eventTime ?? '18:00'} onChange={(e) => handleFieldChange('eventTime', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="venueType">Venue type</label>
                  <Select id="venueType" value={form.venueType ?? 'outdoor'} onChange={(e) => handleFieldChange('venueType', e.target.value as NonNullable<EventInput['venueType']>)}>
                    <option value="home">Home</option>
                    <option value="banquet">Banquet hall</option>
                    <option value="outdoor">Outdoor</option>
                    <option value="restaurant">Restaurant</option>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="guestCount">Guests</label>
                  <Input id="guestCount" type="number" min={1} max={2000} value={form.guestCount} onChange={(e) => handleFieldChange('guestCount', Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground" htmlFor="budget">Budget</label>
                  <Input id="budget" type="number" min={1} value={form.budget} onChange={(e) => handleFieldChange('budget', Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="city">City</label>
                <Input id="city" value={form.city} onChange={(e) => handleFieldChange('city', e.target.value)} placeholder="Pune" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="theme">Theme / vibe</label>
                <Input id="theme" value={form.theme} onChange={(e) => handleFieldChange('theme', e.target.value)} placeholder="Elegant sunset garden" />
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">Dietary needs</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {dietaryOptions.map((label) => (
                    <ChipToggle key={label} pressed={form.dietaryNeeds.includes(label)} onPressed={() => handleDietary(label)} label={label.replace('_', ' ')} />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="accessibilityNeeds">Accessibility</label>
                <Textarea id="accessibilityNeeds" value={form.accessibilityNeeds} onChange={(e) => handleFieldChange('accessibilityNeeds', e.target.value)} placeholder="Ramp access and quiet seating area" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="language">Output language</label>
                <Select id="language" value={form.language} onChange={(e) => handleFieldChange('language', e.target.value as OutputLanguage)}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="description">Description</label>
                <Textarea id="description" value={form.description ?? ''} onChange={(e) => handleFieldChange('description', e.target.value)} placeholder="Tell us the overall mood and special moments you want to include." />
              </div>

              {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{savedStatus}</p>
                <Button type="submit" loading={loading} className="w-full sm:w-auto">Generate my event plan</Button>
              </div>
            </form>
          </aside>

          <section className="space-y-6">
            <Card>
              <CardContent className="p-5 md:p-6">
                <div className="mb-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">Event plan</p>
                    <h2 className="mt-2 font-display text-4xl text-foreground">{plan?.title ?? 'Your celebration blueprint'}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan ? plan.summary : 'Create an event brief to generate a full plan with tasks, budget and guest strategy.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {plan ? (
                      <>
                        <Badge>{countdown} days to go</Badge>
                        <Button variant="secondary" size="sm" onClick={() => copyToClipboard(plan.sections.invitation.body, 'Copied')}>Copy invite</Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(plan.sections.invitation.toast, 'Copied')}>Copy speech</Button>
                        <Button variant="secondary" size="sm" onClick={exportPlan}>Export plan</Button>
                        <Button variant="secondary" size="sm" onClick={exportCalendar}>Add to calendar</Button>
                      </>
                    ) : null}
                  </div>
                </div>

                {plan ? (
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-border bg-muted/50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">City</p>
                      <p className="mt-2 text-lg font-semibold">{plan.city}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Guests</p>
                      <p className="mt-2 text-lg font-semibold">{plan.guestCount}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget</p>
                      <p className="mt-2 text-lg font-semibold">{formatCurrency(plan.budget)}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/50 p-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Theme</p>
                      <p className="mt-2 text-lg font-semibold">{plan.theme}</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {!plan && !loading ? (
              <EmptyState title="No event plan yet" description="Fill in the form and generate a plan to see your celebration roadmap here." action={<Link href="#planner" className="text-sm text-primary">Start with your brief</Link>} />
            ) : null}

            {loading ? (
              <Card>
                <CardContent className="space-y-3 p-5">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="h-20 animate-pulse rounded-xl bg-muted" />
                    <div className="h-20 animate-pulse rounded-xl bg-muted" />
                    <div className="h-20 animate-pulse rounded-xl bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {plan ? (
              <>
                <Tabs tabs={tabList} value={activeTab} onValueChange={setActiveTab} />

                {activeTab === 'overview' ? (
                  <div className="grid gap-4 lg:grid-cols-4">
                    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Task progress</p><p className="mt-3 text-3xl font-bold text-foreground">{taskProgress}%</p><ProgressBar value={taskProgress} className="mt-3" /></CardContent></Card>
                    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Budget used</p><p className="mt-3 text-3xl font-bold text-foreground">{budgetUsed}%</p><ProgressBar value={budgetUsed} className="mt-3" /></CardContent></Card>
                    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">RSVP yes</p><p className="mt-3 text-3xl font-bold text-foreground">{guestSummary.yes}</p></CardContent></Card>
                    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Days remaining</p><p className="mt-3 text-3xl font-bold text-foreground">{countdown}</p></CardContent></Card>
                  </div>
                ) : null}

                {activeTab === 'timeline' ? (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Timeline & Tasks</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={() => regenerateSection('timeline')} aria-label="Load sample timeline suggestions">Sample ideas</Button>
                      </div>
                      <div className="mb-4 flex gap-2"><Input aria-label="New task" placeholder="Add a task" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask(); } }} /><Button type="button" variant="secondary" onClick={addTask}>Add task</Button></div>
                      <div className="space-y-3">
                        {plan.sections.timeline.map((task) => (
                          <div key={task.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                              <Checkbox checked={task.done} onChange={() => toggleTask(task.id)} label={`Mark ${task.title} complete`} />
                              <div>
                                <p className="font-semibold text-foreground">{task.title}</p>
                                <p className="text-sm text-muted-foreground">{task.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={task.priority === 'high' ? 'bg-rose-500/10 text-rose-600' : task.priority === 'medium' ? 'bg-amber-500/15 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}>{task.priority}</Badge>
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">{task.deadline}</span>
                              <Button type="button" variant="ghost" size="sm" aria-label={`Remove ${task.title}`} onClick={() => removeTask(task.id)}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {activeTab === 'budget' ? (
                  <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
                    <Card>
                      <CardContent className="p-5">
                        <h3 className="text-xl font-semibold">Budget overview</h3>
                        <div className="mt-5 flex items-center justify-center">
                          <div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: donutGradient }}>
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card text-center shadow-inner">
                              <div>
                                <p className="text-xl font-bold">{Math.min(100, Math.round((Object.values(actualCosts).reduce((sum, cost) => sum + cost, 0) / (plan.budget || 1)) * 100))}%</p>
                                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">used</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xl font-semibold">Category table</h3>
                          <Button type="button" variant="secondary" size="sm" onClick={() => regenerateSection('budget')} aria-label="Load sample budget suggestions">Sample ideas</Button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead>
                              <tr className="text-muted-foreground">
                                <th className="pb-2 font-medium">Category</th>
                                <th className="pb-2 font-medium">Planned</th>
                                <th className="pb-2 font-medium">Actual</th>
                                <th className="pb-2 font-medium">Remaining</th>
                              </tr>
                            </thead>
                            <tbody>
                              {budgetBreakdown.map(([label, item]) => (
                                <tr key={label} className="border-t border-border">
                                  <td className="py-3 pr-4 font-medium capitalize">{label}</td>
                                  <td className="py-3 pr-4">{formatCurrency(item.amount)}</td>
                                  <td className="py-3 pr-4"><Input aria-label={`${label} actual cost`} type="number" min={0} value={actualCosts[label] ?? 0} onChange={(e) => setActualCosts((current) => ({ ...current, [label]: Math.max(0, Number(e.target.value)) }))} className="min-w-[100px]" /></td>
                                  <td className={`py-3 pr-4 ${(item.amount - (actualCosts[label] ?? 0)) < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(item.amount - (actualCosts[label] ?? 0))}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {Object.entries(actualCosts).some(([category, amount]) => amount > (plan.sections.budget[category as keyof typeof plan.sections.budget]?.amount ?? 0)) ? <div role="status" className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">Actual costs have exceeded a planned category amount.</div> : null}
                      </CardContent>
                    </Card>
                  </div>
                ) : null}

                {activeTab === 'menu' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xl font-semibold">Menu</h3>
                          <Button type="button" variant="secondary" size="sm" onClick={() => regenerateSection('menu')} aria-label="Load sample menu suggestions">Sample ideas</Button>
                        </div>
                        {['Starters', 'Mains', 'Desserts', 'Drinks'].map((section) => (
                          <div key={section} className="mb-4">
                            <p className="mb-2 font-medium text-foreground">{section}</p>
                            <div className="flex flex-wrap gap-2">
                              {(section === 'Starters' ? plan.sections.menu.starters : section === 'Mains' ? plan.sections.menu.mains : section === 'Desserts' ? plan.sections.menu.desserts : plan.sections.menu.drinks).map((item) => (
                                <Badge key={item}>{item}</Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-center justify-between">
                          <h3 className="text-xl font-semibold">Decor</h3>
                          <Button type="button" variant="secondary" size="sm" onClick={() => regenerateSection('decor')} aria-label="Load sample decor suggestions">Sample ideas</Button>
                        </div>
                        <div className="space-y-2">
                          {plan.sections.decor.map((item) => <div key={item} className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-sm">{item}</div>)}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : null}

                {activeTab === 'invitation' ? (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Invitation & Speech</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={() => regenerateSection('invitation')} aria-label="Load sample invitation suggestions">Sample ideas</Button>
                      </div>
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-border bg-muted/50 p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Subject</p>
                          <p className="font-semibold">{plan.sections.invitation.subject}</p>
                          <Button variant="ghost" size="sm" className="mt-3" onClick={() => copyToClipboard(plan.sections.invitation.subject, 'Copied')}>Copy subject</Button>
                        </div>
                        <div className="rounded-2xl border border-border bg-muted/50 p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Message</p>
                          <p className="leading-7 text-foreground">{plan.sections.invitation.body}</p>
                          <Button variant="ghost" size="sm" className="mt-3" onClick={() => copyToClipboard(plan.sections.invitation.body, 'Copied')}>Copy message</Button>
                        </div>
                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Toast</p>
                          <p className="font-medium">{plan.sections.invitation.toast}</p>
                          <Button variant="ghost" size="sm" className="mt-3" onClick={() => copyToClipboard(plan.sections.invitation.toast, 'Copied')}>Copy toast</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {activeTab === 'guests' ? (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold">Guests</h3>
                          <p className="text-sm text-muted-foreground">Confirmed {guestSummary.yes} of {guests.length} planned guests</p>
                        </div>
                        <div className="flex flex-wrap gap-2"><Button type="button" variant="secondary" size="sm" onClick={exportGuests}>Export CSV</Button><label className="inline-flex cursor-pointer items-center rounded-xl bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground">Import CSV<input className="sr-only" type="file" accept=".csv,text/csv" aria-label="Import guest CSV" onChange={(event) => { void importGuests(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label><Button type="button" variant="ghost" size="sm" onClick={() => { setGuests([]); setToast('Guest list cleared'); }} aria-label="Clear guest list">Clear</Button></div>
                      </div>

                      <div className="mb-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"><p className="text-xs uppercase tracking-[0.2em]">Yes</p><p className="mt-2 text-2xl font-bold">{guestSummary.yes}</p></div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-700"><p className="text-xs uppercase tracking-[0.2em]">Maybe</p><p className="mt-2 text-2xl font-bold">{guestSummary.maybe}</p></div>
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700"><p className="text-xs uppercase tracking-[0.2em]">No</p><p className="mt-2 text-2xl font-bold">{guestSummary.no}</p></div>
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Filter guests by RSVP">
                        {(['all', 'yes', 'maybe', 'no'] as const).map((status) => <Button key={status} type="button" size="sm" variant={guestFilter === status ? 'primary' : 'secondary'} aria-pressed={guestFilter === status} onClick={() => setGuestFilter(status)}>{status === 'all' ? 'All guests' : status}</Button>)}
                      </div>

                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Input aria-label="Guest name" value={newGuest} onChange={(e) => setNewGuest(e.target.value)} placeholder="Guest name" className="max-w-md" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (!newGuest.trim()) return; setGuests((current) => [...current, { id: crypto.randomUUID(), name: newGuest.trim().slice(0, 100), rsvp: 'maybe' }]); setNewGuest(''); } }} />
                        <Button type="button" variant="secondary" onClick={() => {
                          if (!newGuest.trim()) return;
                          setGuests((current) => current.length >= 2000 ? current : [...current, { id: crypto.randomUUID(), name: newGuest.trim().slice(0, 100), rsvp: 'maybe' }]);
                          setNewGuest('');
                        }}>Add guest</Button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="text-muted-foreground">
                              <th scope="col" className="pb-2 font-medium">Name</th>
                              <th scope="col" className="pb-2 font-medium">RSVP</th>
                              <th scope="col" className="pb-2 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {guests.filter((guest) => guestFilter === 'all' || guest.rsvp === guestFilter).map((guest) => (
                              <tr key={guest.id} className="border-t border-border">
                                <td className="py-3 pr-4 font-medium">{guest.name}</td>
                                <td className="py-3 pr-4">
                                  <div className="flex gap-2">
                                    {(['yes', 'maybe', 'no'] as RSVPStatus[]).map((status) => (
                                      <button key={status} type="button" className={['rounded-full border px-2 py-1 text-xs uppercase', guest.rsvp === status ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'].join(' ')} onClick={() => updateGuestRsvp(guest.id, status)}>{status}</button>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 pr-4"><button type="button" className="text-sm text-red-600" onClick={() => removeGuest(guest.id)}>Remove</button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                {activeTab === 'backup' ? (
                  <Card>
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-xl font-semibold">Backup plan</h3>
                        <Button type="button" variant="secondary" size="sm" onClick={() => regenerateSection('contingency')} aria-label="Load sample backup suggestions">Sample ideas</Button>
                      </div>
                      <ul className="space-y-3">
                        {plan.sections.contingency.map((item) => (
                          <li key={item} className="rounded-2xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      </div>
      <ToastViewport toasts={toast ? [{ id: 'toast-1', title: toast }] : []} />
    </main>
  );
}
