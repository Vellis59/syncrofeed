import { NextRequest, NextResponse } from "next/server";
import { getDb, persistDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const stmt = db.prepare(`SELECT * FROM articles WHERE id = ?`);
  stmt.bind([Number(id)]);
  if (!stmt.step()) return NextResponse.json({ error: "Article not found" }, { status: 404 });
  const article = stmt.getAsObject();
  stmt.free();
  return NextResponse.json(article);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const body = await req.json();

  if (body.read !== undefined) {
    db.run(`UPDATE articles SET read = ? WHERE id = ?`, [body.read ? 1 : 0, Number(id)]);
  }
  if (body.starred !== undefined) {
    db.run(`UPDATE articles SET starred = ? WHERE id = ?`, [body.starred ? 1 : 0, Number(id)]);
  }

  await persistDb();
  return NextResponse.json({ ok: true });
}
