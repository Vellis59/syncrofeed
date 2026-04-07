"use client";

import { Feed } from "@/lib/types";

interface SidebarProps {
  feeds: Feed[];
  selectedFeed: number | null;
  onSelectFeed: (id: number | null) => void;
  onAddFeed: () => void;
  onDeleteFeed: (id: number) => void;
  onRefreshFeed: (id: number) => void;
  onImportComplete: () => void;
  filterUnread: boolean;
  filterStarred: boolean;
  onToggleUnread: () => void;
  onToggleStarred: () => void;
  onClearFilter: () => void;
}

export function Sidebar({
  feeds,
  selectedFeed,
  onSelectFeed,
  onAddFeed,
  onDeleteFeed,
  onRefreshFeed,
  filterUnread,
  filterStarred,
  onToggleUnread,
  onToggleStarred,
  onClearFilter,
  onImportComplete,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span className="font-bold text-lg">Syncrofeed</span>
          </div>
          <a href="/" className="text-xs text-zinc-400 hover:text-zinc-600">
            Home
          </a>
        </div>
        <button
          onClick={onAddFeed}
          className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg px-3 py-2 text-sm font-medium hover:opacity-90 transition"
        >
          + Add Feed
        </button>
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 space-y-1">
        <button
          onClick={onClearFilter}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
            !selectedFeed && !filterUnread && !filterStarred
              ? "bg-zinc-200 dark:bg-zinc-700 font-medium"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          📰 All Articles
        </button>
        <button
          onClick={onToggleUnread}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
            filterUnread
              ? "bg-zinc-200 dark:bg-zinc-700 font-medium"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          📬 Unread
        </button>
        <button
          onClick={onToggleStarred}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
            filterStarred
              ? "bg-zinc-200 dark:bg-zinc-700 font-medium"
              : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          ⭐ Starred
        </button>
      </div>

      {/* Import/Export */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2">
          <label className="flex-1 text-center px-2 py-1.5 text-xs rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            📥 Import OPML
            <input
              type="file"
              accept=".xml,.opml"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const formData = new FormData();
                formData.append("file", file);
                try {
                  const res = await fetch("/api/opml", { method: "POST", body: formData });
                  const contentType = res.headers.get("content-type") || "";
                  const isJson = contentType.includes("application/json");
                  const payload = isJson ? await res.json() : await res.text();

                  if (!res.ok) {
                    const message = typeof payload === "string"
                      ? payload.slice(0, 300)
                      : payload?.error || "Import failed";
                    throw new Error(message);
                  }

                  const imported = payload?.imported ?? 0;
                  const skipped = payload?.skipped ?? 0;
                  const errors = Array.isArray(payload?.errors) ? payload.errors.length : 0;
                  alert(`Imported: ${imported}, Skipped: ${skipped}${errors ? `, Errors: ${errors}` : ""}`);
                  onImportComplete();
                } catch (error) {
                  alert(error instanceof Error ? error.message : "Import failed");
                }
                e.target.value = "";
              }}
            />
          </label>
          <a
            href="/api/opml"
            download
            className="flex-1 text-center px-2 py-1.5 text-xs rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            📤 Export OPML
          </a>
        </div>
      </div>

      {/* Feeds */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
          Feeds
        </p>
        {feeds.length === 0 ? (
          <p className="text-xs text-zinc-400 px-3">No feeds yet</p>
        ) : (
          feeds.map((feed) => (
            <div
              key={feed.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition ${
                selectedFeed === feed.id
                  ? "bg-zinc-200 dark:bg-zinc-700 font-medium"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800"
              }`}
              onClick={() => onSelectFeed(feed.id)}
            >
              <span className="truncate flex-1">{feed.title}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefreshFeed(feed.id);
                  }}
                  className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded"
                  title="Refresh"
                >
                  🔄
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFeed(feed.id);
                  }}
                  className="p-1 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded text-red-500"
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
