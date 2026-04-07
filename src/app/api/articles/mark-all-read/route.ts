import { NextRequest, NextResponse } from "next/server";
import { getDb, persistDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json().catch(() => ({}));
  const feedId = body?.feedId ? Number(body.feedId) : null;

  if (feedId) {
    db.run(`UPDATE articles SET read = 1 WHERE feed_id = ?`, [feedId]);
  } else {
    db.run(`UPDATE articles SET read = 1 WHERE read = 0`);
  }

  await persistDb();
  return NextResponse.json({ ok: true });
}