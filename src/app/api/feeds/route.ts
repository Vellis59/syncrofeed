import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { feeds, articles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchFeed, discoverFeedUrl } from "@/lib/feed-fetcher";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();
  const allFeeds = await db.select().from(feeds).orderBy(feeds.title);
  return NextResponse.json(allFeeds);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();
  const { url } = body;

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Try direct feed URL first, then auto-discover
    let feedUrl = url;
    try {
      await fetchFeed(url);
    } catch {
      const discovered = await discoverFeedUrl(url);
      if (!discovered) {
        return NextResponse.json({ error: "Could not find a feed at this URL" }, { status: 422 });
      }
      feedUrl = discovered;
    }

    const parsed = await fetchFeed(feedUrl);

    const [feed] = await db
      .insert(feeds)
      .values({
        title: parsed.title,
        url: feedUrl,
        siteUrl: parsed.siteUrl,
        description: parsed.description,
        lastFetchedAt: new Date(),
      })
      .returning();

    if (parsed.items.length > 0) {
      await db.insert(articles).values(
        parsed.items
          .filter((item) => item.url)
          .map((item) => ({
            feedId: feed.id,
            title: item.title,
            url: item.url,
            content: item.content,
            summary: item.summary,
            author: item.author,
            publishedAt: item.publishedAt,
          }))
      );
    }

    return NextResponse.json(feed, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch feed";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
