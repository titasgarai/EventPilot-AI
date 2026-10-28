import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  Heart,
  Share2,
  Plus,
  Loader2,
  Tag,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { EventPlan, IdeaSection, PersonalizedIdea } from '../types';
import { generateMoreIdeasWithAI } from '../services/gemini';
import { useToast } from '../components/common/Toast';
import { Modal } from '../components/common/Modal';

interface AIIdeasViewProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

const SECTIONS: IdeaSection[] = [
  'Decoration',
  'Food',
  'Entertainment',
  'Activities',
  'Invitations',
  'Photography',
  'Budget Saving',
  'Unique Experiences',
];

export const AIIdeasView: React.FC<AIIdeasViewProps> = ({ event, onUpdateEvent }) => {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleFavorite = (ideaId: string) => {
    const updated = event.personalizedIdeas.map((idea) =>
      idea.id === ideaId ? { ...idea, isFavorite: !idea.isFavorite } : idea
    );
    onUpdateEvent({
      ...event,
      personalizedIdeas: updated,
      updatedAt: new Date().toISOString(),
    });
    const found = updated.find((i) => i.id === ideaId);
    showToast(found?.isFavorite ? 'Added to favorites!' : 'Removed from favorites', 'info');
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const sectionArg = activeSection !== 'all' ? activeSection : undefined;
      const newIdeas = await generateMoreIdeasWithAI(event, sectionArg);

      // Append new ideas avoiding duplicate ids
      const existingIds = new Set(event.personalizedIdeas.map((i) => i.id));
      const filteredNew = newIdeas.filter((i) => !existingIds.has(i.id));

      const updated = [...filteredNew, ...event.personalizedIdeas];
      onUpdateEvent({
        ...event,
        personalizedIdeas: updated,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Generated ${filteredNew.length} new creative ideas!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error generating ideas', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter ideas
  const displayedIdeas = event.personalizedIdeas.filter((idea) => {
    if (favoritesOnly && !idea.isFavorite) return false;
    if (activeSection !== 'all' && idea.category !== activeSection) return false;
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Creative Direction
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            AI Ideas & Inspiration
          </h2>
          <p className="text-xs text-slate-500">
            Tailored specifically to your {event.style} {event.type} in {event.location}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFavoritesOnly((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              favoritesOnly
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>Favorites ({event.personalizedIdeas.filter((i) => i.isFavorite).length})</span>
          </button>

          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-royal-600 hover:from-brand-500 hover:to-royal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>Generate More Ideas</span>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories ({event.personalizedIdeas.length})
        </button>

        {SECTIONS.map((sec) => {
          const count = event.personalizedIdeas.filter((i) => i.category === sec).length;
          const isSelected = activeSection === sec;

          return (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sec} ({count})
            </button>
          );
        })}
      </div>

      {/* Ideas Cards Grid */}
      {displayedIdeas.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80">
          <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-800">No ideas found in this view</p>
          <p className="text-xs text-slate-400 mt-1">
            Click "Generate More Ideas" above to have Gemini create fresh suggestions!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedIdeas.map((idea) => {
            const categoryColors: Record<string, string> = {
              Decoration: 'bg-pink-50 text-pink-700 border-pink-200',
              Food: 'bg-amber-50 text-amber-700 border-amber-200',
              Entertainment: 'bg-purple-50 text-purple-700 border-purple-200',
              Activities: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              Invitations: 'bg-sky-50 text-sky-700 border-sky-200',
              Photography: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              'Budget Saving': 'bg-teal-50 text-teal-700 border-teal-200',
              'Unique Experiences': 'bg-rose-50 text-rose-700 border-rose-200',
            };

            const colorClass = categoryColors[idea.category] || 'bg-slate-100 text-slate-700';

            return (
              <div
                key={idea.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
                      {idea.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(idea.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title={idea.isFavorite ? 'Remove favorite' : 'Save favorite'}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          idea.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-2.5 leading-snug">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {idea.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {idea.impactOrSavings && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span>{idea.impactOrSavings}</span>
                    </div>
                  )}

                  {idea.tags && idea.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {idea.tags.map((tag, ti) => (
                        <span
                          key={ti}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

