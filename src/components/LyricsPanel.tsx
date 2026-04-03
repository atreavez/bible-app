import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Music2, Loader2, ChevronUp, ChevronDown, Mic2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LyricsPanelProps {
  song: { title: string; artist: string; thumbnail: string; youtubeId: string } | null;
  isOpen: boolean;
  onClose: () => void;
}

type LyricLine = { text: string; isSection: boolean };

function parseLyrics(raw: string): LyricLine[] {
  return raw.split("\n").map((line) => {
    const trimmed = line.trim();
    const isSection = /^\[.*\]$/.test(trimmed) || /^(verse|chorus|bridge|outro|intro|pre-chorus|hook|interlude)/i.test(trimmed);
    return { text: trimmed, isSection };
  });
}

export default function LyricsPanel({ song, isOpen, onClose }: LyricsPanelProps) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [rawLyrics, setRawLyrics] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState(1.25); // rem
  const [activeLine, setActiveLine] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const fetchLyrics = useCallback(async (title: string, artist: string) => {
    const cacheKey = `${title}::${artist}`;
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey)!;
      setRawLyrics(cached);
      setLyrics(parseLyrics(cached));
      return;
    }

    setIsLoading(true);
    setError(null);
    setLyrics([]);
    setRawLyrics("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("song-lyrics", {
        body: { title, artist },
      });

      if (fnError || !data?.success) {
        setError("Couldn't load lyrics. Try again.");
        return;
      }

      const lyricsText = data.lyrics || "";
      cacheRef.current.set(cacheKey, lyricsText);
      setRawLyrics(lyricsText);
      setLyrics(parseLyrics(lyricsText));
    } catch {
      setError("Couldn't load lyrics. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (song && isOpen) {
      setActiveLine(-1);
      fetchLyrics(song.title, song.artist);
    }
  }, [song?.title, song?.artist, isOpen, fetchLyrics]);

  const handleLineClick = (index: number) => {
    setActiveLine(index === activeLine ? -1 : index);
  };

  if (!song) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
        >
          {/* Backdrop with animated gradient */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              background: `linear-gradient(
                180deg,
                hsl(var(--earth) / 0.95) 0%,
                hsl(var(--olive-dark) / 0.97) 40%,
                hsl(var(--background) / 0.98) 100%
              )`,
              backdropFilter: "blur(20px)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl h-[92vh] sm:h-[85vh] sm:rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: `linear-gradient(
                170deg,
                hsl(var(--card) / 0.15) 0%,
                hsl(var(--background) / 0.08) 100%
              )`,
              backdropFilter: "blur(40px) saturate(1.5)",
              border: "1px solid hsl(var(--border) / 0.2)",
              boxShadow: "0 -10px 60px hsl(var(--gold) / 0.1), inset 0 1px 0 hsl(var(--gold-light) / 0.1)",
            }}
          >
            {/* Ambient glow effect at top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-40 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(ellipse, hsl(var(--gold) / 0.12) 0%, transparent 70%)`,
                filter: "blur(30px)",
              }}
            />

            {/* Header */}
            <div className="relative flex items-center gap-4 p-5 pb-3 border-b border-border/10">
              {/* Thumbnail with glow */}
              <div className="relative flex-shrink-0">
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `radial-gradient(circle, hsl(var(--gold) / 0.3) 0%, transparent 70%)`,
                    filter: "blur(12px)",
                    transform: "scale(1.3)",
                  }}
                />
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="relative w-14 h-14 rounded-xl object-cover shadow-lg"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg`;
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold text-foreground truncate">
                  {song.title}
                </h2>
                <p className="font-body text-sm text-muted-foreground truncate flex items-center gap-1.5">
                  <Mic2 className="w-3 h-3" />
                  {song.artist}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFontSize((s) => Math.max(0.9, s - 0.15))}
                  className="p-2 rounded-xl hover:bg-muted/30 transition-colors text-muted-foreground"
                  title="Smaller text"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFontSize((s) => Math.min(2.2, s + 0.15))}
                  className="p-2 rounded-xl hover:bg-muted/30 transition-colors text-muted-foreground"
                  title="Larger text"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-muted/30 transition-colors text-muted-foreground ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lyrics Body */}
            <div className="flex-1 overflow-hidden relative" ref={scrollRef}>
              {/* Fade edges */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/20 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background/30 to-transparent z-10 pointer-events-none" />

              <ScrollArea className="h-full">
                <div className="px-6 py-8 sm:px-10">
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-20 gap-4"
                    >
                      <div className="relative">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `radial-gradient(circle, hsl(var(--gold) / 0.3) 0%, transparent 70%)`,
                            filter: "blur(15px)",
                            transform: "scale(2)",
                          }}
                        />
                        <Music2 className="relative w-10 h-10 text-gold animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <p className="font-body text-sm text-muted-foreground">
                          Finding lyrics...
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {error && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center justify-center py-20 gap-3"
                    >
                      <Music2 className="w-10 h-10 text-muted-foreground/50" />
                      <p className="font-body text-sm text-muted-foreground text-center">
                        {error}
                      </p>
                      <button
                        onClick={() => fetchLyrics(song.title, song.artist)}
                        className="font-body text-sm text-olive hover:underline mt-2"
                      >
                        Try again
                      </button>
                    </motion.div>
                  )}

                  {!isLoading && !error && lyrics.length > 0 && (
                    <div className="space-y-1">
                      {lyrics.map((line, i) => {
                        if (line.text === "") {
                          return <div key={i} className="h-5" />;
                        }

                        if (line.isSection) {
                          return (
                            <motion.p
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(i * 0.02, 1) }}
                              className="font-body text-xs font-semibold uppercase tracking-[0.2em] mt-6 mb-2"
                              style={{ color: "hsl(var(--gold))" }}
                            >
                              {line.text.replace(/[\[\]]/g, "")}
                            </motion.p>
                          );
                        }

                        const isActive = activeLine === i;

                        return (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(i * 0.015, 1.5) }}
                            onClick={() => handleLineClick(i)}
                            className="font-display leading-relaxed cursor-pointer transition-all duration-300 py-0.5 rounded-lg select-none"
                            style={{
                              fontSize: `${fontSize}rem`,
                              color: isActive
                                ? "hsl(var(--foreground))"
                                : "hsl(var(--foreground) / 0.65)",
                              fontWeight: isActive ? 600 : 400,
                              textShadow: isActive
                                ? "0 0 30px hsl(var(--gold) / 0.3)"
                                : "none",
                              transform: isActive ? "scale(1.03)" : "scale(1)",
                              paddingLeft: isActive ? "0.5rem" : "0",
                              borderLeft: isActive
                                ? "3px solid hsl(var(--gold))"
                                : "3px solid transparent",
                            }}
                          >
                            {line.text}
                          </motion.p>
                        );
                      })}

                      {/* Bottom spacer */}
                      <div className="h-20" />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Bottom bar with song info */}
            <div
              className="relative px-5 py-3 border-t border-border/10 flex items-center justify-center gap-2"
              style={{
                background: "hsl(var(--card) / 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Music2 className="w-3.5 h-3.5 text-gold" />
              <span className="font-body text-xs text-muted-foreground">
                Tap any line to highlight · Resize text with arrows
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
