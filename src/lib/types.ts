export interface Feed {
  id: number;
  title: string;
  url: string;
  siteUrl: string | null;
  description: string | null;
  iconUrl: string | null;
  lastFetchedAt: string | null;
}

export interface Article {
  id: number;
  feedId: number;
  title: string;
  url: string;
  content: string | null;
  summary: string | null;
  author: string | null;
  publishedAt: string | null;
  read: boolean;
  starred: boolean;
  feedTitle: string | null;
}
