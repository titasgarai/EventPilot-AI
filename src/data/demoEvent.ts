import { EventPlan } from '../types';

export const DEMO_EVENT: EventPlan = {
  id: 'demo-event-ananya-arjun',
  name: "Ananya & Arjun's Wedding",
  type: 'wedding',
  date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 42 days remaining
  location: 'Kolkata, West Bengal',
  guestCount: 150,
  totalBudget: 500000,
  currency: 'INR',
  style: 'traditional',
  preferences: 'I want a traditional Bengali wedding for around 150 guests. I want it to feel elegant, with authentic cuisine and warm rituals, but strictly stay within my ₹5 lakh budget.',
  eventSummary: "An authentic, culturally rich Bengali wedding blending timeless rituals (Gaye Holud, Shubho Drishti, Sindoor Daan) with modern tasteful aesthetics. Optimized for an intimate gathering of 150 close family and friends with high-priority spending on artisanal cuisine and photography, while optimizing venue decor via traditional marigold and terracotta accents.",
  isDemo: true,
  createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
  budgetPlan: [
    { id: 'b-1', category: 'Venue', plannedAmount: 110000, spentAmount: 95000, notes: 'Community Rajbari / Banquet hall for 2 days' },
    { id: 'b-2', category: 'Catering', plannedAmount: 175000, spentAmount: 85000, notes: 'Authentic Bengali menu (Bhetki Paturi, Mutton Kosha, Mishti Doi) for 150 guests' },
    { id: 'b-3', category: 'Decoration', plannedAmount: 55000, spentAmount: 40000, notes: 'Genda phool (marigold), dokra motifs & fairy lights' },
    { id: 'b-4', category: 'Photography', plannedAmount: 50000, spentAmount: 30000, notes: 'Candid photographer + cinematic video for 2 days' },
    { id: 'b-5', category: 'Clothing', plannedAmount: 45000, spentAmount: 20000, notes: 'Benarasi saree for Ananya & dhoti-kurta for Arjun' },
    { id: 'b-6', category: 'Entertainment', plannedAmount: 20000, spentAmount: 5000, notes: 'Dhak players (Dhakis), Shehnai tracks & acoustic evening band' },
    { id: 'b-7', category: 'Invitations', plannedAmount: 12000, spentAmount: 6000, notes: 'Digital video invitation + printed scrolls for elders' },
    { id: 'b-8', category: 'Transportation', plannedAmount: 15000, spentAmount: 4000, notes: 'AC Innovas for immediate family & bridal transport' },
    { id: 'b-9', category: 'Miscellaneous', plannedAmount: 18000, spentAmount: 0, notes: 'Puja samagri, emergency contingency, tips' }
  ],
  expenses: [
    { id: 'exp-1', category: 'Venue', title: 'Banquet Hall Advance Deposit (50%)', amount: 55000, date: '2026-09-15', paidTo: 'Sovabazar Heritage Banquet' },
    { id: 'exp-2', category: 'Venue', title: 'Banquet Electricity & Cleaning Surcharge', amount: 40000, date: '2026-10-02', paidTo: 'Sovabazar Heritage Banquet' },
    { id: 'exp-3', category: 'Catering', title: 'Caterer Initial Booking Token', amount: 45000, date: '2026-09-20', paidTo: 'Sonar Bangla Caterers' },
    { id: 'exp-4', category: 'Catering', title: 'Tasting Session & Raw Material Advance', amount: 40000, date: '2026-10-10', paidTo: 'Sonar Bangla Caterers' },
    { id: 'exp-5', category: 'Decoration', title: 'Floral Mandap & Stage Advance', amount: 40000, date: '2026-10-05', paidTo: 'Alpona Floral & Events' },
    { id: 'exp-6', category: 'Photography', title: 'Photographer Retainer Fee', amount: 30000, date: '2026-09-22', paidTo: 'Kolkata Frames Visuals' },
    { id: 'exp-7', category: 'Clothing', title: 'Bridal Crimson Silk Benarasi Saree', amount: 20000, date: '2026-10-12', paidTo: 'Adi Mohini Mohan Kanjilal' },
    { id: 'exp-8', category: 'Invitations', title: 'Custom Digital Invite & 40 Scroll Prints', amount: 6000, date: '2026-10-01', paidTo: 'Heritage Paper Co.' },
    { id: 'exp-9', category: 'Entertainment', title: 'Dhaki Troupe Booking Deposit', amount: 5000, date: '2026-10-18', paidTo: 'Murshidabad Dhak Dal' },
    { id: 'exp-10', category: 'Transportation', title: '2 Rental Cars 3-day Advance', amount: 4000, date: '2026-10-20', paidTo: 'City Cabs Logistics' }
  ],
  timeline: [
    { id: 't-1', name: 'Finalize and book reception venue', phase: '6 months before', deadline: '2026-05-15', status: 'completed', priority: 'high', category: 'Venue' },
    { id: 't-2', name: 'Shortlist caterers and schedule menu tasting', phase: '6 months before', deadline: '2026-05-25', status: 'completed', priority: 'high', category: 'Catering' },
    { id: 't-3', name: 'Lock candid photographer & cinematic videographer', phase: '3 months before', deadline: '2026-08-10', status: 'completed', priority: 'high', category: 'Photography' },
    { id: 't-4', name: 'Finalize bridal Benarasi and groom dhoti', phase: '3 months before', deadline: '2026-08-25', status: 'completed', priority: 'medium', category: 'Clothing' },
    { id: 't-5', name: 'Design and circulate digital wedding invitation', phase: '1 month before', deadline: '2026-10-05', status: 'completed', priority: 'medium', category: 'Invitations' },
    { id: 't-6', name: 'Confirm catering headcount & finalize live fish counter', phase: '1 month before', deadline: '2026-10-15', status: 'completed', priority: 'high', category: 'Catering' },
    { id: 't-7', name: 'Book bridal makeup and saree draping artist', phase: '1 month before', deadline: '2026-10-25', status: 'in_progress', priority: 'high', category: 'Makeup' },
    { id: 't-8', name: 'Finalize floral mandap and Gaye Holud stage decor', phase: '2 weeks before', deadline: '2026-11-10', status: 'in_progress', priority: 'medium', category: 'Decoration' },
    { id: 't-9', name: 'Arrange ritual items (Puja samagri, mukut, topor, bor baron)', phase: '2 weeks before', deadline: '2026-11-15', status: 'pending', priority: 'medium', category: 'Miscellaneous' },
    { id: 't-10', name: 'Confirm guest logistics & pickup schedules', phase: '1 week before', deadline: '2026-11-20', status: 'pending', priority: 'low', category: 'Transportation' },
    { id: 't-11', name: 'Final vendor walkthrough at the banquet hall', phase: '3 days before', deadline: '2026-11-24', status: 'pending', priority: 'high', category: 'Venue' },
    { id: 't-12', name: 'Coordinate Gaye Holud morning setup and sweets delivery', phase: '3 days before', deadline: '2026-11-25', status: 'pending', priority: 'medium', category: 'Catering' },
    { id: 't-13', name: 'Execute wedding day timeline & oversee Bor Jatri welcome', phase: 'Event day', deadline: '2026-11-28', status: 'pending', priority: 'high', category: 'Miscellaneous' }
  ],
  vendors: [
    { id: 'v-1', name: 'Sovabazar Heritage Banquet', category: 'Venue', estimatedCost: 110000, actualCost: 95000, status: 'Booked', contact: '+91 98301 23456', email: 'banquet@sovabazarheritage.in', notes: 'Air-conditioned courtyard venue with dedicated green rooms' },
    { id: 'v-2', name: 'Sonar Bangla Caterers', category: 'Catering', estimatedCost: 175000, actualCost: 165000, status: 'Booked', contact: '+91 98312 98765', email: 'sonar.bangla.events@gmail.com', notes: 'Tasting approved. Includes live fish fry counter and 3 signature sweets' },
    { id: 'v-3', name: 'Alpona Floral & Events', category: 'Decorator', estimatedCost: 55000, actualCost: 52000, status: 'Booked', contact: '+91 98367 11223', email: 'alpona.decor@gmail.com', notes: 'Using real marigolds, kalash, and brass lamps for mandap' },
    { id: 'v-4', name: 'Kolkata Frames Visuals', category: 'Photographer', estimatedCost: 50000, actualCost: 48000, status: 'Booked', contact: '+91 97480 55443', email: 'hello@kolkataframes.com', notes: '2 candid photographers + drone for baraat entrance' },
    { id: 'v-5', name: 'Murshidabad Dhak Troupe', category: 'Entertainment', estimatedCost: 20000, actualCost: 18000, status: 'Booked', contact: '+91 94330 67890', notes: 'Traditional 4-person dhak team for Gaye Holud and Bor Jatri arrival' },
    { id: 'v-6', name: 'Heritage Paper Co.', category: 'Printing', estimatedCost: 12000, actualCost: 10000, status: 'Booked', contact: '+91 98300 44556', notes: 'Eco-friendly handmade paper scrolls delivered' },
    { id: 'v-7', name: 'Glamour Touch Bridal Studio', category: 'Makeup', estimatedCost: 22000, status: 'Contacted', contact: '+91 98305 77889', email: 'glamourtouch.kol@gmail.com', notes: 'Quoted ₹18,000 for bridal makeup + ₹4,000 for mother/sister' },
    { id: 'v-8', name: 'City Cabs & Logistics', category: 'Transportation', estimatedCost: 15000, status: 'Shortlisted', contact: '+91 98309 33221', notes: 'Need 2 Ertiga/Innova vehicles on standby for 48 hours' },
    { id: 'v-9', name: 'Security & Valet Alliance', category: 'Security', estimatedCost: 8000, status: 'Not Started', contact: '+91 98311 00998', notes: 'Banquet provides basic guard; valet needed for 30 cars' }
  ],
  personalizedIdeas: [
    {
      id: 'i-1',
      category: 'Decoration',
      title: 'Terracotta & Marigold Cascade Backdrop',
      description: 'Replace expensive imported flower backdrops with Bankura horse terracotta tiles framed with deep saffron and golden marigold curtains. It gives a regal, grounded Bengali aesthetic at 40% lower cost.',
      impactOrSavings: 'Saves approx ₹15,000',
      isFavorite: true,
      tags: ['Budget Saver', 'Cultural', 'Eco-Friendly']
    },
    {
      id: 'i-2',
      category: 'Food',
      title: 'Live Mini Sondesh & Mishti Bar',
      description: 'Instead of serving pre-boxed dessert trays, set up a charming live mishti station where warm baked roshogolla, patishapta, and nolengur ice cream are served fresh in clay handis.',
      impactOrSavings: 'High guest delight factor',
      isFavorite: true,
      tags: ['Culinary', 'Interactive']
    },
    {
      id: 'i-3',
      category: 'Unique Experiences',
      title: 'Alpona Floor Art Welcome by Local Artisans',
      description: 'Commission traditional rice-paste floor Alpona at the entrance threshold. Have a local artisan paint live motifs during the morning Gaye Holud ceremony for mesmerizing photo ops.',
      impactOrSavings: 'Authentic local art highlight',
      isFavorite: true,
      tags: ['Heritage', 'Instagrammable']
    },
    {
      id: 'i-4',
      category: 'Entertainment',
      title: 'Rabindra Sangeet Acoustic Fusion Sunset Session',
      description: 'Host an unplugged 60-minute acoustic session blending soulful Tagore melodies with soft violin while guests sip evening Darjeeling tea before the main rituals begin.',
      impactOrSavings: 'Eliminates need for expensive DJ',
      isFavorite: false,
      tags: ['Music', 'Atmospheric']
    },
    {
      id: 'i-5',
      category: 'Invitations',
      title: 'Animated Bengali Storyline E-Invite',
      description: 'Create a 45-second hand-drawn illustration video telling the story of how Ananya and Arjun met on College Street, accompanied by acoustic sitar notes and Google Maps pins for venue directions.',
      impactOrSavings: 'Saves ₹8,000 in courier & card printing',
      isFavorite: true,
      tags: ['Digital', 'Personalized']
    },
    {
      id: 'i-6',
      category: 'Budget Saving',
      title: 'Hybrid Floral + Fabric Draping Architecture',
      description: 'Use lush handloom muslin drapes with fairy lights for 70% of the ceiling volume, concentrating fresh fragrant tuberoses (rajanigandha) only at eye level and the ritual mandap.',
      impactOrSavings: 'Reduces decor invoice by ~22%',
      isFavorite: false,
      tags: ['Smart Budget', 'Floral Hack']
    },
    {
      id: 'i-7',
      category: 'Activities',
      title: 'Polaroid Guestbook with "Shubhechha" Wishes Box',
      description: 'Station an instant camera at the reception foyer with a vintage handmade jute journal where relatives stick their instant candid photo alongside handwritten Bengali blessings.',
      impactOrSavings: 'Priceless emotional heirloom',
      isFavorite: false,
      tags: ['Keepsake', 'Guest Fun']
    },
    {
      id: 'i-8',
      category: 'Photography',
      title: 'Pre-Ritual "Kash Phool" Golden Hour Mini Shoot',
      description: 'Take 20 minutes before sunset near the banquet terrace gardens for soft golden-hour portraits while the bride is in pristine ritual garments before crowd commotion.',
      impactOrSavings: 'Zero extra cost; museum quality portraits',
      isFavorite: false,
      tags: ['Photo Tip', 'Timeless']
    }
  ],
  insights: [
    {
      id: 'ins-1',
      title: 'Bridal Makeup Artist Unbooked with 42 Days Remaining',
      description: 'Quality bridal makeup artists in Kolkata during peak wedding season book out 2–3 months ahead. You currently have "Glamour Touch Studio" in contacted status.',
      severity: 'HIGH',
      category: 'Vendors',
      recommendation: 'Confirm booking and pay retainer to your shortlisted artist before end of this week to prevent date collision.',
      actionText: 'View Vendors',
      actionRoute: 'vendors',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ins-2',
      title: 'Budget Allocation: Catering is 35% of Total Budget',
      description: 'At ₹1,75,000 for 150 guests (approx ₹1,166/plate), catering represents 35% of your ₹5,00,000 cap. This is well within standard benchmarks (30-40%), but ensure beverage addons do not incur hidden surcharges.',
      severity: 'LOW',
      category: 'Budget',
      recommendation: 'Lock in written per-plate cost guarantees including live dessert counter refilling and mineral water bottles.',
      actionText: 'Check Budget',
      actionRoute: 'budget',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ins-3',
      title: 'Remaining Unspent Contingency is ₹2,15,000 (43%)',
      description: 'You have committed ₹2,85,000 across venue, food advances, decor, and photography. You have a healthy reserve of ₹2,15,000 for final vendor disbursements and jewelry/clothing.',
      severity: 'LOW',
      category: 'Finance',
      recommendation: 'Hold at least ₹35,000 as pure liquid cash on wedding day for pandit dakshina, Dhaki tips, and emergency logistics.',
      actionText: 'View Budget',
      actionRoute: 'budget',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ins-4',
      title: 'Guest Transportation / Valet Not Yet Locked In',
      description: 'Sovabazar venue has narrow approach streets. Uncoordinated guest vehicle arrivals could cause severe bottlenecks for the Bor Jatri procession.',
      severity: 'MEDIUM',
      category: 'Logistics',
      recommendation: 'Book the shortlisted valet team to guide guest cars to the designated nearby municipal parking plot.',
      actionText: 'Resolve Logistics',
      actionRoute: 'vendors',
      createdAt: new Date().toISOString()
    }
  ]
};

