"use client";

import { useState, useEffect, useCallback } from "react";
import { Feed, Article } from "@/lib/types";
import {
  fetchFeeds,
  fetchArticles,
  fetchArticle,
  addFeed,
  deleteFeed,
  refreshFeed,
  updateArticle,
} from "@/lib/api";
import { Sidebar } from "@/components/sidebar";
import { ArticleList } from "@/components/article-list";
import { ArticleReader } from "@/components/article-reader";
import { AddFeedDialog } from "@/components/add-feed-dialog";

export default function AppPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedFeed, setSelectedFeed] = useState<number | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadFeeds = useCallback(async () => {
    const data = await fetchFeeds();
    setFeeds(data);
  }, []);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    const data = await fetchArticles({
      feedId: selectedFeed || undefined,
      starred: filterStarred || undefined,
      unread: filterUnread || undefined,
    });
    setArticles(data);
    setLoading(false);
  }, [selectedFeed, filterStarred, filterUnread]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleAddFeed = async (url: string) => {
    await addFeed(url);
    setShowAddFeed(false);
    await loadFeeds();
    await loadArticles();
  };

  const handleDeleteFeed = async (id: number) => {
    if (!confirm("Delete this feed and all its articles?")) return;
    await deleteFeed(id);
    if (selectedFeed === id) setSelectedFeed(null);
    await loadFeeds();
    await loadArticles();
  };

  const handleRefreshFeed = async (id: number) => {
    const result = await refreshFeed(id);
    await loadFeeds();
    await loadArticles();
    alert(`${result.added} new article(s) found`);
  };

  const handleRefreshAll = async () => {
    const res = await fetch("/api/feeds/refresh-all", { method: "POST" });
    const data = await res.json();
    await loadFeeds();
    await loadArticles();
    if (data.errors?.length) {
      alert(`Refreshed. ${data.totalAdded} new articles. ${data.errors.length} feed(s) failed.`);
    } else {
      alert(`Refreshed. ${data.totalAdded} new articles.`);
    }
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/articles/mark-all-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedId: selectedFeed }),
    });
    await loadArticles();
  };

  const handleSelectArticle = async (id: number) => {
    const article = await fetchArticle(id);
    setSelectedArticle(article);
    if (!article.read) {
      await updateArticle(id, { read: true });
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: true } : a))
      );
    }
  };

  const handleToggleStar = async (id: number) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;
    const newStarred = !article.starred;
    await updateArticle(id, { starred: newStarred });
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, starred: newStarred } : a))
    );
    if (selectedArticle?.id === id) {
      setSelectedArticle((prev) => (prev ? { ...prev, starred: newStarred } : null));
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {/* Sidebar */}
      <Sidebar
        feeds={feeds}
        selectedFeed={selectedFeed}
        onSelectFeed={setSelectedFeed}
        onAddFeed={() => setShowAddFeed(true)}
        onDeleteFeed={handleDeleteFeed}
        onRefreshFeed={handleRefreshFeed}
        onRefreshAll={handleRefreshAll}
        onMarkAllRead={handleMarkAllRead}
        onImportComplete={async () => {
          await loadFeeds();
          await loadArticles();
        }}
        filterUnread={filterUnread}
        filterStarred={filterStarred}
        onToggleUnread={() => setFilterUnread(!filterUnread)}
        onToggleStarred={() => setFilterStarred(!filterStarred)}
        onClearFilter={() => {
          setSelectedFeed(null);
          setFilterUnread(false);
          setFilterStarred(false);
        }}
      />

      {/* Article List */}
      <ArticleList
        articles={articles}
        selectedArticleId={selectedArticle?.id ?? null}
        onSelectArticle={handleSelectArticle}
        onToggleStar={handleToggleStar}
        loading={loading}
      />

      {/* Reader */}
      <ArticleReader
        article={selectedArticle}
        onToggleStar={() =>
          selectedArticle && handleToggleStar(selectedArticle.id)
        }
        onClose={() => setSelectedArticle(null)}
      />

      {/* Add Feed Dialog */}
      {showAddFeed && (
        <AddFeedDialog
          onAdd={handleAddFeed}
          onClose={() => setShowAddFeed(false)}
        />
      )}
    </div>
  );
}
