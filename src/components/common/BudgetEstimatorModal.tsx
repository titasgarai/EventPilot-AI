import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Sparkles, Loader2, CheckCircle2, TrendingUp, AlertCircle, MapPin, Users, HelpCircle, Monitor, RefreshCw } from 'lucide-react';
import { BudgetEstimateResult, CurrencyCode, EventFormat, EventStyle, EventType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { estimateBudgetWithAI } from '../../services/gemini';
import { useToast } from './Toast';

interface BudgetEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: EventType;
  customEventType?: string;
  format?: EventFormat;
  location: string;
  guestCount: number;
  style: EventStyle;
  preferences?: string;
  currency: CurrencyCode;
  onApplyBudget: (amount: number) => void;
}

export const BudgetEstimatorModal: React.FC<BudgetEstimatorModalProps> = ({
  isOpen,
  onClose,
  eventType,
  customEventType,
  format = 'in-person',
  location,
  guestCount,
  style,
  preferences,
  currency,
  onApplyBudget,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BudgetEstimateResult | null>(null);
  const { showToast } = useToast();

  // Current inputs fingerprint to guarantee cache invalidation
  const currentInputsKey = `${eventType}|${customEventType || ''}|${format}|${location}|${guestCount}|${style}|${currency}`;
  const lastInputsKeyRef = useRef<string>('');

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const data = await estimateBudgetWithAI({
        eventType,
        customEventType,
        format,
        location,
        guestCount,
        style,
        preferences,
        currency,
      });
      setResult(data);
      lastInputsKeyRef.current = currentInputsKey;
    } catch (err) {
      console.error(err);
      showToast('Error estimating budget', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Automatically recalculate whenever modal opens if inputs have changed!
  useEffect(() => {
    if (isOpen) {
      if (lastInputsKeyRef.current !== currentInputsKey || !result) {
        setResult(null); // Invalidate old estimate immediately!
        handleEstimate();
      }
    }
  }, [isOpen, currentInputsKey]);

  const handleApply = () => {
    if (result) {
      onApplyBudget(result.suggestedTarget);
      showToast(`Applied AI target budget: ${formatCurrency(result.suggestedTarget, currency)}`, 'success');
      onClose();
    }
  };

  const displayName = eventType === 'custom' && customEventType ? customEventType : eventType;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GenAI Budget Estimator"
      subtitle={`Location & guest-count aware cost model for ${displayName}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Transparency Banner: Shows exact inputs used for the calculation */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Estimate Based On Current Form Inputs:
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              Synced to Latest
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-800 font-medium">
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Event Type</span>
              <span className="capitalize font-bold text-slate-900 truncate block">{displayName}</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Format</span>
              <span className="capitalize font-bold text-slate-900 block">{format}</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Headcount</span>
              <span className="font-bold text-slate-900 block">{guestCount} attendees</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Location</span>
              <span className="font-bold text-slate-900 truncate block">{format === 'online' ? 'Virtual Stage' : location}</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Style</span>
              <span className="capitalize font-bold text-slate-900 block">{style}</span>
            </div>
            <div className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Currency</span>
              <span className="font-bold text-slate-900 block">{currency}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Calculating benchmarks for {displayName} ({guestCount} {format === 'online' ? 'attendees' : 'guests'})...
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Applying tailored financial model for {displayName} in {location}.
              </p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-5 animate-fade-in">
            {/* Top Cards: Range & Target */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                  Recommended Target Budget
                </span>
                <p className="text-2xl font-black text-brand-900 mt-0.5">
                  {formatCurrency(result.suggestedTarget, currency)}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  ~{formatCurrency(result.costPerGuest, currency)} per {format === 'online' ? 'attendee' : 'guest'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Estimated Realistic Range
                </span>
                <p className="text-xl font-extrabold text-slate-800 mt-0.5">
                  {formatCurrency(result.minRange, currency)} – {formatCurrency(result.maxRange, currency)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Adjusted for {format === 'online' ? 'virtual production' : location} tiers
                </p>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="p-4 rounded-2xl bg-royal-50/60 border border-royal-100 text-xs text-royal-950 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-royal-900">
                <Sparkles className="w-3.5 h-3.5 text-royal-600" /> Event-Aware Financial Analysis
              </span>
              {result.explanation}
            </div>

            {/* Category Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Projected Category Breakdown
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Share</th>
                      <th className="px-4 py-2 text-right">Projected Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.breakdown.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-bold text-slate-900">{item.category}</td>
                        <td className="px-4 py-2.5 text-slate-500">{item.sharePercentage}%</td>
                        <td className="px-4 py-2.5 font-bold text-slate-900 text-right">
                          {formatCurrency(item.estimatedAmount, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Assumptions */}
            {result.assumptions && result.assumptions.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Key Planning Assumptions
                </h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  {result.assumptions.map((ass, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-500 font-bold">•</span>
                      <span>{ass}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Planning Projection:</strong> Generated using event-type benchmarks for {displayName} with {guestCount} {format === 'online' ? 'attendees' : 'guests'}. Actual costs vary with season and custom vendor contracts.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleEstimate}
                disabled={loading}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-calculate</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply Suggested Budget ({formatCurrency(result.suggestedTarget, currency)})</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

