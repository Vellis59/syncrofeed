import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { feeds, articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { fetchFeed } from "@/lib/feed-fetcher";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  await db.delete(feeds).where(eq(feeds.id, Number(id)));
  return NextResponse.json({ ok: true });
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const feedId = Number(id);

  const [feed] = await db.select().from(feeds).where(eq(feeds.id, feedId));
  if (!feed) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }

  const parsed = await fetchFeed(feed.url);

  const existing = await db
    .select({ url: articles.url })
    .from(articles)
    .where(eq(articles.feedId, feedId));
  const existingUrls = new Set(existing.map((a) => a.url));

  const newItems = parsed.items.filter((item) => item.url && !existingUrls.has(item.url));

  if (newItems.length > 0) {
    await db.insert(articles).values(
      newItems.map((item) => ({
        feedId,
        title: item.title,
        url: item.url,
        content: item.content,
        summary: item.summary,
        author: item.author,
        publishedAt: item.publishedAt,
      }))
    );
  }

  await db
    .update(feeds)
    .set({ lastFetchedAt: new Date() })
    .where(eq(feeds.id, feedId));

  return NextResponse.json({ added: newItems.length });
}
