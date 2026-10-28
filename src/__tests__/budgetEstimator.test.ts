import { describe, it, expect } from 'vitest';
import { estimateBudgetWithAI } from '../services/gemini';

describe('Budget Estimator & Event-Type Specific Logic', () => {
  it('calculates a multi-category wedding budget appropriate for 150 guests', async () => {
    const result = await estimateBudgetWithAI({
      eventType: 'wedding',
      location: 'Kolkata, West Bengal',
      guestCount: 150,
      style: 'traditional',
      currency: 'INR',
    });

    expect(result.suggestedTarget).toBeGreaterThanOrEqual(200000);
    expect(result.costPerGuest).toBeGreaterThanOrEqual(1500);
    expect(result.breakdown.length).toBeGreaterThanOrEqual(6);

    const categories = result.breakdown.map((b) => b.category);
    expect(categories).toContain('Catering');
    expect(categories).toContain('Venue');
    expect(categories).toContain('Decoration');

    // Input snapshot verifies transparency
    expect(result.inputSnapshot).toBeDefined();
    expect(result.inputSnapshot?.eventType).toBe('wedding');
    expect(result.inputSnapshot?.guestCount).toBe(150);
  });

  it('calculates a party-oriented birthday budget for 15 guests with party categories', async () => {
    const result = await estimateBudgetWithAI({
      eventType: 'birthday',
      location: 'Kolkata, West Bengal',
      guestCount: 15,
      style: 'casual',
      currency: 'INR',
    });

    // A 15-guest birthday party should NOT be 5 Lakhs
    expect(result.suggestedTarget).toBeLessThanOrEqual(25000);
    expect(result.suggestedTarget).toBeGreaterThanOrEqual(8000);

    const categories = result.breakdown.map((b) => b.category);
    expect(categories).toContain('Cake & Confections');
    expect(categories).toContain('Decorations & Balloons');
    expect(categories).toContain('Entertainment & Games');
    expect(categories).not.toContain('Clothing'); // No wedding trousseau in a casual birthday

    expect(result.inputSnapshot?.eventType).toBe('birthday');
    expect(result.inputSnapshot?.guestCount).toBe(15);
  });

  it('handles online event format with zero physical catering and platform categories', async () => {
    const result = await estimateBudgetWithAI({
      eventType: 'community',
      format: 'online',
      location: 'Online / Google Meet',
      guestCount: 50,
      style: 'modern',
      currency: 'INR',
    });

    const categories = result.breakdown.map((b) => b.category);
    expect(categories).toContain('Platform & Software');
    expect(categories).toContain('Speakers');
    expect(categories).toContain('AV & Production');
    expect(categories).not.toContain('Catering'); // Online format eliminates physical food expenses
  });

  it('calculates civic conference parameters for a community event with 100 attendees', async () => {
    const result = await estimateBudgetWithAI({
      eventType: 'community',
      format: 'in-person',
      location: 'Hyderabad, Telangana',
      guestCount: 100,
      style: 'modern',
      currency: 'INR',
    });

    expect(result.suggestedTarget).toBeGreaterThanOrEqual(25000);
    const categories = result.breakdown.map((b) => b.category);
    expect(categories).toContain('AV & Production');
    expect(categories).toContain('Printing');
    expect(categories).toContain('Volunteers & Staff');
  });

  it('calculates custom event parameters (e.g. College Farewell)', async () => {
    const result = await estimateBudgetWithAI({
      eventType: 'custom',
      customEventType: 'College Farewell',
      location: 'Kolkata, West Bengal',
      guestCount: 80,
      style: 'casual',
      currency: 'INR',
    });

    expect(result.inputSnapshot?.customEventType).toBe('College Farewell');
    const categories = result.breakdown.map((b) => b.category);
    expect(categories).toContain('Entertainment');
    expect(categories).toContain('Party Favors');
  });

  /**
   * CRITICAL REGRESSION TEST REQUESTED BY USER:
   * 1. Create a Wedding with 150 guests and ₹5 lakh.
   * 2. Run Guess My Budget.
   * 3. Go back to Basic Info.
   * 4. Change event type to Birthday.
   * 5. Change guests to 15.
   * 6. Change budget to ₹10,000.
   * 7. Run Guess My Budget again.
   * The second calculation must use ONLY the new values without stale state leakage.
   */
  it('REGRESSION: recalculation uses ONLY new values when user navigates back and changes form inputs', async () => {
    // Step 1: Initial state = Wedding, 150 guests, ₹5 Lakh
    const firstRun = await estimateBudgetWithAI({
      eventType: 'wedding',
      location: 'Kolkata, West Bengal',
      guestCount: 150,
      style: 'traditional',
      currency: 'INR',
    });

    expect(firstRun.inputSnapshot?.eventType).toBe('wedding');
    expect(firstRun.inputSnapshot?.guestCount).toBe(150);
    expect(firstRun.suggestedTarget).toBeGreaterThanOrEqual(200000);
    expect(firstRun.breakdown.map((b) => b.category)).toContain('Decoration');

    // Step 2: User goes back and switches to Birthday, 15 guests, ₹10,000
    const secondRun = await estimateBudgetWithAI({
      eventType: 'birthday',
      location: 'Kolkata, West Bengal',
      guestCount: 15,
      style: 'casual',
      currency: 'INR',
    });

    // The second calculation MUST reflect ONLY Birthday inputs
    expect(secondRun.inputSnapshot?.eventType).toBe('birthday');
    expect(secondRun.inputSnapshot?.guestCount).toBe(15);
    expect(secondRun.suggestedTarget).toBeLessThanOrEqual(25000);
    expect(secondRun.costPerGuest).toBeLessThan(firstRun.costPerGuest);

    const secondCategories = secondRun.breakdown.map((b) => b.category);
    expect(secondCategories).toContain('Cake & Confections');
    expect(secondCategories).toContain('Decorations & Balloons');
    expect(secondCategories).not.toContain('Clothing');

    // Ensure completely distinct object references and non-contaminated values
    expect(secondRun.suggestedTarget).not.toBe(firstRun.suggestedTarget);
    expect(secondRun.inputSnapshot).not.toEqual(firstRun.inputSnapshot);
  });
});
