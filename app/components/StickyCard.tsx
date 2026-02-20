'use client';

import { useState } from 'react';
import type { Sticky } from '@/lib/types';

const AI_TYPE_LABELS: Record<string, string> = {
  generative: '🎨 Generative',
  predictive: '📊 Predictive',
  automation: '⚙️ Automation',
  conversational: '💬 Conversational',
  unsure: '🤷 Not sure',
};

const REALNESS_LABELS: Record<string, { label: string; color: string }> = {
  using: { label: 'In practice', color: 'bg-emerald-100 text-emerald-800' },
  possible: { label: 'Possible soon', color: 'bg-sky-100 text-sky-800' },
  imagined: { label: 'Future vision', color: 'bg-violet-100 text-violet-800' },
};

const SENTIMENT_LABELS: Record<number, string> = {
  '-2': '😟',
  '-1': '😕',
  '0': '😐',
  '1': '🙂',
  '2': '😊',
};

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
  onClick: () => void;
}

export default function StickyCard({ sticky, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const realness = REALNESS_LABELS[sticky.aiRealness];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: sticky.color,
        transform: `rotate(${hovered ? 0 : sticky.rotation}deg) scale(${hovered ? 1.03 : 1})`,
        boxShadow: hovered
          ? '0 16px 32px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.12)'
          : '0 4px 10px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        zIndex: hovered ? 10 : 1,
        position: 'relative',
      }}
      className="rounded-sm cursor-pointer p-4 pt-5 select-none"
    >
      {/* Pin */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 shadow-md"
        style={{
          backgroundColor: '#e53e3e',
          borderColor: '#c53030',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }}
      />

      {/* Main headline */}
      <p className="text-sm font-semibold text-gray-900 leading-snug mb-3 line-clamp-4">
        &ldquo;I want AI to {sticky.useCase}&rdquo;
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {sticky.industry && (
          <span className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium">
            {sticky.industry}
          </span>
        )}
        <span className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium">
          {AI_TYPE_LABELS[sticky.aiType] ?? sticky.aiType}
        </span>
        {realness && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${realness.color}`}>
            {realness.label}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-600 font-medium truncate max-w-[70%]">
          {SENTIMENT_LABELS[sticky.sentiment]} {sticky.authorName}
          {sticky.profession && `, ${sticky.profession}`}
        </span>
        <span className="text-xs text-gray-500 ml-2 flex items-center gap-1 shrink-0">
          <span>💬</span>
          <span>{sticky.comments.length}</span>
          <span className="hidden sm:inline ml-1 opacity-60">· {timeAgo(sticky.createdAt)}</span>
        </span>
      </div>
    </div>
  );
}
