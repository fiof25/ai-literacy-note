'use client';

import { useState } from 'react';
import type { Sticky } from '@/lib/types';

const INDUSTRIES = [
  'Education', 'Healthcare', 'Technology', 'Journalism / Media',
  'Arts & Design', 'Legal', 'Finance', 'Government / Public Sector',
  'Agriculture', 'Retail / E-commerce', 'Manufacturing', 'Research / Academia',
  'Social Services', 'Transportation', 'Other',
];

const AI_TYPES = [
  { value: 'generative', emoji: '🎨', label: 'Generative / Creative', desc: 'Text, images, video, audio' },
  { value: 'predictive', emoji: '📊', label: 'Predictive / Analytical', desc: 'Data analysis, forecasting' },
  { value: 'automation', emoji: '⚙️', label: 'Automation', desc: 'Workflows, process automation' },
  { value: 'conversational', emoji: '💬', label: 'Conversational', desc: 'Chatbots, voice assistants' },
  { value: 'unsure', emoji: '🤷', label: 'Not sure / Multiple', desc: 'A combination or unclear' },
];

const REALNESS = [
  { value: 'using', emoji: '✅', label: 'Already using this' },
  { value: 'possible', emoji: '🔜', label: 'Possible in the near future' },
  { value: 'imagined', emoji: '🌟', label: 'Future vision / Imagined' },
];

const SENTIMENT = [
  { value: -2, emoji: '😟', label: 'Very pessimistic' },
  { value: -1, emoji: '😕', label: 'Pessimistic' },
  { value: 0, emoji: '😐', label: 'Neutral' },
  { value: 1, emoji: '🙂', label: 'Optimistic' },
  { value: 2, emoji: '😊', label: 'Very optimistic' },
];

const SENTIMENT_COLORS: Record<number, string> = {
  '-2': '#DBEAFE',
  '-1': '#EDE9FE',
  '0': '#D1FAE5',
  '1': '#FEF9C3',
  '2': '#FDE68A',
};

type FormData = {
  authorName: string;
  profession: string;
  industry: string;
  region: string;
  useCase: string;
  experience: string;
  aiType: string;
  aiRealness: string;
  sentiment: number;
  painPoints: string;
  extraThoughts: string;
};

const INITIAL_FORM: FormData = {
  authorName: '',
  profession: '',
  industry: '',
  region: '',
  useCase: '',
  experience: '',
  aiType: '',
  aiRealness: '',
  sentiment: 0,
  painPoints: '',
  extraThoughts: '',
};

interface Props {
  savedName: string;
  onClose: () => void;
  onSubmit: (sticky: Sticky) => void;
}

export default function Questionnaire({ savedName, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...INITIAL_FORM, authorName: savedName });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 5; // 4 question steps + 1 preview

  function update(field: keyof FormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance() {
    if (step === 0) return form.authorName.trim().length > 0;
    if (step === 1) return form.useCase.trim().length > 0;
    if (step === 2) return form.aiType.length > 0 && form.aiRealness.length > 0;
    return true;
  }

  function next() {
    if (canAdvance()) setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/stickies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to post');
      const sticky: Sticky = await res.json();
      localStorage.setItem('workshopName', form.authorName);
      onSubmit(sticky);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const previewColor = SENTIMENT_COLORS[form.sentiment] ?? '#FEF9C3';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100">
          <div
            className="h-full bg-amber-500 transition-all duration-400"
            style={{ width: `${((step + 1) / (totalSteps + 1)) * 100}%`, borderRadius: '0 4px 4px 0' }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: i === step ? '18px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: i < step ? '#f59e0b' : i === step ? '#d97706' : '#e5e7eb',
                transition: 'all 0.25s ease',
              }} />
            ))}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            style={{ width: '28px', height: '28px', fontSize: '18px', fontWeight: 700 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Step content */}
        <div key={step} className="px-6 pb-6 step-enter flex-1">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Hello! Let&apos;s start with you.</h2>
                <p className="text-sm text-gray-500">Your story will appear on the shared board.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={(e) => update('authorName', e.target.value)}
                  placeholder="e.g. Maria G."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Your role / profession</label>
                <input
                  type="text"
                  value={form.profession}
                  onChange={(e) => update('profession', e.target.value)}
                  placeholder="e.g. Nurse, Teacher, Journalist…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
                  <select
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="">Select…</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Region</label>
                  <select
                    value={form.region}
                    onChange={(e) => update('region', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  >
                    <option value="">Select…</option>
                    <option value="Urban">Urban</option>
                    <option value="Suburban">Suburban</option>
                    <option value="Rural">Rural</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Tell us your story.</h2>
                <p className="text-sm text-gray-500">This becomes the headline on your sticky note.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  I want AI to… <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.useCase}
                  onChange={(e) => update('useCase', e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="e.g. help me analyze patient X-rays faster and flag anomalies for review"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  autoFocus
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{form.useCase.length}/200</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  What specific experience made you think of this?
                  <span className="font-normal text-gray-400"> (optional)</span>
                </label>
                <textarea
                  value={form.experience}
                  onChange={(e) => update('experience', e.target.value)}
                  rows={3}
                  placeholder="e.g. Last week I spent 4 hours reviewing images that took seconds to flag…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">What kind of AI?</h2>
                <p className="text-sm text-gray-500">Pick the closest match — no wrong answers.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type of AI <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {AI_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update('aiType', t.value)}
                      className={`w-full flex items-center gap-3 border rounded-xl px-4 py-2.5 text-left transition-colors ${
                        form.aiType === t.value
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{t.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t.label}</p>
                        <p className="text-xs text-gray-500">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  This is… <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {REALNESS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => update('aiRealness', r.value)}
                      className={`w-full flex items-center gap-3 border rounded-xl px-4 py-2.5 text-left transition-colors ${
                        form.aiRealness === r.value
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-lg">{r.emoji}</span>
                      <span className="text-sm font-medium text-gray-800">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Your perspective.</h2>
                <p className="text-sm text-gray-500">How do you feel about AI&apos;s role in your world?</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  How do you feel about AI in your industry?
                </label>
                <div className="flex justify-between gap-1">
                  {SENTIMENT.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => update('sentiment', s.value)}
                      title={s.label}
                      className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border transition-all text-2xl ${
                        form.sentiment === s.value
                          ? 'border-amber-500 bg-amber-50 scale-110'
                          : 'border-gray-200 hover:border-gray-300 hover:scale-105'
                      }`}
                    >
                      {s.emoji}
                      <span className="text-xs text-gray-500 mt-1 leading-tight text-center hidden sm:block">
                        {s.label.split(' ')[s.label.split(' ').length - 1]}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Pessimistic</span>
                  <span className="text-xs text-gray-400">Optimistic</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  What pain points in your work could AI help alleviate?
                  <span className="font-normal text-gray-400"> (optional)</span>
                </label>
                <textarea
                  value={form.painPoints}
                  onChange={(e) => update('painPoints', e.target.value)}
                  rows={2}
                  placeholder="e.g. Repetitive data entry, slow report writing, translation barriers…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Any other thoughts? Before/After AI? A challenge this week?
                  <span className="font-normal text-gray-400"> (optional)</span>
                </label>
                <textarea
                  value={form.extraThoughts}
                  onChange={(e) => update('extraThoughts', e.target.value)}
                  rows={2}
                  placeholder="Before AI I had to… / After AI I can… / This week I noticed…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-0.5">Your sticky note is ready!</h2>
                <p className="text-sm text-gray-500">Here&apos;s a preview of what will appear on the board.</p>
              </div>

              {/* Sticky note preview */}
              <div
                className="rounded-sm p-4 pt-5 shadow-md mx-4 relative"
                style={{ backgroundColor: previewColor }}
              >
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2"
                  style={{ backgroundColor: '#e53e3e', borderColor: '#c53030', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                />
                <p className="text-sm font-semibold text-gray-900 leading-snug mb-3">
                  &ldquo;I want AI to {form.useCase || '…'}&rdquo;
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {form.industry && (
                    <span className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      {form.industry}
                    </span>
                  )}
                  {form.aiType && (
                    <span className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      {AI_TYPES.find((t) => t.value === form.aiType)?.emoji}{' '}
                      {AI_TYPES.find((t) => t.value === form.aiType)?.label}
                    </span>
                  )}
                  {form.aiRealness && (
                    <span className="text-xs bg-white/60 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      {REALNESS.find((r) => r.value === form.aiRealness)?.emoji}{' '}
                      {REALNESS.find((r) => r.value === form.aiRealness)?.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  {SENTIMENT.find((s) => s.value === form.sentiment)?.emoji} {form.authorName}
                  {form.profession && `, ${form.profession}`}
                </p>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pb-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={back}
              className="border border-gray-200 text-gray-600 font-semibold rounded-xl py-3 px-5 hover:bg-gray-50 transition-colors text-sm"
            >
              ← Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={next}
              disabled={!canAdvance()}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl py-3 transition-all active:scale-95 text-sm"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl py-3 transition-all active:scale-95 text-sm"
            >
              {submitting ? 'Posting…' : '📌 Pin to Board'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
