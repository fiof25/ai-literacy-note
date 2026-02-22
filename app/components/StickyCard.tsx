'use client';

import { useState } from 'react';
import type { Sticky } from '@/lib/types';

const AI_TYPE_LABELS: Record<string, string> = {
  generative: 'Generative',
  predictive: 'Predictive',
  automation: 'Automation',
  conversational: 'Conversational',
  unsure: 'Mixed / Unsure',
};

const REALNESS_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  using:    { label: 'In practice',  bg: '#D1FAE5', text: '#065F46' },
  possible: { label: 'Possible soon', bg: '#DBEAFE', text: '#1E40AF' },
  imagined: { label: 'Future vision', bg: '#EDE9FE', text: '#5B21B6' },
};

const SENTIMENT_LABELS: Record<string, string> = {
  '-2': '−−', '-1': '−', '0': '', '1': '+', '2': '++',
};

const PIN_COLORS = ['#E05252', '#4A90D9', '#5CB85C', '#E09A2B', '#9B59B6'];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

interface Props {
  sticky: Sticky;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onDelete: (id: string) => void;
}

export default function StickyCard({ sticky, isDragging, onMouseDown, onDelete }: Props) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const realness = REALNESS_LABELS[sticky.aiRealness];
  const pinColor = PIN_COLORS[sticky.id.charCodeAt(0) % PIN_COLORS.length];

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(sticky.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  }

  const isLifted = isDragging || hovered;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
      onMouseDown={onMouseDown}
      className="note-fold select-none relative"
      style={{
        backgroundColor: sticky.color,
        transform: `rotate(${isLifted ? 0 : sticky.rotation}deg) scale(${isLifted ? 1.05 : 1})`,
        boxShadow: isDragging
          ? '10px 16px 36px rgba(0,0,0,0.38), 2px 4px 8px rgba(0,0,0,0.18)'
          : hovered
          ? '5px 10px 24px rgba(0,0,0,0.24), 2px 3px 6px rgba(0,0,0,0.1)'
          : '3px 5px 12px rgba(0,0,0,0.18), 1px 2px 4px rgba(0,0,0,0.07)',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'grab',
        padding: '20px 16px 14px',
        borderRadius: '2px',
      }}
    >
      {/* Pushpin — inset box-shadow for highlight, no color-mix */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: pinColor,
          boxShadow: `inset -2px -2px 4px rgba(0,0,0,0.3), inset 1px 1px 3px rgba(255,255,255,0.5), 0 2px 5px rgba(0,0,0,0.4)`,
          pointerEvents: 'none',
        }}
      />

      {/* Delete button */}
      {hovered && (
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleDeleteClick}
          title={confirmDelete ? 'Click again to confirm' : 'Delete'}
          style={{
            position: 'absolute',
            top: '5px',
            right: '5px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: confirmDelete ? 'rgba(220,38,38,0.85)' : 'rgba(0,0,0,0.15)',
            color: confirmDelete ? '#fff' : '#444',
            transition: 'background 0.15s',
          }}
        >
          {confirmDelete ? '!' : '×'}
        </button>
      )}

      {/* Headline */}
      <p
        className="font-bold leading-snug line-clamp-4 mb-3"
        style={{ fontSize: '13.5px', color: '#1a1a1a', lineHeight: 1.45 }}
      >
        &ldquo;I want AI to {sticky.useCase}&rdquo;
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {sticky.industry && (
          <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.1)', color: '#333', padding: '2px 7px', borderRadius: '20px', fontWeight: 600 }}>
            {sticky.industry}
          </span>
        )}
        <span style={{ fontSize: '10px', background: 'rgba(0,0,0,0.1)', color: '#333', padding: '2px 7px', borderRadius: '20px', fontWeight: 600 }}>
          {AI_TYPE_LABELS[sticky.aiType] ?? sticky.aiType}
        </span>
        {realness && (
          <span style={{ fontSize: '10px', background: realness.bg, color: realness.text, padding: '2px 7px', borderRadius: '20px', fontWeight: 600 }}>
            {realness.label}
          </span>
        )}
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.09)', marginBottom: '9px' }} />

      <div className="flex items-center justify-between">
        <span style={{ fontSize: '11px', color: '#3a3a3a', fontWeight: 600 }} className="truncate max-w-[72%]">
          {SENTIMENT_LABELS[String(sticky.sentiment)]} {sticky.authorName}
          {sticky.profession ? `, ${sticky.profession}` : ''}
        </span>
        <span style={{ fontSize: '10px', color: '#5a5a5a' }} className="flex items-center gap-1 shrink-0 ml-2">
          <span>{sticky.comments.length} comments</span>
          <span className="opacity-55 ml-0.5">· {timeAgo(sticky.createdAt)}</span>
        </span>
      </div>
    </div>
  );
}
