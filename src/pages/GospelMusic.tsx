import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, ExternalLink, Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import OrnamentDivider from "@/components/OrnamentDivider";
import { supabase } from "@/integrations/supabase/client";

interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
  category: string;
}

const CURATED: PlaylistItem[] = [
  { id: "1", title: "Graves Into Gardens", artist: "Elevation Worship", youtubeId: "MiBHOQqEpZ8", thumbnail: "https://img.youtube.com/vi/MiBHOQqEpZ8/hqdefault.jpg", category: "Worship" },
  { id: "2", title: "Way Maker", artist: "Sinach", youtubeId: "QZ3sI_MOVES", thumbnail: "https://img.youtube.com/vi/QZ3sI_MOVES/hqdefault.jpg", category: "Worship" },
  { id: "3", title: "Goodness of God", artist: "Bethel Music", youtubeId: "EdOSKpMYER4", thumbnail: "https://img.youtube.com/vi/EdOSKpMYER4/hqdefault.jpg", category: "Worship" },
  { id: "4", title: "Oceans", artist: "Hillsong UNITED", youtubeId: "dy9nwe9_xzw", thumbnail: "https://img.youtube.com/vi/dy9nwe9_xzw/hqdefault.jpg", category: "Worship" },
  { id: "5", title: "Great Are You Lord", artist: "All Sons & Daughters", youtubeId: "JCNUNiILFVo", thumbnail: "https://img.youtube.com/vi/JCNUNiILFVo/hqdefault.jpg", category: "Worship" },
  { id: "6", title: "Holy Spirit", artist: "Francesca Battistelli", youtubeId: "6WSTM7e0z4E", thumbnail: "https://img.youtube.com/vi/6WSTM7e0z4E/hqdefault.jpg", category: "Worship" },
  { id: "7", title: "How Great Is Our God", artist: "Chris Tomlin", youtubeId: "KBD18rsVJHk", thumbnail: "https://img.youtube.com/vi/KBD18rsVJHk/hqdefault.jpg", category: "Praise" },
  { id: "8", title: "Reckless Love", artist: "Cory Asbury", youtubeId: "FiPETYFXLgA", thumbnail: "https://img.youtube.com/vi/FiPETYFXLgA/hqdefault.jpg", category: "Worship" },
  { id: "9", title: "What A Beautiful Name", artist: "Hillsong Worship", youtubeId: "nQWFzMvCfLE", thumbnail: "https://img.youtube.com/vi/nQWFzMvCfLE/hqdefault.jpg", category: "Worship" },
  { id: "10", title: "10,000 Reasons", artist: "Matt Redman", youtubeId: "XtwIT8JjddM", thumbnail: "https://img.youtube.com/vi/XtwIT8JjddM/hqdefault.jpg", category: "Praise" },
  { id: "11", title: "Yes I Will", artist: "Vertical Worship", youtubeId: "P2SDi6VkVXA", thumbnail: "https://img.youtube.com/vi/P2SDi6VkVXA/hqdefault.jpg", category: "Worship" },
  { id: "12", title: "Amazing Grace (My Chains Are Gone)", artist: "Chris Tomlin", youtubeId: "YrLk4vdY28Q", thumbnail: "https://img.youtube.com/vi/YrLk4vdY28Q/hqdefault.jpg", category: "Hymns" },
  { id: "13", title: "It Is Well With My Soul", artist: "Bethel Music", youtubeId: "zY5o9mP22V0", thumbnail: "https://img.youtube.com/vi/zY5o9mP22V0/hqdefault.jpg", category: "Hymns" },
  { id: "14", title: "No Longer Slaves", artist: "Bethel Music", youtubeId: "XGur1Jc-IWM", thumbnail: "https://img.youtube.com/vi/XGur1Jc-IWM/hqdefault.jpg", category: "Worship" },
  { id: "15", title: "Build My Life", artist: "Housefires", youtubeId: "Z0dIBr8csaM", thumbnail: "https://img.youtube.com/vi/Z0dIBr8csaM/hqdefault.jpg", category: "Worship" },
  { id: "16", title: "Total Praise", artist: "Richard Smallwood", youtubeId: "rG-RGIMnFOY", thumbnail: "https://img.youtube.com/vi/rG-RGIMnFOY/hqdefault.jpg", category: "Gospel" },
  { id: "17", title: "Every Praise", artist: "Hezekiah Walker", youtubeId: "UuuZMg6NVeA", thumbnail: "https://img.youtube.com/vi/UuuZMg6NVeA/hqdefault.jpg", category: "Gospel" },
  { id: "18", title: "Never Would Have Made It", artist: "Marvin Sapp", youtubeId: "HH_fMT50xlE", thumbnail: "https://img.youtube.com/vi/HH_fMT50xlE/hqdefault.jpg", category: "Gospel" },
  { id: "19", title: "Jireh", artist: "Maverick City Music", youtubeId: "GIhN2CDZJTU", thumbnail: "https://img.youtube.com/vi/GIhN2CDZJTU/hqdefault.jpg", category: "Worship" },
  { id: "20", title: "Refiner", artist: "Maverick City Music", youtubeId: "R3JjYXsfWcE", thumbnail: "https://img.youtube.com/vi/R3JjYXsfWcE/hqdefault.jpg", category: "Worship" },
];

const CATEGORIES = ["All", "Worship", "Praise", "Gospel", "Hymns"];

async function searchYouTube(query: string): Promise<PlaylistItem[]> {
  const { data, error } = await supabase.functions.invoke("youtube-search", {
    body: { query },
  });
  if (error || !data?.success) return [];
  return (data.items || []).map((item: any) => ({ ...item, category: "Search" }));
}

export default function GospelMusic() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<PlaylistItem | null>(null);
  const [searchResults, setSearchResults] = useState<PlaylistItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("gospel-favorites");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // Local suggestions from curated list
  const suggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];
    return CURATED.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery]);

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

  const filtered = useMemo(() => {
    if (hasSearched) return searchResults;
    return activeCategory === "All" ? CURATED : CURATED.filter((p) => p.category === activeCategory);
  }, [activeCategory, hasSearched, searchResults]);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <GsapReveal className="text-center mb-8" direction="scale">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Gospel <span className="text-gradient-gold italic">Music</span>
          </h1>
          <p className="mt-3 font-body text-muted-foreground max-w-lg mx-auto">
            Search any gospel song on YouTube or browse our curated collection.
          </p>
        </GsapReveal>

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
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar with suggestions */}
        <div ref={searchRef} className="relative max-w-lg mx-auto mb-6">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
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
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {showSuggestions && searchQuery.trim() && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden"
              >
                <p className="px-3 py-1.5 text-xs text-muted-foreground font-body border-b border-border">
                  From curated collection
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
                      <p className="font-body text-sm text-foreground truncate">{song.title}</p>
                      <p className="font-body text-xs text-muted-foreground truncate">{song.artist}</p>
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
            {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
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
              {isSearching ? "Searching YouTube..." : `${searchResults.length} results found`}
            </p>
            <button onClick={clearSearch} className="text-sm text-olive hover:underline font-body mt-1">
              ← Back to curated collection
            </button>
          </div>
        )}

        {/* Song Grid */}
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
                    const next = fallbacks.find(u => u !== target.src);
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
                    href={`https://www.youtube.com/watch?v=${song.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
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
