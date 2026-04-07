import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { articles, feeds } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const feedId = searchParams.get("feed_id");
    const starred = searchParams.get("starred");
    const unread = searchParams.get("unread");

    const conditions = [];
    if (feedId) conditions.push(eq(articles.feedId, Number(feedId)));
    if (starred === "true") conditions.push(eq(articles.starred, true));
    if (unread === "true") conditions.push(eq(articles.read, false));

    const result = await db
      .select({
        id: articles.id,
        title: articles.title,
        url: articles.url,
        summary: articles.summary,
        author: articles.author,
        publishedAt: articles.publishedAt,
        read: articles.read,
        starred: articles.starred,
        feedTitle: feeds.title,
        feedId: articles.feedId,
      })
      .from(articles)
      .leftJoin(feeds, eq(articles.feedId, feeds.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(articles.publishedAt))
      .limit(100);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
