import { describe, it, expect } from 'vitest';
import { getDashboardConfig } from '../utils/dashboardConfig';
import { EventPlan } from '../types';

describe('Dashboard Configuration & Format Theming', () => {
  const baseEvent: EventPlan = {
    id: 'test-event-1',
    name: 'Sample Event',
    type: 'wedding',
    date: '2026-10-30',
    location: 'Kolkata',
    guestCount: 150,
    totalBudget: 500000,
    currency: 'INR',
    style: 'traditional',
    preferences: '',
    eventSummary: 'Summary',
    budgetPlan: [],
    expenses: [],
    timeline: [],
    vendors: [],
    personalizedIdeas: [],
    insights: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('configures wedding dashboard with ceremony badges and grand wedding styling', () => {
    const config = getDashboardConfig({ ...baseEvent, type: 'wedding' });
    expect(config.primaryMetricType).toBe('wedding');
    expect(config.personalityLabel).toContain('Ceremony');
    expect(config.accentBadge).toContain('Wedding');
    expect(config.statCards.length).toBe(4);
  });

  it('configures birthday dashboard with party badge and celebration styling', () => {
    const config = getDashboardConfig({ ...baseEvent, type: 'birthday', guestCount: 20 });
    expect(config.primaryMetricType).toBe('birthday');
    expect(config.personalityLabel).toContain('Party');
    expect(config.accentBadge).toContain('Birthday');
    expect(config.heroGradient).toContain('amber');
    expect(config.statCards.some((s) => s.title.includes('Party Budget') || s.title.includes('Cake'))).toBe(true);
  });

  it('configures online event with virtual stage room styling', () => {
    const config = getDashboardConfig({
      ...baseEvent,
      type: 'community',
      format: 'online',
      onlineDetails: {
        platform: 'Google Meet',
        meetingLink: 'https://meet.google.com/test-123',
        recordingRequired: true,
      },
    });

    expect(config.primaryMetricType).toBe('online');
    expect(config.personalityLabel).toContain('Virtual Stage');
    expect(config.accentBadge).toContain('Virtual');
    expect(config.statCards.some((s) => s.title.includes('Virtual'))).toBe(true);
  });

  it('configures community event with civic agenda and delegate metrics', () => {
    const config = getDashboardConfig({ ...baseEvent, type: 'community', guestCount: 100 });
    expect(config.primaryMetricType).toBe('community');
    expect(config.personalityLabel).toContain('Community');
    expect(config.accentBadge).toContain('Community');
    expect(config.statCards.some((s) => s.title.includes('Community') || s.title.includes('Delegates'))).toBe(true);
  });

  it('configures custom event with user specified custom label', () => {
    const config = getDashboardConfig({
      ...baseEvent,
      type: 'custom',
      customEventType: 'College Farewell',
    });

    expect(config.primaryMetricType).toBe('custom');
    expect(config.personalityLabel).toContain('College Farewell');
    expect(config.accentBadge).toContain('College Farewell');
  });
});
