import React from 'react';
import {
  Sparkles,
  Calendar,
  Plus,
  Layers,
  Key,
  Menu,
  X,
  ChevronDown,
  RotateCcw,
  ShieldCheck,
  User,
  LogOut,
} from 'lucide-react';
import { EventPlan, UserProfile } from '../../types';
import { isAiConfigured } from '../../services/gemini';

interface NavbarProps {
  activeEvent: EventPlan;
  events: EventPlan[];
  userProfile: UserProfile | null;
  onSelectEvent: (id: string) => void;
  onOpenMyEvents: () => void;
  onOpenCreateEvent: () => void;
  onOpenApiKeyModal: () => void;
  onResetDemo: () => void;
  onToggleMobileSidebar: () => void;
  isMobileSidebarOpen: boolean;
  onNavigateHome: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeEvent,
  events,
  userProfile,
  onSelectEvent,
  onOpenMyEvents,
  onOpenCreateEvent,
  onOpenApiKeyModal,
  onResetDemo,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
  onNavigateHome,
  onLogout,
}) => {
  const hasAi = isAiConfigured();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 text-left group transition-transform focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-royal-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                EventPilot<span className="text-brand-600">.AI</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">
                AI Event Manager
              </span>
            </div>
          </button>
        </div>

        {/* Center: Event Selector */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="relative group">
            <select
              value={activeEvent.id}
              onChange={(e) => onSelectEvent(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-semibold pl-8 pr-8 py-2 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer transition-all max-w-[240px] truncate"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} {evt.isDemo ? '(Demo)' : ''}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-brand-600 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={onOpenMyEvents}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>My Events ({events.length})</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Status / Demo Badge */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              hasAi
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
            title="Configure Gemini API or switch modes"
          >
            {hasAi ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Gemini Live</span>
                <span className="sm:hidden">AI</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Mode</span>
              </>
            )}
          </button>

          {/* Reset Demo button */}
          <button
            onClick={onResetDemo}
            className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Restore sample demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* Create Event CTA */}
          <button
            onClick={onOpenCreateEvent}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-600/30 hover:shadow-md transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Plan New Event</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* User Profile Chip & Logout */}
          {userProfile && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <div
                className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-700"
                title={`${userProfile.name} (${userProfile.email})`}
              >
                {userProfile.avatar ? (
                  <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
                ) : (
                  userProfile.name.charAt(0).toUpperCase()
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out / Switch Profile"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
