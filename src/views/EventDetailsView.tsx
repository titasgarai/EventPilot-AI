import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  Palette,
  FileText,
  Sparkles,
  Save,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { EventPlan, EventStyle, EventType } from '../types';
import { formatCurrency, formatDate, getDaysRemaining } from '../utils/formatters';
import { useToast } from '../components/common/Toast';

interface EventDetailsViewProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({ event, onUpdateEvent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { showToast } = useToast();

  const [name, setName] = useState(event.name);
  const [type, setType] = useState<EventType>(event.type);
  const [date, setDate] = useState(event.date);
  const [location, setLocation] = useState(event.location);
  const [guestCount, setGuestCount] = useState(event.guestCount);
  const [totalBudget, setTotalBudget] = useState(event.totalBudget);
  const [style, setStyle] = useState<EventStyle>(event.style);
  const [preferences, setPreferences] = useState(event.preferences);

  const countdown = getDaysRemaining(event.date);

  const handleSave = () => {
    const updated: EventPlan = {
      ...event,
      name,
      type,
      date,
      location,
      guestCount,
      totalBudget,
      style,
      preferences,
      updatedAt: new Date().toISOString(),
    };
    onUpdateEvent(updated);
    setIsEditing(false);
    showToast('Event details successfully updated!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Configuration Dossier
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Event Overview & Parameters
          </h2>
          <p className="text-xs text-slate-500">
            Created on {formatDate(event.createdAt)} • Last updated {formatDate(event.updatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Banner summary */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-royal-50 via-slate-50 to-brand-50/50 border border-royal-100/60">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              AI Blueprint Narrative
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {event.eventSummary}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Event Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            ) : (
              <p className="text-base font-bold text-slate-900">{event.name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Event Type
            </label>
            {isEditing ? (
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
              >
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="community">Community Event</option>
                <option value="custom">Custom</option>
              </select>
            ) : (
              <p className="text-sm font-semibold text-slate-800 capitalize">{event.type}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Target Date & Countdown
            </label>
            {isEditing ? (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(event.date)} ({countdown.label})
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-800">{event.location}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Guest Count
            </label>
            {isEditing ? (
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-800">{event.guestCount} guests</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Total Budget
            </label>
            {isEditing ? (
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900"
              />
            ) : (
              <p className="text-sm font-bold text-brand-700">
                {formatCurrency(event.totalBudget, event.currency)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Style & Theme
            </label>
            {isEditing ? (
              <input
                type="text"
                value={style}
                onChange={(e) => setStyle(e.target.value as EventStyle)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 capitalize"
              />
            ) : (
              <p className="text-sm font-semibold text-slate-800 capitalize">{event.style}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            User Specific Preferences & AI Instructions
          </label>
          {isEditing ? (
            <textarea
              rows={4}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
            />
          ) : (
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              {event.preferences || 'No special preferences entered.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

