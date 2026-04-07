import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const feedId = searchParams.get("feed_id");
    const starred = searchParams.get("starred");
    const unread = searchParams.get("unread");

    const conditions: string[] = [];
    if (feedId) conditions.push(`articles.feed_id = ${Number(feedId)}`);
    if (starred === "true") conditions.push(`articles.starred = 1`);
    if (unread === "true") conditions.push(`articles.read = 0`);
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT articles.id, articles.feed_id as feedId, articles.title, articles.url, articles.content, articles.summary,
             articles.author, articles.published_at as publishedAt, articles.read, articles.starred,
             feeds.title as feedTitle
      FROM articles
      LEFT JOIN feeds ON articles.feed_id = feeds.id
      ${where}
      ORDER BY articles.published_at DESC
      LIMIT 100
    `;

    const stmt = db.prepare(query);
    const articles = [];
    while (stmt.step()) articles.push(stmt.getAsObject());
    stmt.free();
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch articles" }, { status: 500 });
  }
}
