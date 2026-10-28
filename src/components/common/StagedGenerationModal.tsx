import React from 'react';
import { Sparkles, Brain, CheckCircle2, Loader2 } from 'lucide-react';
import { StagedLoadingStep } from '../../types';
import { STAGED_STEPS } from '../../services/gemini';

interface StagedGenerationModalProps {
  isOpen: boolean;
  currentStep: StagedLoadingStep | null;
  eventName: string;
}

export const StagedGenerationModal: React.FC<StagedGenerationModalProps> = ({
  isOpen,
  currentStep,
  eventName,
}) => {
  if (!isOpen) return null;

  const currentStepNum = currentStep?.step || 1;
  const progressPercent = Math.min(100, Math.round(((currentStepNum - 0.5) / STAGED_STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 overflow-hidden text-center">
        {/* Decorative glowing gradient top bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-500 via-purple-500 to-royal-600 animate-pulse" />

        {/* AI Icon with rotating ring */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-royal-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-1">
          EventPilot AI Generating Plan
        </h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
          Architecting complete blueprint for <span className="font-semibold text-slate-800">"{eventName}"</span>
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-royal-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Staged steps checklist */}
        <div className="space-y-3 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200/60 mb-6">
          {STAGED_STEPS.map((step) => {
            const isDone = currentStepNum > step.step;
            const isCurrent = currentStepNum === step.step;

            return (
              <div
                key={step.step}
                className={`flex items-start gap-3 p-2 rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-white shadow-sm border border-brand-200/60 ring-1 ring-brand-100'
                    : 'opacity-70'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {step.step}
                    </div>
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-brand-900 font-bold' : isDone ? 'text-slate-800' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-snug">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Brain className="w-3.5 h-3.5 text-royal-500" />
          <span>Powered by Google Gemini 1.5 Flash</span>
        </div>
      </div>
    </div>
  );
};

