import { describe, it, expect } from 'vitest';
import { generateContextualFallbackPlan } from '../services/gemini';
import { CreateEventInput } from '../services/gemini';

describe('Event Planning Logic & Distinct Event Type Models', () => {
  const weddingInput: CreateEventInput = {
    name: 'Priya & Rahul Wedding',
    type: 'wedding',
    date: '2026-11-20',
    location: 'Kolkata, West Bengal',
    guestCount: 150,
    totalBudget: 500000,
    currency: 'INR',
    style: 'traditional',
    preferences: 'Authentic Bengali ceremony and grand feast',
  };

  const birthdayInput: CreateEventInput = {
    name: 'Aarav 7th Birthday Party',
    type: 'birthday',
    date: '2026-05-10',
    location: 'Kolkata, West Bengal',
    guestCount: 20,
    totalBudget: 15000,
    currency: 'INR',
    style: 'casual',
    preferences: 'Superheroes theme, fun games, custom cake',
  };

  const communityInput: CreateEventInput = {
    name: 'Kolkata Tech Open Source Summit',
    type: 'community',
    date: '2026-08-15',
    location: 'Science City Auditorium, Kolkata',
    guestCount: 100,
    totalBudget: 60000,
    currency: 'INR',
    style: 'modern',
    preferences: 'Developer workshops, badges, tea station',
  };

  const onlineInput: CreateEventInput = {
    name: 'Global Web Development Masterclass',
    type: 'community',
    format: 'online',
    onlineDetails: {
      platform: 'Google Meet',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      hostName: 'Dev Lead',
      recordingRequired: true,
      techChecklist: [],
    },
    date: '2026-09-01',
    location: 'Online / Google Meet',
    guestCount: 50,
    totalBudget: 10000,
    currency: 'INR',
    style: 'modern',
    preferences: 'Live coding walkthrough and Q&A',
  };

  const customInput: CreateEventInput = {
    name: 'Class of 2026 Grand Farewell',
    type: 'custom',
    customEventType: 'College Farewell',
    date: '2026-06-30',
    location: 'Campus Auditorium, Kolkata',
    guestCount: 80,
    totalBudget: 40000,
    currency: 'INR',
    style: 'casual',
    preferences: 'Yearbook signing, batch awards, DJ dance floor',
  };

  it('Wedding != Birthday: generated planning structures are genuinely distinct', () => {
    const weddingPlan = generateContextualFallbackPlan(weddingInput);
    const birthdayPlan = generateContextualFallbackPlan(birthdayInput);

    // Budgets are different
    expect(weddingPlan.budgetPlan.length).toBeGreaterThanOrEqual(6);
    expect(birthdayPlan.budgetPlan.length).toBeGreaterThanOrEqual(4);

    const weddingCategories = weddingPlan.budgetPlan.map((b) => b.category);
    const birthdayCategories = birthdayPlan.budgetPlan.map((b) => b.category);
    expect(weddingCategories).toContain('Clothing'); // Trousseau in wedding
    expect(birthdayCategories).toContain('Cake & Confections'); // Birthday cake & treats
    expect(birthdayCategories).not.toContain('Clothing'); // No wedding trousseau in birthday

    // Birthday vendor roster includes cake vendor
    expect(birthdayPlan.vendors.some((v) => v.category === 'Cake')).toBe(true);

    // Timelines are different (Wedding has 6-month preparatory phase; Birthday has 2-week quick sprint)
    const weddingPhases = weddingPlan.timeline.map((t) => t.phase);
    const birthdayPhases = birthdayPlan.timeline.map((t) => t.phase);
    expect(weddingPhases).toContain('6 months before');
    expect(birthdayPhases).not.toContain('6 months before');
    expect(birthdayPhases).toContain('2 weeks before');

    // Run of show is different
    const weddingRos = weddingPlan.runOfShow || [];
    const birthdayRos = birthdayPlan.runOfShow || [];
    expect(weddingRos.some((r) => r.title.toLowerCase().includes('mandap') || r.title.toLowerCase().includes('ceremony'))).toBe(true);
    expect(birthdayRos.some((r) => r.title.toLowerCase().includes('cake') || r.title.toLowerCase().includes('game'))).toBe(true);
  });

  it('Community Event focuses on civic facilities, volunteer roles, and stage audio', () => {
    const plan = generateContextualFallbackPlan(communityInput);
    const budgetCategories = plan.budgetPlan.map((b) => b.category);

    expect(budgetCategories).toContain('AV & Production');
    expect(budgetCategories).toContain('Printing');
    expect(budgetCategories).toContain('Volunteers & Staff');

    const tasks = plan.timeline.map((t) => t.name.toLowerCase());
    expect(tasks.some((t) => t.includes('volunteer') || t.includes('badge') || t.includes('permit') || t.includes('sound'))).toBe(true);
  });

  it('Online Event allocates $0 to physical catering and provides streaming run-of-show', () => {
    const plan = generateContextualFallbackPlan(onlineInput);
    const budgetCategories = plan.budgetPlan.map((b) => b.category);

    // Online event has no physical catering
    expect(budgetCategories).not.toContain('Catering');
    expect(budgetCategories).toContain('Platform & Software');

    const ros = plan.runOfShow || [];
    expect(ros.some((r) => r.title.toLowerCase().includes('av') || r.title.toLowerCase().includes('screen') || r.title.toLowerCase().includes('recording') || r.title.toLowerCase().includes('tech') || r.title.toLowerCase().includes('room'))).toBe(true);
  });

  it('Custom Event uses custom event title and features custom activities', () => {
    const plan = generateContextualFallbackPlan(customInput);
    const summary = plan.eventSummary.toLowerCase();

    expect(summary).toContain('college farewell');
    const tasks = plan.timeline.map((t) => t.name.toLowerCase());
    expect(tasks.some((t) => t.includes('yearbook') || t.includes('senior') || t.includes('farewell') || t.includes('award'))).toBe(true);
  });

  it('All 5 event types produce valid, self-consistent schemas', () => {
    const inputs = [weddingInput, birthdayInput, communityInput, onlineInput, customInput];
    for (const inp of inputs) {
      const plan = generateContextualFallbackPlan(inp);
      expect(plan.eventSummary).toBeTruthy();
      expect(plan.budgetPlan.length).toBeGreaterThan(0);
      expect(plan.timeline.length).toBeGreaterThan(0);
      expect(plan.vendors.length).toBeGreaterThan(0);
      expect(plan.personalizedIdeas.length).toBeGreaterThan(0);
      expect(plan.insights.length).toBeGreaterThan(0);
    }
  });
});
