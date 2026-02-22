'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { Sticky, Comment } from '@/lib/types';
import StickyDetail from './StickyDetail';

// Dynamic import with ssr:false — Three.js needs browser APIs
const ForestScene3D = dynamic(() => import('./ForestScene3D'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to bottom, #B8DFF0 0%, #C8EAA8 70%, #5BA541 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', fontWeight: 600, letterSpacing: '0.03em' }}>
        Planting trees…
      </p>
    </div>
  ),
});

const LEGEND = [
  { key: 'generative',     color: '#DB2777', bg: 'rgba(252,231,243,0.92)', label: 'Generative',     icon: '❀' },
  { key: 'predictive',     color: '#047857', bg: 'rgba(209,250,229,0.92)', label: 'Predictive',     icon: '△' },
  { key: 'automation',     color: '#1D4ED8', bg: 'rgba(219,234,254,0.92)', label: 'Automation',     icon: '◈' },
  { key: 'conversational', color: '#B45309', bg: 'rgba(254,249,195,0.92)', label: 'Conversational', icon: '◯' },
  { key: 'unsure',         color: '#6D28D9', bg: 'rgba(237,233,254,0.92)', label: 'Mixed / Unsure', icon: '✦' },
];

interface Props {
  stickies: Sticky[];
  savedName: string;
  onCommentAdded: (stickyId: string, comment: Comment) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
  onShareStory: () => void;
}

export default function ForestView({ stickies, savedName, onCommentAdded, onDelete, onBack, onShareStory }: Props) {
  const [selected, setSelected] = useState<Sticky | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const maxIdx = stickies.length;

  const visible = useMemo(
    () => [...stickies].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [stickies]
  );

  const glass: React.CSSProperties = {
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(255,255,255,0.55)',
    borderRadius: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.14)',
  };

  return (
    /* Full-screen fixed overlay */
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, overflow: 'hidden' }}>

      {/* ── 3D canvas: fills entire screen ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <ForestScene3D stickies={visible} sliderIdx={maxIdx} onSelect={setSelected} />
      </div>

      {/* ── Top bar ── */}
      <div style={{
        position: 'absolute', top: 20, left: 20, right: 20, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            ...glass,
            padding: '9px 18px',
            fontSize: '13px', fontWeight: 700, color: '#3D2008',
            cursor: 'pointer', border: 'none', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          ← Board
        </button>

        {/* Title pill */}
        <div style={{ ...glass, padding: '9px 18px', flexGrow: 1, minWidth: 0 }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#3D2008' }}>Our AI Stories</span>
          <span style={{ fontSize: '12px', color: '#9B7A50', marginLeft: 10 }}>
            Forest View · {maxIdx} {maxIdx === 1 ? 'story' : 'stories'}
          </span>
        </div>

        {/* Share story */}
        <button
          onClick={onShareStory}
          style={{
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            border: 'none', borderRadius: '14px',
            padding: '9px 20px',
            fontSize: '13px', fontWeight: 700, color: 'white',
            cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 4px 18px rgba(217,119,6,0.42)',
          }}
        >
          + Share Story
        </button>
      </div>

      {/* ── Legend (bottom-left) ── */}
      <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        {showLegend && (
          <div style={{ ...glass, padding: '12px 16px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LEGEND.map((l) => (
              <span key={l.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '12px', fontWeight: 600, color: l.color }}>
                <span style={{ fontSize: '15px' }}>{l.icon}</span>
                {l.label}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowLegend((v) => !v)}
          style={{
            ...glass, border: 'none',
            padding: '7px 14px', fontSize: '12px', fontWeight: 600,
            color: '#6B4A20', cursor: 'pointer', borderRadius: '10px',
          }}
        >
          {showLegend ? 'Hide legend' : 'Tree types'}
        </button>
      </div>

      {/* ── Orbit hint (bottom-right) ── */}
      <div style={{ position: 'absolute', bottom: 34, right: 24, zIndex: 10 }}>
        <span style={{
          background: 'rgba(0,0,0,0.32)',
          backdropFilter: 'blur(8px)',
          borderRadius: '10px',
          padding: '7px 13px',
          fontSize: '11px', color: 'rgba(255,255,255,0.82)', fontWeight: 500,
        }}>
          Drag to orbit · scroll to zoom
        </span>
      </div>

      {/* ── StickyDetail modal ── */}
      {selected && (
        <StickyDetail
          sticky={selected}
          savedName={savedName}
          onClose={() => setSelected(null)}
          onCommentAdded={(id, comment) => {
            onCommentAdded(id, comment);
            setSelected((prev) => prev?.id === id ? { ...prev, comments: [...prev.comments, comment] } : prev);
          }}
          onDelete={(id) => { onDelete(id); setSelected(null); }}
        />
      )}
    </div>
  );
}
