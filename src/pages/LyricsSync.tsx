import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Music4,
  Search,
  X,
  Play,
  Maximize2,
  Minimize2,
  PictureInPicture2,
  Palette,
  Check,
} from "lucide-react";
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

/* ── Color Presets ─────────────────────────────────────── */

type ColorPreset = {
  id: string;
  label: string;
  bg: string;
  text: string;
  active: string;
  glow: string;
  accent: string;
};

const COLOR_PRESETS: ColorPreset[] = [
  {
    id: "midnight",
    label: "Midnight",
    bg: "linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #0a0a15 100%)",
    text: "#e0e0ec",
    active: "#ffffff",
    glow: "rgba(120, 100, 255, 0.5)",
    accent: "#7c6aff",
  },
  {
    id: "spotify",
    label: "Spotify",
    bg: "linear-gradient(180deg, #121212 0%, #191414 50%, #0d0d0d 100%)",
    text: "#b3b3b3",
    active: "#1DB954",
    glow: "rgba(29, 185, 84, 0.4)",
    accent: "#1DB954",
  },
  {
    id: "ocean",
    label: "Ocean",
    bg: "linear-gradient(180deg, #0a1628 0%, #0d1f3c 50%, #071220 100%)",
    text: "#8facc8",
    active: "#00d4ff",
    glow: "rgba(0, 212, 255, 0.4)",
    accent: "#00d4ff",
  },
  {
    id: "sunset",
    label: "Sunset",
    bg: "linear-gradient(180deg, #1a0a1e 0%, #2d1233 50%, #140818 100%)",
    text: "#d4a0d8",
    active: "#ff6b9d",
    glow: "rgba(255, 107, 157, 0.4)",
    accent: "#ff6b9d",
  },
  {
    id: "gold",
    label: "Gold",
    bg: "linear-gradient(180deg, #1a1508 0%, #2a2210 50%, #121008 100%)",
    text: "#c4a86c",
    active: "#ffd700",
    glow: "rgba(255, 215, 0, 0.4)",
    accent: "#ffd700",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "linear-gradient(180deg, #0a1a0a 0%, #122212 50%, #081208 100%)",
    text: "#8cb88c",
    active: "#4ade80",
    glow: "rgba(74, 222, 128, 0.4)",
    accent: "#4ade80",
  },
  {
    id: "snow",
    label: "Snow",
    bg: "linear-gradient(180deg, #f5f5f7 0%, #eaeaef 50%, #f0f0f5 100%)",
    text: "#666680",
    active: "#1a1a2e",
    glow: "rgba(100, 100, 200, 0.2)",
    accent: "#5856d6",
  },
  {
    id: "cherry",
    label: "Cherry",
    bg: "linear-gradient(180deg, #1a0508 0%, #2d0a10 50%, #140408 100%)",
    text: "#d88a8a",
    active: "#ff4757",
    glow: "rgba(255, 71, 87, 0.4)",
    accent: "#ff4757",
  },
];

const getStoredPreset = (): string => {
  try {
    return localStorage.getItem("lyrics-color-preset") || "midnight";
  } catch {
    return "midnight";
  }
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
          events?: {
            onReady?: () => void;
            onStateChange?: (e: { data: number }) => void;
          };
        },
      ) => {
        destroy: () => void;
        seekTo: (s: number, a?: boolean) => void;
        getCurrentTime: () => number;
        playVideo: () => void;
        getPlayerState: () => number;
      };
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [lyricsMode, setLyricsMode] = useState<"split" | "fullscreen" | "mini">(
    "split",
  );

  /* Color customization */
  const [selectedPreset, setSelectedPreset] = useState(getStoredPreset);
  const [showPalette, setShowPalette] = useState(false);

  const activeColors = useMemo(
    () =>
      COLOR_PRESETS.find((p) => p.id === selectedPreset) || COLOR_PRESETS[0],
    [selectedPreset],
  );

  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<{
    destroy: () => void;
    seekTo: (s: number, a?: boolean) => void;
    getCurrentTime: () => number;
    playVideo: () => void;
    getPlayerState: () => number;
  } | null>(null);

  /* ── Search songs ────────────────────────────────────── */

  const searchSongs = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setShowResults(true);
    try {
      const { data, error: err } = await supabase.functions.invoke(
        "youtube-search",
        {
          body: { query: q, maxResults: 10 },
        },
      );
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

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Save preset ──────────────────────────────────────── */
  useEffect(() => {
    try {
      localStorage.setItem("lyrics-color-preset", selectedPreset);
    } catch {}
  }, [selectedPreset]);

  /* ── Load verified captions only ───────────────────────── */

  const loadCaptions = useCallback(
    async (id: string, title?: string, artist?: string) => {
      setIsLoading(true);
      setError(null);
      setCues([]);
      try {
        const { data, error: err } = await supabase.functions.invoke(
          "youtube-captions",
          {
            body: { videoId: id, lang: "en" },
          },
        );

        const captionsAvailable =
          !err &&
          data?.success &&
          Array.isArray(data.cues) &&
          data.cues.length > 0;

        if (captionsAvailable) {
          setCues(data.cues);
          return;
        }

        console.log("Captions unavailable for selected song", {
          title,
          artist,
          functionError: err?.message || null,
          functionReason: data?.reason || null,
        });

        setError(
          "No verified synced lyrics are available for this song yet. Try another version or live performance.",
        );
      } catch (e) {
        console.error("loadCaptions error:", e);
        setError("Could not fetch lyrics right now. Try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeSong?.artist],
  );

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
      playerVars: { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady: () => {
          setIsPlaying(true);
        },
        onStateChange: (e: { data: number }) => {
          setIsPlaying(e.data === 1);
        },
      },
    });
  }, []);

  /* ── Select a song ───────────────────────────────────── */

  const selectSong = useCallback(
    async (song: SearchResult) => {
      setActiveSong(song);
      setVideoId(song.youtubeId);
      setShowResults(false);
      setCurrentMs(0);
      await loadCaptions(song.youtubeId, song.title, song.artist);
    },
    [loadCaptions],
  );

  /* Seed from URL param */
  useEffect(() => {
    if (!seededVideo) return;
    setVideoId(seededVideo);
    void loadCaptions(seededVideo);
  }, [seededVideo, loadCaptions]);

  /* Build player once the host is mounted for the current video */
  useEffect(() => {
    if (!videoId) return;
    void buildPlayer(videoId);
  }, [videoId, buildPlayer]);

  /* Poll player time */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!playerRef.current) return;
      try {
        const t = playerRef.current.getCurrentTime();
        if (typeof t === "number") {
          setCurrentMs(Math.max(0, t * 1000));
        }
      } catch {}
    }, 150);
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
  const colors = activeColors;

  /* ── Color palette picker ────────────────────────────── */
  const palettePopup = (
    <AnimatePresence>
      {showPalette && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -8 }}
          className="absolute right-0 top-full mt-2 z-50 rounded-2xl p-3 shadow-2xl"
          style={{
            background: "rgba(20, 20, 30, 0.97)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            minWidth: "260px",
          }}
        >
          <p className="text-xs font-body text-white/50 mb-2 px-1">Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  setShowPalette(false);
                }}
                className="group relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:bg-white/10"
                title={preset.label}
              >
                <div
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{
                    background: preset.bg,
                    borderColor:
                      selectedPreset === preset.id
                        ? preset.accent
                        : "rgba(255,255,255,0.15)",
                    boxShadow:
                      selectedPreset === preset.id
                        ? `0 0 12px ${preset.accent}60`
                        : "none",
                  }}
                >
                  {selectedPreset === preset.id && (
                    <div className="w-full h-full flex items-center justify-center">
                      <Check
                        className="w-3.5 h-3.5"
                        style={{ color: preset.accent }}
                      />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-white/60 group-hover:text-white/90 transition-colors">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── Lyrics content (shared between modes) ───────────── */
  const lyricsContent = (
    <>
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                filter: "blur(24px)",
                transform: "scale(3)",
              }}
            />
            <Music4
              className="relative w-12 h-12"
              style={{ color: colors.text }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Loader2
              className="w-4 h-4 animate-spin"
              style={{ color: `${colors.text}99` }}
            />
            <p
              className="font-body text-base"
              style={{ color: `${colors.text}b0` }}
            >
              Loading lyrics...
            </p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Music4 className="w-10 h-10" style={{ color: `${colors.text}40` }} />
          <p
            className="font-body text-sm text-center max-w-xs"
            style={{ color: `${colors.text}90` }}
          >
            {error}
          </p>
          {videoId && (
            <button
              onClick={() =>
                loadCaptions(videoId, activeSong?.title, activeSong?.artist)
              }
              className="font-body text-sm hover:underline"
              style={{ color: colors.accent }}
            >
              Try again
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && cues.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Music4 className="w-10 h-10" style={{ color: `${colors.text}30` }} />
          <p
            className="font-body text-sm text-center"
            style={{ color: `${colors.text}80` }}
          >
            {videoId
              ? "No lyrics available. Try another song."
              : "Search and select a song to see lyrics"}
          </p>
        </div>
      )}

      {!isLoading && !error && cues.length > 0 && (
        <div className="space-y-0.5">
          {cues.map((cue, i) => {
            const isActive = i === activeCueIndex;
            const dist =
              activeCueIndex >= 0 ? Math.abs(i - activeCueIndex) : 999;
            const isNear = !isActive && dist <= 2;
            const isFar = dist > 4;

            return (
              <motion.button
                type="button"
                key={`${cue.startMs}-${i}`}
                data-cue={i}
                onClick={() =>
                  playerRef.current?.seekTo(cue.startMs / 1000, true)
                }
                initial={false}
                animate={{
                  scale: isActive ? 1.02 : 1,
                  opacity: isActive ? 1 : isNear ? 0.75 : isFar ? 0.2 : 0.4,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative w-full text-left rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 transition-all duration-500"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${colors.accent}18 0%, ${colors.accent}08 100%)`
                    : "transparent",
                }}
              >
                {/* Glow behind active line */}
                {isActive && (
                  <motion.div
                    layoutId="lyrics-glow"
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at center, ${colors.glow} 0%, ${colors.accent}15 40%, transparent 70%)`,
                      filter: "blur(16px)",
                      transform: "scaleX(1.05) scaleY(2)",
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
                      background: `linear-gradient(180deg, ${colors.accent} 0%, ${colors.accent}50 100%)`,
                      boxShadow: `0 0 14px ${colors.glow}`,
                    }}
                  />
                )}

                <span className="relative z-[1] flex items-baseline gap-3">
                  <span
                    className="font-body text-[10px] tabular-nums flex-shrink-0 mt-0.5 transition-colors duration-300"
                    style={{
                      color: isActive ? colors.accent : `${colors.text}35`,
                    }}
                  >
                    {fmtTime(cue.startMs)}
                  </span>
                  <span
                    className={`font-display leading-relaxed transition-all duration-500 ${
                      isFullscreen
                        ? "text-xl sm:text-2xl md:text-3xl"
                        : "text-base sm:text-lg"
                    }`}
                    style={{
                      color: isActive
                        ? colors.active
                        : `${colors.text}${isNear ? "a0" : "55"}`,
                      fontWeight: isActive ? 700 : 400,
                      textShadow: isActive
                        ? `0 0 30px ${colors.glow}, 0 0 60px ${colors.accent}40, 0 2px 4px rgba(0,0,0,0.4)`
                        : "none",
                      letterSpacing: isActive ? "0.02em" : "0",
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
        background: colors.bg,
        border: isFullscreen ? "none" : `1px solid ${colors.accent}20`,
        backdropFilter: isMini ? "blur(24px)" : undefined,
        boxShadow: isMini
          ? `0 20px 60px rgba(0,0,0,0.5), 0 0 20px ${colors.accent}15`
          : isFullscreen
            ? "none"
            : `0 8px 32px rgba(0,0,0,0.2), 0 0 20px ${colors.accent}08`,
      }}
    >
      {/* Header bar with controls */}
      <div
        className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0 z-20 relative"
        style={{
          borderColor: `${colors.accent}15`,
          background: `${colors.accent}08`,
          backdropFilter: "blur(10px)",
        }}
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
            <p
              className={`font-display font-semibold truncate ${isMini ? "text-xs" : "text-sm"}`}
              style={{ color: colors.active }}
            >
              {activeSong?.title || "Lyrics"}
            </p>
            {activeSong?.artist && !isMini && (
              <p
                className="font-body text-xs truncate"
                style={{ color: `${colors.text}70` }}
              >
                {activeSong.artist}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0 relative">
          {/* Color palette */}
          <button
            onClick={() => setShowPalette((p) => !p)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: showPalette ? colors.accent : `${colors.text}90` }}
            title="Change theme"
          >
            <Palette className="w-4 h-4" />
          </button>
          {palettePopup}

          {/* Mini/PiP toggle */}
          {!isMini && (
            <button
              onClick={() => setLyricsMode("mini")}
              className="p-1.5 rounded-lg transition-colors"
              title="Mini player"
              style={{ color: `${colors.text}90` }}
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>
          )}
          {/* Fullscreen toggle */}
          <button
            onClick={() => setLyricsMode(isFullscreen ? "split" : "fullscreen")}
            className="p-1.5 rounded-lg transition-colors"
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            style={{ color: `${colors.text}90` }}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
          {/* Restore to split if in mini */}
          {isMini && (
            <button
              onClick={() => setLyricsMode("split")}
              className="p-1.5 rounded-lg transition-colors"
              title="Restore"
              style={{ color: `${colors.text}90` }}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Top/bottom fade */}
      <div
        className="absolute top-[44px] left-0 right-0 h-10 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, ${colors.accent}10, transparent)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-20 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${selectedPreset === "snow" ? "#f0f0f5" : "#0a0a12"} 0%, transparent 100%)`,
        }}
      />

      {/* Scrollable lyrics */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-ornate ${
          isMini
            ? "px-3 py-4"
            : isFullscreen
              ? "px-6 sm:px-16 md:px-24 py-12"
              : "px-5 py-8 sm:px-8"
        }`}
      >
        {lyricsContent}
      </div>

      {/* Bottom info bar (fullscreen only) */}
      {isFullscreen && activeSong && (
        <div
          className="relative z-20 px-6 py-3 flex items-center justify-center gap-2"
          style={{
            borderTop: `1px solid ${colors.accent}15`,
            background: `${colors.accent}08`,
            backdropFilter: "blur(10px)",
          }}
        >
          <Music4 className="w-3.5 h-3.5" style={{ color: colors.accent }} />
          <span
            className="font-body text-xs"
            style={{ color: `${colors.text}70` }}
          >
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
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Search"
                )}
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
                          <p className="font-body text-sm text-foreground truncate">
                            {song.title}
                          </p>
                          <p className="font-body text-xs text-muted-foreground truncate">
                            {song.artist}
                          </p>
                        </div>
                        <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {showResults &&
                results.length === 0 &&
                !isSearching &&
                query.trim() && (
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
                    <p className="font-body text-sm text-muted-foreground">
                      No songs found. Try another search.
                    </p>
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
                  <div
                    ref={playerHostRef}
                    className="aspect-video w-full"
                    style={{ background: "hsl(var(--earth))" }}
                  />
                  <div className="p-4 border-t border-border/50">
                    <h2 className="font-display text-xl text-foreground truncate">
                      {activeSong?.title || "Now Playing"}
                    </h2>
                    {activeSong?.artist && (
                      <p className="font-body text-sm text-muted-foreground truncate">
                        {activeSong.artist}
                      </p>
                    )}
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {fmtTime(currentMs)}
                    </p>
                  </div>
                </>
              ) : (
                <div
                  className="aspect-video flex flex-col items-center justify-center"
                  style={{ background: "hsl(var(--earth))" }}
                >
                  <Music4 className="w-12 h-12 text-muted-foreground/40 mb-3" />
                  <p className="font-body text-sm text-muted-foreground">
                    Search a song above to get started
                  </p>
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
