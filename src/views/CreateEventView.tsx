import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  MapPin,
  Wallet,
  Palette,
  MessageSquare,
  Check,
  CheckCircle2,
} from 'lucide-react';
import {
  EventType,
  EventStyle,
  CurrencyCode,
  CURRENCY_MAP,
  EventPlan,
  StagedLoadingStep,
} from '../types';
import { CreateEventInput, generateEventPlanWithAI } from '../services/gemini';
import { StagedGenerationModal } from '../components/common/StagedGenerationModal';
import { useToast } from '../components/common/Toast';

interface CreateEventViewProps {
  onPlanCreated: (plan: EventPlan) => void;
  onCancel: () => void;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({ onPlanCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<StagedLoadingStep | null>(null);
  const { showToast } = useToast();

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('Kolkata, West Bengal');
  const [guestCount, setGuestCount] = useState<number>(150);

  // Budget
  const [totalBudget, setTotalBudget] = useState<number>(500000);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Style
  const [style, setStyle] = useState<EventStyle>('traditional');

  // Preferences
  const [preferences, setPreferences] = useState(
    'I want a traditional Bengali wedding for around 150 guests. I want it to feel elegant with authentic regional cuisine, but strictly stay within my ₹5 lakh budget.'
  );

  const styleOptions: { id: EventStyle; title: string; desc: string; icon: string }[] = [
    { id: 'traditional', title: 'Traditional', desc: 'Rich cultural rituals, regional decor & heritage', icon: '🪔' },
    { id: 'modern', title: 'Modern', desc: 'Sleek aesthetics, contemporary lighting & music', icon: '✨' },
    { id: 'minimal', title: 'Minimal', desc: 'Understated elegance, focused on intimate connections', icon: '🌿' },
    { id: 'luxury', title: 'Luxury', desc: 'Opulent venue, premium catering & bespoke experiences', icon: '💎' },
    { id: 'casual', title: 'Casual', desc: 'Relaxed atmosphere, comfortable seating & easy vibes', icon: '🎉' },
    { id: 'eco-friendly', title: 'Eco-Friendly', desc: 'Zero plastic, sustainable materials & potted greenery', icon: '🌱' },
    { id: 'custom', title: 'Custom', desc: 'Blend styles uniquely crafted by your AI prompt', icon: '🎨' },
  ];

  const presetTemplates = [
    {
      label: 'Traditional Bengali Wedding (₹5L)',
      type: 'wedding' as EventType,
      name: "Rohit & Meera's Wedding",
      guests: 150,
      budget: 500000,
      style: 'traditional' as EventStyle,
      pref: 'Traditional Bengali wedding with Gaye Holud and authentic Bengali food (Bhetki fish, Kosha Mangsho) for 150 guests in Kolkata within ₹5 Lakhs.',
    },
    {
      label: '30th Milestone Birthday Bash',
      type: 'birthday' as EventType,
      name: "Aryan's 30th Rooftop Soirée",
      guests: 60,
      budget: 120000,
      style: 'modern' as EventStyle,
      pref: 'Chic rooftop evening celebration with live acoustic music, craft cocktails, gourmet appetizers, and Polaroid photo memories.',
    },
    {
      label: 'Community Tech Symposium',
      type: 'community' as EventType,
      name: 'AI Developers Meetup & Demo Day',
      guests: 200,
      budget: 250000,
      style: 'modern' as EventStyle,
      pref: 'Community tech symposium with keynote auditorium stage, high-speed networking, swag bags, and buffet lunch for 200 builders.',
    },
  ];

  const handleApplyPreset = (t: typeof presetTemplates[0]) => {
    setType(t.type);
    setName(t.name);
    setGuestCount(t.guests);
    setTotalBudget(t.budget);
    setStyle(t.style);
    setPreferences(t.pref);
    showToast(`Applied preset: ${t.label}`, 'info');
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!name.trim()) {
        showToast('Please enter an event name', 'error');
        return;
      }
      if (!date) {
        showToast('Please pick an event date', 'error');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    if (!name.trim()) {
      showToast('Please specify an event name', 'error');
      setCurrentStep(1);
      return;
    }

    setIsGenerating(true);

    const input: CreateEventInput = {
      name,
      type,
      date,
      location,
      guestCount,
      totalBudget,
      currency,
      style,
      preferences,
    };

    try {
      const generated = await generateEventPlanWithAI(input, (step) => {
        setLoadingStep(step);
      });

      const newPlan: EventPlan = {
        id: `event-${Date.now()}`,
        name,
        type,
        date,
        location,
        guestCount,
        totalBudget,
        currency,
        style,
        preferences,
        eventSummary: generated.eventSummary,
        budgetPlan: generated.budgetPlan,
        expenses: [],
        timeline: generated.timeline,
        vendors: generated.vendors,
        personalizedIdeas: generated.personalizedIdeas,
        insights: generated.insights,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      showToast('AI Event Plan successfully created!', 'success');
      onPlanCreated(newPlan);
    } catch (err) {
      console.error(err);
      showToast('Error generating plan, but created fallback plan.', 'info');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      {/* Staged Generation Modal Overlay */}
      <StagedGenerationModal
        isOpen={isGenerating}
        currentStep={loadingStep}
        eventName={name || 'Your Event'}
      />

      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>GenAI Event Planner</span>
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Create New Event</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Share your event parameters and let Google Gemini architect your budget, timeline, vendors, and ideas.
        </p>
      </div>

      {/* Quick Preset Buttons */}
      <div className="mb-8 p-3.5 bg-slate-100/70 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-brand-600" /> Presets:
        </span>
        {presetTemplates.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleApplyPreset(p)}
            className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-700 rounded-lg border border-slate-200 transition-all shadow-xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Step Progress Pills */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Basic Info' },
            { step: 2, label: 'Budget' },
            { step: 3, label: 'Aesthetic' },
            { step: 4, label: 'Vision' },
          ].map((s) => {
            const isDone = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} className="flex-1 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-4 ring-brand-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : s.step}
                </div>
                <span
                  className={`text-[11px] font-semibold mt-1.5 ${
                    isCurrent ? 'text-brand-900 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 1 — Basic Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">Who, what, when, and where.</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ananya & Arjun's Wedding"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="community">Community Event</option>
                  <option value="custom">Custom Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Location / City
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Kolkata, West Bengal"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Number of Guests
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={5}
                    max={5000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 2 — Total Budget</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Gemini will intelligently split this budget across 9 essential categories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Total Budget Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    step={5000}
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="flex gap-2 mt-2">
                  {[200000, 500000, 1000000, 2000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTotalBudget(amt)}
                      className="px-2 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                    >
                      {CURRENCY_MAP[currency]?.symbol || '₹'}
                      {(amt / 100000).toFixed(amt % 100000 === 0 ? 0 : 1)} Lakh
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 cursor-pointer"
                >
                  {Object.entries(CURRENCY_MAP).map(([code, c]) => (
                    <option key={code} value={code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-800">Budget Per Guest Ratio:</span>{' '}
              {guestCount > 0 ? (
                <span className="font-semibold text-brand-700">
                  {CURRENCY_MAP[currency]?.symbol}
                  {Math.round(totalBudget / guestCount).toLocaleString()} per guest
                </span>
              ) : (
                'N/A'
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Style */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 3 — Aesthetic & Style</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the design language for your decor, atmosphere, and supplier choices.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {styleOptions.map((opt) => {
                const isSelected = style === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900">{opt.title}</h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Preferences & AI Prompt */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 4 — Vision & AI Instructions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tell EventPilot AI anything specific: traditions, food requests, entertainment, or constraints.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Tell AI what you have in mind...
              </label>
              <textarea
                rows={5}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="Example: I want a traditional Bengali wedding for around 150 guests. I want it to feel elegant with authentic regional cuisine, but strictly stay within my ₹5 lakh budget."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed transition-all"
              />
            </div>

            {/* Summary preview badge */}
            <div className="p-4 bg-royal-50/50 rounded-2xl border border-royal-100 text-xs text-royal-950 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span><strong>Event:</strong> {name || 'Untitled Event'}</span>
              <span><strong>Target:</strong> {date}</span>
              <span><strong>Guests:</strong> {guestCount}</span>
              <span><strong>Budget:</strong> {CURRENCY_MAP[currency]?.symbol}{totalBudget.toLocaleString()}</span>
              <span><strong>Style:</strong> {style}</span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ml-auto"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              className="px-7 py-3 bg-gradient-to-r from-brand-600 to-royal-600 hover:from-brand-500 hover:to-royal-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 active:scale-95 ml-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate My Event Plan</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

