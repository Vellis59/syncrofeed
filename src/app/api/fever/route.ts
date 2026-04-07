import { NextRequest, NextResponse } from "next/server";
import {
  validateFeverAuth,
  feverAuthToken,
  getFeverFeeds,
  getFeverFavicons,
  getFeverItems,
  getFeverGroups,
  getFeverLinks,
} from "@/lib/fever";
import { getDb } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function parseIds(value: string | null): number[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => Number(v.trim()))
    .filter(Boolean);
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const apiKey = form.get("api_key")?.toString() || null;

  // Auth check endpoint
  if (form.get("api") !== null && form.get("groups") === null && form.get("feeds") === null && form.get("items") === null && form.get("mark") === null) {
    const authenticated = validateFeverAuth(apiKey);
    return NextResponse.json({
      api_version: 3,
      auth: authenticated ? 1 : 0,
    });
  }

  if (!validateFeverAuth(apiKey)) {
    return NextResponse.json({
      api_version: 3,
      auth: 0,
      error: "Invalid API key",
    }, { status: 403 });
  }

  // Mark item as read/unread/saved/unsaved
  const mark = form.get("mark")?.toString();
  const id = form.get("id")?.toString();
  const as = form.get("as")?.toString();

  if (mark === "item" && id && as) {
    const articleId = Number(id);
    const db = getDb();

    if (as === "read") {
      await db.update(articles).set({ read: true }).where(eq(articles.id, articleId));
    } else if (as === "unread") {
      await db.update(articles).set({ read: false }).where(eq(articles.id, articleId));
    } else if (as === "saved") {
      await db.update(articles).set({ starred: true }).where(eq(articles.id, articleId));
    } else if (as === "unsaved") {
      await db.update(articles).set({ starred: false }).where(eq(articles.id, articleId));
    }

    return NextResponse.json({ api_version: 3, auth: 1 });
  }

  const response: Record<string, unknown> = {
    api_version: 3,
    auth: 1,
    last_refreshed_on_time: String(Math.floor(Date.now() / 1000)),
  };

  if (form.get("feeds") !== null) {
    response.feeds = await getFeverFeeds();
    response.feeds_groups = [];
  }

  if (form.get("favicons") !== null) {
    response.favicons = await getFeverFavicons();
  }

  if (form.get("groups") !== null) {
    response.groups = await getFeverGroups();
  }

  if (form.get("links") !== null) {
    response.links = await getFeverLinks();
  }

  if (form.get("items") !== null) {
    response.items = await getFeverItems({
      sinceId: form.get("since_id") ? Number(form.get("since_id")?.toString()) : undefined,
      maxId: form.get("max_id") ? Number(form.get("max_id")?.toString()) : undefined,
      withIds: parseIds(form.get("with_ids")?.toString() || null),
    });
  }

  response.saved_item_ids = [];
  response.read_item_ids = [];

  return NextResponse.json(response);
}

export async function GET() {
  return NextResponse.json({
    message: "Fever API endpoint. Use POST with ?api or form-data per Fever spec.",
    demo_api_key: feverAuthToken(),
  });
}
