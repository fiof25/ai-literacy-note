import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import type { Comment } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.text?.trim()) {
    return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
  }

  const db = readDB();
  const stickyIndex = db.stickies.findIndex((s) => s.id === id);

  if (stickyIndex === -1) {
    return NextResponse.json({ error: 'Sticky not found' }, { status: 404 });
  }

  const comment: Comment = {
    id: crypto.randomUUID(),
    author: (body.author || 'Anonymous').trim(),
    text: body.text.trim(),
    createdAt: new Date().toISOString(),
  };

  db.stickies[stickyIndex].comments.push(comment);
  writeDB(db);

  return NextResponse.json(comment, { status: 201 });
}
