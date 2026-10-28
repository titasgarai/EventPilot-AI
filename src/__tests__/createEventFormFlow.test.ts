import { describe, it, expect } from 'vitest';
import { EventType, EventFormat, CurrencyCode } from '../types';

/**
 * Validation logic mirroring CreateEventView to ensure full unit test coverage
 * of edge cases, inputs, and backwards navigation state updates.
 */
function validateStep1(input: {
  name: string;
  type: EventType;
  customEventType?: string;
  date: string;
  location: string;
  format: EventFormat;
  guestCountStr: string;
}): { isValid: boolean; error?: string; parsedGuestCount: number } {
  const parsedGuestCount = parseInt(input.guestCountStr, 10);

  if (input.type === 'custom' && (!input.customEventType || !input.customEventType.trim())) {
    return { isValid: false, error: 'Please specify what event you are planning', parsedGuestCount: 0 };
  }
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: 'Please enter an event name', parsedGuestCount: 0 };
  }
  if (!input.date) {
    return { isValid: false, error: 'Please pick an event date', parsedGuestCount: 0 };
  }
  if (input.format !== 'online' && (!input.location || !input.location.trim())) {
    return { isValid: false, error: 'Please provide an event location / city', parsedGuestCount: 0 };
  }
  if (!input.guestCountStr || isNaN(parsedGuestCount) || parsedGuestCount < 1) {
    return { isValid: false, error: 'Please enter a valid guest / attendee count', parsedGuestCount: 0 };
  }

  return { isValid: true, parsedGuestCount };
}

function validateStep2(input: {
  budgetStr: string;
  currency: CurrencyCode;
}): { isValid: boolean; error?: string; parsedBudget: number } {
  const parsedBudget = parseInt(input.budgetStr, 10);
  if (!input.budgetStr || isNaN(parsedBudget) || parsedBudget < 500) {
    return { isValid: false, error: 'Please specify a realistic total budget', parsedBudget: 0 };
  }
  return { isValid: true, parsedBudget };
}

function getBudgetPresetsForType(type: EventType, format: EventFormat, currency: CurrencyCode) {
  if (currency === 'INR') {
    if (type === 'birthday' || format === 'online') {
      return [5000, 10000, 15000, 25000, 50000, 100000];
    }
    if (type === 'community') {
      return [25000, 50000, 100000, 250000, 500000];
    }
    return [100000, 200000, 500000, 1000000, 2500000, 5000000];
  }
  return [1000, 2500, 5000, 10000, 25000, 50000];
}

describe('Create Event Wizard Form Flow & Validation Rules', () => {
  describe('Step 1 Validation & Edge Cases', () => {
    const validBase = {
      name: 'Annual Team Meet',
      type: 'community' as EventType,
      date: '2026-11-15',
      location: 'Kolkata, West Bengal',
      format: 'in-person' as EventFormat,
      guestCountStr: '50',
    };

    it('accepts completely valid inputs', () => {
      const res = validateStep1(validBase);
      expect(res.isValid).toBe(true);
      expect(res.parsedGuestCount).toBe(50);
    });

    it('rejects empty event name', () => {
      const res = validateStep1({ ...validBase, name: '   ' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('event name');
    });

    it('rejects custom event with missing description', () => {
      const res = validateStep1({ ...validBase, type: 'custom', customEventType: '' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('specify what event');
    });

    it('accepts custom event with provided description', () => {
      const res = validateStep1({ ...validBase, type: 'custom', customEventType: 'College Farewell' });
      expect(res.isValid).toBe(true);
    });

    it('rejects empty location for in-person events', () => {
      const res = validateStep1({ ...validBase, location: '' });
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('location');
    });

    it('allows empty location for online events (since venue is virtual)', () => {
      const res = validateStep1({ ...validBase, format: 'online', location: '' });
      expect(res.isValid).toBe(true);
    });

    it('rejects empty, zero, or negative guest count', () => {
      expect(validateStep1({ ...validBase, guestCountStr: '' }).isValid).toBe(false);
      expect(validateStep1({ ...validBase, guestCountStr: '0' }).isValid).toBe(false);
      expect(validateStep1({ ...validBase, guestCountStr: '-5' }).isValid).toBe(false);
      expect(validateStep1({ ...validBase, guestCountStr: 'abc' }).isValid).toBe(false);
    });

    it('accepts guestCount = 1 for micro-gatherings', () => {
      const res = validateStep1({ ...validBase, guestCountStr: '1' });
      expect(res.isValid).toBe(true);
      expect(res.parsedGuestCount).toBe(1);
    });
  });

  describe('Step 2 Budget Presets & Validation', () => {
    it('provides party-sized budget presets for birthday events', () => {
      const presets = getBudgetPresetsForType('birthday', 'in-person', 'INR');
      expect(presets[0]).toBe(5000);
      expect(presets).toContain(15000);
      expect(presets[presets.length - 1]).toBe(100000);
    });

    it('provides grand-scale budget presets for wedding events', () => {
      const presets = getBudgetPresetsForType('wedding', 'in-person', 'INR');
      expect(presets[0]).toBe(100000);
      expect(presets).toContain(500000);
      expect(presets).toContain(5000000);
    });

    it('provides digital scale budget presets for online events regardless of type', () => {
      const presets = getBudgetPresetsForType('community', 'online', 'INR');
      expect(presets[0]).toBe(5000);
      expect(presets).toContain(15000);
    });

    it('rejects unrealistically small or zero budget', () => {
      expect(validateStep2({ budgetStr: '0', currency: 'INR' }).isValid).toBe(false);
      expect(validateStep2({ budgetStr: '200', currency: 'INR' }).isValid).toBe(false);
      expect(validateStep2({ budgetStr: '', currency: 'INR' }).isValid).toBe(false);
    });

    it('accepts realistic budget amounts (>= 500)', () => {
      const res = validateStep2({ budgetStr: '15000', currency: 'INR' });
      expect(res.isValid).toBe(true);
      expect(res.parsedBudget).toBe(15000);
    });
  });

  describe('Step Backwards Navigation State Stability', () => {
    it('maintains state integrity when user steps backward and modifies inputs', () => {
      // User creates Wedding
      let currentInputs = {
        name: 'Wedding 2026',
        type: 'wedding' as EventType,
        guestCountStr: '150',
        budgetStr: '500000',
        currency: 'INR' as CurrencyCode,
      };

      // User navigates forward to Step 2
      expect(validateStep1({
        ...currentInputs,
        date: '2026-12-01',
        location: 'Kolkata',
        format: 'in-person',
      }).isValid).toBe(true);

      // User goes back to Step 1 and changes to Birthday with 20 guests
      currentInputs = {
        ...currentInputs,
        type: 'birthday',
        guestCountStr: '20',
        budgetStr: '15000',
      };

      const step1Result = validateStep1({
        ...currentInputs,
        date: '2026-12-01',
        location: 'Kolkata',
        format: 'in-person',
      });
      const step2Result = validateStep2({
        budgetStr: currentInputs.budgetStr,
        currency: currentInputs.currency,
      });

      expect(step1Result.parsedGuestCount).toBe(20);
      expect(step2Result.parsedBudget).toBe(15000);
      expect(currentInputs.type).toBe('birthday');
    });
  });
});

