'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Sticky, Comment } from '@/lib/types';
import StickyCard from './components/StickyCard';
import StickyDetail from './components/StickyDetail';
import Questionnaire from './components/Questionnaire';

const INDUSTRIES = [
  'Education', 'Healthcare', 'Technology', 'Journalism / Media',
  'Arts & Design', 'Legal', 'Finance', 'Government / Public Sector',
  'Agriculture', 'Retail / E-commerce', 'Manufacturing', 'Research / Academia',
  'Social Services', 'Transportation', 'Other',
];

const AI_TYPES = [
  { value: 'generative', label: '🎨 Generative' },
  { value: 'predictive', label: '📊 Predictive' },
  { value: 'automation', label: '⚙️ Automation' },
  { value: 'conversational', label: '💬 Conversational' },
  { value: 'unsure', label: '🤷 Not sure' },
];

export default function BoardPage() {
  const [stickies, setStickies] = useState<Sticky[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedSticky, setSelectedSticky] = useState<Sticky | null>(null);
  const [savedName, setSavedName] = useState('');

  // Filters
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterAiType, setFilterAiType] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterRealness, setFilterRealness] = useState('');
  const [searchText, setSearchText] = useState('');

  // Load saved name from localStorage
  useEffect(() => {
    const name = localStorage.getItem('workshopName') || '';
    setSavedName(name);
  }, []);

  const fetchStickies = useCallback(async () => {
    try {
      const res = await fetch('/api/stickies');
      if (!res.ok) return;
      const data: Sticky[] = await res.json();
      setStickies(data);
    } catch {
      // fail silently on polling errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + poll every 5s
  useEffect(() => {
    fetchStickies();
    const interval = setInterval(fetchStickies, 5000);
    return () => clearInterval(interval);
  }, [fetchStickies]);

  function handleNewSticky(sticky: Sticky) {
    setStickies((prev) => [sticky, ...prev]);
    setShowQuestionnaire(false);
  }

  function handleCommentAdded(stickyId: string, comment: Comment) {
    setStickies((prev) =>
      prev.map((s) =>
        s.id === stickyId ? { ...s, comments: [...s.comments, comment] } : s
      )
    );
    // Also update selected sticky if it's open
    setSelectedSticky((prev) =>
      prev && prev.id === stickyId
        ? { ...prev, comments: [...prev.comments, comment] }
        : prev
    );
  }

  // Filtered stickies
  const filtered = stickies.filter((s) => {
    if (filterIndustry && s.industry !== filterIndustry) return false;
    if (filterAiType && s.aiType !== filterAiType) return false;
    if (filterRealness && s.aiRealness !== filterRealness) return false;
    if (filterSentiment === 'optimistic' && s.sentiment < 1) return false;
    if (filterSentiment === 'pessimistic' && s.sentiment > -1) return false;
    if (filterSentiment === 'neutral' && s.sentiment !== 0) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (
        !s.useCase.toLowerCase().includes(q) &&
        !s.authorName.toLowerCase().includes(q) &&
        !s.industry.toLowerCase().includes(q) &&
        !s.experience.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // Stats
  const totalOptimistic = stickies.filter((s) => s.sentiment > 0).length;
  const totalPessimistic = stickies.filter((s) => s.sentiment < 0).length;
  const uniqueIndustries = new Set(stickies.map((s) => s.industry).filter(Boolean)).size;
  const hasFilters = filterIndustry || filterAiType || filterSentiment || filterRealness || searchText;

  return (
    <div className="min-h-screen flex flex-col bg-stone-900">
      {/* Header */}
      <header className="bg-stone-900 border-b border-stone-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-0.5">
              AI Literacy Workshop · Phase 2
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              Our AI Stories
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live stats */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-stone-400">
              <span>{stickies.length} {stickies.length === 1 ? 'story' : 'stories'}</span>
              <span>·</span>
              <span>{uniqueIndustries} industries</span>
              {stickies.length > 0 && (
                <>
                  <span>·</span>
                  <span>😊 {totalOptimistic} optimistic</span>
                  <span>·</span>
                  <span>😟 {totalPessimistic} pessimistic</span>
                </>
              )}
            </div>

            <button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors shadow-lg"
            >
              📌 Share Your Story
            </button>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <div className="bg-stone-800 border-b border-stone-700 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search stories…"
            className="bg-stone-700 text-white text-xs placeholder-stone-400 border border-stone-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 w-36"
          />

          {/* Industry filter */}
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="bg-stone-700 text-white text-xs border border-stone-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          {/* AI type filter */}
          <select
            value={filterAiType}
            onChange={(e) => setFilterAiType(e.target.value)}
            className="bg-stone-700 text-white text-xs border border-stone-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="">All AI types</option>
            {AI_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          {/* Sentiment filter */}
          <select
            value={filterSentiment}
            onChange={(e) => setFilterSentiment(e.target.value)}
            className="bg-stone-700 text-white text-xs border border-stone-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="">All feelings</option>
            <option value="optimistic">😊 Optimistic</option>
            <option value="neutral">😐 Neutral</option>
            <option value="pessimistic">😟 Pessimistic</option>
          </select>

          {/* Realness filter */}
          <select
            value={filterRealness}
            onChange={(e) => setFilterRealness(e.target.value)}
            className="bg-stone-700 text-white text-xs border border-stone-600 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <option value="">All stages</option>
            <option value="using">✅ Already using</option>
            <option value="possible">🔜 Possible soon</option>
            <option value="imagined">🌟 Future vision</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setFilterIndustry('');
                setFilterAiType('');
                setFilterSentiment('');
                setFilterRealness('');
                setSearchText('');
              }}
              className="text-xs text-amber-400 hover:text-amber-300 underline"
            >
              Clear filters
            </button>
          )}

          <span className="text-xs text-stone-500 ml-auto">
            {filtered.length} of {stickies.length} shown
          </span>
        </div>
      </div>

      {/* Board */}
      <main className="flex-1 corkboard p-5 sm:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-white/60">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading stories…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-white/10 rounded-2xl p-8 max-w-sm">
              {stickies.length === 0 ? (
                <>
                  <p className="text-4xl mb-4">📌</p>
                  <h2 className="text-lg font-bold text-white mb-2">The board is empty!</h2>
                  <p className="text-sm text-white/70 mb-4">
                    Be the first to share your AI use case story.
                  </p>
                  <button
                    onClick={() => setShowQuestionnaire(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Share your story
                  </button>
                </>
              ) : (
                <>
                  <p className="text-4xl mb-4">🔍</p>
                  <h2 className="text-lg font-bold text-white mb-2">No stories match</h2>
                  <p className="text-sm text-white/70">Try adjusting your filters.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="sticky-columns max-w-7xl mx-auto">
            {filtered.map((sticky) => (
              <StickyCard
                key={sticky.id}
                sticky={sticky}
                onClick={() => setSelectedSticky(sticky)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer note */}
      <div className="bg-stone-900 border-t border-stone-700 px-4 py-2 text-center">
        <p className="text-xs text-stone-500">
          Board refreshes automatically · Click any sticky note to read the full story and comment
        </p>
      </div>

      {/* Questionnaire modal */}
      {showQuestionnaire && (
        <Questionnaire
          savedName={savedName}
          onClose={() => setShowQuestionnaire(false)}
          onSubmit={handleNewSticky}
        />
      )}

      {/* Detail modal */}
      {selectedSticky && (
        <StickyDetail
          sticky={selectedSticky}
          savedName={savedName}
          onClose={() => setSelectedSticky(null)}
          onCommentAdded={handleCommentAdded}
        />
      )}
    </div>
  );
}
