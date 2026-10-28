import { CurrencyCode, CURRENCY_MAP, EventPlan } from '../types';

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const config = CURRENCY_MAP[currency] || { symbol: '₹' };
  
  // Format numbers nicely
  if (currency === 'INR') {
    // Indian numbering format (lakhs, crores)
    return `${config.symbol}${amount.toLocaleString('en-IN')}`;
  }
  return `${config.symbol}${amount.toLocaleString('en-US')}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysRemaining(dateString: string): { days: number; isPast: boolean; label: string } {
  if (!dateString) return { days: 0, isPast: false, label: 'Date not set' };
  const target = new Date(dateString).getTime();
  const today = new Date().setHours(0, 0, 0, 0);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), isPast: true, label: `${Math.abs(diffDays)} days ago` };
  } else if (diffDays === 0) {
    return { days: 0, isPast: false, label: 'Today is the day!' };
  } else {
    return { days: diffDays, isPast: false, label: `${diffDays} days remaining` };
  }
}

export function calculateCostPerGuest(totalBudget: number, guestCount: number): number {
  if (!guestCount || guestCount <= 0 || !totalBudget || totalBudget <= 0) {
    return 0;
  }
  return Math.round(totalBudget / guestCount);
}

export function calculateBudgetStats(event: EventPlan) {
  const totalBudget = event.totalBudget || 0;
  
  // Sum spent across actual expenses or budget categories
  const totalSpentFromExpenses = event.expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0;
  const totalSpentFromPlan = event.budgetPlan?.reduce((sum, b) => sum + (b.spentAmount || 0), 0) || 0;
  
  // Prefer expenses if entered, else budget items spent
  const totalSpent = Math.max(totalSpentFromExpenses, totalSpentFromPlan);
  const totalPlanned = event.budgetPlan?.reduce((sum, b) => sum + (b.plannedAmount || 0), 0) || totalBudget;
  const remaining = Math.max(0, totalBudget - totalSpent);
  const percentageSpent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 0;
  const isOverBudget = totalSpent > totalBudget;

  return {
    totalBudget,
    totalPlanned,
    totalSpent,
    remaining,
    percentageSpent,
    isOverBudget,
  };
}

export function calculateTaskStats(event: EventPlan) {
  const tasks = event.timeline || [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const pending = tasks.filter((t) => t.status === 'pending').length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    completed,
    inProgress,
    pending,
    progressPercent,
  };
}

export function calculateVendorStats(event: EventPlan) {
  const vendors = event.vendors || [];
  const total = vendors.length;
  const booked = vendors.filter((v) => v.status === 'Booked').length;
  const contacted = vendors.filter((v) => v.status === 'Contacted').length;
  const shortlisted = vendors.filter((v) => v.status === 'Shortlisted').length;
  const notStarted = vendors.filter((v) => v.status === 'Not Started').length;

  return {
    total,
    booked,
    contacted,
    shortlisted,
    notStarted,
  };
}

