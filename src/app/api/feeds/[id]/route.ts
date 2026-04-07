import { NextRequest, NextResponse } from "next/server";
import { getDb, persistDb } from "@/lib/db";
import { fetchFeed } from "@/lib/feed-fetcher";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  db.run(`DELETE FROM feeds WHERE id = ?`, [Number(id)]);
  await persistDb();
  return NextResponse.json({ ok: true });
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb();
  const { id } = await params;
  const feedId = Number(id);
  const result = db.exec(`SELECT * FROM feeds WHERE id = ${feedId}`);
  if (!result.length || !result[0].values.length) return NextResponse.json({ error: "Feed not found" }, { status: 404 });

  const [row] = result[0].values;
  const feedUrl = String(row[2]);
  const parsed = await fetchFeed(feedUrl);

  const existingStmt = db.prepare(`SELECT url FROM articles WHERE feed_id = ?`);
  existingStmt.bind([feedId]);
  const existing = new Set<string>();
  while (existingStmt.step()) existing.add(String(existingStmt.get()[0]));
  existingStmt.free();

  let added = 0;
  for (const item of parsed.items.filter((i) => i.url && !existing.has(i.url))) {
    db.run(
      `INSERT INTO articles (feed_id, title, url, content, summary, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [feedId, item.title, item.url, item.content || null, item.summary || null, item.author || null, item.publishedAt ? Math.floor(item.publishedAt.getTime() / 1000) : null]
    );
    added++;
  }

  db.run(`UPDATE feeds SET last_fetched_at = ? WHERE id = ?`, [Math.floor(Date.now() / 1000), feedId]);
  await persistDb();
  return NextResponse.json({ added });
}
