import { NextResponse } from "next/server";
import { getDb, persistDb } from "@/lib/db";
import { fetchFeed } from "@/lib/feed-fetcher";

export const dynamic = "force-dynamic";

export async function POST() {
  const db = await getDb();
  const stmt = db.prepare(`SELECT id, url FROM feeds`);
  const feeds = [] as { id: number; url: string }[];
  while (stmt.step()) {
    const row = stmt.getAsObject() as any;
    feeds.push({ id: Number(row.id), url: String(row.url) });
  }
  stmt.free();

  const results = [] as { feedId: number; added: number; error?: string }[];

  for (const feed of feeds) {
    try {
      const parsed = await fetchFeed(feed.url);
      const existingStmt = db.prepare(`SELECT url FROM articles WHERE feed_id = ?`);
      existingStmt.bind([feed.id]);
      const existing = new Set<string>();
      while (existingStmt.step()) existing.add(String(existingStmt.get()[0]));
      existingStmt.free();

      let added = 0;
      for (const item of parsed.items.filter((i) => i.url && !existing.has(i.url))) {
        db.run(
          `INSERT INTO articles (feed_id, title, url, content, summary, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [feed.id, item.title, item.url, item.content || null, item.summary || null, item.author || null, item.publishedAt ? Math.floor(item.publishedAt.getTime() / 1000) : null]
        );
        added++;
      }
      db.run(`UPDATE feeds SET last_fetched_at = ? WHERE id = ?`, [Math.floor(Date.now() / 1000), feed.id]);
      results.push({ feedId: feed.id, added });
    } catch (err) {
      results.push({ feedId: feed.id, added: 0, error: err instanceof Error ? err.message : "Failed" });
    }
  }

  await persistDb();
  const totalAdded = results.reduce((sum, r) => sum + r.added, 0);
  const errors = results.filter((r) => r.error);
  return NextResponse.json({ ok: true, totalAdded, errors: errors.length > 0 ? errors : undefined });
}