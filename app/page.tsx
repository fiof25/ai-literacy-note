'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Sticky, Comment } from '@/lib/types';
import StickyCard from './components/StickyCard';
import StickyDetail from './components/StickyDetail';
import Questionnaire from './components/Questionnaire';
import ForestView from './components/ForestView';

const INDUSTRIES = [
  'Education', 'Healthcare', 'Technology', 'Journalism / Media',
  'Arts & Design', 'Legal', 'Finance', 'Government / Public Sector',
  'Agriculture', 'Retail / E-commerce', 'Manufacturing', 'Research / Academia',
  'Social Services', 'Transportation', 'Other',
];

const AI_TYPES = [
  { value: 'generative',     label: 'Generative' },
  { value: 'predictive',     label: 'Predictive' },
  { value: 'automation',     label: 'Automation' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'unsure',         label: 'Not sure' },
];

const NOTE_WIDTH = 220;

export default function BoardPage() {
  const [stickies, setStickies]                   = useState<Sticky[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedSticky, setSelectedSticky]       = useState<Sticky | null>(null);
  const [savedName, setSavedName]                 = useState('');
  const [draggingId, setDraggingId]               = useState<string | null>(null);
  const [viewMode, setViewMode]                   = useState<'board' | 'forest'>('board');

  // Filters
  const [filterIndustry, setFilterIndustry]   = useState('');
  const [filterAiType, setFilterAiType]       = useState('');
  const [filterSentiment, setFilterSentiment] = useState('');
  const [filterRealness, setFilterRealness]   = useState('');
  const [searchText, setSearchText]           = useState('');

  // Drag state stored in refs to avoid re-registering event listeners
  const dragRef = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startNoteX: number;
    startNoteY: number;
    moved: boolean;
  } | null>(null);
  const currentDragPos = useRef<{ x: number; y: number } | null>(null);
  // Keep a ref to current stickies to avoid stale closure in mouseup
  const stickiesRef = useRef(stickies);
  useEffect(() => { stickiesRef.current = stickies; }, [stickies]);

  useEffect(() => {
    setSavedName(localStorage.getItem('workshopName') || '');
  }, []);

  const fetchStickies = useCallback(async () => {
    try {
      const res = await fetch('/api/stickies');
      if (!res.ok) return;
      setStickies(await res.json());
    } catch { /* fail silently */ } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStickies();
    const t = setInterval(fetchStickies, 5000);
    return () => clearInterval(t);
  }, [fetchStickies]);

  // Register drag mouse handlers once
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startMouseX;
      const dy = e.clientY - dragRef.current.startMouseY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;

      const newX = Math.max(0, dragRef.current.startNoteX + dx);
      const newY = Math.max(0, dragRef.current.startNoteY + dy);
      currentDragPos.current = { x: newX, y: newY };

      setStickies((prev) =>
        prev.map((s) => (s.id === dragRef.current?.id ? { ...s, x: newX, y: newY } : s))
      );
    }

    function onMouseUp() {
      if (!dragRef.current) return;
      const { id, moved } = dragRef.current;

      if (moved && currentDragPos.current) {
        const { x, y } = currentDragPos.current;
        fetch(`/api/stickies/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y }),
        }).catch(() => {});
      } else if (!moved) {
        // Was a click — open the detail modal
        const s = stickiesRef.current.find((s) => s.id === id);
        if (s) setSelectedSticky(s);
      }

      dragRef.current = null;
      currentDragPos.current = null;
      setDraggingId(null);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []); // register once

  function startDrag(e: React.MouseEvent, sticky: Sticky) {
    e.preventDefault();
    dragRef.current = {
      id: sticky.id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNoteX: sticky.x ?? 50,
      startNoteY: sticky.y ?? 50,
      moved: false,
    };
    currentDragPos.current = { x: sticky.x ?? 50, y: sticky.y ?? 50 };
    setDraggingId(sticky.id);
  }

  function handleNewSticky(sticky: Sticky) {
    setStickies((prev) => [sticky, ...prev]);
    setShowQuestionnaire(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/stickies/${id}`, { method: 'DELETE' }).catch(() => {});
    setStickies((prev) => prev.filter((s) => s.id !== id));
    if (selectedSticky?.id === id) setSelectedSticky(null);
  }

  function handleCommentAdded(stickyId: string, comment: Comment) {
    setStickies((prev) =>
      prev.map((s) => s.id === stickyId ? { ...s, comments: [...s.comments, comment] } : s)
    );
    setSelectedSticky((prev) =>
      prev?.id === stickyId ? { ...prev, comments: [...prev.comments, comment] } : prev
    );
  }

  const filtered = stickies.filter((s) => {
    if (filterIndustry  && s.industry   !== filterIndustry)  return false;
    if (filterAiType    && s.aiType     !== filterAiType)    return false;
    if (filterRealness  && s.aiRealness !== filterRealness)  return false;
    if (filterSentiment === 'optimistic'  && s.sentiment < 1)   return false;
    if (filterSentiment === 'pessimistic' && s.sentiment > -1)  return false;
    if (filterSentiment === 'neutral'     && s.sentiment !== 0) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!s.useCase.toLowerCase().includes(q) &&
          !s.authorName.toLowerCase().includes(q) &&
          !s.industry.toLowerCase().includes(q) &&
          !s.experience.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const totalOptimistic  = stickies.filter((s) => s.sentiment > 0).length;
  const totalPessimistic = stickies.filter((s) => s.sentiment < 0).length;
  const uniqueIndustries = new Set(stickies.map((s) => s.industry).filter(Boolean)).size;
  const hasFilters = filterIndustry || filterAiType || filterSentiment || filterRealness || searchText;

  function clearFilters() {
    setFilterIndustry(''); setFilterAiType('');
    setFilterSentiment(''); setFilterRealness(''); setSearchText('');
  }

  const sel = 'text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border-amber-200 text-stone-700';

  return (
    <>
    <div className="wall">

      {/* ── Workshop title + actions ── */}
      <div className="px-6 sm:px-10 pt-7 pb-4 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
<h1 className="font-extrabold leading-tight"
              style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#3D2008' }}>
              Our AI Stories
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
            {stickies.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap justify-end" style={{ fontSize: '12px' }}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: 'rgba(155,101,53,0.12)', color: '#6B4A20' }}>
                  {stickies.length} {stickies.length === 1 ? 'story' : 'stories'}
                  {uniqueIndustries > 0 && ` · ${uniqueIndustries} industries`}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#15803d', fontWeight: 600 }}>
                  ↑ {totalOptimistic}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#4338ca', fontWeight: 600 }}>
                  ↓ {totalPessimistic}
                </span>
              </div>
            )}
            {/* View mode toggle */}
            <div className="flex rounded-xl overflow-hidden border text-xs font-semibold" style={{ borderColor: 'rgba(155,101,53,0.25)' }}>
              <button
                onClick={() => setViewMode('board')}
                className="px-4 py-2.5 transition-colors"
                style={{
                  background: viewMode === 'board' ? 'rgba(155,101,53,0.15)' : 'white',
                  color: viewMode === 'board' ? '#6B4A20' : '#9B7A50',
                }}
              >
                Board
              </button>
              <button
                onClick={() => setViewMode('forest')}
                className="px-4 py-2.5 transition-colors"
                style={{
                  background: viewMode === 'forest' ? 'rgba(155,101,53,0.15)' : 'white',
                  color: viewMode === 'forest' ? '#6B4A20' : '#9B7A50',
                  borderLeft: '1px solid rgba(155,101,53,0.25)',
                }}
              >
                Forest
              </button>
            </div>
            <button
              onClick={() => setShowQuestionnaire(true)}
              className="font-bold text-white px-5 py-3 rounded-xl text-sm transition-all active:scale-95 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' }}
            >
              + Share Your Story
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)', border: '1px solid rgba(155,101,53,0.15)', boxShadow: '0 2px 8px rgba(155,101,53,0.06)' }}>
          <span className="text-xs font-semibold mr-1 hidden sm:inline" style={{ color: '#9B6535' }}>Filter:</span>
          <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search…"
            className="text-xs border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white border-amber-200 text-stone-700 w-36" />
          <select value={filterIndustry}  onChange={(e) => setFilterIndustry(e.target.value)}  className={sel}>
            <option value="">All industries</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={filterAiType}    onChange={(e) => setFilterAiType(e.target.value)}    className={sel}>
            <option value="">All AI types</option>
            {AI_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)} className={sel}>
            <option value="">All feelings</option>
            <option value="optimistic">Optimistic</option>
            <option value="neutral">Neutral</option>
            <option value="pessimistic">Pessimistic</option>
          </select>
          <select value={filterRealness}  onChange={(e) => setFilterRealness(e.target.value)}  className={sel}>
            <option value="">All stages</option>
            <option value="using">In practice</option>
            <option value="possible">Possible soon</option>
            <option value="imagined">Future vision</option>
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors hover:bg-amber-50"
              style={{ color: '#9B6535', border: '1px solid rgba(155,101,53,0.25)' }}>
              ✕ Clear
            </button>
          )}
          <span className="ml-auto text-xs font-medium" style={{ color: '#9B7A50' }}>
            {filtered.length} / {stickies.length} shown
          </span>
        </div>
      </div>

      {/* ── Bulletin board (always rendered) ── */}
      <div className="px-6 sm:px-10 pb-10 max-w-7xl mx-auto">
        <div className="board-frame">
          <div
            className="corkboard"
            style={{ minHeight: '680px', position: 'relative', overflow: 'auto', padding: '24px' }}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'rgba(255,255,255,0.85)' }} />
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Loading stories…</p>
              </div>

            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center rounded-2xl px-8 py-8 max-w-xs"
                  style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                  {stickies.length === 0 ? (
                    <>
                      <p className="text-5xl mb-3">·</p>
                      <h2 className="font-bold mb-2" style={{ color: '#fff', fontSize: '17px' }}>The board is empty!</h2>
                      <p className="mb-5" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>Be the first to pin your AI story — it only takes a minute.</p>
                      <button onClick={() => setShowQuestionnaire(true)}
                        className="font-bold text-white px-5 py-2.5 rounded-xl text-sm transition-all hover:scale-105 active:scale-95"
                        style={{ background: 'rgba(245,158,11,0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        Share your story
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-5xl mb-3">○</p>
                      <h2 className="font-bold mb-1" style={{ color: '#fff', fontSize: '17px' }}>No stories match</h2>
                      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>Try adjusting your filters.</p>
                    </>
                  )}
                </div>
              </div>

            ) : (
              <div style={{ position: 'relative', minHeight: '640px' }}>
                {filtered.map((sticky) => (
                  <div
                    key={sticky.id}
                    style={{
                      position: 'absolute',
                      left: sticky.x ?? 40,
                      top: sticky.y ?? 40,
                      width: `${NOTE_WIDTH}px`,
                      zIndex: draggingId === sticky.id ? 100 : 1,
                    }}
                  >
                    <StickyCard
                      sticky={sticky}
                      isDragging={draggingId === sticky.id}
                      onMouseDown={(e) => startDrag(e, sticky)}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Board modals ── */}
      {showQuestionnaire && (
        <Questionnaire savedName={savedName} onClose={() => setShowQuestionnaire(false)} onSubmit={handleNewSticky} />
      )}
      {selectedSticky && (
        <StickyDetail
          sticky={selectedSticky}
          savedName={savedName}
          onClose={() => setSelectedSticky(null)}
          onCommentAdded={handleCommentAdded}
          onDelete={handleDelete}
        />
      )}
    </div>

    {/* ── Forest mode: full-screen overlay ── */}
    {viewMode === 'forest' && (
      <ForestView
        stickies={filtered}
        savedName={savedName}
        onCommentAdded={handleCommentAdded}
        onDelete={handleDelete}
        onBack={() => setViewMode('board')}
        onShareStory={() => setShowQuestionnaire(true)}
      />
    )}
    </>
  );
}
