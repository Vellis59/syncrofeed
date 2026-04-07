import { NextRequest, NextResponse } from "next/server";
import { getDb, persistDb } from "@/lib/db";
import { fetchFeed, discoverFeedUrl } from "@/lib/feed-fetcher";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const stmt = db.prepare("SELECT * FROM feeds ORDER BY title ASC");
    const feeds = [];
    while (stmt.step()) feeds.push(stmt.getAsObject());
    stmt.free();
    return NextResponse.json(feeds);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch feeds" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    let feedUrl = url;
    try {
      await fetchFeed(url);
    } catch {
      const discovered = await discoverFeedUrl(url);
      if (!discovered) return NextResponse.json({ error: "Could not find a feed at this URL" }, { status: 422 });
      feedUrl = discovered;
    }

    const parsed = await fetchFeed(feedUrl);
    const db = await getDb();
    db.run(
      `INSERT INTO feeds (title, url, site_url, description, last_fetched_at) VALUES (?, ?, ?, ?, ?)`,
      [parsed.title, feedUrl, parsed.siteUrl || null, parsed.description || null, Math.floor(Date.now() / 1000)]
    );

    const idResult = db.exec("SELECT last_insert_rowid() as id");
    const feedId = Number(idResult[0].values[0][0]);

    for (const item of parsed.items.filter((i) => i.url)) {
      db.run(
        `INSERT INTO articles (feed_id, title, url, content, summary, author, published_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [feedId, item.title, item.url, item.content || null, item.summary || null, item.author || null, item.publishedAt ? Math.floor(item.publishedAt.getTime() / 1000) : null]
      );
    }

    await persistDb();

    return NextResponse.json({ id: feedId, title: parsed.title, url: feedUrl, siteUrl: parsed.siteUrl || null, description: parsed.description || null }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to add feed" }, { status: 422 });
  }
}
