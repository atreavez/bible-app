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

  const isFullscreen = lyricsMode === "fullscreen";
  const isMini = lyricsMode === "mini";

  /* ── Lyrics content (shared between modes) ───────────── */
  const lyricsContent = (
    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: "radial-gradient(circle, hsl(var(--gold) / 0.5) 0%, transparent 70%)",
                filter: "blur(24px)",
                transform: "scale(3)",
              }}
            />
            <Music4 className="relative w-12 h-12 text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-foreground/60" />
            <p className="font-body text-base text-foreground/70">Loading lyrics...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Music4 className="w-10 h-10 text-foreground/30" />
          <p className="font-body text-sm text-foreground/60 text-center max-w-xs">{error}</p>
          {videoId && (
            <button
              onClick={() => loadCaptions(videoId, activeSong?.title, activeSong?.artist)}
              className="font-body text-sm hover:underline"
              style={{ color: "hsl(var(--gold))" }}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && cues.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Music4 className="w-10 h-10 text-foreground/20" />
          <p className="font-body text-sm text-foreground/50 text-center">
            {videoId ? "No lyrics available. Try another song." : "Search and select a song to see lyrics"}
          </p>
        </div>
      )}

      {!isLoading && !error && cues.length > 0 && (
        <div className="space-y-0.5">
          {cues.map((cue, i) => {
            const isActive = i === activeCueIndex;
            const dist = activeCueIndex >= 0 ? Math.abs(i - activeCueIndex) : 999;
            const isNear = !isActive && dist <= 2;
            const isFar = dist > 4;

            return (
              <motion.button
                type="button"
                key={`${cue.startMs}-${i}`}
                data-cue={i}
                onClick={() => playerRef.current?.seekTo(cue.startMs / 1000, true)}
                initial={false}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  opacity: isActive ? 1 : isNear ? 0.75 : isFar ? 0.25 : 0.45,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full text-left rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-500"
                style={{
                  background: isActive
                    ? "linear-gradient(135deg, hsl(var(--gold) / 0.12) 0%, hsl(var(--gold) / 0.04) 100%)"
                    : "transparent",
                }}
              >
                {/* Glow behind active line */}
                {isActive && (
                  <motion.div
                    layoutId="lyrics-glow"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at center, hsl(var(--gold) / 0.25) 0%, hsl(var(--gold) / 0.08) 40%, transparent 70%)",
                      filter: "blur(12px)",
                      transform: "scaleX(1.05) scaleY(1.8)",
                    }}
                    transition={{ type: "spring", damping: 22, stiffness: 180 }}
                  />
                )}

                {/* Active line left accent */}
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full"
                    style={{
                      height: "60%",
                      background: "linear-gradient(180deg, hsl(var(--gold)) 0%, hsl(var(--gold) / 0.3) 100%)",
                      boxShadow: "0 0 12px hsl(var(--gold) / 0.5)",
                    }}
                  />
                )}

                <span className="relative z-[1] flex items-baseline gap-3">
                  <span
                    className="font-body text-[10px] tabular-nums flex-shrink-0 mt-0.5 transition-colors duration-300"
                    style={{
                      color: isActive ? "hsl(var(--gold))" : "hsl(var(--foreground) / 0.25)",
                    }}
                  >
                    {fmtTime(cue.startMs)}
                  </span>
                  <span
                    className={`font-display leading-relaxed transition-all duration-500 ${
                      isFullscreen ? "text-xl sm:text-2xl md:text-3xl" : "text-base sm:text-lg"
                    }`}
                    style={{
                      color: isActive ? "hsl(var(--foreground))" : `hsl(var(--foreground) / ${isNear ? 0.6 : 0.35})`,
                      fontWeight: isActive ? 600 : 400,
                      textShadow: isActive
                        ? "0 0 30px hsl(var(--gold) / 0.6), 0 0 60px hsl(var(--gold) / 0.25), 0 2px 4px hsl(0 0% 0% / 0.3)"
                        : "none",
                      letterSpacing: isActive ? "0.01em" : "0",
                    }}
                  >
                    {cue.text}
                  </span>
                </span>
              </motion.button>
            );
          })}
          <div className="h-40" />
        </div>
      )}
    </>
  );

  /* ── Lyrics panel wrapper (adapts to mode) ───────────── */
  const lyricsPanel = (
    <div
      className={`relative overflow-hidden flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-[70] rounded-none"
          : isMini
            ? "fixed bottom-4 right-4 z-[70] w-[360px] h-[320px] rounded-2xl shadow-2xl"
            : "rounded-2xl h-[65vh]"
      }`}
      style={{
        background: isFullscreen
          ? "linear-gradient(180deg, hsl(var(--earth)) 0%, hsl(220 15% 6%) 100%)"
          : isMini
            ? "hsl(var(--card) / 0.98)"
            : "linear-gradient(180deg, hsl(var(--card) / 0.95) 0%, hsl(var(--earth) / 0.85) 100%)",
        border: isFullscreen ? "none" : "1px solid hsl(var(--border) / 0.3)",
        backdropFilter: isMini ? "blur(24px)" : undefined,
        boxShadow: isMini
          ? "0 20px 60px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(var(--gold-light) / 0.1)"
          : isFullscreen
            ? "none"
            : "inset 0 1px 0 hsl(var(--gold-light) / 0.08), var(--shadow-card)",
      }}
    >
      {/* Header bar with controls */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/20 flex-shrink-0 z-20 relative"
        style={{ background: "hsl(var(--card) / 0.3)", backdropFilter: "blur(10px)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeSong?.thumbnail && (
            <img
              src={activeSong.thumbnail}
              alt=""
              className={`rounded-lg object-cover flex-shrink-0 ${isMini ? "w-8 h-6" : "w-10 h-7"}`}
              onError={(e) => {
                e.currentTarget.src = `https://img.youtube.com/vi/${activeSong.youtubeId}/mqdefault.jpg`;
              }}
            />
          )}
          <div className="min-w-0">
            <p className={`font-display font-semibold text-foreground truncate ${isMini ? "text-xs" : "text-sm"}`}>
              {activeSong?.title || "Lyrics"}
            </p>
            {activeSong?.artist && !isMini && (
              <p className="font-body text-xs text-foreground/50 truncate">{activeSong.artist}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Mini/PiP toggle */}
          {!isMini && (
            <button
              onClick={() => setLyricsMode("mini")}
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
              title="Mini player"
            >
              <PictureInPicture2 className="w-4 h-4 text-foreground/60" />
            </button>
          )}
          {/* Fullscreen toggle */}
          <button
            onClick={() => setLyricsMode(isFullscreen ? "split" : "fullscreen")}
            className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-foreground/60" />
            ) : (
              <Maximize2 className="w-4 h-4 text-foreground/60" />
            )}
          </button>
          {/* Restore to split if in mini */}
          {isMini && (
            <button
              onClick={() => setLyricsMode("split")}
              className="p-1.5 rounded-lg hover:bg-muted/30 transition-colors"
              title="Restore"
            >
              <Maximize2 className="w-4 h-4 text-foreground/60" />
            </button>
          )}
        </div>
      </div>

      {/* Top/bottom fade */}
      <div className="absolute top-[44px] left-0 right-0 h-10 bg-gradient-to-b from-card/60 to-transparent z-10 pointer-events-none" />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none"
        style={{
          background: isFullscreen
            ? "linear-gradient(to top, hsl(220 15% 6%) 0%, transparent 100%)"
            : "linear-gradient(to top, hsl(var(--earth) / 0.9) 0%, transparent 100%)",
        }}
      />

      {/* Scrollable lyrics */}
      <div className={`flex-1 overflow-y-auto scrollbar-ornate ${isMini ? "px-3 py-4" : isFullscreen ? "px-6 sm:px-16 md:px-24 py-12" : "px-5 py-8 sm:px-8"}`}>
        {lyricsContent}
      </div>

      {/* Bottom info bar (fullscreen only) */}
      {isFullscreen && activeSong && (
        <div className="relative z-20 px-6 py-3 border-t border-border/10 flex items-center justify-center gap-2"
          style={{ background: "hsl(var(--card) / 0.1)", backdropFilter: "blur(10px)" }}
        >
          <Music4 className="w-3.5 h-3.5" style={{ color: "hsl(var(--gold))" }} />
          <span className="font-body text-xs text-foreground/50">
            Tap any line to jump · {fmtTime(currentMs)}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-10 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header */}
        {!isFullscreen && (
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
              Sing <span className="text-gradient-gold italic">Along</span>
            </h1>
            <p className="mt-2 text-muted-foreground font-body max-w-2xl mx-auto">
              Search any song and sing along with real-time synced lyrics
            </p>
          </div>
        )}

        {/* Search Bar */}
        {!isFullscreen && (
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
        )}

        {/* Main Content */}
        {!isFullscreen && (
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

            {/* Lyrics Panel (split mode) */}
            {!isMini && lyricsPanel}
          </div>
        )}

        {/* Fullscreen lyrics */}
        {isFullscreen && lyricsPanel}
      </div>

      {/* Mini player (floating) */}
      {isMini && !isFullscreen && lyricsPanel}
    </div>
  );
}
