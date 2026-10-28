import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  EventPlan,
  EventType,
  EventFormat,
  OnlineEventDetails,
  RunOfShowItem,
  EventStyle,
  CurrencyCode,
  BudgetItem,
  Task,
  Vendor,
  PersonalizedIdea,
  SmartInsight,
  ChatMessage,
  StagedLoadingStep,
  BudgetEstimateResult,
  BudgetEstimateInputSnapshot,
  VendorAdviceResult,
  VendorCategory,
  BudgetCategory,
} from '../types';
import { getCustomApiKey } from '../utils/storage';

export interface CreateEventInput {
  name: string;
  type: EventType;
  customEventType?: string;
  format?: EventFormat;
  onlineDetails?: OnlineEventDetails;
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
  runOfShow?: RunOfShowItem[];
  vendors: Vendor[];
  personalizedIdeas: PersonalizedIdea[];
  insights: SmartInsight[];
  onlineDetails?: OnlineEventDetails;
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
export function cleanAndParseJson<T>(raw: string): T {
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
 * Event-Specific Contextual Fallback Generator:
 * Genuinely distinct planning models for Wedding, Birthday, Community, Online, and Custom events.
 * Guarantees zero generic cross-contamination!
 */
export function generateContextualFallbackPlan(input: CreateEventInput): GeneratedPlanOutput {
  const currency = input.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : '$';
  const b = input.totalBudget || 50000;
  const guests = input.guestCount || 50;
  const isOnline = input.format === 'online';
  const eventLabel = input.type === 'custom' && input.customEventType ? input.customEventType : input.name;

  // 1. ONLINE / VIRTUAL EVENT
  if (isOnline) {
    const budgetPlan: BudgetItem[] = [
      { id: 'b-on-1', category: 'Platform & Software', plannedAmount: Math.round(b * 0.28), spentAmount: 0, notes: `${input.onlineDetails?.platform || 'Virtual Meeting'} enterprise licensing, cloud capacity for ${guests} attendees` },
      { id: 'b-on-2', category: 'Speakers', plannedAmount: Math.round(b * 0.25), spentAmount: 0, notes: 'Honorarium and digital gift vouchers for keynote speakers / panel experts' },
      { id: 'b-on-3', category: 'AV & Production', plannedAmount: Math.round(b * 0.20), spentAmount: 0, notes: 'Studio webcam, pro broadcast microphone, ring lighting & stream deck hardware' },
      { id: 'b-on-4', category: 'Design & Assets', plannedAmount: Math.round(b * 0.12), spentAmount: 0, notes: 'Virtual stage backgrounds, slide deck design, and social media promotional banner suite' },
      { id: 'b-on-5', category: 'Technical Setup', plannedAmount: Math.round(b * 0.10), spentAmount: 0, notes: 'High-speed redundant internet line backup & cloud recording processing' },
      { id: 'b-on-6', category: 'Miscellaneous', plannedAmount: Math.round(b * 0.05), spentAmount: 0, notes: 'Emergency tech support standby & participant digital giveaways' },
    ];

    const timeline: Task[] = [
      { id: 't-on-1', name: `Setup ${input.onlineDetails?.platform || 'Google Meet'} room & generate joining link`, phase: '3 weeks before', deadline: '2026-10-01', status: 'completed', priority: 'high', category: 'Platform' },
      { id: 't-on-2', name: 'Design webinar slide deck & virtual speaker background', phase: '2 weeks before', deadline: '2026-10-08', status: 'pending', priority: 'medium', category: 'Design' },
      { id: 't-on-3', name: 'Conduct speaker technical rehearsal (mic, video, screen share)', phase: '1 week before', deadline: '2026-10-15', status: 'pending', priority: 'high', category: 'Technical' },
      { id: 't-on-4', name: 'Send 48-hour reminder email with one-click joining link', phase: '2 days before', deadline: '2026-10-20', status: 'pending', priority: 'high', category: 'Invitations' },
      { id: 't-on-5', name: 'Green room soundcheck & start cloud recording', phase: 'Event day', deadline: input.date, status: 'pending', priority: 'high', category: 'Production' },
    ];

    const runOfShow: RunOfShowItem[] = [
      { id: 'ros-on-1', time: 'T-30 min', title: 'Speaker Green Room', description: 'Test presenter audio, camera lighting, noise cancellation and slide deck sharing', leadPerson: input.onlineDetails?.moderatorName || 'Moderator' },
      { id: 'ros-on-2', time: '00:00', title: 'Waiting Room Opens', description: 'Play ambient welcome music loop while participants join', leadPerson: 'Tech Host' },
      { id: 'ros-on-3', time: '00:05', title: 'Welcome & Ground Rules', description: 'Brief audience on chat etiquette, Q&A guidelines, and recording notice', leadPerson: input.onlineDetails?.hostName || 'Host' },
      { id: 'ros-on-4', time: '00:15', title: 'Keynote Presentation', description: 'Main presentation with interactive screen sharing', leadPerson: 'Keynote Speaker' },
      { id: 'ros-on-5', time: '00:45', title: 'Moderated Live Q&A', description: 'Curate top upvoted questions from chat for speakers to answer live', leadPerson: input.onlineDetails?.moderatorName || 'Moderator' },
      { id: 'ros-on-6', time: '00:55', title: 'Closing & Digital Resource Link', description: 'Share feedback poll and post-event resource portal link', leadPerson: 'Host' },
      { id: 'ros-on-7', time: 'Post-Event', title: 'Cloud Recording Dispatch', description: 'Export recording, generate transcription, and email replay link to all registered attendees', leadPerson: 'Tech Host' },
    ];

    const vendors: Vendor[] = [
      { id: 'v-on-1', name: 'StreamCraft Virtual Event Production', category: 'AV & Production', estimatedCost: Math.round(b * 0.20), status: 'Shortlisted', contact: '+91 98200 44112', notes: 'Webinar broadcast management, switchboard mixing & tech backup' },
      { id: 'v-on-2', name: 'PixelDeck Presentation Studio', category: 'Design & Assets', estimatedCost: Math.round(b * 0.12), status: 'Not Started', contact: '+91 98200 55223', notes: 'Keynote slides, virtual backgrounds, and branded social assets' },
      { id: 'v-on-3', name: 'Global Pro Host & MC Collective', category: 'Entertainment', estimatedCost: Math.round(b * 0.18), status: 'Shortlisted', contact: '+91 98200 66334', notes: 'Bilingual virtual emcee to maintain high audience engagement' },
    ];

    const personalizedIdeas: PersonalizedIdea[] = [
      { id: 'i-on-1', category: 'Activities', title: 'Interactive Live Word Cloud & Polling', description: 'Use live polling tools (e.g., Slido) during opening to crowdsource audience expectations on screen in real time.', impactOrSavings: 'Boosts attendee retention by 40%', isFavorite: true, tags: ['Interactive', 'Engagement'] },
      { id: 'i-on-2', category: 'Unique Experiences', title: 'Curated Virtual Swag Kit (Digital Goodie Bag)', description: 'Provide registered attendees with an exclusive Notion resource dashboard, discount codes, and speaker templates.', impactOrSavings: 'High perceived value with zero shipping cost', isFavorite: true, tags: ['Digital Swag', 'Eco-Friendly'] },
      { id: 'i-on-3', category: 'Budget Saving', title: 'Repurpose Cloud Recording into 5 Micro-Clips', description: 'Edit the 1-hour session into 5 high-impact 60-second video shorts for LinkedIn and YouTube reels.', impactOrSavings: 'Multiplies event ROI for weeks after the session', isFavorite: false, tags: ['Content Reuse', 'Marketing'] },
    ];

    const insights: SmartInsight[] = [
      { id: 'ins-on-1', title: 'Bandwidth & Hotspot Redundancy', description: `For a virtual event with ${guests} participants, ensure the primary presenter has a mobile 5G hotspot tethered as fallback in case Wi-Fi drops.`, severity: 'HIGH', category: 'Technical', recommendation: 'Designate a co-host with slides downloaded locally.', actionText: 'Check Tech', actionRoute: 'dashboard', createdAt: new Date().toISOString() },
      { id: 'ins-on-2', title: 'Recording Auto-Start Verification', description: 'Enable auto-recording to cloud so vital opening remarks are never lost.', severity: 'MEDIUM', category: 'Operations', recommendation: 'Verify meeting recording storage quota.', actionText: 'View Settings', actionRoute: 'dashboard', createdAt: new Date().toISOString() },
    ];

    return {
      eventSummary: `A high-impact virtual event on ${input.onlineDetails?.platform || 'Google Meet'} for ~${guests} attendees, orchestrated with technical redundancy, professional slide presentation, and interactive audience polling.`,
      budgetPlan,
      timeline,
      runOfShow,
      vendors,
      personalizedIdeas,
      insights,
      onlineDetails: input.onlineDetails,
    };
  }

  // 2. BIRTHDAY PARTY (3-5 Hours, Compact & Fun!)
  if (input.type === 'birthday') {
    const budgetPlan: BudgetItem[] = [
      { id: 'b-bd-1', category: 'Food & Beverages', plannedAmount: Math.round(b * 0.38), spentAmount: 0, notes: `Party menu, finger foods, and welcome mocktails for ${guests} guests (~${symbol}${Math.round((b * 0.38) / Math.max(1, guests))}/person)` },
      { id: 'b-bd-2', category: 'Venue', plannedAmount: Math.round(b * 0.18), spentAmount: 0, notes: `Private party cafe / terrace hall booking for 4-hour party slot in ${input.location}` },
      { id: 'b-bd-3', category: 'Cake & Confections', plannedAmount: Math.round(b * 0.12), spentAmount: 0, notes: `Custom multi-tier artisanal birthday cake matching ${input.style} theme with dessert shooters` },
      { id: 'b-bd-4', category: 'Decorations & Balloons', plannedAmount: Math.round(b * 0.12), spentAmount: 0, notes: 'Organic balloon garland arch, neon "Happy Birthday" LED sign, and tabletop centerpieces' },
      { id: 'b-bd-5', category: 'Entertainment & Games', plannedAmount: Math.round(b * 0.10), spentAmount: 0, notes: 'Party emcee / game coordinator, sound system & curated upbeat party playlist' },
      { id: 'b-bd-6', category: 'Photography', plannedAmount: Math.round(b * 0.04), spentAmount: 0, notes: '2-hour party candid coverage & Polaroid instant guest prints' },
      { id: 'b-bd-7', category: 'Party Favors', plannedAmount: Math.round(b * 0.04), spentAmount: 0, notes: 'Personalized thank-you favor boxes for departing guests' },
      { id: 'b-bd-8', category: 'Miscellaneous', plannedAmount: Math.round(b * 0.02), spentAmount: 0, notes: 'Candles, sparklers, cutlery surplus, and buffer cash' },
    ];

    const timeline: Task[] = [
      { id: 't-bd-1', name: `Lock party venue/space in ${input.location} for 4-hour slot`, phase: '2 weeks before', deadline: '2026-10-14', status: 'pending', priority: 'high', category: 'Venue' },
      { id: 't-bd-2', name: 'Order bespoke birthday cake from boutique bakery', phase: '1 week before', deadline: '2026-10-21', status: 'pending', priority: 'high', category: 'Cake' },
      { id: 't-bd-3', name: 'Send digital WhatsApp invites & confirm RSVP headcount', phase: '1 week before', deadline: '2026-10-22', status: 'completed', priority: 'medium', category: 'Invitations' },
      { id: 't-bd-4', name: 'Curate party games, trivia questions & upbeat music playlist', phase: '3 days before', deadline: '2026-10-25', status: 'pending', priority: 'medium', category: 'Entertainment' },
      { id: 't-bd-5', name: 'Pick up balloon garland & prep favor goodie bags', phase: '1 day before', deadline: '2026-10-27', status: 'pending', priority: 'high', category: 'Decoration' },
      { id: 't-bd-6', name: 'Host party, cut cake, play games, and take group photos', phase: 'Event day', deadline: input.date, status: 'pending', priority: 'high', category: 'Activities' },
    ];

    const runOfShow: RunOfShowItem[] = [
      { id: 'ros-bd-1', time: '17:30', title: 'Venue Prep & Balloon Styling', description: 'Inspect balloon arches, set up cake table, and test party speaker volume', leadPerson: 'Party Host' },
      { id: 'ros-bd-2', time: '18:00', title: 'Guest Arrival & Welcome Drinks', description: 'Welcome drinks served, background party playlist, guests mingle', leadPerson: 'Host' },
      { id: 'ros-bd-3', time: '18:30', title: 'Party Games & Interactive Trivia', description: 'Fun interactive games, musical trivia, or customized friend quiz', leadPerson: 'Game Host' },
      { id: 'ros-bd-4', time: '19:15', title: 'Appetizers & Finger Food Spread', description: 'Warm starter appetizers and live snack counters open', leadPerson: 'Caterer' },
      { id: 'ros-bd-5', time: '19:45', title: 'Cake Cutting Ceremony', description: 'Gather everyone around cake table, light sparklers, sing Happy Birthday', leadPerson: 'Everyone' },
      { id: 'ros-bd-6', time: '20:00', title: 'Dinner Buffet & Polaroid Photo Booth', description: 'Dinner buffet open while guests take instant souvenir snaps with birthday VIP', leadPerson: 'Photographer' },
      { id: 'ros-bd-7', time: '20:45', title: 'Favors Distribution & Party Wrap-Up', description: 'Hand out return gift favor bags and conclude a memorable celebration', leadPerson: 'Host' },
    ];

    const vendors: Vendor[] = [
      { id: 'v-bd-1', name: 'SugarWhisk Artisan Cakes', category: 'Cake', estimatedCost: Math.round(b * 0.12), status: 'Shortlisted', contact: '+91 98300 77112', notes: `Custom 2kg ${input.style} cake with buttercream piping` },
      { id: 'v-bd-2', name: 'Fiesta Bites Catering Co.', category: 'Catering', estimatedCost: Math.round(b * 0.38), status: 'Shortlisted', contact: '+91 98300 88223', notes: `Kids & adult combo menu with live slider & mocktail counter` },
      { id: 'v-bd-3', name: 'BalloonBloom Party Stylists', category: 'Decorator', estimatedCost: Math.round(b * 0.12), status: 'Not Started', contact: '+91 98300 99334', notes: 'Organic balloon backdrop, LED number light & streamer wall' },
      { id: 'v-bd-4', name: 'SnapJoy Candid Moments', category: 'Photographer', estimatedCost: Math.round(b * 0.04), status: 'Not Started', contact: '+91 98300 11445', notes: '2-hour party package with 50 instant mini polaroids' },
    ];

    const personalizedIdeas: PersonalizedIdea[] = [
      { id: 'i-bd-1', category: 'Activities', title: 'Custom "How Well Do You Know the Birthday Star?" Trivia', description: 'A hilarious 15-question mobile trivia game where friends compete for silly prizes.', impactOrSavings: 'Creates guaranteed laughter and camaraderie', isFavorite: true, tags: ['Party Game', 'Memories'] },
      { id: 'i-bd-2', category: 'Food', title: 'Interactive DIY Mini Waffle / Ice Cream Sundae Bar', description: 'A dessert station where guests top their waffles with Belgian chocolate, sprinkles, and fruit.', impactOrSavings: 'A massive crowd favorite costing ~₹60/head', isFavorite: true, tags: ['Dessert Bar', 'Fun Cuisine'] },
      { id: 'i-bd-3', category: 'Unique Experiences', title: 'Retro Polaroid Wall with Personal Wishes', description: 'Peg polaroid snaps onto fairy lights with written handwritten birthday notes.', impactOrSavings: 'A physical keepsake the host treasures for years', isFavorite: true, tags: ['Photo Booth', 'Sentimental'] },
    ];

    const insights: SmartInsight[] = [
      { id: 'ins-bd-1', title: 'Cake Delivery Timing Buffer', description: 'Have the cake delivered 90 minutes before party start so temperature stabilizes and no last-minute transit panic occurs.', severity: 'HIGH', category: 'Logistics', recommendation: 'Verify delivery window with bakery.', actionText: 'Check Vendors', actionRoute: 'vendors', createdAt: new Date().toISOString() },
      { id: 'ins-bd-2', title: 'Keep Activity Blocks Snappy', description: 'Limit individual party games to 15-20 minutes to maintain high energy without guest fatigue.', severity: 'LOW', category: 'Entertainment', recommendation: 'Review run-of-show schedule.', actionText: 'View Timeline', actionRoute: 'timeline', createdAt: new Date().toISOString() },
    ];

    return {
      eventSummary: `A joyful, energetic 4-hour birthday celebration for ${guests} guests in ${input.location} with a total budget of ${symbol}${b.toLocaleString()}. Focused on high-energy party games, signature cake cutting, and memorable party snapshots!`,
      budgetPlan,
      timeline,
      runOfShow,
      vendors,
      personalizedIdeas,
      insights,
    };
  }

  // 3. COMMUNITY EVENT (Collaborative, Sessions, Volunteers, Operations)
  if (input.type === 'community') {
    const budgetPlan: BudgetItem[] = [
      { id: 'b-com-1', category: 'Venue', plannedAmount: Math.round(b * 0.25), spentAmount: 0, notes: `Community auditorium / civic hall rental in ${input.location} with stage and seating for ${guests}` },
      { id: 'b-com-2', category: 'Catering', plannedAmount: Math.round(b * 0.25), spentAmount: 0, notes: `Boxed meals, tea/coffee service, and bottled water for ${guests} attendees` },
      { id: 'b-com-3', category: 'AV & Production', plannedAmount: Math.round(b * 0.18), spentAmount: 0, notes: 'Dual wireless microphones, PA audio mixer, projection screen & podium lighting' },
      { id: 'b-com-4', category: 'Printing', plannedAmount: Math.round(b * 0.10), spentAmount: 0, notes: 'Attendee name badges, event banners, registration flyers, and route directional signage' },
      { id: 'b-com-5', category: 'Volunteers & Staff', plannedAmount: Math.round(b * 0.08), spentAmount: 0, notes: 'Volunteer meals, organizer branded tees, and honorarium appreciation tokens' },
      { id: 'b-com-6', category: 'Security', plannedAmount: Math.round(b * 0.06), spentAmount: 0, notes: 'Entry crowd marshals, first aid booth, and parking management' },
      { id: 'b-com-7', category: 'Speakers', plannedAmount: Math.round(b * 0.05), spentAmount: 0, notes: 'Guest speaker mementos, travel allowance & felicitation shawls' },
      { id: 'b-com-8', category: 'Permissions & Operations', plannedAmount: Math.round(b * 0.03), spentAmount: 0, notes: 'Municipal permissions, electrical backup surcharge, and waste management' },
    ];

    const timeline: Task[] = [
      { id: 't-com-1', name: `Secure community hall & file municipal sound permits in ${input.location}`, phase: '2 months before', deadline: '2026-09-01', status: 'pending', priority: 'high', category: 'Venue' },
      { id: 't-com-2', name: 'Open volunteer registration & assign coordinator roles', phase: '1 month before', deadline: '2026-10-01', status: 'pending', priority: 'high', category: 'Volunteers' },
      { id: 't-com-3', name: 'Finalize speaker lineup & session agenda schedule', phase: '2 weeks before', deadline: '2026-10-15', status: 'pending', priority: 'high', category: 'Program' },
      { id: 't-com-4', name: 'Print stage backdrop banner & delegate name badges', phase: '1 week before', deadline: '2026-10-22', status: 'pending', priority: 'medium', category: 'Printing' },
      { id: 't-com-5', name: 'Conduct volunteer dry run & PA sound system testing', phase: '2 days before', deadline: '2026-10-27', status: 'pending', priority: 'high', category: 'Technical' },
      { id: 't-com-6', name: 'Manage attendee registration, stage sessions & hall teardown', phase: 'Event day', deadline: input.date, status: 'pending', priority: 'high', category: 'Operations' },
    ];

    const runOfShow: RunOfShowItem[] = [
      { id: 'ros-com-1', time: '08:30', title: 'Volunteer Briefing & Desk Setup', description: 'Brief 10-15 volunteers, hand out badges, verify emergency exits', leadPerson: 'Volunteer Lead' },
      { id: 'ros-com-2', time: '09:00', title: 'Registration & Morning Tea', description: 'Welcome attendees, scan tickets/RSVPs, distribute badges and conference kits', leadPerson: 'Registration Desk' },
      { id: 'ros-com-3', time: '09:45', title: 'Keynote & Community Welcome', description: 'Opening address outlining event vision, followed by keynote address', leadPerson: 'Convenor' },
      { id: 'ros-com-4', time: '11:00', title: 'Panel Sessions / Workshops', description: 'Multi-speaker breakout tracks or open town-hall discussion', leadPerson: 'Moderator' },
      { id: 'ros-com-5', time: '12:30', title: 'Networking Lunch', description: 'Catered lunch boxes, exhibition stalls open, networking mixer', leadPerson: 'Catering Lead' },
      { id: 'ros-com-6', time: '14:00', title: 'Community Showcases & Open Mic', description: 'Short 5-minute showcase presentations from participants', leadPerson: 'MC' },
      { id: 'ros-com-7', time: '16:00', title: 'Felicitations, Next Steps & Teardown', description: 'Vote of thanks, volunteer appreciation, and orderly venue cleanup', leadPerson: 'Convenor' },
    ];

    const vendors: Vendor[] = [
      { id: 'v-com-1', name: `${input.location} Civic Cultural Center`, category: 'Venue', estimatedCost: Math.round(b * 0.25), status: 'Shortlisted', contact: '+91 98400 11223', notes: `Capacity for ${guests} with generator backup` },
      { id: 'v-com-2', name: 'ProSound Audio & Projector Rentals', category: 'Equipment', estimatedCost: Math.round(b * 0.18), status: 'Shortlisted', contact: '+91 98400 22334', notes: '4 wireless collar mics, 2 handheld mics, PA amp, and HDMI projector' },
      { id: 'v-com-3', name: 'Community Kitchen Bulk Meals', category: 'Catering', estimatedCost: Math.round(b * 0.25), status: 'Not Started', contact: '+91 98400 33445', notes: `Hygienic boxed meals and tea/snack service for ${guests} participants` },
      { id: 'v-com-4', name: 'SpeedyPrint Banners & Badges', category: 'Printing', estimatedCost: Math.round(b * 0.10), status: 'Not Started', contact: '+91 98400 44556', notes: 'Laminated badges with eco lanyards and 20x10 stage flex backdrop' },
    ];

    const personalizedIdeas: PersonalizedIdea[] = [
      { id: 'i-com-1', category: 'Activities', title: 'Live QR-Code Feedback & Action Idea Wall', description: 'Project a live QR code on screen where attendees post ideas for community projects in real time.', impactOrSavings: 'Turns passive attendees into active collaborators', isFavorite: true, tags: ['Collaboration', 'Civic Tech'] },
      { id: 'i-com-2', category: 'Budget Saving', title: 'Eco-Friendly Bring-Your-Own-Bottle Station', description: 'Setup 20L water dispenser cans with paper cups instead of hundreds of single-use plastic bottles.', impactOrSavings: 'Saves ~₹5,000 and eliminates plastic waste', isFavorite: true, tags: ['Eco-Friendly', 'Green Event'] },
      { id: 'i-com-3', category: 'Unique Experiences', title: 'Volunteer Spotlight Felicitation Ceremony', description: 'Award framed certificates and eco-plant saplings to key youth volunteer coordinators during closing.', impactOrSavings: 'Builds long-term community loyalty', isFavorite: false, tags: ['Recognition', 'Community Pride'] },
    ];

    const insights: SmartInsight[] = [
      { id: 'ins-com-1', title: 'Registration Queue Bottleneck Risk', description: `For ${guests} attendees, a single registration desk will create a 25-minute line at 9 AM. Split into 2 alphabetical queues (A-M and N-Z).`, severity: 'HIGH', category: 'Logistics', recommendation: 'Assign 2 volunteers per queue.', actionText: 'View Tasks', actionRoute: 'timeline', createdAt: new Date().toISOString() },
      { id: 'ins-com-2', title: 'Sound Clearance & Permission Check', description: 'Confirm municipal sound curfew if using amplified PA speakers after dark.', severity: 'MEDIUM', category: 'Legal', recommendation: 'Double check local police permission.', actionText: 'View Checklist', actionRoute: 'dashboard', createdAt: new Date().toISOString() },
    ];

    return {
      eventSummary: `A well-structured community gathering for ${guests} attendees in ${input.location} with an organized budget of ${symbol}${b.toLocaleString()}, prioritizing registration flow, volunteer coordination, and seamless session delivery.`,
      budgetPlan,
      timeline,
      runOfShow,
      vendors,
      personalizedIdeas,
      insights,
    };
  }

  // 4. CUSTOM EVENT (e.g., College Farewell, Engagement Party, Product Launch, Gaming Tournament)
  if (input.type === 'custom') {
    const customTitle = input.customEventType || input.name || 'Special Gathering';
    const isFarewell = customTitle.toLowerCase().includes('farewell') || customTitle.toLowerCase().includes('college');
    const isLaunch = customTitle.toLowerCase().includes('launch') || customTitle.toLowerCase().includes('product');

    const budgetPlan: BudgetItem[] = [
      { id: 'b-cust-1', category: 'Venue', plannedAmount: Math.round(b * 0.28), spentAmount: 0, notes: `${customTitle} celebration venue reservation in ${input.location}` },
      { id: 'b-cust-2', category: 'Catering', plannedAmount: Math.round(b * 0.34), spentAmount: 0, notes: `Festive banquet dinner & beverage counter for ${guests} attendees` },
      { id: 'b-cust-3', category: 'Entertainment', plannedAmount: Math.round(b * 0.15), spentAmount: 0, notes: isFarewell ? 'DJ sound system, dance floor lighting, and student emcee awards' : 'Keynote presentation staging and background audio' },
      { id: 'b-cust-4', category: isFarewell ? 'Party Favors' : 'Promotion & Marketing', plannedAmount: Math.round(b * 0.10), spentAmount: 0, notes: isFarewell ? 'Custom batch souvenirs, memento shields, and yearbooks' : 'Promotional media kit and launch showcase displays' },
      { id: 'b-cust-5', category: 'Decoration', plannedAmount: Math.round(b * 0.08), spentAmount: 0, notes: `${input.style} thematic backdrop, welcome arch, and stage lighting` },
      { id: 'b-cust-6', category: 'Miscellaneous', plannedAmount: Math.round(b * 0.05), spentAmount: 0, notes: 'Contingency cash and on-day runner support' },
    ];

    const timeline: Task[] = [
      { id: 't-cust-1', name: `Finalize venue contract for ${customTitle} in ${input.location}`, phase: '1 month before', deadline: '2026-10-01', status: 'pending', priority: 'high', category: 'Venue' },
      { id: 't-cust-2', name: isFarewell ? 'Collate batch photo archives for nostalgic video montage' : 'Finalize launch deck and speaker rehearsal', phase: '2 weeks before', deadline: '2026-10-15', status: 'pending', priority: 'high', category: 'Program' },
      { id: 't-cust-3', name: 'Confirm headcount & order customized event mementos', phase: '1 week before', deadline: '2026-10-22', status: 'pending', priority: 'medium', category: 'Logistics' },
      { id: 't-cust-4', name: 'Coordinate sound check and dance floor lighting setup', phase: '2 days before', deadline: '2026-10-27', status: 'pending', priority: 'high', category: 'Technical' },
      { id: 't-cust-5', name: `Execute ${customTitle} schedule, dinner, and photo sessions`, phase: 'Event day', deadline: input.date, status: 'pending', priority: 'high', category: 'Operations' },
    ];

    const runOfShow: RunOfShowItem[] = [
      { id: 'ros-cust-1', time: '16:30', title: 'Stage Setup & DJ Sound Check', description: 'Test stage lighting, sound levels, and video projector display', leadPerson: 'Event Lead' },
      { id: 'ros-cust-2', time: '17:30', title: 'Red Carpet Entry & Welcome Mocktails', description: 'Guests arrive, photo booth shoots, background beats play', leadPerson: 'Reception Team' },
      { id: 'ros-cust-3', time: '18:15', title: isFarewell ? 'Nostalgic Video Reel & Senior Titles' : 'Keynote Presentation & Demonstration', description: isFarewell ? 'Screen funny memories video followed by senior title presentations' : 'Live demonstration of featured project', leadPerson: 'Host' },
      { id: 'ros-cust-4', time: '19:30', title: 'Memento & Certificate Distribution', description: 'Present customized tokens of appreciation to key participants', leadPerson: 'Chief Guest' },
      { id: 'ros-cust-5', time: '20:15', title: 'Dinner Buffet & DJ Dance Floor Opens', description: 'Festive dinner buffet opens while music turns up', leadPerson: 'DJ' },
      { id: 'ros-cust-6', time: '22:00', title: 'Grand Group Photo & Closing Farewell', description: 'Group celebration photo under stage lights before send-off', leadPerson: 'Photographer' },
    ];

    const vendors: Vendor[] = [
      { id: 'v-cust-1', name: `${input.location} Heritage Banquet Lounge`, category: 'Venue', estimatedCost: Math.round(b * 0.28), status: 'Shortlisted', contact: '+91 98500 11223', notes: `Party banquet with dance floor and audio hookups` },
      { id: 'v-cust-2', name: 'SonicPulse DJ & Staging Rigs', category: 'Entertainment', estimatedCost: Math.round(b * 0.15), status: 'Shortlisted', contact: '+91 98500 22334', notes: 'Party DJ, strobe lighting rig, and wireless mics' },
      { id: 'v-cust-3', name: 'Royal Plate Catering Banquet', category: 'Catering', estimatedCost: Math.round(b * 0.34), status: 'Not Started', contact: '+91 98500 33445', notes: `Dinner buffet with 3 live appetizer counters for ${guests} guests` },
      { id: 'v-cust-4', name: 'Prestige Awards & Print Studios', category: 'Party Favors', estimatedCost: Math.round(b * 0.10), status: 'Not Started', contact: '+91 98500 44556', notes: 'Laser-engraved batch trophies, mementos, and printed yearbooks' },
    ];

    const personalizedIdeas: PersonalizedIdea[] = [
      { id: 'i-cust-1', category: 'Unique Experiences', title: isFarewell ? '"Hall of Fame" Senior Batch Title Awards' : 'Interactive Product Experience Sandbox', description: isFarewell ? 'Award humorous, affectionate framed titles (e.g. "Most Likely to Be Late", "Batch Philosopher") voted by peers.' : 'Allow guests to experience hands-on stations.', impactOrSavings: 'The emotional highlight of the evening', isFavorite: true, tags: ['Memories', 'Spotlight'] },
      { id: 'i-cust-2', category: 'Photography', title: '360-Degree Video Spin Booth with Digital Sharing', description: 'A slow-motion rotating video platform where groups capture fun cinematic clips instantly sent to their phones.', impactOrSavings: 'Viral social media engagement among guests', isFavorite: true, tags: ['Viral', 'Photo-Op'] },
      { id: 'i-cust-3', category: 'Budget Saving', title: 'Crowdsourced Batch Memory Montage', description: 'Collect photos via a shared Google Drive folder instead of hiring an expensive third-party video agency.', impactOrSavings: 'Saves ~₹12,000 on video production', isFavorite: false, tags: ['Crowdsourced', 'Smart Savings'] },
    ];

    const insights: SmartInsight[] = [
      { id: 'ins-cust-1', title: 'Memento Delivery Lead Time', description: 'Custom engraved mementos require 7-10 business days for laser printing. Place order early to avoid air-rush fees.', severity: 'HIGH', category: 'Logistics', recommendation: 'Collect final attendee names by this weekend.', actionText: 'Review Items', actionRoute: 'timeline', createdAt: new Date().toISOString() },
      { id: 'ins-cust-2', title: 'Music Curfew Coordination', description: 'Venues often have a strict 10:00 PM DJ cutoff. Start the formal title ceremony early so dance floor time is not truncated.', severity: 'MEDIUM', category: 'Program', recommendation: 'Review run-of-show timing.', actionText: 'View Schedule', actionRoute: 'timeline', createdAt: new Date().toISOString() },
    ];

    return {
      eventSummary: `A customized, deeply personal ${customTitle} planned for ${guests} guests in ${input.location} with a total budget of ${symbol}${b.toLocaleString()}, tailored to create lasting memories and high-energy celebration.`,
      budgetPlan,
      timeline,
      runOfShow,
      vendors,
      personalizedIdeas,
      insights,
    };
  }

  // 5. WEDDING (Full-Scale Ceremony, Banquets, Traditions, Vendor Heavy)
  const budgetPlan: BudgetItem[] = [
    { id: 'b-wed-1', category: 'Catering', plannedAmount: Math.round(b * 0.35), spentAmount: 0, notes: `Curated wedding feast with multi-cuisine live counters for ${guests} guests (~${symbol}${Math.round((b * 0.35) / Math.max(1, guests))}/plate)` },
    { id: 'b-wed-2', category: 'Venue', plannedAmount: Math.round(b * 0.22), spentAmount: 0, notes: `Heritage banquet hall / lawn booking for ceremonies and reception in ${input.location}` },
    { id: 'b-wed-3', category: 'Decoration', plannedAmount: Math.round(b * 0.14), spentAmount: 0, notes: `${input.style} mandap floral draping, entrance archway, and ambient dining lighting` },
    { id: 'b-wed-4', category: 'Photography', plannedAmount: Math.round(b * 0.10), spentAmount: 0, notes: '2-day candid photo & cinematic film team with drone coverage' },
    { id: 'b-wed-5', category: 'Clothing', plannedAmount: Math.round(b * 0.07), spentAmount: 0, notes: 'Bridal and groom traditional attire, accessories & bridal party coordination' },
    { id: 'b-wed-6', category: 'Entertainment', plannedAmount: Math.round(b * 0.04), spentAmount: 0, notes: 'Sangeet DJ, live shehnai / instrumental artists, and sound setup' },
    { id: 'b-wed-7', category: 'Makeup', plannedAmount: Math.round(b * 0.03), spentAmount: 0, notes: 'Bridal hair, HD makeup artist, saree draping & touch-up kit' },
    { id: 'b-wed-8', category: 'Transportation', plannedAmount: Math.round(b * 0.02), spentAmount: 0, notes: 'Vintage bridal car, guest shuttle vans, and valet parking team' },
    { id: 'b-wed-9', category: 'Miscellaneous', plannedAmount: Math.round(b * 0.03), spentAmount: 0, notes: 'Priest honorarium, cash dakshina envelopes, and emergency contingency fund' },
  ];

  const timeline: Task[] = [
    { id: 't-wed-1', name: `Finalize wedding banquet venue in ${input.location}`, phase: '6 months before', deadline: '2026-05-01', status: 'pending', priority: 'high', category: 'Venue' },
    { id: 't-wed-2', name: `Shortlist caterers for ${guests} guests & schedule menu tasting`, phase: '6 months before', deadline: '2026-05-15', status: 'pending', priority: 'high', category: 'Catering' },
    { id: 't-wed-3', name: 'Book lead candid wedding photographer and cinematic film crew', phase: '3 months before', deadline: '2026-07-01', status: 'pending', priority: 'high', category: 'Photography' },
    { id: 't-wed-4', name: 'Book bridal makeup artist and schedule bridal trial', phase: '3 months before', deadline: '2026-07-15', status: 'pending', priority: 'high', category: 'Makeup' },
    { id: 't-wed-5', name: `Send digital & traditional invitations matching ${input.style} aesthetic`, phase: '1 month before', deadline: '2026-09-01', status: 'pending', priority: 'medium', category: 'Invitations' },
    { id: 't-wed-6', name: 'Lock mandap florals, stage lighting, and table centerpieces', phase: '2 weeks before', deadline: '2026-10-15', status: 'pending', priority: 'high', category: 'Decoration' },
    { id: 't-wed-7', name: 'Confirm final plate guarantee count with catering management', phase: '1 week before', deadline: '2026-10-22', status: 'pending', priority: 'high', category: 'Catering' },
    { id: 't-wed-8', name: 'Execute wedding ceremonies, guest reception & photography', phase: 'Event day', deadline: input.date, status: 'pending', priority: 'high', category: 'Ceremony' },
  ];

  const runOfShow: RunOfShowItem[] = [
    { id: 'ros-wed-1', time: '14:00', title: 'Bridal Makeup & Stylist Prep', description: 'Bridal artist arrives, saree draping, bridal solo portraits', leadPerson: 'Makeup Artist' },
    { id: 'ros-wed-2', time: '17:00', title: 'Baraat / Groom Arrival & Welcome', description: 'Groom procession with music, traditional Milni greeting by bride family', leadPerson: 'Family Lead' },
    { id: 'ros-wed-3', time: '18:15', title: 'Varmala / Garland Exchange Ceremony', description: 'Stage ceremony with celebratory flower petals and couple portraits', leadPerson: 'Priest / Emcee' },
    { id: 'ros-wed-4', time: '19:00', title: 'Main Mandap Wedding Vows & Pheras', description: 'Sacred fire rituals, chanting of mantras, and mangalsutra ceremony', leadPerson: 'Priest' },
    { id: 'ros-wed-5', time: '20:30', title: 'Grand Wedding Dinner Reception', description: 'Multi-course banquet feast opens, live dessert counters, guest greetings', leadPerson: 'Caterer' },
    { id: 'ros-wed-6', time: '22:30', title: 'Bidaai / Emotional Send-off Ceremony', description: 'Traditional blessings from elders, bridal farewell, and car departure', leadPerson: 'Family' },
  ];

  const vendors: Vendor[] = [
    { id: 'v-wed-1', name: `${input.location} Royal Heritage Banquets`, category: 'Venue', estimatedCost: Math.round(b * 0.22), status: 'Shortlisted', contact: '+91 98311 22334', notes: `Capacity for ${guests} guests, bridal suite included` },
    { id: 'v-wed-2', name: 'Shahi Dawat Royal Caterers', category: 'Catering', estimatedCost: Math.round(b * 0.35), status: 'Shortlisted', contact: '+91 98311 33445', notes: `Signature live counters, traditional sweets, silver service for ${guests} guests` },
    { id: 'v-wed-3', name: 'Vedic Blooms & Mandap Decor', category: 'Decorator', estimatedCost: Math.round(b * 0.14), status: 'Not Started', contact: '+91 98311 44556', notes: `${input.style} mandap with fresh marigold/jasmine florals & brass elements` },
    { id: 'v-wed-4', name: 'Kolkata Frames Candid Wedding Cinematics', category: 'Photographer', estimatedCost: Math.round(b * 0.10), status: 'Not Started', contact: '+91 98311 55667', notes: '2 candid leads, drone coverage, 4K wedding film, and raw drive backup' },
    { id: 'v-wed-5', name: 'GlamArt Bridal Studio', category: 'Makeup', estimatedCost: Math.round(b * 0.03), status: 'Not Started', contact: '+91 98311 66778', notes: 'HD airbrush makeup, saree styling & assistant for mother/sister' },
  ];

  const personalizedIdeas: PersonalizedIdea[] = [
    { id: 'i-wed-1', category: 'Decoration', title: 'Botanical Herb & Marigold Floating Urulis', description: 'Place antique brass urulis filled with scented floating candles and fresh yellow marigolds at each banquet table.', impactOrSavings: 'Saves 35% on tall glass table centerpieces', isFavorite: true, tags: ['Traditional', 'Aesthetic'] },
    { id: 'i-wed-2', category: 'Food', title: 'Regional Heritage Dessert Tasting Stall', description: `Feature live warm artisan delicacies native to ${input.location} (such as freshly made patishapta and baked rosogolla).`, impactOrSavings: 'A memorable cultural conversation starter', isFavorite: true, tags: ['Cuisine', 'Heritage'] },
    { id: 'i-wed-3', category: 'Activities', title: 'Generational Ancestral Photo Gallery Walkway', description: 'Drape vintage framed black-and-white wedding portraits of parents and grandparents along the entrance corridor.', impactOrSavings: 'Deep emotional resonance for elderly family members', isFavorite: true, tags: ['Sentimental', 'Keepsake'] },
  ];

  const insights: SmartInsight[] = [
    { id: 'ins-wed-1', title: `Catering and Venue represent ~${Math.round((0.35 + 0.22) * 100)}% of your budget`, description: `For ${guests} guests with ${symbol}${b.toLocaleString()} budget, locking per-plate caterer terms now guards against seasonal inflation.`, severity: 'HIGH', category: 'Budget', recommendation: 'Negotiate plate guarantees with caterer.', actionText: 'Check Budget', actionRoute: 'budget', createdAt: new Date().toISOString() },
    { id: 'ins-wed-2', title: 'Prime Wedding Date Vendor Shortage', description: 'Peak wedding dates in your region see high demand for candid photographers and bridal makeup artists.', severity: 'MEDIUM', category: 'Vendors', recommendation: 'Lock artist retainers this week.', actionText: 'View Vendors', actionRoute: 'vendors', createdAt: new Date().toISOString() },
  ];

  return {
    eventSummary: `A magnificent ${input.style} wedding celebration for ${guests} guests in ${input.location} with a total budget of ${symbol}${b.toLocaleString()}, prioritizing heartfelt ceremonies, heritage banqueting, and cinematic memories.`,
    budgetPlan,
    timeline,
    runOfShow,
    vendors,
    personalizedIdeas,
    insights,
  };
}

export const STAGED_STEPS: StagedLoadingStep[] = [
  { step: 1, label: 'Understanding your event type & format...', detail: 'Analyzing whether this is a Wedding, Birthday party, Community event, Online webinar, or Custom gathering.' },
  { step: 2, label: 'Engineering tailored budget categories...', detail: 'Allocating funds strictly into event-appropriate buckets (no forced wedding models!).' },
  { step: 3, label: 'Building milestone & run-of-show timelines...', detail: 'Crafting realistic prep phases and timed hour-by-hour event schedule.' },
  { step: 4, label: 'Curating specialized vendor roster...', detail: 'Selecting vendors matching your specific event type and city pricing.' },
  { step: 5, label: 'Synthesizing creative recommendations...', detail: 'Designing personalized touches and intelligent risk assessments.' },
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
      await runProgress(i, 500);
    }
    return generateContextualFallbackPlan(input);
  }

  try {
    // Stage 1
    await runProgress(0, 250);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    await runProgress(1, 250);

    const isOnline = input.format === 'online';
    const isHybrid = input.format === 'hybrid';
    const eventConcept = input.type === 'custom' && input.customEventType ? input.customEventType : input.type;

    const eventTypeRules = {
      wedding: `This is a WEDDING. Generate a detailed, ceremony-rich plan.
- Budget categories should include: Venue, Catering, Decoration, Photography, Clothing, Entertainment, Makeup, Transportation, Miscellaneous.
- Timeline phases should span months of preparation (6 months before, 3 months before, 1 month before, 2 weeks before, 1 week before, Event day).
- Run of show should detail pre-wedding rituals, baraat/arrival, ceremony/vows, dinner reception, and send-off.`,
      birthday: `This is a BIRTHDAY PARTY. Do NOT generate a wedding-style plan!
- Duration is typically 3 to 5 hours.
- Budget categories MUST focus on party items: Food & Beverages, Venue, Cake & Confections, Decorations & Balloons, Entertainment & Games, Photography, Party Favors, Miscellaneous. DO NOT include clothing or bridal makeup!
- Timeline must be compact (2 weeks before, 1 week before, 3 days before, 1 day before, Party day). NO 6-month timelines!
- Run of show must cover guest arrival, party games, appetizers, cake cutting, dinner buffet, photos, and party favors.`,
      community: `This is a COMMUNITY / CIVIC EVENT. Focus on crowd management, volunteers, and sessions.
- Budget categories should include: Venue & Facilities, Catering & Boxed Meals, AV & Stage Production, Printing & Badges, Volunteers & Staff, Security & First Aid, Speakers, Operations & Permissions.
- Timeline should focus on permits, volunteer registration, AV testing, and run sheets.
- Run of show should detail registration desk, keynote welcome, breakout sessions, networking lunch, and community wrap-up.`,
      custom: `This is a CUSTOM EVENT: "${input.customEventType || input.name}".
- Understand the user's specific concept ("${input.customEventType || input.name}") and determine the exact appropriate duration, budget categories, vendors, and run of show for this specific gathering (e.g. College Farewell, Product Launch, Baby Shower, Gaming Tournament).
- DO NOT default to a wedding!`,
    }[input.type] || `Plan this event according to its specific nature: ${input.type}.`;

    const formatRule = isOnline
      ? `EVENT FORMAT: 100% ONLINE / VIRTUAL on ${input.onlineDetails?.platform || 'Google Meet'}.
- NO physical venue rentals, physical catering, or on-site decor!
- Budget categories MUST be digital: Platform & Software, Speakers, AV & Production, Design & Assets, Technical Setup, Miscellaneous.
- Include tasks for meeting link creation, mic/camera dry runs, and cloud recording.
- Run of show must cover green room soundcheck, live webinar broadcast, and Q&A.`
      : isHybrid
      ? `EVENT FORMAT: HYBRID (Dual In-Person & Virtual Stream on ${input.onlineDetails?.platform || 'Google Meet'}). Include both physical venue logistics and live-streaming AV setup.`
      : `EVENT FORMAT: IN-PERSON in ${input.location}.`;

    const systemPrompt = `You are EventPilot AI, an elite event planner.
Generate a deeply tailored, realistic event plan for:
- Event Name: ${input.name}
- Event Type: ${input.type} (${eventConcept})
- Format: ${input.format || 'in-person'}
- Target Date: ${input.date}
- Location: ${input.location}
- Attendees / Guests: ${input.guestCount}
- Budget: ${input.currency} ${input.totalBudget}
- Style: ${input.style}
- Specific Preferences & Vision: "${input.preferences}"

CRITICAL PLANNING RULES:
${eventTypeRules}

${formatRule}

IMPORTANT:
- Total budget must sum to exactly ${input.totalBudget}.
- Return realistic vendors for ${input.location} (or virtual service providers if online).
- Generate a run-of-show schedule for event day with realistic timed blocks.

Return ONLY raw valid JSON adhering to this schema:
{
  "eventSummary": "Executive overview of this specific event...",
  "budgetPlan": [
    { "id": "b-1", "category": "Category Name", "plannedAmount": 10000, "spentAmount": 0, "notes": "..." }
  ],
  "timeline": [
    { "id": "t-1", "name": "Task name", "deadline": "YYYY-MM-DD", "phase": "1 week before", "status": "pending", "priority": "high", "category": "Category", "notes": "..." }
  ],
  "runOfShow": [
    { "id": "ros-1", "time": "18:00", "title": "Activity name", "description": "...", "leadPerson": "Host" }
  ],
  "vendors": [
    { "id": "v-1", "name": "Vendor name", "category": "Category", "estimatedCost": 5000, "status": "Shortlisted", "contact": "+...", "notes": "..." }
  ],
  "personalizedIdeas": [
    { "id": "i-1", "category": "Activities", "title": "Title", "description": "...", "impactOrSavings": "...", "isFavorite": true, "tags": ["tag1"] }
  ],
  "insights": [
    { "id": "ins-1", "title": "Title", "description": "...", "severity": "HIGH", "category": "Logistics", "recommendation": "...", "actionText": "Action", "actionRoute": "timeline" }
  ]
}`;

    // Step 2 & 3
    await runProgress(2, 250);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.6,
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

    if (input.onlineDetails) {
      parsed.onlineDetails = input.onlineDetails;
    }

    return parsed;
  } catch (error) {
    console.warn('Gemini API call failed or encountered error. Falling back to contextual plan:', error);
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
 * with deep awareness of current event state, type, and format.
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
  const isOnline = event.format === 'online';
  const customDesc = event.type === 'custom' && event.customEventType ? `Custom: ${event.customEventType}` : event.type;

  const contextData = `
CURRENT EVENT DOSSIER:
- Event: "${event.name}" (${customDesc}, ${event.style}, Format: ${event.format || 'in-person'})
- Target Date: ${event.date} (${isOnline ? 'Virtual Stage' : event.location})
- Attendees / Guests: ${event.guestCount}
- Total Budget: ${symbol}${event.totalBudget.toLocaleString()}
- Total Spent: ${symbol}${totalSpent.toLocaleString()} | Remaining: ${symbol}${remaining.toLocaleString()}
- User Preferences: "${event.preferences || 'Standard expectations'}"
${isOnline && event.onlineDetails ? `- Virtual Platform: ${event.onlineDetails.platform} | Link: ${event.onlineDetails.meetingLink || 'Not generated'} | Recording: ${event.onlineDetails.recordingRequired ? 'Yes' : 'No'}` : ''}
- Booked Vendors: ${bookedVendors.join(', ') || 'None yet'}
- Unbooked / Shortlisted Vendors: ${unbookedVendors.join(', ') || 'None'}
- Incomplete Tasks (${pendingTasks.length}): ${pendingTasks.slice(0, 8).join('; ')}
`;

  if (!apiKey) {
    const qLower = userQuestion.toLowerCase();

    // 1. Birthday Specific Questions
    if (event.type === 'birthday') {
      if (qLower.includes('game') || qLower.includes('activities') || qLower.includes('entertain')) {
        return `### 3 Crowd-Pleasing Party Games for ${event.name} (${event.guestCount} Guests)

1. **Custom VIP Trivia & Memory Bluff**:
   - Write 12 quirky multiple-choice questions about the birthday person. Guests vote on their phones or small dry-erase boards.
   - *Time*: 20 mins • *Cost*: ₹0 • *Energy*: High laughter and friendly banter.
2. **Music Freeze / Name That 10-Second Tune**:
   - Play popular songs from milestone years of the birthday person's life. First table to guess correctly scores points.
   - *Time*: 15 mins • *Cost*: ₹0.
3. **Instant Polaroid Scrapbook Challenge**:
   - Give guests fun silly props (vintage glasses, funny speech bubbles). Each guest snaps a polaroid and writes a 1-sentence funny memory in the scrapbook.`;
      }
      if (qLower.includes('cake') || qLower.includes('bakery')) {
        const kgNeeded = Math.max(1, Math.ceil(event.guestCount * 0.1));
        return `### Birthday Cake Recommendation for ${event.guestCount} Guests
- **Optimal Cake Size**: **${kgNeeded} to ${kgNeeded + 0.5} kg** (approx 100-120g per guest).
- **Flavor Trend**: A double-tier combination: Bottom tier dark chocolate ganache (crowd-pleaser), top tier fresh berry vanilla.
- **Timing**: Have the cake delivered **90 minutes before party kickoff** to let the buttercream stabilize at room temperature.
- **Estimated Cost**: In ${event.location}, an artisanal custom themed cake runs ~${symbol}${Math.round(kgNeeded * 1400).toLocaleString()}.`;
      }
      if (qLower.includes('schedule') || qLower.includes('timeline') || qLower.includes('run of show')) {
        return `### Optimal 4-Hour Birthday Run-of-Show
- **18:00**: Guest Arrival, Welcome Mocktails & Upbeat Background Music
- **18:30**: Interactive Party Games & Icebreakers
- **19:15**: Appetizers & Finger Food Service
- **19:45**: Cake Cutting Ceremony, Singing & Birthday Toast
- **20:00**: Dinner Buffet & Photo Booth Session
- **20:45**: Return Favors Distribution & Warm Send-Off`;
      }
    }

    // 2. Online Event Specific Questions
    if (isOnline) {
      if (qLower.includes('rehearsal') || qLower.includes('tech') || qLower.includes('prepare') || qLower.includes('mic')) {
        return `### Virtual Event Technical Rehearsal Checklist (${event.onlineDetails?.platform || 'Google Meet'})
1. **Audio Isolation Test**: Presenters must use a dedicated external USB mic (or noise-cancelling headset), not laptop built-in mics.
2. **Lighting & Camera Angle**: Position webcam at eye level with soft frontal lighting (avoid bright windows directly behind the speaker).
3. **Screen Share Rehearsal**: If sharing slides with video/audio, ensure "Share tab audio" is enabled in your browser.
4. **Internet Fallback**: Designate a mobile hotspot on standby in case primary fiber drops.
5. **Assigned Co-Host**: Ensure a co-host has moderator rights to mute stray unmuted mics and paste links in chat.`;
      }
      if (qLower.includes('engagement') || qLower.includes('interactive') || qLower.includes('poll')) {
        return `### Keeping ${event.guestCount} Online Attendees Engaged
- **Every 10-12 Minutes Checkpoint**: Never talk for >15 minutes without an audience interaction (ask a 1-word question in chat).
- **Live Slido / Mentimeter Word Cloud**: Post a 1-click QR code on slide 3 to visualize audience expectations on screen.
- **Dedicated Chat Host**: Have your moderator actively reply to chat comments in real time so attendees feel acknowledged.`;
      }
    }

    // 3. Community Event Questions
    if (event.type === 'community') {
      if (qLower.includes('volunteer') || qLower.includes('staff') || qLower.includes('people')) {
        const volunteersNeeded = Math.max(3, Math.ceil(event.guestCount / 15));
        return `### Volunteer Staffing Plan for ${event.guestCount} Attendees
- **Recommended Volunteer Roster**: **${volunteersNeeded} to ${volunteersNeeded + 2} volunteers**.
- **Role Allocation**:
  - *Registration Desk (2-3 volunteers)*: Check-in, badges, welcome flyers.
  - *Audio/Visual & Stage (1-2 volunteers)*: Mic management, presentation laptop cueing.
  - *Crowd & Logistics (2 volunteers)*: Guiding attendees, managing refreshments line.
  - *Floating Coordinator (1 volunteer)*: Assisting convenors and resolving emergencies.
- **Tip**: Conduct a 15-minute morning briefing with coffee and print a 1-page run sheet for each volunteer.`;
      }
    }

    // 4. Custom Event (e.g. College Farewell)
    if (event.type === 'custom') {
      const customName = event.customEventType || event.name;
      if (qLower.includes('idea') || qLower.includes('activity') || qLower.includes('titles') || qLower.includes('awards')) {
        return `### Creative Ideas for ${customName} (${event.guestCount} Guests)
1. **"Hall of Fame" Senior / VIP Title Citations**:
   - Present humorous, affectionate laminated citations (e.g., "Most Likely to Solve It Last Minute", "Chief Morale Officer").
2. **Nostalgic 4-Minute Video Reel**:
   - Screen a fast-paced compilation of photo bloopers and memories set to nostalgic acoustic music.
3. **Signature Memory Wall**:
   - Set up an interactive backdrop where every attendee signs their name and leaves a 1-sentence parting wish.`;
      }
    }

    // 5. Wedding Default
    if (qLower.includes('book first') || qLower.includes('start with')) {
      return `### Top Priority Bookings for ${event.name}
1. **Lock Your Venue & Catering Immediately**: For ${event.guestCount} guests in ${event.location}, banquet slots fill rapidly. Securing your per-plate price protects against seasonal hikes.
2. **Confirm Lead Photographer**: Premium candid cinematographers book 4-6 months out.
3. **Finalize the Guest Roster**: Invitations, seating, and caterer plate guarantees all flow from this list.`;
    }

    if (qLower.includes('save') || qLower.includes('overspending') || qLower.includes('budget')) {
      return `### Realistic Cost-Saving Strategies (Save ${symbol}30,000 - ${symbol}50,000)
1. **Transition to Digital Animated Invitations**: Saves 70-80% compared to luxury paper cards and courier postage.
2. **Repurpose Floral Decor**: Move ceremony stage pedestals and urulis into the dining foyer for the evening reception.
3. **Curate the Dessert Buffet**: Feature 2 fresh regional live hot sweets rather than 6 heavy pre-catered desserts guests leave half-eaten.`;
    }

    if (qLower.includes('this week') || qLower.includes('next 7 days') || qLower.includes('tasks')) {
      return `### Action Plan for This Week
- **Priority 1**: Finalize booking for your pending vendors (${unbookedVendors.slice(0, 2).join(' and ') || 'catering and lead photographer'}).
- **Priority 2**: Review the banquet floor plan with the decorator to ensure smooth flow for ${event.guestCount} attendees.
- **Priority 3**: Verify advance payment receipts and update the budget tracker in your EventPilot dashboard.`;
    }

    return `Hello! As your EventPilot AI planner for **${event.name}** (${customDesc}), I'm tracking your plan for **${event.guestCount} attendees** with **${symbol}${remaining.toLocaleString()} uncommitted budget remaining**.

Based on your **${event.style}** setting in **${event.location}**, what would you like help with today? I can optimize your budget categories, refine your hour-by-hour run of show, or review vendor contracts!`;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const conversationHistory = history.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const systemInstruction = `You are EventPilot AI, an elite event planning project manager and consultant.
You are actively managing this specific event:
${contextData}

CRITICAL RULES:
- If this is a BIRTHDAY, respond like an expert party planner (cake sizes, party games, 4-hour timeline, balloon decor). NEVER mention weddings, brides, or mandaps!
- If this is an ONLINE EVENT, focus on audio/video streaming, participant engagement, technical rehearsals, Google Meet/Zoom mechanics.
- If this is a COMMUNITY EVENT, focus on crowd logistics, registration desk flow, volunteers, and speaker sessions.
- If this is a CUSTOM EVENT (e.g. "${event.customEventType || event.name}"), tailor all answers directly to this specific custom gathering!
- If this is a WEDDING, provide sophisticated wedding planning, ritual timing, and catering guidance.
- Always use the real event numbers, names, budget, vendors, and location.`;

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: `Understood! I am briefed on ${event.name} (${customDesc}) and ready to assist you.` }] },
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

export interface EstimateBudgetInput {
  eventType: EventType;
  customEventType?: string;
  format?: EventFormat;
  location: string;
  guestCount: number;
  style: EventStyle;
  preferences?: string;
  currency?: CurrencyCode;
}

/**
 * GenAI "Guess My Budget with AI" Estimator:
 * Genuinely event-aware and format-aware!
 * - Birthday: Short party model (3-5h, cake, games, balloons, food).
 * - Community: Civic gathering model (auditorium, sound, volunteer perks, badges).
 * - Online: Digital production model (platform license, streaming gear, speaker honorarium).
 * - Wedding: Ceremony banquet model (mandap, feast, photography, clothing).
 * - Custom: Tailored to custom event description.
 */
export async function estimateBudgetWithAI(
  input: EstimateBudgetInput
): Promise<BudgetEstimateResult> {
  const apiKey = getEffectiveApiKey();
  const guests = Math.max(1, input.guestCount || 50);
  const location = input.location || 'Kolkata, West Bengal';
  const currency = input.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : '$';
  const isOnline = input.format === 'online';

  // Location tier adjustments
  const locLower = location.toLowerCase();
  let cityMultiplier = 1.0;
  if (locLower.includes('mumbai') || locLower.includes('delhi') || locLower.includes('bangalore') || locLower.includes('bengaluru')) {
    cityMultiplier = 1.25;
  } else if (locLower.includes('dubai') || locLower.includes('london') || locLower.includes('new york') || locLower.includes('singapore')) {
    cityMultiplier = currency === 'INR' ? 2.5 : 1.2;
  } else if (locLower.includes('goa') || locLower.includes('jaipur') || locLower.includes('udaipur')) {
    cityMultiplier = 1.15;
  }

  let styleMultiplier = 1.0;
  if (input.style === 'luxury') styleMultiplier = 1.7;
  else if (input.style === 'minimal') styleMultiplier = 0.75;
  else if (input.style === 'eco-friendly') styleMultiplier = 0.85;

  let targetTotal = 50000;
  let breakdown: BudgetEstimateResult['breakdown'] = [];
  let explanation = '';
  let assumptions: string[] = [];

  // 1. ONLINE EVENT BUDGET MODEL
  if (isOnline) {
    const baseDigitalProduction = 15000;
    const attendeeScale = Math.min(25000, guests * 100);
    targetTotal = Math.round((baseDigitalProduction + attendeeScale) * styleMultiplier);
    targetTotal = Math.round(targetTotal / 1000) * 1000;

    breakdown = [
      { category: 'Platform & Software', estimatedAmount: Math.round(targetTotal * 0.28), sharePercentage: 28 },
      { category: 'Speakers', estimatedAmount: Math.round(targetTotal * 0.25), sharePercentage: 25 },
      { category: 'AV & Production', estimatedAmount: Math.round(targetTotal * 0.20), sharePercentage: 20 },
      { category: 'Design & Assets', estimatedAmount: Math.round(targetTotal * 0.12), sharePercentage: 12 },
      { category: 'Technical Setup', estimatedAmount: Math.round(targetTotal * 0.10), sharePercentage: 10 },
      { category: 'Miscellaneous', estimatedAmount: Math.round(targetTotal * 0.05), sharePercentage: 5 },
    ];

    explanation = `Calculated specifically for a 100% virtual / online event for ${guests} attendees. Unlike physical venues, online budgets are driven by enterprise webinar software licensing, presenter AV hardware, and digital slide design rather than food catering.`;
    assumptions = [
      `Includes virtual meeting room capacity for up to ${guests} attendees.`,
      `Covers speaker honorarium / digital mementos and presentation slide deck design.`,
      `Includes backup high-speed connection and post-event recording editing.`,
      `Zero physical venue or transportation overhead.`,
    ];
  }
  // 2. BIRTHDAY BUDGET MODEL (Party-oriented, 3-5h duration)
  else if (input.eventType === 'birthday') {
    const costPerGuest = Math.round(750 * cityMultiplier * styleMultiplier);
    const calculated = costPerGuest * guests;
    targetTotal = Math.max(10000, Math.round(calculated / 1000) * 1000);

    breakdown = [
      { category: 'Food & Beverages', estimatedAmount: Math.round(targetTotal * 0.38), sharePercentage: 38 },
      { category: 'Venue', estimatedAmount: Math.round(targetTotal * 0.18), sharePercentage: 18 },
      { category: 'Cake & Confections', estimatedAmount: Math.round(targetTotal * 0.12), sharePercentage: 12 },
      { category: 'Decorations & Balloons', estimatedAmount: Math.round(targetTotal * 0.12), sharePercentage: 12 },
      { category: 'Entertainment & Games', estimatedAmount: Math.round(targetTotal * 0.10), sharePercentage: 10 },
      { category: 'Photography', estimatedAmount: Math.round(targetTotal * 0.04), sharePercentage: 4 },
      { category: 'Party Favors', estimatedAmount: Math.round(targetTotal * 0.04), sharePercentage: 4 },
      { category: 'Miscellaneous', estimatedAmount: Math.round(targetTotal * 0.02), sharePercentage: 2 },
    ];

    explanation = `Calculated for a ${input.style} 4-hour birthday celebration for ${guests} guests in ${location}. Focuses on party essentials: delicious finger foods (~${symbol}${costPerGuest}/head), a custom artisan birthday cake, colorful balloon styling, and interactive party games.`;
    assumptions = [
      `Assumes a 3 to 5 hour party duration in a cafe, terrace lounge, or private party room.`,
      `Includes custom themed artisanal cake (~${Math.max(1, Math.ceil(guests * 0.1))} kg).`,
      `Covers organic balloon garland, photo props, and games coordination.`,
      `No excessive wedding overheads such as bridal trousseau or multi-day rentals.`,
    ];
  }
  // 3. COMMUNITY EVENT BUDGET MODEL
  else if (input.eventType === 'community') {
    const costPerAttendee = Math.round(520 * cityMultiplier * styleMultiplier);
    const calculated = costPerAttendee * guests;
    targetTotal = Math.max(25000, Math.round(calculated / 5000) * 5000);

    breakdown = [
      { category: 'Venue', estimatedAmount: Math.round(targetTotal * 0.25), sharePercentage: 25 },
      { category: 'Catering', estimatedAmount: Math.round(targetTotal * 0.25), sharePercentage: 25 },
      { category: 'AV & Production', estimatedAmount: Math.round(targetTotal * 0.18), sharePercentage: 18 },
      { category: 'Printing', estimatedAmount: Math.round(targetTotal * 0.10), sharePercentage: 10 },
      { category: 'Volunteers & Staff', estimatedAmount: Math.round(targetTotal * 0.08), sharePercentage: 8 },
      { category: 'Security', estimatedAmount: Math.round(targetTotal * 0.06), sharePercentage: 6 },
      { category: 'Speakers', estimatedAmount: Math.round(targetTotal * 0.05), sharePercentage: 5 },
      { category: 'Permissions & Operations', estimatedAmount: Math.round(targetTotal * 0.03), sharePercentage: 3 },
    ];

    explanation = `Calculated for a community / civic gathering of ${guests} attendees in ${location}. Prioritizes community auditorium rental, PA audio system, badge printing, volunteer hospitality, and boxed meals (~${symbol}${costPerAttendee}/attendee).`;
    assumptions = [
      `Community hall or civic auditorium rental with seating for ${guests}.`,
      `Includes 2-4 wireless mics, PA amplifier, and projector display.`,
      `Boxed meals, tea/coffee station, and drinking water jars.`,
      `Printed attendee name badges and stage flex backdrop.`,
    ];
  }
  // 4. CUSTOM EVENT (e.g. College Farewell)
  else if (input.eventType === 'custom') {
    const customTitle = input.customEventType || 'Custom Event';
    const costPerGuest = Math.round(900 * cityMultiplier * styleMultiplier);
    targetTotal = Math.max(20000, Math.round((costPerGuest * guests) / 5000) * 5000);

    breakdown = [
      { category: 'Catering', estimatedAmount: Math.round(targetTotal * 0.34), sharePercentage: 34 },
      { category: 'Venue', estimatedAmount: Math.round(targetTotal * 0.28), sharePercentage: 28 },
      { category: 'Entertainment', estimatedAmount: Math.round(targetTotal * 0.15), sharePercentage: 15 },
      { category: 'Party Favors', estimatedAmount: Math.round(targetTotal * 0.10), sharePercentage: 10 },
      { category: 'Decoration', estimatedAmount: Math.round(targetTotal * 0.08), sharePercentage: 8 },
      { category: 'Miscellaneous', estimatedAmount: Math.round(targetTotal * 0.05), sharePercentage: 5 },
    ];

    explanation = `Calculated for a custom "${customTitle}" for ${guests} guests in ${location}. Balances banquet dinner hospitality, venue space, dance music/DJ staging, and commemorative souvenirs.`;
    assumptions = [
      `Tailored to ${customTitle} parameters for ${guests} attendees in ${location}.`,
      `Includes dinner buffet, music/AV setup, and customized event mementos.`,
      `Contingency reserve factored in for last-minute headcount additions.`,
    ];
  }
  // 5. WEDDING BUDGET MODEL
  else {
    const costPerGuest = Math.round(3300 * cityMultiplier * styleMultiplier);
    const calculated = costPerGuest * guests;
    targetTotal = Math.max(200000, Math.round(calculated / 10000) * 10000);

    breakdown = [
      { category: 'Catering', estimatedAmount: Math.round(targetTotal * 0.35), sharePercentage: 35 },
      { category: 'Venue', estimatedAmount: Math.round(targetTotal * 0.22), sharePercentage: 22 },
      { category: 'Decoration', estimatedAmount: Math.round(targetTotal * 0.14), sharePercentage: 14 },
      { category: 'Photography', estimatedAmount: Math.round(targetTotal * 0.10), sharePercentage: 10 },
      { category: 'Clothing', estimatedAmount: Math.round(targetTotal * 0.07), sharePercentage: 7 },
      { category: 'Entertainment', estimatedAmount: Math.round(targetTotal * 0.04), sharePercentage: 4 },
      { category: 'Makeup', estimatedAmount: Math.round(targetTotal * 0.03), sharePercentage: 3 },
      { category: 'Transportation', estimatedAmount: Math.round(targetTotal * 0.02), sharePercentage: 2 },
      { category: 'Miscellaneous', estimatedAmount: Math.round(targetTotal * 0.03), sharePercentage: 3 },
    ];

    explanation = `Calculated for a ${input.style} wedding celebration for ${guests} guests in ${location}. In this region, banquet catering with live counters and venue rental represent ~57% of total outlay (approx ${symbol}${costPerGuest}/guest for full hospitality), followed by mandap florals and cinematic photography.`;
    assumptions = [
      `Includes multi-course banquet feast, live counters, and silver service.`,
      `Covers heritage banquet hall or lawn booking for ceremonies and reception.`,
      `Includes 2-day candid wedding photo and cinematic film crew.`,
      `Factors in bridal makeup, mandap florals, and music setup.`,
    ];
  }

  const minRange = Math.round(targetTotal * 0.85);
  const maxRange = Math.round(targetTotal * 1.2);

  const snapshot: BudgetEstimateInputSnapshot = {
    eventType: input.eventType,
    customEventType: input.customEventType,
    format: input.format || 'in-person',
    location,
    guestCount: guests,
    style: input.style,
    currency,
    preferences: input.preferences,
  };

  const fallbackResult: BudgetEstimateResult = {
    minRange,
    maxRange,
    suggestedTarget: targetTotal,
    costPerGuest: Math.round(targetTotal / Math.max(1, guests)),
    breakdown,
    explanation,
    assumptions,
    inputSnapshot: snapshot,
  };

  if (!apiKey) {
    return fallbackResult;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an event financial analyst. Estimate a realistic budget for:
- Event Type: ${input.eventType} (${input.customEventType || input.eventType})
- Format: ${input.format || 'in-person'}
- Location: ${location}
- Attendees/Guests: ${guests}
- Style: ${input.style}
- Specific Vision: "${input.preferences || 'Standard expectations'}"
- Currency: ${currency}

RULES:
1. If this is a BIRTHDAY, cost must be reasonable for a 3-5h party (e.g. for 15 guests, ~10,000 - 15,000 INR). Categories must be: Food & Beverages, Venue, Cake & Confections, Decorations & Balloons, Entertainment & Games, Photography, Party Favors, Miscellaneous. DO NOT suggest 5 Lakhs or wedding categories!
2. If this is an ONLINE EVENT, categories must be: Platform & Software, Speakers, AV & Production, Design & Assets, Technical Setup, Miscellaneous.
3. If this is a COMMUNITY EVENT, categories must be: Venue, Catering, AV & Production, Printing, Volunteers & Staff, Security, Speakers, Permissions & Operations.
4. If this is a WEDDING, calculate realistic banqueting, mandap, and photo costs for ${guests} guests in ${location}.
5. Sum of breakdown amounts must equal suggestedTarget.

Return ONLY raw JSON matching this schema:
{
  "minRange": 42000,
  "maxRange": 58000,
  "suggestedTarget": 50000,
  "costPerGuest": 1000,
  "breakdown": [
    { "category": "Category", "estimatedAmount": 15000, "sharePercentage": 30 }
  ],
  "explanation": "Rationale...",
  "assumptions": ["Assumption 1", "Assumption 2"]
}`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
    });

    const parsed = cleanAndParseJson<BudgetEstimateResult>(res.response.text());
    if (parsed.suggestedTarget && parsed.breakdown && parsed.breakdown.length > 0) {
      parsed.inputSnapshot = snapshot;
      return parsed;
    }
    return fallbackResult;
  } catch (err) {
    console.warn('estimateBudgetWithAI error, using regional fallback', err);
    return fallbackResult;
  }
}

/**
 * GenAI Vendor Advisory & Alternative Finder:
 * Provides questions to ask, alternative supplier approaches, and negotiation tips.
 */
export async function getVendorAdviceWithAI(
  category: VendorCategory,
  event: EventPlan
): Promise<VendorAdviceResult> {
  const apiKey = getEffectiveApiKey();

  const fallbackAdvice: VendorAdviceResult = {
    vendorCategory: category,
    alternativeOptions: [
      `Independent freelance ${category.toLowerCase()} specialists with direct portfolios`,
      `Multi-service event agency package (often bundles 10-15% discount)`,
      `Local regional collective or academy graduates for budget-conscious quality`,
    ],
    selectionTips: [
      `Always request an unedited full album or raw menu tasting session rather than a curated Instagram highlight reel.`,
      `Confirm in writing who will personally manage your event on the day, not just the sales representative.`,
      `Split payments into milestone tranches: 25% token, 50% on key milestone, and 25% after final delivery.`,
    ],
    questionsToAsk: [
      `What is your backup contingency plan if equipment malfunctions or primary staff falls ill?`,
      `Are electricity charges, cleaning surcharges, and setup/breakdown hours included in the quotation?`,
      `What are the exact overtime charges if the event extends beyond schedule?`,
    ],
    estimatedCostRange: `Typical range in ${event.location} for ${event.guestCount} guests: ${event.currency === 'INR' ? '₹' : '$'}${Math.round(event.totalBudget * 0.08).toLocaleString()} – ${event.currency === 'INR' ? '₹' : '$'}${Math.round(event.totalBudget * 0.18).toLocaleString()}`,
    backupPlan: `Shortlist at least 2 backup ${category.toLowerCase()} providers on standby 3 weeks before the date.`,
  };

  if (!apiKey) {
    return fallbackAdvice;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an event management consultant advising a client on hiring for the category "${category}".
Event context: "${event.name}" (${event.type}, ${event.style}, ${event.guestCount} guests in ${event.location}, budget: ${event.currency} ${event.totalBudget}).

Provide strategic hiring advice. Return raw JSON adhering to this schema:
{
  "vendorCategory": "${category}",
  "alternativeOptions": ["Option 1", "Option 2", "Option 3"],
  "selectionTips": ["Tip 1", "Tip 2", "Tip 3"],
  "questionsToAsk": ["Question 1", "Question 2", "Question 3"],
  "estimatedCostRange": "Range text...",
  "backupPlan": "Contingency strategy..."
}`;

    const res = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.5 },
    });

    return cleanAndParseJson<VendorAdviceResult>(res.response.text());
  } catch (e) {
    console.warn('getVendorAdviceWithAI error, using fallback', e);
    return fallbackAdvice;
  }
}


