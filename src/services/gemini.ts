import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  EventPlan,
  EventType,
  EventStyle,
  CurrencyCode,
  BudgetItem,
  Task,
  Vendor,
  PersonalizedIdea,
  SmartInsight,
  ChatMessage,
  StagedLoadingStep,
} from '../types';
import { getCustomApiKey } from '../utils/storage';

export interface CreateEventInput {
  name: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  style: EventStyle;
  preferences: string;
}

export interface GeneratedPlanOutput {
  eventSummary: string;
  budgetPlan: BudgetItem[];
  timeline: Task[];
  vendors: Vendor[];
  personalizedIdeas: PersonalizedIdea[];
  insights: SmartInsight[];
}

export function getEffectiveApiKey(): string {
  const customKey = getCustomApiKey();
  if (customKey && customKey.trim()) {
    return customKey.trim();
  }
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

export function isAiConfigured(): boolean {
  return Boolean(getEffectiveApiKey());
}

/**
 * Clean and parse JSON response from Gemini, handling markdown code fences.
 */
function cleanAndParseJson<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (err) {
    // Attempt relaxed regex extraction of first outer JSON object
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw new Error(`Failed to parse AI JSON response: ${(err as Error).message}`);
  }
}

/**
 * Realistic contextual fallback generator if Gemini API key is missing or offline/quota exceeded.
 * Guarantees the app never crashes and always returns tailored data!
 */
export function generateContextualFallbackPlan(input: CreateEventInput): GeneratedPlanOutput {
  const currency = input.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : '$';
  const b = input.totalBudget || 500000;
  const guests = input.guestCount || 100;

  // Tailor budget distribution based on event type
  let venuePct = 0.22;
  let cateringPct = 0.35;
  let decorPct = 0.12;
  let photoPct = 0.10;
  let clothingPct = 0.08;
  let entertainmentPct = 0.05;
  let invitePct = 0.02;
  let transportPct = 0.03;
  let miscPct = 0.03;

  if (input.type === 'birthday') {
    venuePct = 0.20;
    cateringPct = 0.40;
    entertainmentPct = 0.15;
    decorPct = 0.12;
    photoPct = 0.05;
    clothingPct = 0.03;
    transportPct = 0.02;
    invitePct = 0.01;
    miscPct = 0.02;
  } else if (input.type === 'community') {
    venuePct = 0.28;
    cateringPct = 0.32;
    entertainmentPct = 0.12;
    decorPct = 0.08;
    photoPct = 0.04;
    transportPct = 0.06;
    clothingPct = 0.01;
    invitePct = 0.04;
    miscPct = 0.05;
  }

  const budgetPlan: BudgetItem[] = [
    { id: 'b-gen-1', category: 'Venue', plannedAmount: Math.round(b * venuePct), spentAmount: 0, notes: `${input.style} venue booking for ${guests} attendees in ${input.location}` },
    { id: 'b-gen-2', category: 'Catering', plannedAmount: Math.round(b * cateringPct), spentAmount: 0, notes: `Curated food & beverages for ~${guests} guests (~${symbol}${Math.round((b * cateringPct) / guests)}/guest)` },
    { id: 'b-gen-3', category: 'Decoration', plannedAmount: Math.round(b * decorPct), spentAmount: 0, notes: `${input.style} theme floral and lighting design tailored to ${input.name}` },
    { id: 'b-gen-4', category: 'Photography', plannedAmount: Math.round(b * photoPct), spentAmount: 0, notes: 'Candid coverage, edited highlight reel, high-res digital gallery' },
    { id: 'b-gen-5', category: 'Entertainment', plannedAmount: Math.round(b * entertainmentPct), spentAmount: 0, notes: 'Music, sound system, MC / host engagement' },
    { id: 'b-gen-6', category: 'Clothing', plannedAmount: Math.round(b * clothingPct), spentAmount: 0, notes: 'Attire and styling matching the event aesthetic' },
    { id: 'b-gen-7', category: 'Invitations', plannedAmount: Math.round(b * invitePct), spentAmount: 0, notes: 'Digital video invites and RSVP management' },
    { id: 'b-gen-8', category: 'Transportation', plannedAmount: Math.round(b * transportPct), spentAmount: 0, notes: 'Logistics, guest shuttle and parking arrangements' },
    { id: 'b-gen-9', category: 'Miscellaneous', plannedAmount: Math.round(b * miscPct), spentAmount: 0, notes: 'Emergency contingency and on-day cash reserves' },
  ];

  const timeline: Task[] = [
    { id: 't-gen-1', name: `Finalize venue contract in ${input.location}`, phase: '6 months before', deadline: '2026-06-01', status: 'pending', priority: 'high', category: 'Venue' },
    { id: 't-gen-2', name: `Shortlist caterers for ${guests} guests & taste menu`, phase: '6 months before', deadline: '2026-06-15', status: 'pending', priority: 'high', category: 'Catering' },
    { id: 't-gen-3', name: 'Book lead photographer and videographer', phase: '3 months before', deadline: '2026-08-01', status: 'pending', priority: 'high', category: 'Photography' },
    { id: 't-gen-4', name: `Design invitations matching ${input.style} aesthetic`, phase: '3 months before', deadline: '2026-08-20', status: 'pending', priority: 'medium', category: 'Invitations' },
    { id: 't-gen-5', name: 'Send digital RSVPs and track confirmations', phase: '1 month before', deadline: '2026-10-01', status: 'pending', priority: 'medium', category: 'Invitations' },
    { id: 't-gen-6', name: 'Lock decor layout, stage design, and lighting', phase: '1 month before', deadline: '2026-10-15', status: 'pending', priority: 'high', category: 'Decoration' },
    { id: 't-gen-7', name: 'Schedule sound check and entertainment timeline', phase: '2 weeks before', deadline: '2026-11-01', status: 'pending', priority: 'medium', category: 'Entertainment' },
    { id: 't-gen-8', name: 'Confirm final headcount with catering team', phase: '1 week before', deadline: '2026-11-10', status: 'pending', priority: 'high', category: 'Catering' },
    { id: 't-gen-9', name: 'Final venue walk-through with key vendors', phase: '3 days before', deadline: '2026-11-20', status: 'pending', priority: 'high', category: 'Venue' },
    { id: 't-gen-10', name: 'Execute event day schedule and guest coordination', phase: 'Event day', deadline: input.date, status: 'pending', priority: 'high', category: 'Miscellaneous' },
  ];

  const vendors: Vendor[] = [
    { id: 'v-gen-1', name: `${input.location} Heritage Hall / Venue`, category: 'Venue', estimatedCost: Math.round(b * venuePct), status: 'Shortlisted', contact: '+91 98300 11000', notes: `Capacity for ${guests} guests with proper parking` },
    { id: 'v-gen-2', name: 'Gourmet Feast Caterers', category: 'Catering', estimatedCost: Math.round(b * cateringPct), status: 'Shortlisted', contact: '+91 98300 22000', notes: `Customized menu for ${guests} attendees, includes live counters` },
    { id: 'v-gen-3', name: 'Artisan Decor & Ambience', category: 'Decorator', estimatedCost: Math.round(b * decorPct), status: 'Not Started', contact: '+91 98300 33000', notes: `${input.style} thematic backdrop and entrance arches` },
    { id: 'v-gen-4', name: 'Aura Lens Studios', category: 'Photographer', estimatedCost: Math.round(b * photoPct), status: 'Not Started', contact: '+91 98300 44000', notes: 'Full day coverage with candid specialist & cinematic reel' },
    { id: 'v-gen-5', name: 'SoundScape Productions', category: 'Entertainment', estimatedCost: Math.round(b * entertainmentPct), status: 'Not Started', contact: '+91 98300 55000', notes: 'Sound equipment, lighting, and DJ/acoustic host' },
    { id: 'v-gen-6', name: 'City Express Mobility', category: 'Transportation', estimatedCost: Math.round(b * transportPct), status: 'Not Started', contact: '+91 98300 66000', notes: 'Guest coordination and pickup standby' },
  ];

  const personalizedIdeas: PersonalizedIdea[] = [
    {
      id: 'i-gen-1',
      category: 'Decoration',
      title: `${input.style.toUpperCase()} Thematic Focal Installation`,
      description: `Create an eye-catching signature installation at the entry combining natural floral accents with warm Edison bulbs. Designed specifically for ${input.name} in ${input.location}.`,
      impactOrSavings: 'High visual impact on a modest budget',
      isFavorite: true,
      tags: ['Aesthetic', 'Photo-Op', input.style],
    },
    {
      id: 'i-gen-2',
      category: 'Food',
      title: 'Interactive Signature Tasting Station',
      description: `Instead of standard buffet lines, add a live artisanal counter serving regional specialties beloved in ${input.location}. Guests can customize toppings and seasonings.`,
      impactOrSavings: 'Maximizes guest engagement',
      isFavorite: true,
      tags: ['Cuisine', 'Memorable'],
    },
    {
      id: 'i-gen-3',
      category: 'Budget Saving',
      title: 'Modular Stage & Dual-Use Floral Elements',
      description: `Design ceremony florals on moveable pedestals that can be swiftly relocated to the dining backdrop, saving you from purchasing duplicate arrangements.`,
      impactOrSavings: `Estimated savings: ~15% on decor`,
      isFavorite: false,
      tags: ['Smart Budget', 'Optimization'],
    },
    {
      id: 'i-gen-4',
      category: 'Unique Experiences',
      title: 'Personalized Audio Guestbook or QR Memory Wall',
      description: `Place an elegant vintage rotary phone or QR frame where guests record heartfelt 30-second audio messages for ${input.name}.`,
      impactOrSavings: 'Unforgettable keepsake with near zero rental cost',
      isFavorite: true,
      tags: ['Tech', 'Keepsake'],
    },
    {
      id: 'i-gen-5',
      category: 'Entertainment',
      title: 'Curated Sunset Acoustic Set',
      description: 'Engage a local acoustic duo for 45 minutes during guest arrival to establish an intimate, sophisticated ambiance before formalities commence.',
      impactOrSavings: 'Elevates guest mood instantly',
      isFavorite: false,
      tags: ['Music', 'Vibe'],
    },
    {
      id: 'i-gen-6',
      category: 'Invitations',
      title: 'Interactive Digital Story Web-Card',
      description: `Send a mobile-optimized animated invite with personalized Google Maps routes to ${input.location}, RSVP collection, and Spotify event playlist link.`,
      impactOrSavings: 'Saves 70% compared to paper printing',
      isFavorite: false,
      tags: ['Eco-Friendly', 'Digital'],
    },
  ];

  const insights: SmartInsight[] = [
    {
      id: 'ins-gen-1',
      title: `Venue and Catering will consume ~${Math.round((venuePct + cateringPct) * 100)}% of your budget`,
      description: `For ${guests} guests with a budget of ${symbol}${b.toLocaleString()}, venue and food are your anchor expenses. Prioritize locking these first.`,
      severity: 'HIGH',
      category: 'Budget',
      recommendation: `Request itemized proposals from at least 2 venues in ${input.location} before committing any deposit.`,
      actionText: 'View Budget',
      actionRoute: 'budget',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ins-gen-2',
      title: 'Vendor Booking Window is Open',
      description: `For events with ${guests} guests, prime photographers and decorators get booked quickly. Starting outreach now gives you maximum negotiating leverage.`,
      severity: 'MEDIUM',
      category: 'Vendors',
      recommendation: 'Reach out to shortlisted vendors to compare packages.',
      actionText: 'Browse Vendors',
      actionRoute: 'vendors',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ins-gen-3',
      title: 'Contingency Allocation',
      description: `We allocated ${symbol}${Math.round(b * miscPct).toLocaleString()} as a miscellaneous safety buffer to ensure unexpected costs do not disrupt your plan.`,
      severity: 'LOW',
      category: 'Finance',
      recommendation: 'Keep this contingency reserve untouched until the final week.',
      actionText: 'Check Budget',
      actionRoute: 'budget',
      createdAt: new Date().toISOString(),
    },
  ];

  return {
    eventSummary: `A meticulously planned ${input.style} ${input.type} for ${guests} guests in ${input.location} with a total budget of ${symbol}${b.toLocaleString()}. Balanced across high-impact hospitality, memorable aesthetics, and seamless execution based on your note: "${input.preferences}".`,
    budgetPlan,
    timeline,
    vendors,
    personalizedIdeas,
    insights,
  };
}

export const STAGED_STEPS: StagedLoadingStep[] = [
  { step: 1, label: 'Understanding your event...', detail: 'Analyzing guest count, venue locale, theme, and user vision.' },
  { step: 2, label: 'Building your budget...', detail: 'Optimizing category allocations across venue, catering, and decor.' },
  { step: 3, label: 'Creating your timeline...', detail: 'Scheduling milestones from 6 months before to the big day.' },
  { step: 4, label: 'Preparing vendor checklist...', detail: 'Identifying essential vendor categories and target cost bands.' },
  { step: 5, label: 'Generating personalized ideas...', detail: 'Crafting bespoke decoration, culinary, and experiential touches.' },
];

/**
 * Main AI Generation pipeline: Calls Google Gemini API with staged progress.
 * If API key is absent or call fails, seamlessly falls back to high quality contextual data.
 */
export async function generateEventPlanWithAI(
  input: CreateEventInput,
  onStepProgress?: (step: StagedLoadingStep) => void
): Promise<GeneratedPlanOutput> {
  const apiKey = getEffectiveApiKey();

  // Helper to step through animation smoothly
  const runProgress = async (stepIndex: number, ms: number) => {
    if (onStepProgress && STAGED_STEPS[stepIndex]) {
      onStepProgress(STAGED_STEPS[stepIndex]);
    }
    await new Promise((resolve) => setTimeout(resolve, ms));
  };

  // If no API key, execute beautiful simulated staged generation with contextual fallback
  if (!apiKey) {
    console.info('No Gemini API key detected. Using contextual fallback engine.');
    for (let i = 0; i < STAGED_STEPS.length; i++) {
      await runProgress(i, 600);
    }
    return generateContextualFallbackPlan(input);
  }

  try {
    // Stage 1
    await runProgress(0, 300);

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash or gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    await runProgress(1, 300);

    const systemPrompt = `You are EventPilot AI, an elite professional event planning consultant.
Transform the following event details into an actionable, realistic, deeply personalized event plan.

EVENT DETAILS:
- Event Name: ${input.name}
- Type: ${input.type}
- Target Date: ${input.date}
- Location: ${input.location}
- Guest Count: ${input.guestCount}
- Total Budget: ${input.totalBudget} ${input.currency}
- Aesthetic / Style: ${input.style}
- Specific Preferences & Vision: "${input.preferences}"

CRITICAL INSTRUCTIONS:
1. Budget allocations must be tailored to the specific budget size (${input.currency} ${input.totalBudget}) and guest count (${input.guestCount}).
   Categories to use: "Venue", "Catering", "Decoration", "Photography", "Entertainment", "Clothing", "Invitations", "Transportation", "Miscellaneous".
   The sum of plannedAmount must equal ${input.totalBudget}.
2. Timeline tasks must reference the event date (${input.date}) and span realistic phases:
   "6 months before", "3 months before", "1 month before", "2 weeks before", "1 week before", "3 days before", "Event day".
3. Vendors must be realistic for ${input.location} and the event type (${input.type}).
   Statuses can be "Shortlisted", "Not Started".
4. Personalized ideas must NOT be generic. Ground them in ${input.location}, the style (${input.style}), and the user's specific note: "${input.preferences}".
   Idea categories must be among: "Decoration", "Food", "Entertainment", "Activities", "Invitations", "Photography", "Budget Saving", "Unique Experiences".
5. Insights should evaluate risks, overspending, or critical missing elements with severity: "LOW", "MEDIUM", or "HIGH".

Return ONLY raw valid JSON adhering to this exact schema (no markdown fences, no conversational text):
{
  "eventSummary": "Concise executive overview of the event concept and execution strategy",
  "budgetPlan": [
    { "id": "b-1", "category": "Venue", "plannedAmount": 100000, "spentAmount": 0, "notes": "Details..." }
  ],
  "timeline": [
    { "id": "t-1", "name": "Task name", "deadline": "YYYY-MM-DD", "phase": "6 months before", "status": "pending", "priority": "high", "category": "Venue", "notes": "..." }
  ],
  "vendors": [
    { "id": "v-1", "name": "Vendor name", "category": "Venue", "estimatedCost": 100000, "status": "Shortlisted", "contact": "+...", "notes": "..." }
  ],
  "personalizedIdeas": [
    { "id": "i-1", "category": "Decoration", "title": "...", "description": "...", "impactOrSavings": "...", "isFavorite": true, "tags": ["tag1", "tag2"] }
  ],
  "insights": [
    { "id": "ins-1", "title": "...", "description": "...", "severity": "HIGH", "category": "Budget", "recommendation": "...", "actionText": "View Budget", "actionRoute": "budget" }
  ]
}`;

    // Step 2 & 3
    await runProgress(2, 250);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    await runProgress(3, 250);

    const responseText = result.response.text();
    const parsed = cleanAndParseJson<GeneratedPlanOutput>(responseText);

    await runProgress(4, 250);

    // Validate fields exist
    if (!parsed.eventSummary || !Array.isArray(parsed.budgetPlan) || !Array.isArray(parsed.timeline)) {
      throw new Error('AI response missing essential sections');
    }

    return parsed;
  } catch (error) {
    console.warn('Gemini API call failed or encountered error. Falling back to contextual plan:', error);
    // Provide nice animation before returning fallback
    for (let i = 2; i < STAGED_STEPS.length; i++) {
      await runProgress(i, 200);
    }
    return generateContextualFallbackPlan(input);
  }
}

/**
 * AI Budget Optimizer: Analyzes current spending, identifies disproportionate allocations,
 * and proposes reallocation options.
 */
export async function optimizeBudgetWithAI(event: EventPlan): Promise<{
  summary: string;
  recommendations: { category: string; currentShare: number; suggestedShare: number; advice: string }[];
}> {
  const apiKey = getEffectiveApiKey();
  const symbol = event.currency === 'INR' ? '₹' : '$';

  if (!apiKey) {
    // Intelligent fallback analysis
    const total = event.totalBudget || 500000;
    const decor = event.budgetPlan.find((b) => b.category === 'Decoration')?.plannedAmount || 0;
    const decorShare = Math.round((decor / total) * 100);

    return {
      summary: `Based on your ${event.style} ${event.type} for ${event.guestCount} guests in ${event.location}, your overall budget of ${symbol}${total.toLocaleString()} is viable, but rebalancing can save 12-15% without sacrificing guest experience.`,
      recommendations: [
        {
          category: 'Decoration',
          currentShare: decorShare || 15,
          suggestedShare: Math.max(8, decorShare - 5),
          advice: `You are allocating ${decorShare}% to decoration. By using modular seasonal floral arrangements and ambient fairy lighting, you can safely reduce this to ${Math.max(8, decorShare - 5)}% and redirect savings to hospitality.`,
        },
        {
          category: 'Catering',
          currentShare: 35,
          suggestedShare: 38,
          advice: `Catering drives 80% of guest satisfaction for a ${event.type}. Moving ₹15,000 to catering will allow you to add a crowd-pleasing live dessert station without exceeding total budget.`,
        },
        {
          category: 'Invitations',
          currentShare: 3,
          suggestedShare: 1,
          advice: 'Transition to 100% animated digital invitations via WhatsApp/Email to eliminate paper courier costs and recover ~₹6,000 for food upgrades.',
        },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a financial event optimizer. Analyze this budget for "${event.name}" (${event.type}, ${event.style}, ${event.guestCount} guests, budget: ${symbol}${event.totalBudget}):
${JSON.stringify(event.budgetPlan, null, 2)}
Expenses so far:
${JSON.stringify(event.expenses, null, 2)}

Provide actionable recommendations to reduce unnecessary spending and rebalance allocations.
Return ONLY raw JSON in this structure:
{
  "summary": "High level strategic advice...",
  "recommendations": [
    { "category": "Decoration", "currentShare": 20, "suggestedShare": 15, "advice": "Specific realistic saving step..." }
  ]
}`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.5 },
    });
    return cleanAndParseJson(res.response.text());
  } catch (err) {
    console.warn('optimizeBudgetWithAI failed, using fallback', err);
    return optimizeBudgetWithAI({ ...event, isDemo: true });
  }
}

/**
 * AI 7-Day Action Planner: Analyzes upcoming deadlines & pending tasks
 * to construct a prioritized day-by-day plan.
 */
export async function planNext7DaysWithAI(event: EventPlan): Promise<{
  summary: string;
  dailyPlan: { day: string; title: string; tasks: string[]; priority: 'high' | 'medium' | 'low'; reason: string }[];
}> {
  const pendingTasks = event.timeline.filter((t) => t.status !== 'completed');
  const apiKey = getEffectiveApiKey();

  if (!apiKey || pendingTasks.length === 0) {
    return {
      summary: `Your event is in ${event.location}. Here is an optimal 7-day sprint tackling your highest priority pending items to keep your timeline on track.`,
      dailyPlan: [
        {
          day: 'Day 1 (Monday)',
          title: 'Vendor Contract Lock-in',
          tasks: ['Follow up with shortlisted caterer and request finalized quotation', 'Review payment schedules'],
          priority: 'high',
          reason: 'Catering requires longest lead time for fresh procurement.',
        },
        {
          day: 'Day 2 (Tuesday)',
          title: 'Design & Visual Themes',
          tasks: ['Review mood board for stage and floral entrance with decorator', 'Confirm lighting layout'],
          priority: 'medium',
          reason: 'Prevents rush charges and allows sourcing of local artisan elements.',
        },
        {
          day: 'Day 3 (Wednesday)',
          title: 'Guest List & Digital RSVPs',
          tasks: ['Finalize list of 150 guests', 'Dispatch digital invitation preview to close family'],
          priority: 'high',
          reason: 'Early RSVP tracking reduces catering food waste and excess cost.',
        },
        {
          day: 'Day 4 (Thursday)',
          title: 'Photography Briefing',
          tasks: ['Send preferred shot list to photographer (portraits, key rituals, family photos)'],
          priority: 'medium',
          reason: 'Aligning on must-have frames avoids missed moments during the hustle.',
        },
        {
          day: 'Day 5 (Friday)',
          title: 'Attire & Fitting Checks',
          tasks: ['Inspect bridal/host attire, jewelry matching, and alteration deadlines'],
          priority: 'low',
          reason: 'Ensures garments are ready well ahead of ritual days.',
        },
        {
          day: 'Day 6 (Saturday)',
          title: 'Venue Logistics Walkthrough',
          tasks: ['Verify electrical hookups, sound volume restrictions, and parking entrance at venue'],
          priority: 'high',
          reason: 'Technical checks eliminate on-day bottlenecks.',
        },
        {
          day: 'Day 7 (Sunday)',
          title: 'Sprint Review & Buffer Planning',
          tasks: ['Review week 1 disbursements against budget', 'Withdraw on-day cash contingency reserve'],
          priority: 'medium',
          reason: 'Maintains financial discipline before the final sprint.',
        },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an event management expert. The event "${event.name}" (${event.type}, Date: ${event.date}) has these incomplete tasks:
${JSON.stringify(pendingTasks, null, 2)}

Create a prioritized 7-day action sprint to accelerate progress.
Return ONLY valid JSON:
{
  "summary": "Motivational overview of the 7-day sprint...",
  "dailyPlan": [
    { "day": "Day 1 (Monday)", "title": "Focus area", "tasks": ["Task 1", "Task 2"], "priority": "high", "reason": "Why this matters today..." }
  ]
}`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
    });
    return cleanAndParseJson(res.response.text());
  } catch (e) {
    console.warn('planNext7DaysWithAI error', e);
    return planNext7DaysWithAI({ ...event, isDemo: true });
  }
}

/**
 * AI Missing Vendor Analyzer: Identifies vendor categories that were forgotten.
 */
export async function findMissingVendorsWithAI(event: EventPlan): Promise<{
  missingCategories: { category: string; reason: string; estimatedBudgetShare: string; urgency: 'high' | 'medium' | 'low' }[];
  summary: string;
}> {
  const existingCategories = event.vendors.map((v) => v.category.toLowerCase());
  const apiKey = getEffectiveApiKey();

  if (!apiKey) {
    const missing: { category: string; reason: string; estimatedBudgetShare: string; urgency: 'high' | 'medium' | 'low' }[] = [];
    if (!existingCategories.includes('makeup') && event.type === 'wedding') {
      missing.push({
        category: 'Bridal Makeup & Styling',
        reason: 'Essential for traditional wedding ceremonies; prime artists book months in advance.',
        estimatedBudgetShare: '3 - 5% of budget',
        urgency: 'high',
      });
    }
    if (!existingCategories.includes('security')) {
      missing.push({
        category: 'Valet & Event Security',
        reason: 'Prevents traffic jams and vehicle vandalism around venue during peak arrival hours.',
        estimatedBudgetShare: '1 - 2% of budget',
        urgency: 'medium',
      });
    }
    if (!existingCategories.includes('equipment')) {
      missing.push({
        category: 'Generator & Sound Equipment Backup',
        reason: 'Banquet halls often experience voltage drops when heavy AC and stage lighting fire simultaneously.',
        estimatedBudgetShare: '2 - 3% of budget',
        urgency: 'high',
      });
    }

    return {
      summary: `We scanned your ${event.vendors.length} booked and shortlisted vendors against standard checklists for a ${event.guestCount}-guest ${event.type}. Here are critical service gaps to address:`,
      missingCategories: missing.length > 0 ? missing : [
        {
          category: 'Dedicated Wedding Coordinator / Day-of Runner',
          reason: 'Having a neutral runner ensures family members enjoy rituals rather than coordinating catering trays.',
          estimatedBudgetShare: '2% of budget',
          urgency: 'medium',
        },
      ],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Event: "${event.name}" (${event.type}, ${event.guestCount} guests in ${event.location}).
Existing vendors: ${event.vendors.map((v) => `${v.category}: ${v.name} (${v.status})`).join(', ')}.

Identify vendor categories that may have been forgotten or overlooked for this event.
Return raw JSON:
{
  "summary": "Explanation of findings...",
  "missingCategories": [
    { "category": "Category name", "reason": "Why it is critical...", "estimatedBudgetShare": "X% of budget", "urgency": "high" }
  ]
}`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
    });
    return cleanAndParseJson(res.response.text());
  } catch (err) {
    console.warn('findMissingVendorsWithAI error', err);
    return findMissingVendorsWithAI({ ...event, isDemo: true });
  }
}

/**
 * AI Ideas Generator: Generates more ideas for specific sections or overall.
 */
export async function generateMoreIdeasWithAI(
  event: EventPlan,
  section?: string
): Promise<PersonalizedIdea[]> {
  const apiKey = getEffectiveApiKey();

  if (!apiKey) {
    const fallbackList: PersonalizedIdea[] = [
      {
        id: `i-more-${Date.now()}-1`,
        category: 'Food',
        title: 'Bespoke Welcome Mocktail Counter with Local Flavors',
        description: `Welcome guests with signature coolers like Aam Panna and spiced Gondhoraj lime fizz served in eco-friendly terracotta kulhads.`,
        impactOrSavings: 'Refreshing guest first impression under ₹70/head',
        isFavorite: false,
        tags: ['Welcome Drink', 'Local Pride'],
      },
      {
        id: `i-more-${Date.now()}-2`,
        category: 'Decoration',
        title: 'Botanical Herb & Marigold Centerpieces in Brass Urulis',
        description: `Float yellow petals and scented tealight candles in traditional brass urulis at each banquet table instead of bulky tall glass stands.`,
        impactOrSavings: 'Saves 35% on table centerpiece florals',
        isFavorite: false,
        tags: ['Tabletop', 'Traditional'],
      },
      {
        id: `i-more-${Date.now()}-3`,
        category: 'Activities',
        title: 'Generational Family Tree Photo Tunnel',
        description: `Create a warm walkway draped in warm fairy lights featuring framed wedding photos of parents and grandparents from the 1960s to present.`,
        impactOrSavings: 'Deep emotional resonance for elderly relatives',
        isFavorite: true,
        tags: ['Sentimental', 'Heritage'],
      },
    ];
    return fallbackList;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Event: "${event.name}" (${event.type}, ${event.style}, ${event.guestCount} guests in ${event.location}, budget: ${event.currency} ${event.totalBudget}).
Preferences: "${event.preferences}".
Generate 4 fresh, creative, highly specific ideas for ${section ? `section "${section}"` : 'the event'}.
Do NOT repeat existing ideas: ${event.personalizedIdeas.map((i) => i.title).join(', ')}.

Return raw JSON array:
[
  {
    "id": "i-${Date.now()}-1",
    "category": "${section || 'Unique Experiences'}",
    "title": "Creative title",
    "description": "Specific actionable idea...",
    "impactOrSavings": "Why it is great / savings...",
    "isFavorite": false,
    "tags": ["Tag1", "Tag2"]
  }
]`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.8 },
    });
    return cleanAndParseJson<PersonalizedIdea[]>(res.response.text());
  } catch (e) {
    console.warn('generateMoreIdeasWithAI error', e);
    return generateMoreIdeasWithAI({ ...event, isDemo: true }, section);
  }
}

/**
 * Contextual AI Assistant: Acts as an event planning project manager and consultant
 * with full awareness of current event state.
 */
export async function askEventPilotAssistant(
  event: EventPlan,
  history: ChatMessage[],
  userQuestion: string
): Promise<string> {
  const apiKey = getEffectiveApiKey();
  const symbol = event.currency === 'INR' ? '₹' : '$';

  // Construct comprehensive context summary
  const totalSpent = event.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const remaining = Math.max(0, event.totalBudget - totalSpent);
  const pendingTasks = event.timeline?.filter((t) => t.status !== 'completed').map((t) => `${t.name} (${t.priority} priority, phase: ${t.phase})`) || [];
  const bookedVendors = event.vendors?.filter((v) => v.status === 'Booked').map((v) => `${v.category}: ${v.name}`) || [];
  const unbookedVendors = event.vendors?.filter((v) => v.status !== 'Booked').map((v) => `${v.category}: ${v.name} [${v.status}]`) || [];

  const contextData = `
CURRENT EVENT DOSSIER:
- Event: "${event.name}" (${event.type}, ${event.style})
- Date: ${event.date} (${event.location})
- Guest Count: ${event.guestCount}
- Total Budget: ${symbol}${event.totalBudget.toLocaleString()}
- Total Spent: ${symbol}${totalSpent.toLocaleString()} | Remaining: ${symbol}${remaining.toLocaleString()}
- User Preferences: "${event.preferences}"
- Booked Vendors: ${bookedVendors.join(', ') || 'None yet'}
- Unbooked / Shortlisted Vendors: ${unbookedVendors.join(', ') || 'None'}
- Incomplete Tasks (${pendingTasks.length}): ${pendingTasks.slice(0, 8).join('; ')}
`;

  if (!apiKey) {
    // Intelligent fallback responses for common queries
    const qLower = userQuestion.toLowerCase();
    if (qLower.includes('book first') || qLower.includes('start with')) {
      return `### Top Priority Bookings for ${event.name}

1. **Lock Your Venue & Catering Immediately**: For ${event.guestCount} guests in ${event.location}, venue dates fill fast. Since Catering represents over 30% of your ${symbol}${event.totalBudget.toLocaleString()} budget, securing per-plate guarantees now prevents inflationary price hikes.
2. **Shortlist Your Lead Photographer**: Top candid photographers accept only one client per date. Reach out to lock retainer terms.
3. **Draft the Guest Master List**: Everything from invitation counts to seating and buffet counts depends on this.`;
    }

    if (qLower.includes('save') || qLower.includes('overspending') || qLower.includes('budget')) {
      return `### Realistic Cost-Saving Strategies (Save ${symbol}30,000 - ${symbol}50,000)

1. **Digital Invitations with Personalized Video**: Replace heavy paper cards and courier postage with custom animated e-invitations. *Estimated savings: ${symbol}8,000 - ${symbol}12,000*.
2. **Dual-Purpose Ceremony Floral Draping**: Repurpose the morning ceremony florals as the evening reception photo booth backdrop. *Estimated savings: ${symbol}15,000*.
3. **Curate the Dessert Buffet**: Rather than 6 complex catered desserts, feature 2 warm live traditional sweets and artisanal ice cream in clay handis. Guests love freshness more than sheer quantity. *Estimated savings: ${symbol}10,000*.`;
    }

    if (qLower.includes('this week') || qLower.includes('next 7 days') || qLower.includes('tasks')) {
      return `### Action Plan for This Week

- **Priority 1**: Finalize booking for your pending vendors (${unbookedVendors.slice(0, 2).join(' and ') || 'bridal makeup and transportation'}).
- **Priority 2**: Review the banquet floor plan with the decorator to ensure smooth flow for ${event.guestCount} attendees.
- **Priority 3**: Verify advance payment receipts and update the budget tracker in your EventPilot dashboard.`;
    }

    if (qLower.includes('entertainment') || qLower.includes('ideas') || qLower.includes('activities')) {
      return `### 3 Memorable Entertainment Ideas for ${event.name}

1. **Acoustic Sunset Welcome**: A 45-minute live acoustic performance blending regional melodies with contemporary acoustic guitar during guest arrival.
2. **Instant Polaroid Audio/Photo Guestbook**: Guests snap their photo, pin it into a handmade jute scrapbook, and write personal blessings.
3. **Interactive Food Tasting Station**: A live artisanal counter (such as fresh patishapta or roasted chaat) where guests customize their servings.`;
    }

    return `Hello! As your EventPilot AI project manager for **${event.name}**, I'm tracking your plan for **${event.guestCount} guests** with **${symbol}${remaining.toLocaleString()} uncommitted budget remaining**. 

Regarding your question: based on your **${event.style}** vision and **${event.location}** setting, I recommend prioritizing your outstanding high-priority tasks and keeping a minimum 5% cash contingency on hand. 

Would you like me to analyze your vendor contracts, optimize budget categories, or detail a step-by-step 7-day checklist?`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const conversationHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = `You are EventPilot AI, a brilliant, calm, authoritative event planning project manager and consultant.
You are actively helping the user plan this specific event:
${contextData}

GUIDELINES:
- Respond directly, concisely, and with structured bullet points and markdown headings.
- Always use the real event numbers, names, budget, vendors, and location.
- Never give generic advice; tailor everything to ${event.name} (${event.type}, ${event.style}, budget ${symbol}${event.totalBudget}).
- Offer proactive, actionable advice as a trusted project manager.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: `Understood! I am completely briefed on ${event.name} and ready to assist you as your dedicated AI event project manager.` }] },
        ...conversationHistory,
      ],
    });

    const response = await chat.sendMessage(userQuestion);
    return response.response.text();
  } catch (err) {
    console.warn('askEventPilotAssistant error, falling back', err);
    return askEventPilotAssistant({ ...event, isDemo: true }, history, userQuestion);
  }
}

