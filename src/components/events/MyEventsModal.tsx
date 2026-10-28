import React from 'react';
import { Modal } from '../common/Modal';
import { EventPlan } from '../../types';
import { formatCurrency, formatDate, getDaysRemaining, calculateTaskStats } from '../../utils/formatters';
import {
  Calendar,
  Copy,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  MapPin,
  Users,
} from 'lucide-react';

interface MyEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventPlan[];
  activeEventId: string;
  onSelectEvent: (id: string) => void;
  onDuplicateEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenCreateNew: () => void;
}

export const MyEventsModal: React.FC<MyEventsModalProps> = ({
  isOpen,
  onClose,
  events,
  activeEventId,
  onSelectEvent,
  onDuplicateEvent,
  onDeleteEvent,
  onOpenCreateNew,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="My Planned Events"
      subtitle="Switch between events, create duplicates, or launch a new plan"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Top button to create new */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500">
            {events.length} {events.length === 1 ? 'event' : 'events'} managed in browser storage
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenCreateNew();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Event</span>
          </button>
        </div>

        {/* List of event cards */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {events.map((evt) => {
            const isActive = evt.id === activeEventId;
            const taskStats = calculateTaskStats(evt);
            const countdown = getDaysRemaining(evt.date);

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isActive
                    ? 'border-brand-500 bg-brand-50/20 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-slate-900">{evt.name}</h4>
                      {evt.isDemo && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Demo Event
                        </span>
                      )}
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="capitalize font-semibold text-slate-700">
                        {evt.type} • {evt.style}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {evt.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {evt.guestCount} guests
                      </span>
                      <span className="font-semibold text-brand-700">
                        {formatCurrency(evt.totalBudget, evt.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Countdown pill */}
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {countdown.label}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{formatDate(evt.date)}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Planning Progress</span>
                      <span className="font-semibold text-slate-700">
                        {taskStats.completed} / {taskStats.total} tasks ({taskStats.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${taskStats.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isActive && (
                      <button
                        onClick={() => {
                          onSelectEvent(evt.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Open
                      </button>
                    )}
                    <button
                      onClick={() => onDuplicateEvent(evt.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicate Event"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {events.length > 1 && (
                      <button
                        onClick={() => onDeleteEvent(evt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

