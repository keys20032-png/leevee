import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "safehubhelp-bookmarks";

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((title: string) => {
    setBookmarks((prev) =>
      prev.includes(title) ? prev.filter((b) => b !== title) : [...prev, title]
    );
  }, []);

  const isBookmarked = useCallback(
    (title: string) => bookmarks.includes(title),
    [bookmarks]
  );

  return { bookmarks, toggleBookmark, isBookmarked };
};
