import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const db = readDB();
  const before = db.stickies.length;
  db.stickies = db.stickies.filter((s) => s.id !== id);
  if (db.stickies.length === before) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  writeDB(db);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  const db = readDB();
  const idx = db.stickies.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (typeof body.x === 'number') db.stickies[idx].x = body.x;
  if (typeof body.y === 'number') db.stickies[idx].y = body.y;
  writeDB(db);
  return NextResponse.json(db.stickies[idx]);
}
