import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  calculateCostPerGuest,
  calculateBudgetStats,
  calculateTaskStats,
  calculateVendorStats,
} from '../utils/formatters';
import { EventPlan } from '../types';

describe('Formatters, Statistical Aggregations & Math Edge Cases', () => {
  describe('formatCurrency', () => {
    it('formats Indian Rupees using lakhs and crores separator', () => {
      expect(formatCurrency(500000, 'INR')).toBe('₹5,00,000');
      expect(formatCurrency(15000, 'INR')).toBe('₹15,000');
      expect(formatCurrency(10000000, 'INR')).toBe('₹1,00,00,000');
      expect(formatCurrency(0, 'INR')).toBe('₹0');
    });

    it('formats US Dollars with standard thousands separators', () => {
      expect(formatCurrency(50000, 'USD')).toBe('$50,000');
      expect(formatCurrency(1200, 'USD')).toBe('$1,200');
    });
  });

  describe('calculateCostPerGuest (Edge Cases & Validation)', () => {
    it('calculates standard per-guest cost correctly', () => {
      expect(calculateCostPerGuest(500000, 150)).toBe(3333);
      expect(calculateCostPerGuest(15000, 15)).toBe(1000);
    });

    it('handles guest count = 0 gracefully without division by zero error', () => {
      expect(calculateCostPerGuest(50000, 0)).toBe(0);
    });

    it('handles guest count = 1 correctly', () => {
      expect(calculateCostPerGuest(50000, 1)).toBe(50000);
    });

    it('handles negative or NaN guest counts safely', () => {
      expect(calculateCostPerGuest(50000, -10)).toBe(0);
      expect(calculateCostPerGuest(50000, NaN)).toBe(0);
    });

    it('handles budget = 0 or negative budget safely', () => {
      expect(calculateCostPerGuest(0, 50)).toBe(0);
      expect(calculateCostPerGuest(-5000, 50)).toBe(0);
    });

    it('handles very large guest count (10,000 attendees)', () => {
      expect(calculateCostPerGuest(2000000, 10000)).toBe(200);
    });

    it('handles very small budget (₹500 for 5 guests)', () => {
      expect(calculateCostPerGuest(500, 5)).toBe(100);
    });
  });

  describe('calculateBudgetStats', () => {
    const mockEvent: EventPlan = {
      id: 'mock-1',
      name: 'Budget Test Event',
      type: 'wedding',
      date: '2026-10-30',
      location: 'Kolkata',
      guestCount: 100,
      totalBudget: 100000,
      currency: 'INR',
      style: 'traditional',
      preferences: '',
      eventSummary: '',
      budgetPlan: [
        { id: 'b-1', category: 'Venue', plannedAmount: 40000, spentAmount: 40000, notes: '' },
        { id: 'b-2', category: 'Catering', plannedAmount: 60000, spentAmount: 20000, notes: '' },
      ],
      expenses: [
        { id: 'exp-1', category: 'Venue', title: 'Advance', amount: 40000, date: '2026-01-01' },
        { id: 'exp-2', category: 'Catering', title: 'Token', amount: 20000, date: '2026-01-02' },
      ],
      timeline: [],
      vendors: [],
      personalizedIdeas: [],
      insights: [],
      createdAt: '',
      updatedAt: '',
    };

    it('calculates total spent, remaining, and percentage spent accurately', () => {
      const stats = calculateBudgetStats(mockEvent);
      expect(stats.totalBudget).toBe(100000);
      expect(stats.totalSpent).toBe(60000);
      expect(stats.remaining).toBe(40000);
      expect(stats.percentageSpent).toBe(60);
      expect(stats.isOverBudget).toBe(false);
    });

    it('flags overbudget correctly when expenses exceed total budget', () => {
      const overbudgetEvent: EventPlan = {
        ...mockEvent,
        totalBudget: 50000,
        expenses: [{ id: 'exp-1', category: 'Venue', title: 'Venue', amount: 75000, date: '2026-01-01' }],
      };
      const stats = calculateBudgetStats(overbudgetEvent);
      expect(stats.totalSpent).toBe(75000);
      expect(stats.remaining).toBe(0);
      expect(stats.isOverBudget).toBe(true);
      expect(stats.percentageSpent).toBe(100);
    });
  });

  describe('calculateTaskStats', () => {
    it('calculates completion percentages and counts', () => {
      const eventWithTasks: EventPlan = {
        id: 'mock-tasks',
        name: 'Tasks Test',
        type: 'birthday',
        date: '2026-10-30',
        location: 'Kolkata',
        guestCount: 20,
        totalBudget: 10000,
        currency: 'INR',
        style: 'casual',
        preferences: '',
        eventSummary: '',
        budgetPlan: [],
        expenses: [],
        timeline: [
          { id: 't-1', name: 'Order cake', phase: '1 week before', priority: 'high', status: 'completed', deadline: '2026-10-23' },
          { id: 't-2', name: 'Buy balloons', phase: '3 days before', priority: 'medium', status: 'in_progress', deadline: '2026-10-27' },
          { id: 't-3', name: 'Send invites', phase: '2 weeks before', priority: 'high', status: 'pending', deadline: '2026-10-16' },
          { id: 't-4', name: 'Pack favors', phase: 'Event day', priority: 'low', status: 'pending', deadline: '2026-10-30' },
        ],
        vendors: [],
        personalizedIdeas: [],
        insights: [],
        createdAt: '',
        updatedAt: '',
      };

      const stats = calculateTaskStats(eventWithTasks);
      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.pending).toBe(2);
      expect(stats.progressPercent).toBe(25);
    });
  });

  describe('calculateVendorStats', () => {
    it('breaks down vendors by status', () => {
      const eventWithVendors: EventPlan = {
        id: 'mock-vendors',
        name: 'Vendors Test',
        type: 'community',
        date: '2026-10-30',
        location: 'Kolkata',
        guestCount: 50,
        totalBudget: 50000,
        currency: 'INR',
        style: 'modern',
        preferences: '',
        eventSummary: '',
        budgetPlan: [],
        expenses: [],
        timeline: [],
        vendors: [
          { id: 'v-1', name: 'Sound Co', category: 'AV & Production', estimatedCost: 15000, status: 'Booked', contact: '123' },
          { id: 'v-2', name: 'Print Lab', category: 'Printing', estimatedCost: 5000, status: 'Contacted', contact: '456' },
          { id: 'v-3', name: 'Auditorium', category: 'Venue', estimatedCost: 20000, status: 'Shortlisted', contact: '789' },
          { id: 'v-4', name: 'Catering Express', category: 'Catering', estimatedCost: 10000, status: 'Not Started', contact: '' },
        ],
        personalizedIdeas: [],
        insights: [],
        createdAt: '',
        updatedAt: '',
      };

      const stats = calculateVendorStats(eventWithVendors);
      expect(stats.total).toBe(4);
      expect(stats.booked).toBe(1);
      expect(stats.contacted).toBe(1);
      expect(stats.shortlisted).toBe(1);
      expect(stats.notStarted).toBe(1);
    });
  });

  describe('getDaysRemaining', () => {
    it('handles empty date string without crashing', () => {
      const res = getDaysRemaining('');
      expect(res.days).toBe(0);
      expect(res.label).toBe('Date not set');
    });

    it('calculates future dates correctly', () => {
      const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = getDaysRemaining(future);
      expect(res.days).toBeGreaterThanOrEqual(9);
      expect(res.isPast).toBe(false);
      expect(res.label).toContain('remaining');
    });
  });
});
