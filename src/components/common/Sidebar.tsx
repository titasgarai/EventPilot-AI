import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Wallet,
  Clock,
  Store,
  Lightbulb,
  Sparkles,
  Bot,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { EventPlan } from '../../types';
import { getDaysRemaining, calculateTaskStats } from '../../utils/formatters';

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'details'
  | 'budget'
  | 'timeline'
  | 'vendors'
  | 'ideas'
  | 'assistant'
  | 'create';

interface SidebarProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeEvent: EventPlan;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenMyEvents: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeEvent,
  isMobileOpen,
  onCloseMobile,
  onOpenMyEvents,
}) => {
  const countdown = getDaysRemaining(activeEvent.date);
  const taskStats = calculateTaskStats(activeEvent);

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | null;
    isHighlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'details', label: 'Event Details', icon: FileText, badge: null },
    { id: 'budget', label: 'Budget & Expenses', icon: Wallet, badge: `${activeEvent.budgetPlan.length}` },
    { id: 'timeline', label: 'Timeline & Tasks', icon: Clock, badge: `${taskStats.pending}` },
    { id: 'vendors', label: 'Vendors', icon: Store, badge: `${activeEvent.vendors.length}` },
    { id: 'ideas', label: 'AI Ideas & Inspiration', icon: Lightbulb, badge: 'New' },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, isHighlight: true, badge: 'AI' },
  ];

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80 w-64 select-none">
      {/* Event Focus Card */}
      <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Event
          </span>
          <button
            onClick={onOpenMyEvents}
            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
          >
            Switch <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <h4 className="font-bold text-slate-900 text-sm truncate" title={activeEvent.name}>
          {activeEvent.name}
        </h4>

        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <span className="font-medium truncate">{activeEvent.location || 'Location set'}</span>
        </div>

        {/* Countdown pill */}
        <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 bg-brand-50/70 border border-brand-100 rounded-lg text-xs font-semibold text-brand-700">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
            {countdown.label}
          </span>
          <span className="text-[10px] text-slate-500 font-normal">
            {taskStats.progressPercent}% ready
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Planning Workflow
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id as ActiveTab);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
                  : item.isHighlight
                  ? 'text-royal-800 bg-royal-50/60 hover:bg-royal-100 border border-royal-200/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.isHighlight ? 'text-royal-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.isHighlight
                      ? 'bg-royal-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Quick Callout Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-royal-900 to-slate-900 text-white shadow-md">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-1 rounded-lg bg-white/10 text-brand-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-100">AI Project Manager</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2.5">
            Ask questions, optimize budgets, or plan your next 7-day sprint.
          </p>
          <button
            onClick={() => {
              onSelectTab('assistant');
              onCloseMobile();
            }}
            className="w-full py-1.5 bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
          >
            Ask EventPilot AI
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-72 h-full bg-white shadow-2xl flex flex-col animate-fade-in">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
