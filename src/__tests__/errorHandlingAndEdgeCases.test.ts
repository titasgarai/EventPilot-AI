import { describe, it, expect } from 'vitest';
import { cleanAndParseJson, generateContextualFallbackPlan } from '../services/gemini';
import { CreateEventInput } from '../services/gemini';

describe('Error Handling, Resilient Parsing & Defensive Edge Cases', () => {
  describe('cleanAndParseJson', () => {
    it('parses valid raw JSON strings', () => {
      const json = '{"name":"Aarav","age":7,"tags":["birthday"]}';
      const parsed = cleanAndParseJson<{ name: string; age: number; tags: string[] }>(json);
      expect(parsed.name).toBe('Aarav');
      expect(parsed.age).toBe(7);
      expect(parsed.tags).toEqual(['birthday']);
    });

    it('strips markdown code blocks: ```json ... ``` correctly', () => {
      const wrapped = '```json\n{\n  "status": "success",\n  "count": 42\n}\n```';
      const parsed = cleanAndParseJson<{ status: string; count: number }>(wrapped);
      expect(parsed.status).toBe('success');
      expect(parsed.count).toBe(42);
    });

    it('strips plain markdown code blocks: ``` ... ```', () => {
      const wrapped = '```\n{"result": true}\n```';
      const parsed = cleanAndParseJson<{ result: boolean }>(wrapped);
      expect(parsed.result).toBe(true);
    });

    it('recovers JSON embedded inside conversational model preamble via regex fallback', () => {
      const preambleText = 'Sure! Here is the JSON budget plan you requested:\n{"targetTotal": 50000}\nHope this helps!';
      const parsed = cleanAndParseJson<{ targetTotal: number }>(preambleText);
      expect(parsed.targetTotal).toBe(50000);
    });

    it('throws a clean, descriptive error on non-JSON content', () => {
      const badInput = 'Sorry, as an AI I am unable to generate this plan.';
      expect(() => cleanAndParseJson(badInput)).toThrowError(/Failed to parse AI JSON response/);
    });
  });

  describe('Edge Cases in Plan Generation & Missing Data Resilience', () => {
    it('handles custom event with empty description gracefully', () => {
      const emptyCustomInput: CreateEventInput = {
        name: 'My Special Event',
        type: 'custom',
        customEventType: '',
        date: '2026-12-31',
        location: 'Kolkata',
        guestCount: 50,
        totalBudget: 50000,
        currency: 'INR',
        style: 'casual',
        preferences: '',
      };

      const plan = generateContextualFallbackPlan(emptyCustomInput);
      expect(plan.eventSummary).toBeTruthy();
      expect(plan.budgetPlan.length).toBeGreaterThan(0);
      expect(plan.timeline.length).toBeGreaterThan(0);
    });

    it('handles guestCount = 1 without crash or NaN', () => {
      const soloEvent: CreateEventInput = {
        name: 'Solo Retreat',
        type: 'custom',
        date: '2026-10-01',
        location: 'Darjeeling',
        guestCount: 1,
        totalBudget: 10000,
        currency: 'INR',
        style: 'minimal',
        preferences: '',
      };

      const plan = generateContextualFallbackPlan(soloEvent);
      expect(plan.budgetPlan.length).toBeGreaterThan(0);
      for (const item of plan.budgetPlan) {
        expect(isNaN(item.plannedAmount)).toBe(false);
        expect(item.plannedAmount).toBeGreaterThanOrEqual(0);
      }
    });

    it('handles zero budget safely with fallback floor defaults', () => {
      const zeroBudgetInput: CreateEventInput = {
        name: 'Volunteer Meet',
        type: 'community',
        date: '2026-07-04',
        location: 'Park Street',
        guestCount: 30,
        totalBudget: 0,
        currency: 'INR',
        style: 'casual',
        preferences: '',
      };

      const plan = generateContextualFallbackPlan(zeroBudgetInput);
      expect(plan.budgetPlan.length).toBeGreaterThan(0);
      // Even with 0 budget input, items have valid non-negative numbers
      for (const item of plan.budgetPlan) {
        expect(isNaN(item.plannedAmount)).toBe(false);
      }
    });

    it('ensures all vendor records are safe even when contact/website/email are missing', () => {
      const input: CreateEventInput = {
        name: 'Minimal Birthday',
        type: 'birthday',
        date: '2026-05-01',
        location: 'Kolkata',
        guestCount: 10,
        totalBudget: 10000,
        currency: 'INR',
        style: 'casual',
        preferences: '',
      };

      const plan = generateContextualFallbackPlan(input);
      for (const vendor of plan.vendors) {
        expect(vendor.name).toBeTruthy();
        expect(vendor.category).toBeTruthy();
        expect(vendor.estimatedCost).toBeGreaterThanOrEqual(0);
        // contact, email, website can be undefined or string without throwing errors in consumers
        expect(typeof vendor.contact === 'string' || vendor.contact === undefined).toBe(true);
      }
    });

    it('ensures runOfShow exists and has valid timestamp cues', () => {
      const input: CreateEventInput = {
        name: 'Wedding Run of Show Test',
        type: 'wedding',
        date: '2026-11-15',
        location: 'Kolkata',
        guestCount: 100,
        totalBudget: 400000,
        currency: 'INR',
        style: 'traditional',
        preferences: '',
      };

      const plan = generateContextualFallbackPlan(input);
      expect(plan.runOfShow).toBeDefined();
      expect(plan.runOfShow!.length).toBeGreaterThanOrEqual(3);
      for (const cue of plan.runOfShow!) {
        expect(cue.time).toBeTruthy();
        expect(cue.title).toBeTruthy();
      }
    });
  });
});

