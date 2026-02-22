'use client';

import { useState } from 'react';
import type { Sticky, Comment } from '@/lib/types';

const AI_TYPE_LABELS: Record<string, string> = {
  generative: 'Generative / Creative',
  predictive: 'Predictive / Analytical',
  automation: 'Automation',
  conversational: 'Conversational',
  unsure: 'Not sure / Multiple',
};

const REALNESS_LABELS: Record<string, string> = {
  using: 'Already using this',
  possible: 'Possible in the near future',
  imagined: 'Future vision',
};

const SENTIMENT_MAP: Record<number, { emoji: string; label: string }> = {
  '-2': { emoji: '−−', label: 'Very pessimistic' },
  '-1': { emoji: '−', label: 'Pessimistic' },
  '0': { emoji: '○', label: 'Neutral' },
  '1': { emoji: '+', label: 'Optimistic' },
  '2': { emoji: '++', label: 'Very optimistic' },
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  sticky: Sticky;
  savedName: string;
  onClose: () => void;
  onCommentAdded: (stickyId: string, comment: Comment) => void;
  onDelete: (id: string) => void;
}

export default function StickyDetail({ sticky, savedName, onClose, onCommentAdded, onDelete }: Props) {
  const [commentAuthor, setCommentAuthor] = useState(savedName || '');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sentiment = SENTIMENT_MAP[sticky.sentiment];

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`/api/stickies/${sticky.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: commentAuthor || 'Anonymous', text: commentText }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const comment: Comment = await res.json();
      onCommentAdded(sticky.id, comment);
      if (commentAuthor) {
        localStorage.setItem('workshopName', commentAuthor);
      }
      setCommentText('');
    } catch {
      setError('Could not post comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky color header band */}
        <div
          className="rounded-t-2xl px-6 pt-5 pb-4"
          style={{ backgroundColor: sticky.color }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                {sticky.profession && `${sticky.profession} · `}
                {sticky.industry}
                {sticky.region && ` · ${sticky.region}`}
              </p>
              <h2 className="text-lg font-bold text-gray-900 leading-snug">
                &ldquo;I want AI to {sticky.useCase}&rdquo;
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center shrink-0 rounded-full transition-colors hover:bg-black/10"
              style={{ width: '28px', height: '28px', color: 'rgba(0,0,0,0.45)', fontSize: '18px', fontWeight: 700, lineHeight: 1 }}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Meta tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-xs bg-white/70 text-gray-700 px-2 py-0.5 rounded-full font-medium">
              {AI_TYPE_LABELS[sticky.aiType]}
            </span>
            <span className="text-xs bg-white/70 text-gray-700 px-2 py-0.5 rounded-full font-medium">
              {REALNESS_LABELS[sticky.aiRealness]}
            </span>
            {sentiment && (
              <span className="text-xs bg-white/70 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                {sentiment.emoji} {sentiment.label} about AI
              </span>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-5 space-y-5">
          {/* Story */}
          {sticky.experience && (
            <div className="pl-3" style={{ borderLeft: '3px solid rgba(245,158,11,0.45)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                The story behind it
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{sticky.experience}</p>
            </div>
          )}

          {/* Pain points */}
          {sticky.painPoints && (
            <div className="pl-3" style={{ borderLeft: '3px solid rgba(245,158,11,0.45)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Pain points AI could help with
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{sticky.painPoints}</p>
            </div>
          )}

          {/* Extra thoughts */}
          {sticky.extraThoughts && (
            <div className="pl-3" style={{ borderLeft: '3px solid rgba(245,158,11,0.45)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Extra thoughts
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">{sticky.extraThoughts}</p>
            </div>
          )}

          {/* Author + date + delete */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Posted by <span className="font-medium text-gray-600">{sticky.authorName}</span> · {formatDate(sticky.createdAt)}
            </p>
            <button
              onClick={() => {
                if (confirmDelete) {
                  onDelete(sticky.id);
                  onClose();
                } else {
                  setConfirmDelete(true);
                  setTimeout(() => setConfirmDelete(false), 2500);
                }
              }}
              className="text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
              style={{
                background: confirmDelete ? 'rgba(220,38,38,0.1)' : 'transparent',
                color: confirmDelete ? '#dc2626' : '#9ca3af',
              }}
            >
              {confirmDelete ? 'Confirm delete?' : 'Delete'}
            </button>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Comments */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Comments ({sticky.comments.length})
            </h3>

            <div className="space-y-2.5 mb-4">
              {sticky.comments.length === 0 && (
                <p className="text-sm text-gray-400 italic py-2">No comments yet — be the first to react!</p>
              )}
              {sticky.comments.map((c) => (
                <div key={c.id} className="rounded-xl px-3.5 py-2.5" style={{ background: '#f8f7f4', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{c.author}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>

            {/* Comment form */}
            <form onSubmit={handleComment} className="space-y-2">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your reaction…"
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={submitting || !commentText.trim()}
                  className="text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  {submitting ? '…' : 'Post'}
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
