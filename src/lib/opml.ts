import { parseStringPromise, Builder } from "xml2js";
import { getDb } from "./db";
import { feeds } from "./db/schema";
import { eq } from "drizzle-orm";
import { fetchFeed } from "./feed-fetcher";

interface OpmlOutline {
  $: {
    text?: string;
    title?: string;
    xmlUrl?: string;
    htmlUrl?: string;
    type?: string;
  };
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
      if (outline.$.xmlUrl) {
        feedList.push({
          title: outline.$.title || outline.$.text || outline.$.xmlUrl || "",
          url: outline.$.xmlUrl,
          siteUrl: outline.$.htmlUrl,
        });
      }
      if (outline.outline) {
        extractFeeds(Array.isArray(outline.outline) ? outline.outline : [outline.outline]);
      }
    }
  }

  extractFeeds(Array.isArray(body) ? body : body ? [body] : []);
  if (feedList.length === 0) {
    throw new Error("No feeds found in OPML file");
  }
  return { title, feeds: feedList };
}

export async function importOpml(xml: string): Promise<{ imported: number; skipped: number; errors: string[] }> {
  const { feeds: feedList } = await parseOpml(xml);
  const db = getDb();
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;

  for (const feed of feedList) {
    try {
      // Check if already exists
      const existing = await db.select().from(feeds).where(eq(feeds.url, feed.url));
      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Try to fetch and add
      const parsed = await fetchFeed(feed.url);
      await db.insert(feeds).values({
        title: parsed.title || feed.title,
        url: feed.url,
        siteUrl: parsed.siteUrl || feed.siteUrl,
        description: parsed.description,
        lastFetchedAt: new Date(),
      });
      imported++;
    } catch (err) {
      errors.push(`${feed.url}: ${err instanceof Error ? err.message : "Failed"}`);
      // Still add with metadata from OPML even if fetch fails
      try {
        await db.insert(feeds).values({
          title: feed.title,
          url: feed.url,
          siteUrl: feed.siteUrl,
        });
        imported++;
      } catch {
        skipped++;
      }
    }
  }

  return { imported, skipped, errors };
}

export async function generateOpml(): Promise<string> {
  const db = getDb();
  const allFeeds = await db.select().from(feeds).orderBy(feeds.title);

  const outlines = allFeeds.map((feed) => ({
    $: {
      type: "rss",
      text: feed.title,
      title: feed.title,
      xmlUrl: feed.url,
      htmlUrl: feed.siteUrl || "",
    },
  }));

  const opml = {
    xml: { $: { version: "1.0", encoding: "UTF-8" } },
    opml: {
      $: { version: "2.0" },
      head: {
        title: "Syncrofeed Subscriptions",
      },
      body: { outline: outlines },
    },
  };

  const builder = new Builder({ xmldec: { version: "1.0", encoding: "UTF-8" } });
  return builder.buildObject(opml);
}
