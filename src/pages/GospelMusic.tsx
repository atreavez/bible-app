import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, ExternalLink, Search, X, Loader2, RefreshCw, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import LyricsPanel from "@/components/LyricsPanel";

interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
  category: string;
}

const TRENDING_QUERIES = [
  "latest trending gospel songs",
  "new gospel worship songs",
  "gospel praise hits",
  "afro gospel trending",
  "contemporary christian worship latest",
  "spirit-filled gospel songs new release",
  "urban gospel trending now",
  "gospel music chart",
];

const CATEGORIES = ["All", "Worship", "Praise", "Gospel", "Hymns"];

const pickRandom = (arr: string[], count: number): string[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(count, copy.length));
};

const classifyCategory = (title: string, artist: string): string => {
  const text = `${title} ${artist}`.toLowerCase();
  if (text.includes("hymn") || text.includes("grace") || text.includes("it is well")) {
    return "Hymns";
  }
  if (text.includes("praise") || text.includes("hallelujah") || text.includes("victory")) {
    return "Praise";
  }
  if (text.includes("worship") || text.includes("adore") || text.includes("holy")) {
    return "Worship";
  }
  return "Gospel";
};

const normalizeItems = (items: any[], prefix: string): PlaylistItem[] =>
  items.map((item: any, idx: number) => ({
    id: `${prefix}-${item.youtubeId}-${idx}`,
    title: item.title,
    artist: item.artist,
    youtubeId: item.youtubeId,
    thumbnail: item.thumbnail,
    category: classifyCategory(item.title, item.artist),
  }));

async function searchYouTube(
  query: string,
  mode: "search" | "trending" = "search",
  maxResults = 20,
): Promise<PlaylistItem[]> {
  const { data, error } = await supabase.functions.invoke("youtube-search", {
    body: { query, mode, maxResults },
  });
  if (error || !data?.success) return [];
  return (data.items || []).map((item: any) => ({
    ...item,
    category: "Search",
  }));
}

export default function GospelMusic() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<PlaylistItem | null>(null);
  const [searchResults, setSearchResults] = useState<PlaylistItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [trendingSongs, setTrendingSongs] = useState<PlaylistItem[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [trendingError, setTrendingError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("gospel-favorites");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const loadTrendingSongs = useCallback(async () => {
    setIsLoadingTrending(true);
    setTrendingError(null);
    setHasSearched(false);
    setSearchResults([]);

    try {
      const selectedQueries = pickRandom(TRENDING_QUERIES, 3);
      const responses = await Promise.all(
        selectedQueries.map((q) => searchYouTube(q, "trending", 12)),
      );
      const flattened = normalizeItems(responses.flat(), "trend");

      const deduped = flattened.filter(
        (song, index, list) =>
          list.findIndex((candidate) => candidate.youtubeId === song.youtubeId) === index,
      );

      const shuffled = [...deduped].sort(() => Math.random() - 0.5);
      const latestTrending = shuffled.slice(0, 20);

      setTrendingSongs(latestTrending);
      if (latestTrending.length === 0) {
        setTrendingError("No trending gospel songs found right now. Tap refresh to try again.");
      }
    } catch {
      setTrendingSongs([]);
      setTrendingError("Unable to fetch trending songs right now. Check connection and try again.");
    } finally {
      setIsLoadingTrending(false);
    }
  }, []);

  useEffect(() => {
    void loadTrendingSongs();
  }, [loadTrendingSongs]);

  // Local suggestions from current trending songs
  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return trendingSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q),
    ).slice(0, 5);
  }, [searchQuery, trendingSongs]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("gospel-favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const handleSearch = useCallback(async () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowSuggestions(false);
    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchYouTube(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setShowSuggestions(false);
  };

  const playSuggestion = (song: PlaylistItem) => {
    setActiveVideo(song);
    setShowSuggestions(false);
  };

  const openInYouTubeForBackground = useCallback((song: PlaylistItem) => {
    const webUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;

    if (!Capacitor.isNativePlatform()) {
      window.open(webUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (Capacitor.getPlatform() === "ios") {
      window.location.href = `youtube://www.youtube.com/watch?v=${song.youtubeId}`;
      setTimeout(() => {
        window.location.href = webUrl;
      }, 1200);
      return;
    }

    // Android intent tries to open YouTube app first, then falls back to web URL.
    window.location.href = `intent://www.youtube.com/watch?v=${song.youtubeId}#Intent;package=com.google.android.youtube;scheme=https;end`;
  }, []);

  const filtered = useMemo(() => {
    if (hasSearched) return searchResults;
    return activeCategory === "All"
      ? trendingSongs
      : trendingSongs.filter((p) => p.category === activeCategory);
  }, [activeCategory, hasSearched, searchResults, trendingSongs]);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <GsapReveal className="text-center mb-8" direction="scale">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Gospel <span className="text-gradient-gold italic">Music</span>
          </h1>
          <p className="mt-3 font-body text-muted-foreground max-w-lg mx-auto">
            Search any gospel song on YouTube or browse latest trending picks refreshed from YouTube.
          </p>
        </GsapReveal>

        <div className="flex justify-center mb-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              void loadTrendingSongs();
            }}
            disabled={isLoadingTrending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingTrending ? "animate-spin" : ""}`} />
            Refresh Trending
          </Button>
        </div>

        {/* Now Playing */}
        <AnimatePresence>
          {activeVideo && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 ornate-border rounded-2xl bg-card/80 overflow-hidden"
            >
              <div className="aspect-video w-full max-w-3xl mx-auto">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 text-center">
                <h2 className="font-display text-xl text-foreground">
                  {activeVideo.title}
                </h2>
                <p className="font-body text-sm text-muted-foreground">
                  {activeVideo.artist}
                </p>
                <div className="mt-3 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => openInYouTubeForBackground(activeVideo)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Background play in YouTube
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground font-body">
                  Screen-off playback is managed by the YouTube app/browser, not
                  the in-app preview player.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar with suggestions */}
        <div ref={searchRef} className="relative max-w-lg mx-auto mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                placeholder="Search any gospel song on YouTube..."
                className="pl-9 pr-9 rounded-xl bg-card/80 border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="rounded-xl bg-olive text-primary-foreground hover:bg-olive/90"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </form>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions &&
              searchQuery.trim() &&
              suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                >
                  <p className="px-3 py-1.5 text-xs text-muted-foreground font-body border-b border-border">
                    From latest trending songs
                  </p>
                  {suggestions.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => playSuggestion(song)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
                    >
                      <img
                        src={song.thumbnail}
                        alt=""
                        className="w-10 h-7 rounded object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-body text-sm text-foreground truncate">
                          {song.title}
                        </p>
                        <p className="font-body text-xs text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      </div>
                      <Play className="w-3 h-3 text-muted-foreground flex-shrink-0 ml-auto" />
                    </button>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full px-3 py-2 text-sm text-olive font-body hover:bg-muted/50 transition-colors text-left border-t border-border flex items-center gap-2"
                  >
                    <Search className="w-3 h-3" />
                    Search YouTube for "{searchQuery}"
                  </button>
                </motion.div>
              )}
            {showSuggestions &&
              searchQuery.trim() &&
              suggestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={handleSearch}
                    className="w-full px-3 py-3 text-sm text-olive font-body hover:bg-muted/50 transition-colors text-left flex items-center gap-2"
                  >
                    <Search className="w-3 h-3" />
                    Search YouTube for "{searchQuery}"
                  </button>
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* Category Filter */}
        {!hasSearched && (
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl font-body text-sm transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-olive text-primary-foreground shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {hasSearched && (
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground font-body">
              {isSearching
                ? "Searching YouTube..."
                : `${searchResults.length} results found`}
            </p>
            <button
              onClick={clearSearch}
              className="text-sm text-olive hover:underline font-body mt-1"
            >
              ← Back to trending songs
            </button>
          </div>
        )}

        {/* Song Grid */}
        {isLoadingTrending && !hasSearched && (
          <div className="flex justify-center mb-6">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {trendingError && !hasSearched && (
          <p className="text-center text-red-500 font-body mb-6 text-sm">
            {trendingError}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="ornate-border rounded-2xl bg-card/80 overflow-hidden group hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className="relative aspect-video cursor-pointer overflow-hidden"
                onClick={() => setActiveVideo(song)}
              >
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallbacks = [
                      `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`,
                      `https://img.youtube.com/vi/${song.youtubeId}/default.jpg`,
                      `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`,
                    ];
                    const next = fallbacks.find((u) => u !== target.src);
                    if (next) target.src = next;
                  }}
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-olive/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-medium text-foreground truncate">
                    {song.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => toggleFavorite(song.id)}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Heart
                      className={`w-4 h-4 transition-colors ${
                        favorites.has(song.id)
                          ? "fill-red-500 text-red-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      openInYouTubeForBackground(song);
                    }}
                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {hasSearched && filtered.length === 0 && !isSearching && (
          <p className="text-center text-muted-foreground font-body mt-8">
            No results found. Try a different search term.
          </p>
        )}

        <OrnamentDivider />
      </div>
    </div>
  );
}
