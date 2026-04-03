import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Music4, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type CaptionCue = {
  startMs: number;
  durationMs: number;
  text: string;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: () => void;
          };
        },
      ) => {
        destroy: () => void;
        seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
        getCurrentTime: () => number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

const ensureYouTubeApi = (): Promise<void> => {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const existingScript = document.getElementById("youtube-iframe-api");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => resolve();
  });

  return youtubeApiPromise;
};

const extractVideoId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
      return v;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^[a-zA-Z0-9_-]{11}$/.test(last)) {
      return last;
    }
  } catch {
    return null;
  }

  return null;
};

const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
};

export default function LyricsSync() {
  const [searchParams] = useSearchParams();
  const seededVideo = searchParams.get("video") || "";

  const [videoInput, setVideoInput] = useState(seededVideo);
  const [videoId, setVideoId] = useState<string>(seededVideo);
  const [title, setTitle] = useState("Sing Along");
  const [cues, setCues] = useState<CaptionCue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMs, setCurrentMs] = useState(0);

  const playerHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<{
    destroy: () => void;
    seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
    getCurrentTime: () => number;
  } | null>(null);

  const loadLyrics = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke(
        "youtube-captions",
        {
          body: { videoId: id, lang: "en" },
        },
      );

      if (invokeError || !data?.success) {
        setCues([]);
        setError(data?.error || "Could not fetch captions for this video.");
        return;
      }

      const nextCues = Array.isArray(data.cues) ? data.cues : [];
      setTitle(data.title || "Sing Along");
      setCues(nextCues);

      if (!nextCues.length) {
        setError("No synced captions found for this video.");
      }
    } catch {
      setCues([]);
      setError("Could not fetch lyrics right now. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buildPlayer = useCallback(async (id: string) => {
    if (!playerHostRef.current) return;

    await ensureYouTubeApi();

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    playerHostRef.current.innerHTML = "";
    const mountNode = document.createElement("div");
    playerHostRef.current.appendChild(mountNode);

    playerRef.current = new window.YT!.Player(mountNode, {
      videoId: id,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1,
      },
    });
  }, []);

  const submitVideo = useCallback(async () => {
    const id = extractVideoId(videoInput);
    if (!id) {
      setError("Enter a valid YouTube URL or video ID.");
      return;
    }

    setVideoId(id);
    await Promise.all([loadLyrics(id), buildPlayer(id)]);
  }, [buildPlayer, loadLyrics, videoInput]);

  useEffect(() => {
    if (!videoId) return;
    void Promise.all([loadLyrics(videoId), buildPlayer(videoId)]);
  }, [buildPlayer, loadLyrics, videoId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!playerRef.current) return;
      const seconds = Number(playerRef.current.getCurrentTime() || 0);
      setCurrentMs(Math.max(0, seconds * 1000));
    }, 250);

    return () => {
      window.clearInterval(timer);
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const activeCueIndex = useMemo(() => {
    return cues.findIndex((cue) => {
      const endMs = cue.startMs + Math.max(cue.durationMs, 1400);
      return currentMs >= cue.startMs && currentMs < endMs;
    });
  }, [cues, currentMs]);

  useEffect(() => {
    if (activeCueIndex < 0) return;
    const el = document.querySelector(`[data-cue-index="${activeCueIndex}"]`);
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [activeCueIndex]);

  return (
    <div className="min-h-screen bg-background scrollbar-ornate">
      <Navbar />

      <div className="pt-20 pb-10 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground">
            Synced <span className="text-gradient-gold italic">Lyrics</span>
          </h1>
          <p className="mt-2 text-muted-foreground font-body max-w-2xl mx-auto">
            Paste a YouTube link and sing along with timed caption lines
            highlighted in real time.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitVideo();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="Paste YouTube URL or Video ID"
                className="pl-9 rounded-xl bg-card/80"
              />
            </div>
            <Button
              type="submit"
              className="rounded-xl bg-olive text-primary-foreground hover:bg-olive/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Load Lyrics"
              )}
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-red-500 font-body">{error}</p>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="ornate-border rounded-2xl bg-card/80 overflow-hidden">
            <div ref={playerHostRef} className="aspect-video w-full bg-black" />
            <div className="p-4 border-t border-border/50">
              <h2 className="font-display text-xl text-foreground truncate">
                {title}
              </h2>
              <p className="font-body text-xs text-muted-foreground mt-1">
                Current: {formatTime(currentMs)}
              </p>
            </div>
          </div>

          <div className="ornate-border rounded-2xl bg-card/80 p-3 h-[60vh] overflow-y-auto scrollbar-ornate">
            {cues.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <Music4 className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="font-body text-sm text-muted-foreground">
                  No captions loaded yet. Try a different video that has
                  subtitle tracks.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {cues.map((cue, index) => {
                  const isActive = index === activeCueIndex;
                  return (
                    <button
                      type="button"
                      key={`${cue.startMs}-${index}`}
                      data-cue-index={index}
                      onClick={() => {
                        playerRef.current?.seekTo(cue.startMs / 1000, true);
                      }}
                      className={`w-full text-left rounded-xl p-3 transition-colors ${
                        isActive
                          ? "bg-olive/20 border border-olive/30"
                          : "hover:bg-muted/40 border border-transparent"
                      }`}
                    >
                      <p className="font-body text-xs text-muted-foreground mb-1">
                        {formatTime(cue.startMs)}
                      </p>
                      <p
                        className={`font-body text-sm leading-relaxed ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {cue.text}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
