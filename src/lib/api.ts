import { Feed, Article } from "./types";

const API_BASE = "/api";

export async function fetchFeeds(): Promise<Feed[]> {
  const res = await fetch(`${API_BASE}/feeds`);
  if (!res.ok) throw new Error(`Failed to fetch feeds: ${res.status}`);
  return res.json();
}

export async function addFeed(url: string): Promise<Feed> {
  const res = await fetch(`${API_BASE}/feeds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add feed");
  }
  return res.json();
}

export async function deleteFeed(id: number): Promise<void> {
  await fetch(`${API_BASE}/feeds/${id}`, { method: "DELETE" });
}

export async function refreshFeed(id: number): Promise<{ added: number }> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, { method: "POST" });
  return res.json();
}

export async function fetchArticles(params?: {
  feedId?: number;
  starred?: boolean;
  unread?: boolean;
}): Promise<Article[]> {
  const searchParams = new URLSearchParams();
  if (params?.feedId) searchParams.set("feed_id", String(params.feedId));
  if (params?.starred) searchParams.set("starred", "true");
  if (params?.unread) searchParams.set("unread", "true");
  const res = await fetch(`${API_BASE}/articles?${searchParams}`);
  if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
  return res.json();
}

export async function fetchArticle(id: number): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
  return res.json();
}

export async function updateArticle(
  id: number,
  data: { read?: boolean; starred?: boolean }
): Promise<void> {
  await fetch(`${API_BASE}/articles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
