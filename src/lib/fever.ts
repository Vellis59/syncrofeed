import { getDb } from "./db";
import { feeds, articles, collections } from "./db/schema";
import { eq, desc } from "drizzle-orm";
import crypto from "crypto";

function getApiPassword() {
  return process.env.SYNCROFEED_FEVER_PASSWORD || process.env.PANELIO_ADMIN_PASSWORD || "changeme";
}

export function feverAuthToken(): string {
  const username = "admin";
  const password = getApiPassword();
  return crypto.createHash("md5").update(`${username}:${password}`).digest("hex");
}

export function validateFeverAuth(apiKey?: string | null): boolean {
  if (!apiKey) return false;
  return apiKey === feverAuthToken();
}

export async function getFeverFeeds() {
  const db = getDb();
  const allFeeds = await db.select().from(feeds).orderBy(feeds.title);

  return allFeeds.map((feed) => ({
    id: String(feed.id),
    favicon_id: String(feed.id),
    title: feed.title,
    url: feed.url,
    site_url: feed.siteUrl || feed.url,
    is_spark: 0,
    last_updated_on_time: feed.lastFetchedAt
      ? String(Math.floor(new Date(feed.lastFetchedAt).getTime() / 1000))
      : "0",
  }));
}

export async function getFeverFavicons() {
  const db = getDb();
  const allFeeds = await db.select().from(feeds).orderBy(feeds.title);

  return allFeeds.map((feed) => ({
    id: String(feed.id),
    data: feed.iconUrl || "/favicon.ico",
  }));
}

export async function getFeverItems(options?: {
  sinceId?: number;
  maxId?: number;
  withIds?: number[];
}) {
  const db = getDb();
  let items = await db
    .select()
    .from(articles)
    .orderBy(desc(articles.publishedAt))
    .limit(50);

  if (options?.sinceId) {
    items = items.filter((item) => item.id > options.sinceId!);
  }

  if (options?.maxId) {
    items = items.filter((item) => item.id <= options.maxId!);
  }

  if (options?.withIds?.length) {
    const ids = new Set(options.withIds);
    items = items.filter((item) => ids.has(item.id));
  }

  return items.map((item) => ({
    id: String(item.id),
    feed_id: String(item.feedId),
    title: item.title,
    author: item.author || "",
    html: item.content || item.summary || "",
    url: item.url,
    is_saved: item.starred ? 1 : 0,
    is_read: item.read ? 1 : 0,
    created_on_time: item.publishedAt
      ? String(Math.floor(new Date(item.publishedAt).getTime() / 1000))
      : String(Math.floor(new Date(item.createdAt).getTime() / 1000)),
  }));
}

export async function getFeverGroups() {
  const db = getDb();
  const allCollections = await db.select().from(collections).orderBy(collections.name);

  return allCollections.map((group) => ({
    id: String(group.id),
    title: group.name,
  }));
}

export async function getFeverLinks() {
  return [];
}
