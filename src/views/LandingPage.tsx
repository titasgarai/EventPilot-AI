import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Wallet,
  Clock,
  Lightbulb,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Store,
  Bot,
} from 'lucide-react';
import { EventPlan } from '../types';
import { formatCurrency } from '../utils/formatters';

interface LandingPageProps {
  onStartPlanning: () => void;
  onTryDemo: () => void;
  demoEvent: EventPlan;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onTryDemo,
  demoEvent,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden relative">
      {/* Decorative subtle ambient lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[420px] bg-gradient-to-b from-brand-100/40 via-purple-100/25 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 right-10 w-72 h-72 bg-royal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold mb-6 shadow-2xs animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>AI-Powered Event Management & Intelligent Blueprints</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.12]">
          Plan Your Perfect Event <br />
          <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-royal-600 bg-clip-text text-transparent">
            with GenAI Intelligence
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
          From budget to vendors to the big day, EventPilot AI turns your event idea into an organized, personalized plan.
        </p>

        {/* Clear, Unconfusing CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            <span>Start Planning</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-2xl text-sm font-bold shadow-2xs hover:shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Explore Showcase Demo</span>
          </button>
        </div>

        {/* Visual Dashboard Preview */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          <div className="rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/70 to-slate-100/50 border border-slate-300/80 shadow-2xl backdrop-blur-sm">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-left shadow-inner">
              {/* Fake browser bar */}
              <div className="px-4 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[11px] font-mono font-medium text-slate-500">
                  eventpilot.ai/dashboard/{demoEvent.id}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Demo Showcase
                </span>
              </div>

              {/* Inside Dashboard Preview Snapshot */}
              <div className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200/80">
                  <div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-brand-100 text-brand-800 rounded-full uppercase">
                      {demoEvent.type} • {demoEvent.style}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">
                      {demoEvent.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {demoEvent.location} • {demoEvent.guestCount} guests
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 bg-brand-50 border border-brand-200 rounded-xl text-center">
                    <span className="text-xs font-bold text-brand-700">42 Days Remaining</span>
                    <p className="text-[10px] text-slate-500">Target Date: Nov 28, 2026</p>
                  </div>
                </div>

                {/* 3 mini cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Budget</span>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">
                      {formatCurrency(demoEvent.totalBudget, demoEvent.currency)}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">₹2,15,000 remaining</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Progress</span>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">68% Complete</p>
                    <p className="text-[11px] text-slate-500">17 of 25 tasks done</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Vendors</span>
                    <p className="text-lg font-bold text-slate-900 mt-0.5">6 / 9 Booked</p>
                    <p className="text-[11px] text-amber-600 font-semibold">1 urgent followup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Intelligent Event Planning, End-to-End
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base">
            Not just a generic chatbot — EventPilot AI is deeply embedded in every spreadsheet, milestone, vendor contract, and creative detail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Smart Budget Planning */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-5 group-hover:scale-105 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Budget Planning</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Auto-calculates tailored expense distributions across 9 essential categories. Use our one-click <strong className="text-slate-800">"Optimize My Budget"</strong> AI tool to prevent costly overspending.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-brand-600 flex items-center gap-1">
              <span>Automatic percentage tracking & charts</span>
            </div>
          </div>

          {/* Card 2: AI Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-royal-50 border border-royal-100 flex items-center justify-center text-royal-600 mb-5 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Timeline & Milestones</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              From 6 months before to the big day, get prioritized tasks with deadlines. Run <strong className="text-slate-800">"Plan My Next 7 Days"</strong> to generate a prioritized day-by-day action sprint.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-royal-600 flex items-center gap-1">
              <span>Countdown timer & phase tracking</span>
            </div>
          </div>

          {/* Card 3: Personalized Ideas */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Personalized Ideas & Hacks</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bespoke culinary, decor, activity, and budget-saving concepts tailored to your culture, location, and guest count. Favorite ideas and inject them into your plan.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-amber-700 flex items-center gap-1">
              <span>Contextual to your theme & traditions</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/60 rounded-3xl border border-slate-200/80 my-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            From Vision to Execution in Minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Tell us about your event</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Input your event type, date, budget, guest count, and your personal dream vision in our guided multi-step form.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">AI builds your plan</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Gemini analyzes your parameters and constructs a realistic budget, milestone timeline, vendor checklist, and creative ideas.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
            <div className="w-10 h-10 rounded-full bg-royal-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Manage everything in one place</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Track actual expenses, mark tasks completed, manage vendor contacts, and consult your built-in AI event assistant anytime.
            </p>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onStartPlanning}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm"
          >
            <span>Start Planning Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t border-slate-200 text-xs text-slate-500">
        <p>EventPilot AI — Intelligent Event Planning Assistant. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};
