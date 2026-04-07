"use client";

import { Article } from "@/lib/types";

interface ArticleListProps {
  articles: Article[];
  selectedArticleId: number | null;
  onSelectArticle: (id: number) => void;
  onToggleStar: (id: number) => void;
  loading: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHrs = Math.floor(diffMs / 3600000);

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffHrs < 48) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ArticleList({
  articles,
  selectedArticleId,
  onSelectArticle,
  onToggleStar,
  loading,
}: ArticleListProps) {
  if (loading) {
    return (
      <div className="w-96 border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
        <p className="text-zinc-400 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-96 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h2 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider">
          {articles.length} Article{articles.length !== 1 ? "s" : ""}
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-zinc-400 text-sm">No articles found</p>
            <p className="text-zinc-400 text-xs mt-1">
              Add a feed to get started
            </p>
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article.id}
              onClick={() => onSelectArticle(article.id)}
              className={`px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 cursor-pointer transition ${
                selectedArticleId === article.id
                  ? "bg-blue-50 dark:bg-blue-950/30"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
              } ${article.read ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className={`text-sm leading-snug mb-1 ${
                      article.read ? "font-normal" : "font-semibold"
                    }`}
                  >
                    {article.title}
                  </h3>
                  {article.summary && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-400">
                    {article.feedTitle && (
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                        {article.feedTitle}
                      </span>
                    )}
                    {article.author && <span>by {article.author}</span>}
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(article.id);
                  }}
                  className="shrink-0 text-lg leading-none"
                >
                  {article.starred ? "⭐" : "☆"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
