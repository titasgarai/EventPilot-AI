import React, { useState } from 'react';
import { Modal } from './Modal';
import { Key, Sparkles, CheckCircle2, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getCustomApiKey, setCustomApiKey } from '../../utils/storage';
import { getEffectiveApiKey } from '../../services/gemini';
import { useToast } from './Toast';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onKeySaved }) => {
  const [keyInput, setKeyInput] = useState(getCustomApiKey());
  const effectiveKey = getEffectiveApiKey();
  const hasEnvKey = Boolean(import.meta.env.VITE_GEMINI_API_KEY);
  const { showToast } = useToast();

  const handleSave = () => {
    setCustomApiKey(keyInput);
    showToast(keyInput.trim() ? 'Gemini API key saved!' : 'Custom API key removed', 'info');
    onKeySaved();
    onClose();
  };

  const handleClear = () => {
    setKeyInput('');
    setCustomApiKey('');
    showToast('Reverted to default / Demo Mode', 'info');
    onKeySaved();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Google Gemini AI Engine"
      subtitle="Configure real GenAI integration or use Demo Mode"
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${effectiveKey ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {effectiveKey ? <Sparkles className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Current Status: {effectiveKey ? 'Gemini AI Active' : 'Demo / Simulated AI Mode'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {effectiveKey
                  ? hasEnvKey && !getCustomApiKey()
                    ? 'Connected via environment variable (VITE_GEMINI_API_KEY).'
                    : 'Connected using your personal API key.'
                  : 'EventPilot AI will automatically use rich contextual simulated AI responses.'}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Gemini API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Key className="w-4 h-4" />
            </div>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Stored strictly in your local browser storage.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
            >
              Get free Gemini API key <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        <div className="p-3.5 bg-royal-50/60 rounded-xl border border-royal-100 text-xs text-royal-900 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-royal-600" /> Demo Mode Assurance
          </p>
          <p className="text-slate-600 leading-relaxed">
            No API key? No problem! EventPilot AI features a full-fidelity contextual fallback engine. You can test all features — budget optimization, 7-day timeline action plans, missing vendor discovery, and AI chat — without an API key.
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          {keyInput && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors"
            >
              Clear Custom Key
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

