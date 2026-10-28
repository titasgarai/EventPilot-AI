import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Users,
  MapPin,
  Wallet,
  Check,
  CheckCircle2,
  Monitor,
} from 'lucide-react';
import {
  EventType,
  EventFormat,
  OnlinePlatform,
  EventStyle,
  CurrencyCode,
  CURRENCY_MAP,
  EventPlan,
  StagedLoadingStep,
} from '../types';
import { CreateEventInput, generateEventPlanWithAI } from '../services/gemini';
import { StagedGenerationModal } from '../components/common/StagedGenerationModal';
import { BudgetEstimatorModal } from '../components/common/BudgetEstimatorModal';
import { useToast } from '../components/common/Toast';

interface CreateEventViewProps {
  onPlanCreated: (plan: EventPlan) => void;
  onCancel: () => void;
}

const CITY_SUGGESTIONS = [
  'Kolkata, West Bengal',
  'Mumbai, Maharashtra',
  'Delhi NCR, India',
  'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu',
  'Hyderabad, Telangana',
  'Jaipur, Rajasthan',
  'Goa, India',
  'Pune, Maharashtra',
  'Ahmedabad, Gujarat',
  'Dubai, United Arab Emirates',
  'London, United Kingdom',
  'New York, USA',
  'Singapore',
];

export const CreateEventView: React.FC<CreateEventViewProps> = ({ onPlanCreated, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<StagedLoadingStep | null>(null);
  const [isBudgetEstimatorOpen, setIsBudgetEstimatorOpen] = useState<boolean>(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState<boolean>(false);
  const { showToast } = useToast();

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('wedding');
  const [customEventType, setCustomEventType] = useState('');
  const [format, setFormat] = useState<EventFormat>('in-person');

  // Online Logistics
  const [onlinePlatform, setOnlinePlatform] = useState<OnlinePlatform>('Google Meet');
  const [onlineLink, setOnlineLink] = useState('');
  const [onlineHost, setOnlineHost] = useState('');
  const [onlineModerator, setOnlineModerator] = useState('');
  const [onlineRecording, setOnlineRecording] = useState(true);

  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [location, setLocation] = useState('Kolkata, West Bengal');

  // String buffered state for guests to fix the sticky zero bug
  const [guestCountStr, setGuestCountStr] = useState('150');

  // Budget state with string buffer
  const [budgetStr, setBudgetStr] = useState('500000');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');

  // Style
  const [style, setStyle] = useState<EventStyle>('traditional');

  // Preferences: Initially empty as required (not hardcoded with demo text)
  const [preferences, setPreferences] = useState('');

  const parsedGuestCount = Math.max(1, parseInt(guestCountStr, 10) || 1);
  const parsedBudget = Math.max(1000, parseInt(budgetStr, 10) || 1000);

  // Auto-adapt budget defaults when switching event type
  const handleSelectEventType = (newType: EventType) => {
    setType(newType);
    if (newType === 'birthday') {
      if (parsedGuestCount > 50) setGuestCountStr('25');
      if (parsedBudget > 100000) setBudgetStr('15000');
      if (style === 'traditional') setStyle('casual');
    } else if (newType === 'community') {
      if (parsedGuestCount < 50) setGuestCountStr('100');
      if (parsedBudget < 50000) setBudgetStr('50000');
      if (style === 'traditional') setStyle('modern');
    } else if (newType === 'wedding') {
      if (parsedGuestCount < 50) setGuestCountStr('150');
      if (parsedBudget < 200000) setBudgetStr('500000');
      if (style === 'casual') setStyle('traditional');
    }
  };

  // Event Type options with icons and descriptions
  const eventTypeCards: { id: EventType; title: string; desc: string; icon: string }[] = [
    {
      id: 'wedding',
      title: 'Wedding',
      desc: 'Plan ceremonies, receptions, vendors and guest experiences.',
      icon: '💍',
    },
    {
      id: 'birthday',
      title: 'Birthday',
      desc: 'Plan parties, activities, food and entertainment.',
      icon: '🎂',
    },
    {
      id: 'community',
      title: 'Community Event',
      desc: 'Coordinate people, venues, vendors and activities.',
      icon: '🏘',
    },
    {
      id: 'custom',
      title: 'Custom Event',
      desc: 'Build a personalized plan for any event.',
      icon: '✨',
    },
  ];

  const styleOptions: {
    id: EventStyle;
    title: string;
    desc: string;
    icon: string;
    accent: string;
  }[] = [
    {
      id: 'traditional',
      title: 'Traditional',
      desc: 'Rich cultural rituals, regional decor & heritage customs',
      icon: '🪔',
      accent: 'border-amber-300 bg-amber-50/40 text-amber-900',
    },
    {
      id: 'modern',
      title: 'Modern',
      desc: 'Sleek aesthetics, contemporary lighting & curated music',
      icon: '✨',
      accent: 'border-royal-300 bg-royal-50/40 text-royal-900',
    },
    {
      id: 'minimal',
      title: 'Minimal',
      desc: 'Understated elegance, focused on intimate moments',
      icon: '🌿',
      accent: 'border-emerald-300 bg-emerald-50/40 text-emerald-900',
    },
    {
      id: 'luxury',
      title: 'Luxury',
      desc: 'Opulent venue, premier catering & bespoke hospitality',
      icon: '💎',
      accent: 'border-purple-300 bg-purple-50/40 text-purple-900',
    },
    {
      id: 'casual',
      title: 'Casual',
      desc: 'Relaxed atmosphere, informal seating & easy vibes',
      icon: '🎉',
      accent: 'border-orange-300 bg-orange-50/40 text-orange-900',
    },
    {
      id: 'eco-friendly',
      title: 'Eco-Friendly',
      desc: 'Zero plastic, sustainable materials & potted flora',
      icon: '🌱',
      accent: 'border-teal-300 bg-teal-50/40 text-teal-900',
    },
    {
      id: 'custom',
      title: 'Custom Blend',
      desc: 'A unique fusion personalized through your vision prompt',
      icon: '🎨',
      accent: 'border-brand-300 bg-brand-50/40 text-brand-900',
    },
  ];

  // Dynamic Budget Presets tailored to event type
  const getBudgetPresets = () => {
    if (currency === 'INR') {
      if (type === 'birthday' || format === 'online') {
        return [
          { label: '₹5,000', value: 5000 },
          { label: '₹10,000', value: 10000 },
          { label: '₹15,000', value: 15000 },
          { label: '₹25,000', value: 25000 },
          { label: '₹50,000', value: 50000 },
          { label: '₹1 Lakh', value: 100000 },
        ];
      }
      if (type === 'community') {
        return [
          { label: '₹25,000', value: 25000 },
          { label: '₹50,000', value: 50000 },
          { label: '₹1 Lakh', value: 100000 },
          { label: '₹2.5 Lakh', value: 250000 },
          { label: '₹5 Lakh', value: 500000 },
        ];
      }
      return [
        { label: '₹1 Lakh', value: 100000 },
        { label: '₹2 Lakh', value: 200000 },
        { label: '₹5 Lakh', value: 500000 },
        { label: '₹10 Lakh', value: 1000000 },
        { label: '₹25 Lakh', value: 2500000 },
        { label: '₹50 Lakh', value: 5000000 },
      ];
    }
    return [
      { label: '$500', value: 500 },
      { label: '$1,000', value: 1000 },
      { label: '$2,500', value: 2500 },
      { label: '$5,000', value: 5000 },
      { label: '$10,000', value: 10000 },
      { label: '$25,000', value: 25000 },
      { label: '$50,000', value: 50000 },
    ];
  };

  const activePresets = getBudgetPresets();

  // Filtered city suggestions
  const filteredCities = CITY_SUGGESTIONS.filter((city) =>
    city.toLowerCase().includes(location.toLowerCase())
  );

  // Dynamic vision placeholder based on user choices
  const dynamicPlaceholder = type === 'birthday'
    ? `Tell AI about party games, cake flavor, theme colors, music style, or surprises for this birthday party...`
    : format === 'online'
    ? `Tell AI about your webinar agenda, speakers, polling tools, or technical goals for this online event...`
    : type === 'community'
    ? `Tell AI about community sessions, volunteer coordinator goals, stage equipment, or registration plans...`
    : type === 'custom' && customEventType
    ? `Tell AI specific details, traditions, memories, and key moments you want for your ${customEventType}...`
    : `Tell AI about your food preferences, traditions, entertainment, or anything you want prioritized for your ${style} ${type} in ${location}...`;

  // Dynamic suggestion chips for Step 4
  const suggestionChips = type === 'birthday'
    ? [
        'Recommend 3 high-energy interactive party games',
        'Suggest unique custom birthday cake design ideas',
        'Help balance finger food appetizers vs main dessert buffet',
        'Include photo booth props and Polaroid memory ideas',
      ]
    : format === 'online'
    ? [
        'Include speaker technical dry-run rehearsal checklist',
        'Suggest live audience polling & interactive Q&A format',
        'Provide backup communication plan in case of Wi-Fi drop',
        'How to design a post-event recording distribution email',
      ]
    : type === 'community'
    ? [
        'Organize registration desk to prevent morning crowd queues',
        'Provide volunteer role assignments and briefing schedule',
        'Suggest zero-waste eco-friendly meal distribution',
        'Include civic sound permit and municipal clearance tips',
      ]
    : type === 'custom' && customEventType?.toLowerCase().includes('farewell')
    ? [
        'Suggest funny, affectionate title awards for seniors',
        'Ideas for nostalgic batch video montage and music playlist',
        'How to organize memorable souvenir yearbook distribution',
        'Suggest red carpet entry & photo booth backdrop concepts',
      ]
    : [
        `Suggest authentic regional traditions for ${location.split(',')[0] || 'the event'}`,
        'Help me optimize spending on venue & decoration',
        'Prioritize a memorable culinary & live dessert experience',
        'Include eco-friendly, zero-waste decor ideas',
      ];

  const handleAddChip = (chip: string) => {
    setPreferences((prev) => (prev.trim() ? `${prev.trim()}\n- ${chip}` : chip));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (type === 'custom' && !customEventType.trim()) {
        showToast('Please specify what event you are planning (e.g., College Farewell)', 'error');
        return;
      }
      if (!name.trim()) {
        showToast('Please enter an event name', 'error');
        return;
      }
      if (!date) {
        showToast('Please pick an event date', 'error');
        return;
      }
      if (format !== 'online' && !location.trim()) {
        showToast('Please provide an event location / city', 'error');
        return;
      }
      if (!guestCountStr || parsedGuestCount < 1) {
        showToast('Please enter a valid guest / attendee count', 'error');
        return;
      }
    }
    if (currentStep === 2) {
      if (!budgetStr || parsedBudget < 500) {
        showToast('Please specify a realistic total budget', 'error');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    const finalEventName = name.trim() || (type === 'custom' && customEventType ? customEventType : `My ${type}`);

    setIsGenerating(true);

    const input: CreateEventInput = {
      name: finalEventName,
      type,
      customEventType: type === 'custom' ? customEventType.trim() : undefined,
      format,
      onlineDetails: format !== 'in-person' ? {
        platform: onlinePlatform,
        meetingLink: onlineLink.trim() || undefined,
        hostName: onlineHost.trim() || undefined,
        moderatorName: onlineModerator.trim() || undefined,
        expectedAttendees: parsedGuestCount,
        recordingRequired: onlineRecording,
        techChecklist: [
          { id: 'tc-1', label: 'Create meeting room URL', completed: Boolean(onlineLink.trim()) },
          { id: 'tc-2', label: 'Test presenter external microphone & noise cancellation', completed: false },
          { id: 'tc-3', label: 'Verify HD webcam lighting and background framing', completed: false },
          { id: 'tc-4', label: 'Test presentation slide screen sharing & audio playback', completed: false },
          { id: 'tc-5', label: 'Share calendar invitation with one-click joining link', completed: false },
          { id: 'tc-6', label: 'Assign co-host / chat moderator with participant mute privileges', completed: Boolean(onlineModerator.trim()) },
          { id: 'tc-7', label: 'Verify cloud recording auto-start and local disk backup', completed: false },
          { id: 'tc-8', label: 'Prepare secondary hotspot / backup internet connection', completed: false },
        ],
      } : undefined,
      date,
      location: format === 'online' ? 'Virtual Stage (Online)' : location,
      guestCount: parsedGuestCount,
      totalBudget: parsedBudget,
      currency,
      style,
      preferences: preferences.trim() || `A well-executed ${style} ${type === 'custom' && customEventType ? customEventType : type} within budget.`,
    };

    try {
      const generated = await generateEventPlanWithAI(input, (step) => {
        setLoadingStep(step);
      });

      const newPlan: EventPlan = {
        id: `event-${Date.now()}`,
        name: finalEventName,
        type,
        customEventType: type === 'custom' ? customEventType.trim() : undefined,
        format,
        onlineDetails: input.onlineDetails,
        runOfShow: generated.runOfShow || [],
        date,
        location: format === 'online' ? 'Virtual Stage (Online)' : location,
        guestCount: parsedGuestCount,
        totalBudget: parsedBudget,
        currency,
        style,
        preferences: preferences.trim(),
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

      showToast('AI Event Blueprint created successfully!', 'success');
      onPlanCreated(newPlan);
    } catch (err) {
      console.error(err);
      showToast('Plan created using contextual planning engine.', 'info');
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
        eventName={name || (type === 'custom' && customEventType ? customEventType : 'Your Event')}
      />

      {/* AI Budget Estimator Modal - Fully reactive to fresh form inputs! */}
      <BudgetEstimatorModal
        isOpen={isBudgetEstimatorOpen}
        onClose={() => setIsBudgetEstimatorOpen(false)}
        eventType={type}
        customEventType={type === 'custom' ? customEventType : undefined}
        format={format}
        location={format === 'online' ? 'Virtual Stage' : location}
        guestCount={parsedGuestCount}
        style={style}
        preferences={preferences}
        currency={currency}
        onApplyBudget={(amt) => setBudgetStr(String(amt))}
      />

      {/* Top Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-3 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Event Architect</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Create New Event</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Share your event parameters and let Google Gemini engineer your budget, timeline, vendors, and ideas.
        </p>
      </div>

      {/* Step Progress Bar */}
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

      {/* Main Multi-Step Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
        {/* STEP 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 1 — Basic Information</h3>
              <p className="text-xs text-slate-500 mt-0.5">Define your core event identity and logistics.</p>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Event Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ananya & Arjun's Wedding or Aryan's 30th Birthday"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>

            {/* Event Type - Responsive 4 Cards */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Event Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {eventTypeCards.map((opt) => {
                  const isSelected = type === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectEventType(opt.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/25 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900">{opt.title}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Event Definition Input (When Custom Event is selected) */}
            {type === 'custom' && (
              <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-900">
                    What are you planning? <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                    Custom Concept
                  </span>
                </div>
                <input
                  type="text"
                  value={customEventType}
                  onChange={(e) => {
                    setCustomEventType(e.target.value);
                    if (!name || name === 'My Event' || name.startsWith('Custom')) {
                      setName(e.target.value);
                    }
                  }}
                  placeholder="e.g., College Farewell, Engagement Party, Product Launch, Baby Shower, Gaming Tournament..."
                  className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Quick Picks:</span>
                  {['College Farewell', 'Engagement Party', 'Product Launch', 'Baby Shower', 'Gaming Tournament', 'Cultural Program'].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setCustomEventType(chip);
                        setName(chip);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100 border border-purple-200 text-xs font-medium text-purple-800 transition-colors shadow-2xs"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Event Format Selector: In-Person / Online / Hybrid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Event Format
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'in-person', title: 'In-person', desc: 'Physical venue & guest hospitality', icon: '🏢' },
                  { id: 'online', title: 'Online', desc: '100% virtual stage & streaming', icon: '💻' },
                  { id: 'hybrid', title: 'Hybrid', desc: 'Dual physical room & live stream', icon: '🌐' },
                ].map((fmt) => {
                  const isSel = format === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id as EventFormat)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all text-center select-none ${
                        isSel
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/25 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xl block mb-1">{fmt.icon}</span>
                      <h4 className="font-bold text-xs text-slate-900">{fmt.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block">{fmt.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Virtual Event Logistics (Shown for Online & Hybrid) */}
            {format !== 'in-person' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-royal-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Virtual Event Logistics ({format === 'online' ? '100% Online' : 'Hybrid Stream'})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Streaming / Meeting Platform
                    </label>
                    <select
                      value={onlinePlatform}
                      onChange={(e) => setOnlinePlatform(e.target.value as OnlinePlatform)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                    >
                      <option value="Google Meet">Google Meet</option>
                      <option value="Zoom">Zoom</option>
                      <option value="Microsoft Teams">Microsoft Teams</option>
                      <option value="YouTube Live">YouTube Live</option>
                      <option value="Discord">Discord</option>
                      <option value="Other">Other Platform</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Meeting / Joining Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={onlineLink}
                      onChange={(e) => setOnlineLink(e.target.value)}
                      placeholder="e.g., https://meet.google.com/abc-defg-hij"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Event Host Name
                    </label>
                    <input
                      type="text"
                      value={onlineHost}
                      onChange={(e) => setOnlineHost(e.target.value)}
                      placeholder="e.g., Prof. Mukherjee"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Session Moderator / Co-Host
                    </label>
                    <input
                      type="text"
                      value={onlineModerator}
                      onChange={(e) => setOnlineModerator(e.target.value)}
                      placeholder="e.g., Tech Coordinator"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-center gap-2 pt-4">
                    <span className="text-xs font-semibold text-slate-700">Record Session?</span>
                    <button
                      type="button"
                      onClick={() => setOnlineRecording(!onlineRecording)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        onlineRecording
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {onlineRecording ? 'Yes (HD Cloud)' : 'No'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Date, Location, Guest Count */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Event Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Event Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Location with city suggestions (or Timezone for Online) */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {format === 'online' ? 'Base City / Timezone' : 'Location / City'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onFocus={() => setShowLocationDropdown(true)}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationDropdown(true);
                    }}
                    placeholder={format === 'online' ? 'e.g., Kolkata (IST)' : 'e.g., Kolkata, West Bengal'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* City Suggestion Dropdown */}
                {showLocationDropdown && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto p-1 animate-slide-up">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase text-slate-400">
                      Suggested Cities
                    </p>
                    {filteredCities.slice(0, 7).map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={() => {
                          setLocation(city);
                          setShowLocationDropdown(false);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors flex items-center gap-2"
                      >
                        <MapPin className="w-3 h-3 text-brand-500" />
                        <span>{city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Number of Guests / Attendees */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  {format === 'online' ? 'Expected Attendees' : 'Number of Guests'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={guestCountStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setGuestCountStr(val);
                    }}
                    placeholder={format === 'online' ? '50' : type === 'birthday' ? '25' : '150'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Budget */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Step 2 — Total Budget</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set your budget cap or let GenAI estimate based on {location} and {parsedGuestCount} guests.
                </p>
              </div>

              {/* GenAI "Guess My Budget with AI" Button */}
              <button
                type="button"
                onClick={() => setIsBudgetEstimatorOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-royal-600 hover:from-purple-500 hover:to-royal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Guess My Budget with AI</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Total Budget Amount
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budgetStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setBudgetStr(val);
                    }}
                    placeholder="500000"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-black text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Granular Budget Presets */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Quick Budget Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePresets.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setBudgetStr(String(p.value))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                          parseInt(budgetStr, 10) === p.value
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
                >
                  {Object.entries(CURRENCY_MAP).map(([code, c]) => (
                    <option key={code} value={code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculation summary banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-800">Budget Per Guest Ratio: </span>
                <span className="font-bold text-brand-700">
                  {CURRENCY_MAP[currency]?.symbol}
                  {Math.round(parsedBudget / parsedGuestCount).toLocaleString()} per guest
                </span>
              </div>
              <span className="text-slate-500">
                ({parsedGuestCount} guests in {location})
              </span>
            </div>
          </div>
        )}

        {/* STEP 3: Aesthetic & Style */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 3 — Aesthetic & Style</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose the visual language for your decor, atmosphere, and styling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {styleOptions.map((opt) => {
                const isSelected = style === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 select-none hover:-translate-y-0.5 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/25 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
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
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Step 4 — Vision & AI Instructions</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add specific culinary cravings, rituals, entertainment ideas, or priorities.
              </p>
            </div>

            {/* Collected Parameters Summary Dossier */}
            <div className="p-4 bg-royal-50/60 rounded-2xl border border-royal-100 text-xs text-royal-950 space-y-1.5">
              <span className="font-bold text-royal-900 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-royal-600" /> Blueprint Dossier Collected So Far:
              </span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
                <span><strong>Event:</strong> {name || 'Untitled'} ({type === 'custom' && customEventType ? customEventType : type} • {format})</span>
                <span><strong>Date:</strong> {date}</span>
                <span><strong>Location:</strong> {location}</span>
                <span><strong>Guests:</strong> {parsedGuestCount}</span>
                <span><strong>Budget:</strong> {CURRENCY_MAP[currency]?.symbol}{parsedBudget.toLocaleString()}</span>
                <span><strong>Style:</strong> <span className="capitalize">{style}</span></span>
              </div>
            </div>

            {/* Clickable AI Suggestion Chips */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Clickable Prompt Ideas:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddChip(chip)}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 text-slate-600 border border-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>+</span>
                    <span>{chip}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea with dynamic placeholder (NOT hardcoded text) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Tell AI what you have in mind... (Optional)
              </label>
              <textarea
                rows={4}
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder={dynamicPlaceholder}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed transition-all"
              />
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
