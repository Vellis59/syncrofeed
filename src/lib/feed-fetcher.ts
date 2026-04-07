import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Syncrofeed/1.0 (RSS Reader)",
  },
});

export interface ParsedFeed {
  title: string;
  description?: string;
  siteUrl?: string;
  iconUrl?: string;
  items: ParsedArticle[];
}

export interface ParsedArticle {
  title: string;
  url: string;
  content?: string;
  summary?: string;
  author?: string;
  publishedAt?: Date;
}

export async function fetchFeed(url: string): Promise<ParsedFeed> {
  const parsed = await parser.parseURL(url);

  return {
    title: parsed.title || url,
    description: parsed.description,
    siteUrl: parsed.link,
    items: (parsed.items || []).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "",
      content: item["content:encoded"] || item.content || item.summary,
      summary: item.contentSnippet,
      author: item.creator || item.author,
      publishedAt: item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : new Date(),
    })),
  };
}

export async function discoverFeedUrl(siteUrl: string): Promise<string | null> {
  try {
    const parsed = await parser.parseURL(siteUrl);
    if (parsed?.items?.length) return siteUrl;
  } catch {
    // Not a feed, try to discover
  }

  try {
    const res = await fetch(siteUrl, {
      headers: { "User-Agent": "Syncrofeed/1.0" },
    });
    const html = await res.text();

    // Look for <link rel="alternate" type="application/rss+xml" ...>
    const rssMatch = html.match(/<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i);
    if (rssMatch) {
      const href = rssMatch[1];
      return href.startsWith("http") ? href : new URL(href, siteUrl).toString();
    }

    // Look for Atom
    const atomMatch = html.match(/<link[^>]+type=["']application\/atom\+xml["'][^>]+href=["']([^"']+)["']/i);
    if (atomMatch) {
      const href = atomMatch[1];
      return href.startsWith("http") ? href : new URL(href, siteUrl).toString();
    }

    // Common paths
    const commonPaths = ["/feed", "/rss", "/feed.xml", "/index.xml", "/atom.xml"];
    for (const p of commonPaths) {
      try {
        const testUrl = new URL(p, siteUrl).toString();
        await parser.parseURL(testUrl);
        return testUrl;
      } catch {
        continue;
      }
    }
  } catch {
    // Can't fetch the site
  }

  return null;
}
