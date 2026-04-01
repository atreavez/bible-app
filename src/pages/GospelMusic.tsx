import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Heart, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import GsapReveal from "@/components/GsapReveal";
import OrnamentDivider from "@/components/OrnamentDivider";

interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
  category: string;
}

const PLAYLISTS: PlaylistItem[] = [
  { id: "1", title: "Graves Into Gardens", artist: "Elevation Worship", youtubeId: "KJ1PjqdgFFk", thumbnail: "https://img.youtube.com/vi/KJ1PjqdgFFk/hqdefault.jpg", category: "Worship" },
  { id: "2", title: "Way Maker", artist: "Sinach", youtubeId: "n4MpERSbJhQ", thumbnail: "https://img.youtube.com/vi/n4MpERSbJhQ/hqdefault.jpg", category: "Worship" },
  { id: "3", title: "Goodness of God", artist: "Bethel Music", youtubeId: "wjRMIqmFaWw", thumbnail: "https://img.youtube.com/vi/wjRMIqmFaWw/hqdefault.jpg", category: "Worship" },
  { id: "4", title: "Oceans", artist: "Hillsong UNITED", youtubeId: "ly9oE5b0KA8", thumbnail: "https://img.youtube.com/vi/ly9oE5b0KA8/hqdefault.jpg", category: "Worship" },
  { id: "5", title: "Great Are You Lord", artist: "All Sons & Daughters", youtubeId: "PHHuZmMmKGc", thumbnail: "https://img.youtube.com/vi/PHHuZmMmKGc/hqdefault.jpg", category: "Worship" },
  { id: "6", title: "Holy Spirit", artist: "Francesca Battistelli", youtubeId: "y71TKAE84wA", thumbnail: "https://img.youtube.com/vi/y71TKAE84wA/hqdefault.jpg", category: "Worship" },
  { id: "7", title: "How Great Is Our God", artist: "Chris Tomlin", youtubeId: "KBD18rsVJHk", thumbnail: "https://img.youtube.com/vi/KBD18rsVJHk/hqdefault.jpg", category: "Praise" },
  { id: "8", title: "Reckless Love", artist: "Cory Asbury", youtubeId: "Sc6SSHuZvQE", thumbnail: "https://img.youtube.com/vi/Sc6SSHuZvQE/hqdefault.jpg", category: "Worship" },
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

export default function GospelMusic() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<PlaylistItem | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("gospel-favorites");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("gospel-favorites", JSON.stringify([...next]));
      return next;
    });
  };

  const filtered =
    activeCategory === "All"
      ? PLAYLISTS
      : PLAYLISTS.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-12 px-4 md:px-6 max-w-7xl mx-auto">
        <GsapReveal className="text-center mb-8" direction="scale">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Gospel <span className="text-gradient-gold italic">Music</span>
          </h1>
          <p className="mt-3 font-body text-muted-foreground max-w-lg mx-auto">
            Worship, praise, and uplift your spirit with gospel songs from
            beloved artists.
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

        {/* Category Filter */}
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
              {/* Thumbnail */}
              <div
                className="relative aspect-video cursor-pointer overflow-hidden"
                onClick={() => setActiveVideo(song)}
              >
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-12 h-12 rounded-full bg-olive/90 flex items-center justify-center">
                    <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Info */}
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

        <OrnamentDivider />
      </div>
    </div>
  );
}
