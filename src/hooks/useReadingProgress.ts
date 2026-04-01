import { useState, useEffect, useCallback } from "react";

export interface ReadingStats {
  streak: number;
  longestStreak: number;
  chaptersRead: number;
  lastReadDate: string | null;
  readHistory: Record<string, string[]>; // "Genesis" -> ["1", "2", "3"]
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_chapter", title: "First Steps", description: "Read your first chapter", icon: "📖", unlockedAt: null },
  { id: "ten_chapters", title: "Devoted Reader", description: "Read 10 chapters", icon: "📚", unlockedAt: null },
  { id: "fifty_chapters", title: "Scholar", description: "Read 50 chapters", icon: "🎓", unlockedAt: null },
  { id: "hundred_chapters", title: "Theologian", description: "Read 100 chapters", icon: "🏆", unlockedAt: null },
  { id: "week_streak", title: "Week of Faith", description: "7-day reading streak", icon: "🔥", unlockedAt: null },
  { id: "month_streak", title: "Month of Devotion", description: "30-day reading streak", icon: "⭐", unlockedAt: null },
  { id: "genesis_complete", title: "In the Beginning", description: "Read all of Genesis", icon: "🌍", unlockedAt: null },
  { id: "psalms_explorer", title: "Psalms Explorer", description: "Read 10 Psalms", icon: "🎵", unlockedAt: null },
  { id: "new_testament", title: "Gospel Reader", description: "Read a chapter from each Gospel", icon: "✝️", unlockedAt: null },
  { id: "bookworm", title: "Bookworm", description: "Read from 10 different books", icon: "🐛", unlockedAt: null },
];

const STORAGE_KEY = "bible-reading-progress";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  return Math.abs(
    (new Date(a).getTime() - new Date(b).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function useReadingProgress() {
  const [stats, setStats] = useState<ReadingStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      streak: 0,
      longestStreak: 0,
      chaptersRead: 0,
      lastReadDate: null,
      readHistory: {},
      achievements: ACHIEVEMENTS.map((a) => ({ ...a })),
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const markChapterRead = useCallback((book: string, chapter: number) => {
    setStats((prev) => {
      const today = getToday();
      const chapterKey = String(chapter);
      const bookHistory = prev.readHistory[book] || [];

      if (bookHistory.includes(chapterKey)) return prev;

      const newHistory = {
        ...prev.readHistory,
        [book]: [...bookHistory, chapterKey],
      };
      const newChaptersRead = prev.chaptersRead + 1;

      // Streak calculation
      let newStreak = prev.streak;
      if (prev.lastReadDate === today) {
        // Already read today
      } else if (prev.lastReadDate && daysBetween(prev.lastReadDate, today) === 1) {
        newStreak += 1;
      } else if (prev.lastReadDate !== today) {
        newStreak = 1;
      }
      const newLongest = Math.max(prev.longestStreak, newStreak);

      // Check achievements
      const newAchievements = prev.achievements.map((a) => {
        if (a.unlockedAt) return a;
        switch (a.id) {
          case "first_chapter": return newChaptersRead >= 1 ? { ...a, unlockedAt: today } : a;
          case "ten_chapters": return newChaptersRead >= 10 ? { ...a, unlockedAt: today } : a;
          case "fifty_chapters": return newChaptersRead >= 50 ? { ...a, unlockedAt: today } : a;
          case "hundred_chapters": return newChaptersRead >= 100 ? { ...a, unlockedAt: today } : a;
          case "week_streak": return newStreak >= 7 ? { ...a, unlockedAt: today } : a;
          case "month_streak": return newStreak >= 30 ? { ...a, unlockedAt: today } : a;
          case "genesis_complete": return (newHistory["Genesis"]?.length || 0) >= 50 ? { ...a, unlockedAt: today } : a;
          case "psalms_explorer": return (newHistory["Psalms"]?.length || 0) >= 10 ? { ...a, unlockedAt: today } : a;
          case "new_testament": {
            const gospels = ["Matthew", "Mark", "Luke", "John"];
            const allRead = gospels.every((g) => (newHistory[g]?.length || 0) > 0);
            return allRead ? { ...a, unlockedAt: today } : a;
          }
          case "bookworm": return Object.keys(newHistory).length >= 10 ? { ...a, unlockedAt: today } : a;
          default: return a;
        }
      });

      return {
        streak: newStreak,
        longestStreak: newLongest,
        chaptersRead: newChaptersRead,
        lastReadDate: today,
        readHistory: newHistory,
        achievements: newAchievements,
      };
    });
  }, []);

  return { stats, markChapterRead };
}
