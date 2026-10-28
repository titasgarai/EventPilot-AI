import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  ExternalLink,
  Bot,
  MapPin,
  Copy,
  Check,
  Monitor,
  Cake,
  ShieldCheck,
  Award,
  Sparkles,
} from 'lucide-react';
import { EventPlan } from '../types';
import {
  formatCurrency,
  formatDate,
  getDaysRemaining,
  calculateTaskStats,
} from '../utils/formatters';
import { getDashboardConfig } from '../utils/dashboardConfig';
import { StatCard } from '../components/common/StatCard';
import { ActiveTab } from '../components/common/Sidebar';
import { useToast } from '../components/common/Toast';
import {
  ResponsiveContainer,
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
  onUpdateEvent?: (updated: EventPlan) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  event,
  onNavigateTab,
  onUpdateEvent,
}) => {
  const { showToast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const countdown = getDaysRemaining(event.date);
  const themeConfig = getDashboardConfig(event);

  const taskStats = calculateTaskStats(event);

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

  // Run of Show items (e.g., party timeline or session agenda)
  const runOfShowItems = event.runOfShow || [];

  const handleCopyLink = () => {
    if (event.onlineDetails?.meetingLink) {
      navigator.clipboard.writeText(event.onlineDetails.meetingLink);
      setCopiedLink(true);
      showToast('Meeting link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToggleTechCheckItem = (id: string) => {
    if (!event.onlineDetails?.techChecklist || !onUpdateEvent) return;
    const updatedChecklist = event.onlineDetails.techChecklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    onUpdateEvent({
      ...event,
      onlineDetails: {
        ...event.onlineDetails,
        techChecklist: updatedChecklist,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const isOnline = event.format === 'online' || event.format === 'hybrid';
  const customLabel = event.type === 'custom' && event.customEventType ? event.customEventType : event.type;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Dynamic Hero Header Themed to Event Personality */}
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${themeConfig.heroGradient} text-white p-6 sm:p-8 shadow-xl border`}>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${themeConfig.badgeStyle}`}>
                {customLabel} • {event.style}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-slate-200 border border-white/10">
                {themeConfig.accentBadge}
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
                {event.format === 'online' ? `Virtual Stage (${event.onlineDetails?.platform || 'Google Meet'})` : event.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-royal-400" />
                {event.guestCount} {event.format === 'online' ? 'attendees' : 'guests'}
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
                {event.type === 'birthday' ? 'Party Countdown' : event.format === 'online' ? 'Broadcast Clock' : 'Planning Clock'}
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

      {/* Event-Themed 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {themeConfig.statCards.map((card, i) => (
          <StatCard
            key={i}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            icon={card.icon}
            accentColor={card.accentColor}
            badge={card.badge}
            onClick={() => onNavigateTab(card.tabTarget)}
          />
        ))}
      </div>

      {/* EVENT-SPECIFIC PRIORITY HUBS */}

      {/* 1. ONLINE EVENT HUB: Virtual Stage, Meeting Link & Tech Readiness */}
      {isOnline && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-indigo-200/80 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Virtual Stage Command Center</h3>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                    {event.onlineDetails?.platform || 'Google Meet'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Live stream room credentials and technical rehearsal controls</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {event.onlineDetails?.meetingLink ? (
                <>
                  <button
                    onClick={handleCopyLink}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
                  </button>
                  <a
                    href={event.onlineDetails.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Open Room</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </>
              ) : (
                <button
                  onClick={() => onNavigateTab('details')}
                  className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold"
                >
                  Set Meeting Link
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tech Checklist */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Technical Readiness Checklist:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {event.onlineDetails?.techChecklist?.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleTechCheckItem(item.id)}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 cursor-pointer transition-all text-xs"
                  >
                    <span className={`font-medium ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {item.label}
                    </span>
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                    }`}>
                      {item.completed && <Check className="w-3 h-3" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Virtual Run-of-Show Agenda Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Broadcast Agenda ({runOfShowItems.length} Milestones):
                </span>
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800"
                >
                  View Schedule →
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {runOfShowItems.slice(0, 4).map((ros) => (
                  <div key={ros.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs flex items-start gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] shrink-0 mt-0.5">
                      {ros.time}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{ros.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{ros.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BIRTHDAY PARTY HUB: 4-Hour Timeline & Cake Delivery */}
      {event.type === 'birthday' && !isOnline && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-amber-200/80 shadow-xs space-y-5 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Birthday Party Run-of-Show (3-5 Hours)</h3>
                <p className="text-xs text-slate-500">Compact event-day party schedule from arrival to cake cutting</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              Full Party Timeline ({runOfShowItems.length} Milestones) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {runOfShowItems.slice(0, 3).map((ros, idx) => (
              <div key={ros.id} className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                    {ros.time}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">Step {idx + 1}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 truncate">{ros.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{ros.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. COMMUNITY EVENT HUB: Sessions, Volunteers & Permissions */}
      {event.type === 'community' && !isOnline && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-cyan-200/80 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-100">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Community Operations & Volunteer Center</h3>
                <p className="text-xs text-slate-500">Hall access, registration queue management, and volunteer briefing</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900"
            >
              Manage Session Agenda →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Volunteer Staffing</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">
                {Math.max(4, Math.ceil(event.guestCount / 15))} Volunteers
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ratio: 1 per 15 attendees</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Registration Flow</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">2 Queues Recommended</p>
              <p className="text-[11px] text-slate-500 mt-0.5">A-M and N-Z badge desks</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Sound & Permissions</span>
              <p className="text-base font-extrabold text-emerald-700 mt-0.5">Clearance Active</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Verify 10:00 PM PA curfew</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. CUSTOM EVENT HUB: Customized Run-of-Show */}
      {event.type === 'custom' && !isOnline && runOfShowItems.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-purple-200/80 shadow-xs space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{customLabel} Execution Schedule</h3>
                <p className="text-xs text-slate-500">Hour-by-hour run-of-show tailored specifically for {customLabel}</p>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900"
            >
              Full Schedule →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {runOfShowItems.slice(0, 3).map((ros) => (
              <div key={ros.id} className="p-3.5 rounded-2xl bg-purple-50/40 border border-purple-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-800 tracking-wider">{ros.time}</span>
                <p className="font-bold text-slate-900 truncate">{ros.title}</p>
                <p className="text-[11px] text-slate-600 line-clamp-2">{ros.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <p className="text-xs text-slate-500">Planned vs spent across {customLabel} categories</p>
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


