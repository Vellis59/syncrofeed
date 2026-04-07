"use client";

import { Article } from "@/lib/types";

interface ArticleReaderProps {
  article: Article | null;
  onToggleStar: () => void;
  onClose: () => void;
}

export function ArticleReader({
  article,
  onToggleStar,
  onClose,
}: ArticleReaderProps) {
  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-5xl mb-4">📖</p>
          <p className="text-zinc-400 text-lg">Select an article to read</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-sm"
          >
            ✕
          </button>
          <span className="text-xs text-zinc-400">
            {article.feedTitle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleStar}
            className="text-lg"
          >
            {article.starred ? "⭐" : "☆"}
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 hover:underline"
          >
            Open original ↗
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <article className="max-w-2xl mx-auto px-6 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold leading-tight mb-3">
              {article.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              {article.author && <span>By {article.author}</span>}
              {article.publishedAt && (
                <span>
                  {new Date(article.publishedAt).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </header>

          {article.content ? (
            <div
              className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-500 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <p className="text-zinc-400">
              No content available.{" "}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Read on the original site ↗
              </a>
            </p>
          )}
        </article>
      </div>
    </div>
  );
}
