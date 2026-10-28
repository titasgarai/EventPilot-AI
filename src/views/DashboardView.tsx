import React, { useState } from 'react';
import {
  Calendar,
  Wallet,
  CheckSquare,
  Users,
  Store,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronRight,
  CheckCircle2,
  Lightbulb,
  ExternalLink,
  Bot,
  MapPin,
  Flame,
} from 'lucide-react';
import { EventPlan, SmartInsight } from '../types';
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  calculateBudgetStats,
  calculateTaskStats,
  calculateVendorStats,
} from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { ActiveTab } from '../components/common/Sidebar';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

interface DashboardViewProps {
  event: EventPlan;
  onNavigateTab: (tab: ActiveTab) => void;
  onDismissInsight?: (insightId: string) => void;
}

const PIE_COLORS = [
  '#c23c57', // brand-600
  '#4b61cb', // royal-600
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#8b5cf6', // purple-500
  '#06b6d4', // cyan-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
  '#f97316', // orange-500
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  event,
  onNavigateTab,
  onDismissInsight,
}) => {
  const budgetStats = calculateBudgetStats(event);
  const taskStats = calculateTaskStats(event);
  const vendorStats = calculateVendorStats(event);
  const countdown = getDaysRemaining(event.date);

  // Prepare chart data for budget
  const budgetChartData = event.budgetPlan.map((b) => ({
    name: b.category,
    planned: b.plannedAmount,
    spent: b.spentAmount,
  }));

  // Top pending upcoming tasks
  const upcomingTasks = event.timeline
    .filter((t) => t.status !== 'completed')
    .slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Hero Header with Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-royal-950 to-brand-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-brand-300 border border-white/10">
                {event.type} • {event.style}
              </span>
              {event.isDemo && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Demo Showcase
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {event.name}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                {event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-royal-400" />
                {event.guestCount} guests
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {formatDate(event.date)}
              </span>
            </div>
          </div>

          {/* Countdown & Quick AI Assistant CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight block">
                {countdown.label}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
                Planning Clock
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('assistant')}
              className="px-5 py-3 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group active:scale-95"
            >
              <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Ask EventPilot AI</span>
            </button>
          </div>
        </div>

        {/* Executive summary quote */}
        {event.eventSummary && (
          <div className="mt-6 pt-5 border-t border-white/10 text-xs text-slate-300/90 leading-relaxed italic max-w-4xl">
            "{event.eventSummary}"
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Card */}
        <StatCard
          title="Total Budget"
          value={formatCurrency(budgetStats.totalBudget, event.currency)}
          subtitle={`${formatCurrency(budgetStats.totalSpent, event.currency)} spent • ${formatCurrency(budgetStats.remaining, event.currency)} left`}
          icon={Wallet}
          accentColor="bg-emerald-50 text-emerald-600 border-emerald-100"
          badge={{
            text: `${budgetStats.percentageSpent}% Spent`,
            variant: budgetStats.isOverBudget ? 'danger' : 'success',
          }}
          onClick={() => onNavigateTab('budget')}
        />

        {/* Planning Progress Card */}
        <StatCard
          title="Planning Progress"
          value={`${taskStats.progressPercent}%`}
          subtitle={`${taskStats.completed} of ${taskStats.total} milestones achieved`}
          icon={TrendingUp}
          accentColor="bg-brand-50 text-brand-600 border-brand-100"
          badge={{
            text: taskStats.progressPercent > 50 ? 'On Track' : 'Needs Focus',
            variant: taskStats.progressPercent > 50 ? 'success' : 'warning',
          }}
          onClick={() => onNavigateTab('timeline')}
        />

        {/* Tasks Card */}
        <StatCard
          title="Tasks Pipeline"
          value={`${taskStats.completed} / ${taskStats.total}`}
          subtitle={`${taskStats.pending} pending • ${taskStats.inProgress} in progress`}
          icon={CheckSquare}
          accentColor="bg-royal-50 text-royal-600 border-royal-100"
          badge={{
            text: `${taskStats.pending} Remaining`,
            variant: 'info',
          }}
          onClick={() => onNavigateTab('timeline')}
        />

        {/* Vendors Card */}
        <StatCard
          title="Vendors Roster"
          value={`${vendorStats.booked} / ${vendorStats.total}`}
          subtitle={`${vendorStats.contacted} contacted • ${vendorStats.shortlisted} shortlisted`}
          icon={Store}
          accentColor="bg-amber-50 text-amber-700 border-amber-100"
          badge={{
            text: `${vendorStats.booked} Confirmed`,
            variant: 'warning',
          }}
          onClick={() => onNavigateTab('vendors')}
        />
      </div>

      {/* AI Insights Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Strategic Insights</h2>
              <p className="text-xs text-slate-500">
                Proactive intelligence engine detecting risks, overspending, and deadlines
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('assistant')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Ask AI Assistant <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {event.insights?.slice(0, 4).map((ins) => {
            const severityClass = {
              HIGH: 'border-l-4 border-l-rose-500 bg-rose-50/30 text-rose-950',
              MEDIUM: 'border-l-4 border-l-amber-500 bg-amber-50/30 text-amber-950',
              LOW: 'border-l-4 border-l-sky-500 bg-sky-50/30 text-sky-950',
            }[ins.severity];

            const badgeClass = {
              HIGH: 'bg-rose-100 text-rose-800',
              MEDIUM: 'bg-amber-100 text-amber-800',
              LOW: 'bg-sky-100 text-sky-800',
            }[ins.severity];

            return (
              <div
                key={ins.id}
                className={`p-4 rounded-2xl border border-slate-200/80 shadow-xs ${severityClass} space-y-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                    {ins.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeClass} shrink-0`}>
                    {ins.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{ins.description}</p>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-slate-700 italic">
                    💡 <span className="font-semibold">Action:</span> {ins.recommendation}
                  </p>
                  {ins.actionRoute && (
                    <button
                      onClick={() => onNavigateTab(ins.actionRoute as ActiveTab)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 shrink-0 ml-2"
                    >
                      {ins.actionText || 'Resolve'} →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Section: Budget Chart + Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Budget Distribution Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Budget Allocation Breakdown</h3>
              <p className="text-xs text-slate-500">Planned vs spent across categories</p>
            </div>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              Manage Expenses <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(value: number) => [
                    formatCurrency(value, event.currency),
                    'Amount',
                  ]}
                />
                <Bar dataKey="planned" fill="#4b61cb" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="spent" fill="#c23c57" radius={[4, 4, 0, 0]} name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 flex items-center justify-center gap-6 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-royal-600" />
              <span>Planned Amount</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-brand-600" />
              <span>Actual Spent</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Upcoming Tasks & Sprint */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Immediate Action Items</h3>
                <p className="text-xs text-slate-500">Prioritized by AI for execution</p>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                All Tasks ({taskStats.total}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-start gap-3"
                >
                  <Clock className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                      <span>{task.phase}</span>
                      <span>•</span>
                      <span className="capitalize font-semibold text-brand-700">
                        {task.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-bold text-slate-800">{taskStats.completed}</span> completed,{' '}
              <span className="font-bold text-brand-600">{taskStats.pending}</span> remaining
            </div>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-all"
            >
              Plan 7-Day Sprint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

