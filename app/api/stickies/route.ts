import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import type { Sticky } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SENTIMENT_COLORS: Record<string, string> = {
  '-2': '#DBEAFE',
  '-1': '#EDE9FE',
  '0': '#D1FAE5',
  '1': '#FEF9C3',
  '2': '#FDE68A',
};

export async function GET() {
  const db = readDB();
  const sorted = [...db.stickies].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json(sorted);
}

export async function POST(request: Request) {
  const body = await request.json();
  const db = readDB();

  const sentiment = Number(body.sentiment ?? 0);
  const rotation = parseFloat((Math.random() * 8 - 4).toFixed(2));

  const newSticky: Sticky = {
    id: crypto.randomUUID(),
    authorName: (body.authorName || 'Anonymous').trim(),
    profession: (body.profession || '').trim(),
    industry: (body.industry || '').trim(),
    region: (body.region || '').trim(),
    useCase: (body.useCase || '').trim(),
    experience: (body.experience || '').trim(),
    aiType: body.aiType || 'unsure',
    aiRealness: body.aiRealness || 'imagined',
    sentiment: sentiment as Sticky['sentiment'],
    painPoints: (body.painPoints || '').trim(),
    extraThoughts: (body.extraThoughts || '').trim(),
    color: SENTIMENT_COLORS[String(sentiment)] ?? '#FEF9C3',
    rotation,
    comments: [],
    createdAt: new Date().toISOString(),
  };

  db.stickies.push(newSticky);
  writeDB(db);

  return NextResponse.json(newSticky, { status: 201 });
}
