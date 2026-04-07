import { parseStringPromise, Builder } from "xml2js";
import { getDb, persistDb } from "./db";
import { fetchFeed } from "./feed-fetcher";

interface OpmlOutline {
  $: { text?: string; title?: string; xmlUrl?: string; htmlUrl?: string; type?: string };
  outline?: OpmlOutline[];
}

export async function parseOpml(xml: string): Promise<{ title: string; feeds: { title: string; url: string; siteUrl?: string }[] }> {
  const result = await parseStringPromise(xml, { explicitArray: false });
  const opml = result.opml || result.OPML;
  const title = opml?.head?.title || "Imported OPML";
  const body = opml?.body?.outline || [];
  const feedList: { title: string; url: string; siteUrl?: string }[] = [];

  function extractFeeds(outlines: OpmlOutline[]) {
    for (const outline of outlines.filter(Boolean)) {
      if (!outline?.$) continue;
      if (outline.$.xmlUrl) feedList.push({ title: outline.$.title || outline.$.text || outline.$.xmlUrl, url: outline.$.xmlUrl, siteUrl: outline.$.htmlUrl });
      if (outline.outline) extractFeeds(Array.isArray(outline.outline) ? outline.outline : [outline.outline]);
    }
  }

  extractFeeds(Array.isArray(body) ? body : body ? [body] : []);
  if (feedList.length === 0) throw new Error("No feeds found in OPML file");
  return { title, feeds: feedList };
}

export async function importOpml(xml: string) {
  const { feeds } = await parseOpml(xml);
  const db = await getDb();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (const feed of feeds) {
    const exists = db.exec(`SELECT id FROM feeds WHERE url = '${feed.url.replace(/'/g, "''")}' LIMIT 1`);
    if (exists.length && exists[0].values.length) {
      skipped++;
      continue;
    }
    try {
      const parsed = await fetchFeed(feed.url);
      db.run(`INSERT INTO feeds (title, url, site_url, description, last_fetched_at) VALUES (?, ?, ?, ?, ?)`, [parsed.title || feed.title, feed.url, parsed.siteUrl || feed.siteUrl || null, parsed.description || null, Math.floor(Date.now() / 1000)]);
      imported++;
    } catch (err) {
      errors.push(`${feed.url}: ${err instanceof Error ? err.message : "Failed"}`);
      try {
        db.run(`INSERT INTO feeds (title, url, site_url) VALUES (?, ?, ?)`, [feed.title, feed.url, feed.siteUrl || null]);
        imported++;
      } catch {
        skipped++;
      }
    }
  }

  await persistDb();
  return { imported, skipped, errors };
}

export async function generateOpml(): Promise<string> {
  const db = await getDb();
  const stmt = db.prepare(`SELECT * FROM feeds ORDER BY title ASC`);
  const outlines = [] as any[];
  while (stmt.step()) {
    const feed = stmt.getAsObject();
    outlines.push({ $: { type: "rss", text: feed.title, title: feed.title, xmlUrl: feed.url, htmlUrl: feed.site_url || "" } });
  }
  stmt.free();

  const builder = new Builder({ xmldec: { version: "1.0", encoding: "UTF-8" } });
  return builder.buildObject({ opml: { $: { version: "2.0" }, head: { title: "Syncrofeed Subscriptions" }, body: { outline: outlines } } });
}
