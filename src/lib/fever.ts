import { getDb, persistDb } from "./db";
import crypto from "crypto";

function getApiPassword() {
  return process.env.SYNCROFEED_FEVER_PASSWORD || process.env.PANELIO_ADMIN_PASSWORD || "changeme";
}

export function feverAuthToken(): string {
  return crypto.createHash("md5").update(`admin:${getApiPassword()}`).digest("hex");
}

export function validateFeverAuth(apiKey?: string | null) {
  return !!apiKey && apiKey === feverAuthToken();
}

export async function getFeverFeeds() {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM feeds ORDER BY title ASC`);
  const out = [] as any[];
  while (stmt.step()) {
    const feed = stmt.getAsObject();
    out.push({ id: String(feed.id), favicon_id: String(feed.id), title: feed.title, url: feed.url, site_url: feed.site_url || feed.url, is_spark: 0, last_updated_on_time: String(feed.last_fetched_at || 0) });
  }
  stmt.free();
  return out;
}

export async function getFeverFavicons() {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM feeds ORDER BY title ASC`);
  const out = [] as any[];
  while (stmt.step()) {
    const feed = stmt.getAsObject();
    out.push({ id: String(feed.id), data: feed.icon_url || "/favicon.ico" });
  }
  stmt.free();
  return out;
}

export async function getFeverItems(options?: { sinceId?: number; maxId?: number; withIds?: number[] }) {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM articles ORDER BY published_at DESC LIMIT 50`);
  const out = [] as any[];
  while (stmt.step()) {
    const item = stmt.getAsObject() as any;
    if (options?.sinceId && Number(item.id) <= options.sinceId) continue;
    if (options?.maxId && Number(item.id) > options.maxId) continue;
    if (options?.withIds?.length && !options.withIds.includes(Number(item.id))) continue;
    out.push({ id: String(item.id), feed_id: String(item.feed_id), title: item.title, author: item.author || "", html: item.content || item.summary || "", url: item.url, is_saved: item.starred ? 1 : 0, is_read: item.read ? 1 : 0, created_on_time: String(item.published_at || item.created_at || 0) });
  }
  stmt.free();
  return out;
}

export async function getFeverGroups() {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM collections ORDER BY name ASC`);
  const out = [] as any[];
  while (stmt.step()) {
    const group = stmt.getAsObject();
    out.push({ id: String(group.id), title: group.name });
  }
  stmt.free();
  return out;
}

export async function getFeverLinks() {
  return [];
}

export async function markFeverItem(id: number, as: string) {
  const db = await getDb();
  if (as === "read") db.run(`UPDATE articles SET read = 1 WHERE id = ?`, [id]);
  else if (as === "unread") db.run(`UPDATE articles SET read = 0 WHERE id = ?`, [id]);
  else if (as === "saved") db.run(`UPDATE articles SET starred = 1 WHERE id = ?`, [id]);
  else if (as === "unsaved") db.run(`UPDATE articles SET starred = 0 WHERE id = ?`, [id]);
  await persistDb();
}
