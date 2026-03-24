import { useState, useEffect, useCallback } from "react";

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
  savedAt: string;
}

const STORAGE_KEY = "scripture-bookmarks";

function loadBookmarks(): Bookmark[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "savedAt">) => {
    const existing = bookmarks.find(
      (b) => b.book === bookmark.book && b.chapter === bookmark.chapter && b.verse === bookmark.verse && b.translation === bookmark.translation
    );
    if (existing) return;
    setBookmarks((prev) => [
      { ...bookmark, id: crypto.randomUUID(), savedAt: new Date().toISOString() },
      ...prev,
    ]);
  }, [bookmarks]);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const isBookmarked = useCallback(
    (book: string, chapter: number, verse: number, translation: string) =>
      bookmarks.some((b) => b.book === book && b.chapter === chapter && b.verse === verse && b.translation === translation),
    [bookmarks]
  );

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
