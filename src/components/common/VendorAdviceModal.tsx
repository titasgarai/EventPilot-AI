import React, { useState } from 'react';
import { Modal } from './Modal';
import { Sparkles, Loader2, CheckCircle2, HelpCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { EventPlan, VendorAdviceResult, VendorCategory } from '../../types';
import { getVendorAdviceWithAI } from '../../services/gemini';
import { useToast } from './Toast';

interface VendorAdviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: VendorCategory;
  event: EventPlan;
}

export const VendorAdviceModal: React.FC<VendorAdviceModalProps> = ({
  isOpen,
  onClose,
  category,
  event,
}) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<VendorAdviceResult | null>(null);
  const { showToast } = useToast();

  React.useEffect(() => {
    if (isOpen && category) {
      setLoading(true);
      getVendorAdviceWithAI(category, event)
        .then((res) => setAdvice(res))
        .catch((err) => {
          console.error(err);
          showToast('Failed to load vendor advice', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, category]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${category} Strategy & Hiring Advice`}
      subtitle={`AI planning recommendations for hiring in ${event.location}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {loading ? (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-600 animate-spin mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-900">
                Generating hiring strategies for {category}...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Analyzing market rates and key deliverables for {event.guestCount} guests
              </p>
            </div>
          </div>
        ) : advice ? (
          <div className="space-y-4 animate-fade-in text-xs">
            {/* Price benchmark */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700">Estimated Market Range:</span>
              <span className="font-bold text-brand-700">{advice.estimatedCostRange}</span>
            </div>

            {/* Questions to ask */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-royal-700">
                <HelpCircle className="w-4 h-4 text-royal-600" /> Essential Questions to Ask Before Booking
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {advice.questionsToAsk.map((q, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-royal-500 font-bold shrink-0">{i + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Selection tips */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider flex items-center gap-1.5 text-brand-700">
                <Sparkles className="w-4 h-4 text-brand-600" /> What to Look For (Evaluation Criteria)
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {advice.selectionTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brand-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Alternative Approaches */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-700">
                Alternative Sourcing Options
              </h4>
              <ul className="space-y-1.5 text-slate-600">
                {advice.alternativeOptions.map((opt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Backup Plan */}
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-purple-950">
              <span className="font-bold block mb-0.5">🛡️ Recommended Backup Plan</span>
              <p className="text-slate-600">{advice.backupPlan}</p>
            </div>

            <div className="text-[10px] text-slate-400 italic text-center pt-2">
              * Note: These are AI planning insights to guide your negotiations. Always review written vendor contracts before dispatching deposits.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-all shadow-sm"
              >
                Close Advice
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

