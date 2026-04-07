"use client";

import { useState } from "react";

interface AddFeedDialogProps {
  onAdd: (url: string) => void;
  onClose: () => void;
}

export function AddFeedDialog({ onAdd, onClose }: AddFeedDialogProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError("");

    try {
      await onAdd(url.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-4">Add Feed</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/feed or https://example.com"
            className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-4 py-2 text-sm bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {error && (
            <p className="text-red-500 text-xs mt-2">{error}</p>
          )}
          <p className="text-zinc-400 text-xs mt-2">
            Enter a feed URL or a website URL (auto-discovery will try to find the feed)
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Feed"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
