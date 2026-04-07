import { Feed, Article } from "./types";

const API_BASE = "/api";

async function readApiResponse<T>(res: Response, fallback: string): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message = typeof payload === "string"
      ? payload.slice(0, 300) || fallback
      : payload?.error || fallback;
    throw new Error(message);
  }

  if (typeof payload === "string") {
    throw new Error(fallback);
  }

  return payload as T;
}

export async function fetchFeeds(): Promise<Feed[]> {
  const res = await fetch(`${API_BASE}/feeds`);
  return readApiResponse<Feed[]>(res, "Failed to fetch feeds");
}

export async function addFeed(url: string): Promise<Feed> {
  const res = await fetch(`${API_BASE}/feeds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return readApiResponse<Feed>(res, "Failed to add feed");
}

export async function deleteFeed(id: number): Promise<void> {
  await fetch(`${API_BASE}/feeds/${id}`, { method: "DELETE" });
}

export async function refreshFeed(id: number): Promise<{ added: number }> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, { method: "POST" });
  return readApiResponse<{ added: number }>(res, "Failed to refresh feed");
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
  return readApiResponse<Article[]>(res, "Failed to fetch articles");
}

export async function fetchArticle(id: number): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`);
  return readApiResponse<Article>(res, "Failed to fetch article");
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
