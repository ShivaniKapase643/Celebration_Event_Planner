import type { EventInput, EventPlan, OutputLanguage } from '@/types';

import { calculateBudgetBreakdown } from '@/lib/budget/allocation';
import { futureDateInput } from '@/lib/dates/input-date';

const demoPlans: Record<OutputLanguage, EventPlan> = {
  en: {
    planId: 'demo-en',
    eventType: 'birthday',
    title: 'Sunset Birthday Bash',
    date: futureDateInput(42),
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
    date: futureDateInput(42),
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
    date: futureDateInput(42),
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


export function buildDemoPlan(input: EventInput): EventPlan {
  const base = demoPlans[input.language] ?? demoPlans.en;
  const budget = input.budget || base.budget;
  return {
    ...base,
    eventType: input.eventType,
    title: input.title || base.title,
    date: input.date || base.date,
    city: input.city || base.city,
    budget,
    guestCount: input.guestCount || base.guestCount,
    theme: input.theme || base.theme,
    dietaryNeeds: input.dietaryNeeds.length ? input.dietaryNeeds : base.dietaryNeeds,
    accessibilityNeeds: input.accessibilityNeeds || base.accessibilityNeeds,
    sections: { ...base.sections, budget: calculateBudgetBreakdown(budget) },
    eventTime: input.eventTime ?? '18:00',
    venueType: input.venueType ?? 'outdoor',
    summary: input.language === 'hi'
      ? `${input.city || 'आपके शहर'} में ${input.theme || 'सुंदर'} थीम के साथ ${input.eventType} के लिए ${input.guestCount} मेहमानों की योजना।`
      : input.language === 'mr'
        ? `${input.city || 'तुमच्या शहरात'} येथे ${input.theme || 'सुंदर'} संकल्पनेनुसार ${input.eventType} साठी ${input.guestCount} पाहुण्यांचे नियोजन.`
        : `A polished ${input.eventType} plan tailored for ${input.city || 'your city'} with a ${input.theme || 'warm atmosphere'} experience.`,
    createdAt: new Date().toISOString()
  };
}

