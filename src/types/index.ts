export type EventType = 'wedding' | 'birthday' | 'community' | 'custom';

export type EventStyle =
  | 'traditional'
  | 'modern'
  | 'minimal'
  | 'luxury'
  | 'casual'
  | 'eco-friendly'
  | 'custom';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'CAD' | 'AUD' | 'SGD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToINR: number;
}

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; label: string }> = {
  INR: { symbol: '₹', label: 'INR (₹)' },
  USD: { symbol: '$', label: 'USD ($)' },
  EUR: { symbol: '€', label: 'EUR (€)' },
  GBP: { symbol: '£', label: 'GBP (£)' },
  AED: { symbol: 'AED', label: 'AED' },
  CAD: { symbol: 'C$', label: 'CAD (C$)' },
  AUD: { symbol: 'A$', label: 'AUD (A$)' },
  SGD: { symbol: 'S$', label: 'SGD (S$)' },
};

export type BudgetCategory =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Photography'
  | 'Entertainment'
  | 'Invitations'
  | 'Transportation'
  | 'Clothing'
  | 'Miscellaneous';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  plannedAmount: number;
  spentAmount: number;
  notes?: string;
}

export interface Expense {
  id: string;
  category: BudgetCategory;
  title: string;
  amount: number;
  date: string;
  paidTo?: string;
  notes?: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export type TimelinePhase =
  | '6 months before'
  | '3 months before'
  | '1 month before'
  | '2 weeks before'
  | '1 week before'
  | '3 days before'
  | 'Event day';

export interface Task {
  id: string;
  name: string;
  deadline: string;
  phase: TimelinePhase;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string;
  notes?: string;
}

export type VendorCategory =
  | 'Venue'
  | 'Catering'
  | 'Photographer'
  | 'Decorator'
  | 'Entertainment'
  | 'Transportation'
  | 'Makeup'
  | 'Security'
  | 'Printing'
  | 'Equipment'
  | 'Other';

export type VendorStatus = 'Not Started' | 'Shortlisted' | 'Contacted' | 'Booked';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  estimatedCost: number;
  actualCost?: number;
  status: VendorStatus;
  contact: string;
  email?: string;
  notes?: string;
  rating?: number;
}

export type IdeaSection =
  | 'Decoration'
  | 'Food'
  | 'Entertainment'
  | 'Activities'
  | 'Invitations'
  | 'Photography'
  | 'Budget Saving'
  | 'Unique Experiences';

export interface PersonalizedIdea {
  id: string;
  category: IdeaSection;
  title: string;
  description: string;
  impactOrSavings?: string;
  isFavorite: boolean;
  tags?: string[];
}

export type InsightSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  category: string;
  recommendation: string;
  actionText?: string;
  actionRoute?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export interface EventPlan {
  id: string;
  name: string;
  type: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  style: EventStyle;
  preferences: string;
  eventSummary: string;
  budgetPlan: BudgetItem[];
  expenses: Expense[];
  timeline: Task[];
  vendors: Vendor[];
  personalizedIdeas: PersonalizedIdea[];
  insights: SmartInsight[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface StagedLoadingStep {
  step: number;
  label: string;
  detail: string;
}

