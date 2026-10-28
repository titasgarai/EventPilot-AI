import { EventPlan, EventType, EventFormat } from '../types';
import {
  Wallet,
  Users,
  CheckSquare,
  Store,
  Monitor,
  Cake,
  Music,
  Video,
  ShieldCheck,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { formatCurrency, calculateBudgetStats, calculateTaskStats, calculateVendorStats } from './formatters';

export interface DashboardThemeConfig {
  personalityLabel: string;
  heroGradient: string;
  badgeStyle: string;
  accentBadge: string;
  primaryMetricType: 'wedding' | 'birthday' | 'community' | 'online' | 'custom';
  statCards: {
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    accentColor: string;
    badge: { text: string; variant: 'success' | 'warning' | 'danger' | 'info' };
    tabTarget: 'budget' | 'timeline' | 'vendors' | 'assistant';
  }[];
}

export function getDashboardConfig(event: EventPlan): DashboardThemeConfig {
  const isOnline = event.format === 'online';
  const bStats = calculateBudgetStats(event);
  const tStats = calculateTaskStats(event);
  const vStats = calculateVendorStats(event);
  const symbol = event.currency === 'INR' ? '₹' : '$';

  // 1. ONLINE / VIRTUAL EVENT
  if (isOnline) {
    const techDone = event.onlineDetails?.techChecklist?.filter((c) => c.completed).length || 0;
    const techTotal = event.onlineDetails?.techChecklist?.length || 8;

    return {
      personalityLabel: 'Virtual Stage & Digital Workspace',
      heroGradient: 'from-slate-950 via-indigo-950 to-purple-950 border-indigo-900/50',
      badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      accentBadge: '100% Virtual Event',
      primaryMetricType: 'online',
      statCards: [
        {
          title: 'Virtual Production Budget',
          value: formatCurrency(bStats.totalBudget, event.currency),
          subtitle: `${formatCurrency(bStats.totalSpent, event.currency)} committed • ${formatCurrency(bStats.remaining, event.currency)} left`,
          icon: Wallet,
          accentColor: 'bg-indigo-50 text-indigo-600 border-indigo-100',
          badge: {
            text: `${bStats.percentageSpent}% Allocated`,
            variant: bStats.isOverBudget ? 'danger' : 'success',
          },
          tabTarget: 'budget',
        },
        {
          title: 'Registered Attendees',
          value: `${event.guestCount}`,
          subtitle: `Expected in ${event.onlineDetails?.platform || 'Google Meet'} room`,
          icon: Users,
          accentColor: 'bg-sky-50 text-sky-600 border-sky-100',
          badge: {
            text: 'Live Room Capacity',
            variant: 'info',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Tech Rehearsal Checklist',
          value: `${techDone} / ${techTotal}`,
          subtitle: 'Mic, camera, slides & cloud recording',
          icon: Monitor,
          accentColor: 'bg-purple-50 text-purple-600 border-purple-100',
          badge: {
            text: techDone >= 4 ? 'Ready to Stream' : 'Tests Pending',
            variant: techDone >= 4 ? 'success' : 'warning',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Webinar Digital Assets',
          value: `${vStats.total} Resources`,
          subtitle: 'Producer, slides & video editor',
          icon: Video,
          accentColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          badge: {
            text: `${vStats.booked} Confirmed`,
            variant: 'success',
          },
          tabTarget: 'vendors',
        },
      ],
    };
  }

  // 2. BIRTHDAY PARTY
  if (event.type === 'birthday') {
    const cakeBudget = event.budgetPlan.find((b) => b.category.toLowerCase().includes('cake'))?.plannedAmount || 0;

    return {
      personalityLabel: 'Festive Party Command Center',
      heroGradient: 'from-amber-950 via-slate-900 to-rose-950 border-amber-900/40',
      badgeStyle: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
      accentBadge: 'Joyful Birthday Party',
      primaryMetricType: 'birthday',
      statCards: [
        {
          title: 'Party Budget',
          value: formatCurrency(bStats.totalBudget, event.currency),
          subtitle: `${formatCurrency(bStats.totalSpent, event.currency)} spent • ${formatCurrency(bStats.remaining, event.currency)} left`,
          icon: Wallet,
          accentColor: 'bg-rose-50 text-rose-600 border-rose-100',
          badge: {
            text: `${bStats.percentageSpent}% Spent`,
            variant: bStats.isOverBudget ? 'danger' : 'success',
          },
          tabTarget: 'budget',
        },
        {
          title: 'Guest Headcount',
          value: `${event.guestCount}`,
          subtitle: 'Invited friends & family members',
          icon: Users,
          accentColor: 'bg-amber-50 text-amber-700 border-amber-100',
          badge: {
            text: 'RSVP Headcount',
            variant: 'info',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Party Tasks Pipeline',
          value: `${tStats.completed} / ${tStats.total}`,
          subtitle: `${tStats.pending} pending • Games & playlist ready`,
          icon: CheckSquare,
          accentColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          badge: {
            text: tStats.progressPercent > 50 ? 'Party Ready' : 'In Progress',
            variant: tStats.progressPercent > 50 ? 'success' : 'warning',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Artisan Cake & Decor',
          value: cakeBudget > 0 ? formatCurrency(cakeBudget, event.currency) : 'Curated',
          subtitle: 'Custom cake, balloons & photographer',
          icon: Cake,
          accentColor: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
          badge: {
            text: `${vStats.booked} / ${vStats.total} Booked`,
            variant: 'warning',
          },
          tabTarget: 'vendors',
        },
      ],
    };
  }

  // 3. COMMUNITY EVENT
  if (event.type === 'community') {
    return {
      personalityLabel: 'Civic & Community Operations Hub',
      heroGradient: 'from-slate-950 via-slate-900 to-cyan-950 border-cyan-900/40',
      badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      accentBadge: 'Community Gathering',
      primaryMetricType: 'community',
      statCards: [
        {
          title: 'Community Fund / Budget',
          value: formatCurrency(bStats.totalBudget, event.currency),
          subtitle: `${formatCurrency(bStats.totalSpent, event.currency)} spent • ${formatCurrency(bStats.remaining, event.currency)} left`,
          icon: Wallet,
          accentColor: 'bg-cyan-50 text-cyan-700 border-cyan-100',
          badge: {
            text: `${bStats.percentageSpent}% Allocated`,
            variant: bStats.isOverBudget ? 'danger' : 'success',
          },
          tabTarget: 'budget',
        },
        {
          title: 'Registered Delegates',
          value: `${event.guestCount}`,
          subtitle: 'Attendees across all sessions',
          icon: Users,
          accentColor: 'bg-blue-50 text-blue-700 border-blue-100',
          badge: {
            text: 'Hall Capacity OK',
            variant: 'info',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Operations & Volunteers',
          value: `${tStats.completed} / ${tStats.total}`,
          subtitle: 'Permissions, soundcheck & badges',
          icon: ShieldCheck,
          accentColor: 'bg-teal-50 text-teal-700 border-teal-100',
          badge: {
            text: tStats.progressPercent > 50 ? 'On Track' : 'Needs Focus',
            variant: tStats.progressPercent > 50 ? 'success' : 'warning',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Equipment & Facilities',
          value: `${vStats.booked} / ${vStats.total}`,
          subtitle: 'Auditorium, PA sound & catering',
          icon: Store,
          accentColor: 'bg-amber-50 text-amber-700 border-amber-100',
          badge: {
            text: `${vStats.booked} Confirmed`,
            variant: 'warning',
          },
          tabTarget: 'vendors',
        },
      ],
    };
  }

  // 4. CUSTOM EVENT
  if (event.type === 'custom') {
    const customTitle = event.customEventType || event.name;

    return {
      personalityLabel: `Tailored Blueprint: ${customTitle}`,
      heroGradient: 'from-purple-950 via-slate-900 to-brand-950 border-purple-900/40',
      badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      accentBadge: customTitle,
      primaryMetricType: 'custom',
      statCards: [
        {
          title: 'Event Budget',
          value: formatCurrency(bStats.totalBudget, event.currency),
          subtitle: `${formatCurrency(bStats.totalSpent, event.currency)} spent • ${formatCurrency(bStats.remaining, event.currency)} left`,
          icon: Wallet,
          accentColor: 'bg-purple-50 text-purple-600 border-purple-100',
          badge: {
            text: `${bStats.percentageSpent}% Spent`,
            variant: bStats.isOverBudget ? 'danger' : 'success',
          },
          tabTarget: 'budget',
        },
        {
          title: 'Expected Guests',
          value: `${event.guestCount}`,
          subtitle: `Attendees for ${customTitle}`,
          icon: Users,
          accentColor: 'bg-brand-50 text-brand-600 border-brand-100',
          badge: {
            text: 'Headcount Set',
            variant: 'info',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Milestones & Tasks',
          value: `${tStats.completed} / ${tStats.total}`,
          subtitle: `${tStats.pending} pending tasks remaining`,
          icon: CheckSquare,
          accentColor: 'bg-royal-50 text-royal-600 border-royal-100',
          badge: {
            text: tStats.progressPercent > 50 ? 'On Track' : 'Needs Focus',
            variant: tStats.progressPercent > 50 ? 'success' : 'warning',
          },
          tabTarget: 'timeline',
        },
        {
          title: 'Specialized Vendors',
          value: `${vStats.booked} / ${vStats.total}`,
          subtitle: 'Venues, music, gifts & catering',
          icon: Award,
          accentColor: 'bg-amber-50 text-amber-700 border-amber-100',
          badge: {
            text: `${vStats.booked} Confirmed`,
            variant: 'warning',
          },
          tabTarget: 'vendors',
        },
      ],
    };
  }

  // 5. WEDDING DEFAULT
  return {
    personalityLabel: 'Ceremony & Banqueting Masterplan',
    heroGradient: 'from-slate-900 via-royal-950 to-brand-950 border-slate-800',
    badgeStyle: 'bg-white/10 text-brand-300 border-white/10',
    accentBadge: 'Wedding Masterplan',
    primaryMetricType: 'wedding',
    statCards: [
      {
        title: 'Total Budget',
        value: formatCurrency(bStats.totalBudget, event.currency),
        subtitle: `${formatCurrency(bStats.totalSpent, event.currency)} spent • ${formatCurrency(bStats.remaining, event.currency)} left`,
        icon: Wallet,
        accentColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        badge: {
          text: `${bStats.percentageSpent}% Spent`,
          variant: bStats.isOverBudget ? 'danger' : 'success',
        },
        tabTarget: 'budget',
      },
      {
        title: 'Planning Progress',
        value: `${tStats.progressPercent}%`,
        subtitle: `${tStats.completed} of ${tStats.total} milestones achieved`,
        icon: Sparkles,
        accentColor: 'bg-brand-50 text-brand-600 border-brand-100',
        badge: {
          text: tStats.progressPercent > 50 ? 'On Track' : 'Needs Focus',
          variant: tStats.progressPercent > 50 ? 'success' : 'warning',
        },
        tabTarget: 'timeline',
      },
      {
        title: 'Tasks Pipeline',
        value: `${tStats.completed} / ${tStats.total}`,
        subtitle: `${tStats.pending} pending • ${tStats.inProgress} in progress`,
        icon: CheckSquare,
        accentColor: 'bg-royal-50 text-royal-600 border-royal-100',
        badge: {
          text: `${tStats.pending} Remaining`,
          variant: 'info',
        },
        tabTarget: 'timeline',
      },
      {
        title: 'Vendors Roster',
        value: `${vStats.booked} / ${vStats.total}`,
        subtitle: `${vStats.contacted} contacted • ${vStats.shortlisted} shortlisted`,
        icon: Store,
        accentColor: 'bg-amber-50 text-amber-700 border-amber-100',
        badge: {
          text: `${vStats.booked} Confirmed`,
          variant: 'warning',
        },
        tabTarget: 'vendors',
      },
    ],
  };
}
