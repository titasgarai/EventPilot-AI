import React, { useState } from 'react';
import { Modal } from './Modal';
import { Sparkles, Loader2, CheckCircle2, TrendingUp, AlertCircle, MapPin, Users, HelpCircle } from 'lucide-react';
import { BudgetEstimateResult, CurrencyCode, EventStyle, EventType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { estimateBudgetWithAI } from '../../services/gemini';
import { useToast } from './Toast';

interface BudgetEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventType: EventType;
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

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const data = await estimateBudgetWithAI({
        eventType,
        location,
        guestCount,
        style,
        preferences,
        currency,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      showToast('Error estimating budget', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Run automatically when modal opens if not already estimated
  React.useEffect(() => {
    if (isOpen && !result && !loading) {
      handleEstimate();
    }
  }, [isOpen]);

  const handleApply = () => {
    if (result) {
      onApplyBudget(result.suggestedTarget);
      showToast(`Applied AI target budget: ${formatCurrency(result.suggestedTarget, currency)}`, 'success');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GenAI Budget Estimator"
      subtitle="Location & guest-count aware cost projection powered by Gemini"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Input Parameters Summary Pill */}
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
          <span className="font-bold text-slate-900 capitalize">{style} {eventType}</span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            {location || 'Location set'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-slate-800">
            <Users className="w-3.5 h-3.5 text-royal-500" />
            {guestCount} guests
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Calculating regional cost benchmarks for {location}...
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Analyzing hospitality catering rates, local venue tariffs, and {style} styling expectations.
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
                  ~{formatCurrency(result.costPerGuest, currency)} per guest
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
                  Variance for vendor tiers in {location}
                </p>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="p-4 rounded-2xl bg-royal-50/60 border border-royal-100 text-xs text-royal-950 leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 mb-1 text-royal-900">
                <Sparkles className="w-3.5 h-3.5 text-royal-600" /> Regional Market Analysis
              </span>
              {result.explanation}
            </div>

            {/* Category Breakdown Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Projected Category Breakdown
              </h4>
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
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
                <strong>Planning Estimate:</strong> This projection is generated by GenAI based on regional event averages in {location}. Actual quotes will depend on vendor availability, seasonality, and customized contracts.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleEstimate}
                disabled={loading}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Re-calculate
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
