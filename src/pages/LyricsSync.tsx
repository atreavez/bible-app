import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Music4, Search, X, Play, Maximize2, Minimize2, PictureInPicture2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/* ── Types ─────────────────────────────────────────────── */

type CaptionCue = { startMs: number; durationMs: number; text: string };

type SearchResult = {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  thumbnail: string;
};

/* ── YouTube IFrame API ────────────────────────────────── */

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: { onReady?: () => void };
        },
      ) => {
        destroy: () => void;
        seekTo: (s: number, a?: boolean) => void;
        getCurrentTime: () => number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<void> | null = null;
const ensureYT = (): Promise<void> => {
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      document.body.appendChild(s);
    }
    window.onYouTubeIframeAPIReady = () => resolve();
  });
  return ytApiPromise;
};

const extractId = (input: string): string | null => {
  const t = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(t)) return t;
  try {
    const url = new URL(t);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  } catch {}
  return null;
};

const fmtTime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

/* ── Component ─────────────────────────────────────────── */

export default function LyricsSync() {
  const [searchParams] = useSearchParams();
  const seededVideo = searchParams.get("video") || "";

  /* Search state */
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  /* Player state */
  const [videoId, setVideoId] = useState(seededVideo);
  const [activeSong, setActiveSong] = useState<SearchResult | null>(null);
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMs, setCurrentMs] = useState(0);
  const [lyricsMode, setLyricsMode] = useState<"split" | "fullscreen" | "mini">("split");

  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<{ destroy: () => void; seekTo: (s: number, a?: boolean) => void; getCurrentTime: () => number } | null>(null);

  /* ── Search songs ────────────────────────────────────── */

  const searchSongs = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setShowResults(true);
    try {
      const { data, error: err } = await supabase.functions.invoke("youtube-search", {
        body: { query: q, maxResults: 10 },
      });
      if (err || !data?.success) {
        setResults([]);
        return;
      }
      setResults(
        (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          artist: item.artist,
          youtubeId: item.youtubeId,
          thumbnail: item.thumbnail,
        })),
      );
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  /* Close search results on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Load captions (with AI lyrics fallback) ──────────── */

  const loadCaptions = useCallback(async (id: string, title?: string, artist?: string) => {
    setIsLoading(true);
    setError(null);
    setCues([]);
    try {
      // Try YouTube captions first
      const { data, error: err } = await supabase.functions.invoke("youtube-captions", {
        body: { videoId: id, lang: "en" },
      });
      
      const captionsAvailable = !err && data?.success && Array.isArray(data.cues) && data.cues.length > 0;
      
      if (captionsAvailable) {
        setCues(data.cues);
        return;
      }

      // Fallback: use AI-generated lyrics
      console.log("Captions not available, falling back to AI lyrics", { title, artist, err: err?.message });
      if (title) {
        const { data: lyricsData, error: lyricsErr } = await supabase.functions.invoke("song-lyrics", {
          body: { title, artist: artist || "" },
        });
        console.log("AI lyrics response:", { success: lyricsData?.success, hasLyrics: !!lyricsData?.lyrics, err: lyricsErr?.message });
        if (!lyricsErr && lyricsData?.success && lyricsData.lyrics) {
          const lines = lyricsData.lyrics.split("\n").filter((l: string) => l.trim());
          const interval = 3000;
          const aiCues: CaptionCue[] = lines.map((text: string, i: number) => ({
            startMs: i * interval,
            durationMs: interval,
            text: text.trim(),
          }));
          setCues(aiCues);
          setError(null);
          return;
        }
      }

      setError("No lyrics found for this video. Try a different song.");
    } catch (e) {
      console.error("loadCaptions error:", e);
      setError("Could not fetch lyrics right now. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ── Build YT player ─────────────────────────────────── */

  const buildPlayer = useCallback(async (id: string) => {
    if (!playerHostRef.current) return;
    await ensureYT();
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    playerHostRef.current.innerHTML = "";
    const mount = document.createElement("div");
    playerHostRef.current.appendChild(mount);
    playerRef.current = new window.YT!.Player(mount, {
      videoId: id,
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
    });
  }, []);

  /* ── Select a song ───────────────────────────────────── */

  const selectSong = useCallback(
    async (song: SearchResult) => {
      setActiveSong(song);
      setVideoId(song.youtubeId);
      setShowResults(false);
      setCurrentMs(0);
      await Promise.all([loadCaptions(song.youtubeId, song.title, song.artist), buildPlayer(song.youtubeId)]);
    },
    [loadCaptions, buildPlayer],
  );

  /* Seed from URL param */
  useEffect(() => {
    if (!seededVideo) return;
    setVideoId(seededVideo);
    void Promise.all([loadCaptions(seededVideo), buildPlayer(seededVideo)]);
  }, [seededVideo, loadCaptions, buildPlayer]);

  /* Poll player time */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!playerRef.current) return;
      setCurrentMs(Math.max(0, Number(playerRef.current.getCurrentTime() || 0) * 1000));
    }, 200);
    return () => {
      window.clearInterval(timer);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  /* Active cue index */
  const activeCueIndex = useMemo(() => {
    return cues.findIndex((cue) => {
      const end = cue.startMs + Math.max(cue.durationMs, 1400);
      return currentMs >= cue.startMs && currentMs < end;
    });
  }, [cues, currentMs]);

  /* Auto-scroll */
  useEffect(() => {
    if (activeCueIndex < 0) return;
    const el = document.querySelector(`[data-cue="${activeCueIndex}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeCueIndex]);

  /* ── Render ──────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-10 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Sing <span className="text-gradient-gold italic">Along</span>
          </h1>
          <p className="mt-2 text-muted-foreground font-body max-w-2xl mx-auto">
            Search any song and sing along with real-time synced lyrics
          </p>
        </div>

        {/* Search Bar */}
        <div ref={searchBoxRef} className="relative max-w-2xl mx-auto mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void searchSongs();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (!e.target.value.trim()) setShowResults(false);
                }}
                placeholder="Search for a song, artist, or paste YouTube URL..."
                className="pl-9 pr-9 rounded-xl bg-card/80 border-border"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="rounded-xl bg-olive text-primary-foreground hover:bg-olive/90"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </form>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {showResults && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute z-50 top-full mt-2 w-full rounded-2xl overflow-hidden border border-border"
                style={{
                  background: "hsl(var(--card) / 0.97)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "var(--shadow-deep)",
                }}
              >
                <p className="px-4 py-2 text-xs font-body text-muted-foreground border-b border-border/50">
                  {results.length} results — tap to load lyrics
                </p>
                <div className="max-h-80 overflow-y-auto scrollbar-ornate">
                  {results.map((song) => (
                    <button
                      key={song.id}
                      onClick={() => selectSong(song)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b border-border/20 last:border-b-0"
                    >
                      <img
                        src={song.thumbnail}
                        alt=""
                        className="w-14 h-10 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm text-foreground truncate">{song.title}</p>
                        <p className="font-body text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {showResults && results.length === 0 && !isSearching && query.trim() && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute z-50 top-full mt-2 w-full rounded-2xl border border-border p-6 text-center"
                style={{
                  background: "hsl(var(--card) / 0.97)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <p className="font-body text-sm text-muted-foreground">No songs found. Try another search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main Content: Player + Lyrics */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Video Player */}
          <div className="ornate-border rounded-2xl bg-card/80 overflow-hidden">
            {videoId ? (
              <>
                <div ref={playerHostRef} className="aspect-video w-full" style={{ background: "hsl(var(--earth))" }} />
                <div className="p-4 border-t border-border/50">
                  <h2 className="font-display text-xl text-foreground truncate">
                    {activeSong?.title || "Now Playing"}
                  </h2>
                  {activeSong?.artist && (
                    <p className="font-body text-sm text-muted-foreground truncate">{activeSong.artist}</p>
                  )}
                  <p className="font-body text-xs text-muted-foreground mt-1">{fmtTime(currentMs)}</p>
                </div>
              </>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center" style={{ background: "hsl(var(--earth))" }}>
                <Music4 className="w-12 h-12 text-muted-foreground/40 mb-3" />
                <p className="font-body text-sm text-muted-foreground">Search a song above to get started</p>
              </div>
            )}
          </div>

          {/* Lyrics Panel with Glow */}
          <div
            className="relative rounded-2xl overflow-hidden h-[60vh]"
            style={{
              background: `linear-gradient(180deg, hsl(var(--card) / 0.9) 0%, hsl(var(--earth) / 0.7) 100%)`,
              border: "1px solid hsl(var(--border) / 0.4)",
              boxShadow: "inset 0 1px 0 hsl(var(--gold-light) / 0.08), var(--shadow-card)",
            }}
          >
            {/* Top/bottom fade overlays */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-card/90 to-transparent z-10 pointer-events-none rounded-t-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-earth/80 to-transparent z-10 pointer-events-none rounded-b-2xl" />

            <div className="h-full overflow-y-auto scrollbar-ornate px-5 py-10 sm:px-8">
              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full animate-pulse"
                      style={{
                        background: "radial-gradient(circle, hsl(var(--gold) / 0.4) 0%, transparent 70%)",
                        filter: "blur(20px)",
                        transform: "scale(2.5)",
                      }}
                    />
                    <Music4 className="relative w-10 h-10 text-foreground/60" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <p className="font-body text-sm text-muted-foreground">Loading lyrics...</p>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Music4 className="w-10 h-10 text-muted-foreground/40" />
                  <p className="font-body text-sm text-muted-foreground text-center max-w-xs">{error}</p>
                  {videoId && (
                    <button
                      onClick={() => loadCaptions(videoId, activeSong?.title, activeSong?.artist)}
                      className="font-body text-sm text-olive hover:underline"
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !error && cues.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Music4 className="w-10 h-10 text-muted-foreground/30" />
                  <p className="font-body text-sm text-muted-foreground text-center">
                    {videoId ? "No captions available. Try another video." : "Search and select a song to see lyrics"}
                  </p>
                </div>
              )}

              {/* Lyrics with glow */}
              {!isLoading && !error && cues.length > 0 && (
                <div className="space-y-1">
                  {cues.map((cue, i) => {
                    const isActive = i === activeCueIndex;
                    const isNear =
                      !isActive &&
                      activeCueIndex >= 0 &&
                      Math.abs(i - activeCueIndex) <= 2;

                    return (
                      <motion.button
                        type="button"
                        key={`${cue.startMs}-${i}`}
                        data-cue={i}
                        onClick={() => playerRef.current?.seekTo(cue.startMs / 1000, true)}
                        initial={false}
                        animate={{
                          scale: isActive ? 1.04 : 1,
                          opacity: isActive ? 1 : isNear ? 0.7 : 0.4,
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="relative w-full text-left rounded-2xl px-5 py-3 transition-all duration-300"
                        style={{
                          background: isActive
                            ? "linear-gradient(135deg, hsl(var(--gold) / 0.15) 0%, hsl(var(--olive) / 0.10) 100%)"
                            : "transparent",
                          borderLeft: isActive
                            ? "3px solid hsl(var(--gold))"
                            : "3px solid transparent",
                        }}
                      >
                        {/* Glow behind active line */}
                        {isActive && (
                          <motion.div
                            layoutId="lyrics-glow"
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{
                              background:
                                "radial-gradient(ellipse at center, hsl(var(--gold) / 0.18) 0%, transparent 70%)",
                              filter: "blur(18px)",
                              transform: "scaleX(1.1) scaleY(1.6)",
                            }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                          />
                        )}

                        <span className="relative z-[1] flex items-baseline gap-3">
                          <span
                            className="font-body text-[10px] tabular-nums flex-shrink-0 mt-0.5"
                            style={{
                              color: isActive
                                ? "hsl(var(--gold))"
                                : "hsl(var(--muted-foreground) / 0.5)",
                            }}
                          >
                            {fmtTime(cue.startMs)}
                          </span>
                          <span
                            className="font-display text-lg sm:text-xl leading-relaxed"
                            style={{
                              color: isActive
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--foreground) / 0.55)",
                              fontWeight: isActive ? 600 : 400,
                              textShadow: isActive
                                ? "0 0 40px hsl(var(--gold) / 0.5), 0 0 80px hsl(var(--gold) / 0.2)"
                                : "none",
                            }}
                          >
                            {cue.text}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                  <div className="h-32" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
