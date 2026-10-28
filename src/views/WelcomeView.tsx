import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../utils/storage';

interface WelcomeViewProps {
  onLoginSuccess: (profile: UserProfile) => void;
  onExploreDemo: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onLoginSuccess, onExploreDemo }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleGoogleLogin = () => {
    const profile: UserProfile = {
      name: 'Titas Garai',
      email: 'titasgarai@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      isGuest: false,
    };
    saveUserProfile(profile);
    onLoginSuccess(profile);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      isGuest: false,
    };
    saveUserProfile(profile);
    onLoginSuccess(profile);
  };

  const handleGuestLogin = () => {
    const profile: UserProfile = {
      name: 'Guest Planner',
      email: 'guest@eventpilot.ai',
      isGuest: true,
    };
    saveUserProfile(profile);
    onLoginSuccess(profile);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-brand-200/40 via-purple-200/30 to-royal-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl relative z-10 animate-slide-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-royal-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mx-auto mb-4">
            <Sparkles className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            EventPilot<span className="text-brand-600">.AI</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-1">
            GenAI Event Planning Assistant
          </p>
          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Welcome! Turn your vision, budget, and guest list into an organized, personalized event plan in minutes.
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-3">
          {/* Continue with Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Toggle Email Sign In Form */}
          {!showEmailForm ? (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>Sign In with Email</span>
            </button>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-3 pt-1 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Your Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="border-t border-slate-100 w-full" />
            <span className="bg-white px-2.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider absolute">
              or
            </span>
          </div>

          {/* Guest / Demo Option */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-100/70 text-brand-700 font-bold text-xs rounded-2xl border border-brand-200/60 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Continue as Guest</span>
          </button>

          <button
            type="button"
            onClick={() => {
              handleGuestLogin();
              onExploreDemo();
            }}
            className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-1"
          >
            <span>Or explore Showcase Demo Event</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Local storage note */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center leading-relaxed">
          ⚡ <strong>Local Session:</strong> No password needed. Your plans & budgets are saved directly in your browser's private local storage.
        </div>
      </div>
    </div>
  );
};
