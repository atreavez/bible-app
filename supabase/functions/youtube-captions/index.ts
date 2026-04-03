export {};

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type CaptionTrack = {
  baseUrl: string;
  languageCode?: string;
  vssId?: string;
  name?: { simpleText?: string };
};

type CaptionCue = {
  startMs: number;
  durationMs: number;
  text: string;
};

type CaptionDebug = {
  videoId: string;
  title?: string;
  captionTrackCount?: number;
  trackLanguages?: string[];
  selectedTrackLanguage?: string;
  selectedTrackVssId?: string;
  fetchAttempts?: Array<{
    format: string;
    ok: boolean;
    parsed: "json3" | "xml" | "srv3" | "vtt" | "none";
  }>;
};

const decodeHtmlEntities = (value: string): string => {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
};

const parseXmlCaptions = (xml: string): CaptionCue[] => {
  const cues: CaptionCue[] = [];
  const pattern = /<text\b([^>]*)>([\s\S]*?)<\/text>/g;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(xml)) !== null) {
    const attrs = match[1] || "";
    const textContent = decodeHtmlEntities(match[2] || "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!textContent) continue;

    const startMatch = attrs.match(/\bstart="([0-9.]+)"/);
    const durMatch = attrs.match(/\bdur="([0-9.]+)"/);
    const startSeconds = startMatch ? Number(startMatch[1]) : 0;
    const durSeconds = durMatch ? Number(durMatch[1]) : 0;

    cues.push({
      startMs: Math.max(0, Math.round(startSeconds * 1000)),
      durationMs: Math.max(0, Math.round(durSeconds * 1000)),
      text: textContent,
    });
  }

  return cues;
};

const parseSrv3Captions = (xml: string): CaptionCue[] => {
  const cues: CaptionCue[] = [];
  const pattern = /<p\b([^>]*)>([\s\S]*?)<\/p>/g;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(xml)) !== null) {
    const attrs = match[1] || "";
    const rawContent = match[2] || "";

    const startMatch = attrs.match(/\bt="(\d+)"/);
    const durMatch = attrs.match(/\bd="(\d+)"/);
    const startMs = startMatch ? Number(startMatch[1]) : 0;
    const durationMs = durMatch ? Number(durMatch[1]) : 0;

    // srv3 commonly wraps words in <s> and uses \n for line breaks.
    const text = decodeHtmlEntities(rawContent)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\s*\n\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) continue;

    cues.push({
      startMs: Math.max(0, startMs),
      durationMs: Math.max(0, durationMs),
      text,
    });
  }

  return cues;
};

const parseVttCaptions = (vtt: string): CaptionCue[] => {
  const cues: CaptionCue[] = [];
  const normalized = vtt.replace(/\r\n/g, "\n");
  const blocks = normalized
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const timeToMs = (time: string): number => {
    const parts = time.split(":").map((p) => p.trim());
    if (parts.length < 2 || parts.length > 3) return 0;

    const [hh, mm, ss] =
      parts.length === 3 ? parts : ["0", parts[0], parts[1]];
    const [secPart, msPart = "0"] = ss.split(".");

    const hours = Number(hh) || 0;
    const minutes = Number(mm) || 0;
    const seconds = Number(secPart) || 0;
    const milliseconds = Number((msPart + "000").slice(0, 3)) || 0;

    return (
      hours * 60 * 60 * 1000 +
      minutes * 60 * 1000 +
      seconds * 1000 +
      milliseconds
    );
  };

  for (const block of blocks) {
    if (block.startsWith("WEBVTT") || block.startsWith("NOTE")) continue;

    const lines = block.split("\n").map((line) => line.trimEnd());
    const timingLineIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingLineIndex < 0) continue;

    const timingLine = lines[timingLineIndex];
    const [startRaw, endRaw] = timingLine.split("-->").map((v) => v.trim());
    if (!startRaw || !endRaw) continue;

    const startMs = timeToMs(startRaw.split(" ")[0]);
    const endMs = timeToMs(endRaw.split(" ")[0]);

    const text = decodeHtmlEntities(lines.slice(timingLineIndex + 1).join(" "))
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) continue;

    cues.push({
      startMs: Math.max(0, startMs),
      durationMs: Math.max(0, endMs - startMs),
      text,
    });
  }

  return cues;
};

const buildUrlWithFmt = (baseUrl: string, fmt: string): string => {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("fmt", fmt);
    return url.toString();
  } catch {
    const joiner = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${joiner}fmt=${encodeURIComponent(fmt)}`;
  }
};

const parseJson3Captions = (payload: unknown): CaptionCue[] => {
  const events = Array.isArray((payload as any)?.events)
    ? (payload as any).events
    : [];

  const cues: CaptionCue[] = [];
  for (const event of events) {
    const segs = Array.isArray(event?.segs) ? event.segs : [];
    if (!segs.length) continue;

    const text = segs
      .map((seg: { utf8?: string }) => seg?.utf8 || "")
      .join("")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) continue;

    const startMs = Number(event?.tStartMs || 0);
    const durationMs = Number(event?.dDurationMs || 0);

    cues.push({
      startMs,
      durationMs,
      text,
    });
  }

  return cues;
};

const fetchCaptionsFromTrack = async (
  track: CaptionTrack,
): Promise<{
  cues: CaptionCue[];
  attempts: Array<{
    format: string;
    ok: boolean;
    parsed: "json3" | "xml" | "srv3" | "vtt" | "none";
  }>;
}> => {
  const urlAttempts = [
    buildUrlWithFmt(track.baseUrl, "json3"),
    buildUrlWithFmt(track.baseUrl, "srv3"),
    buildUrlWithFmt(track.baseUrl, "vtt"),
    track.baseUrl,
  ];

  const attempts: Array<{
    format: string;
    ok: boolean;
    parsed: "json3" | "xml" | "srv3" | "vtt" | "none";
  }> = [];

  const detectFormat = (captionsUrl: string): string => {
    if (captionsUrl.includes("fmt=srv3")) return "srv3";
    if (captionsUrl.includes("fmt=json3")) return "json3";
    if (captionsUrl.includes("fmt=vtt")) return "vtt";
    return "original";
  };

  for (const captionsUrl of urlAttempts) {
    try {
      const captionsRes = await fetch(captionsUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!captionsRes.ok) {
        attempts.push({
          format: detectFormat(captionsUrl),
          ok: false,
          parsed: "none",
        });
        continue;
      }

      const body = await captionsRes.text();
      if (!body.trim()) {
        attempts.push({
          format: detectFormat(captionsUrl),
          ok: true,
          parsed: "none",
        });
        continue;
      }

      try {
        const jsonPayload = JSON.parse(body);
        const jsonCues = parseJson3Captions(jsonPayload);
        if (jsonCues.length > 0) {
          attempts.push({
            format: detectFormat(captionsUrl),
            ok: true,
            parsed: "json3",
          });
          return { cues: jsonCues, attempts };
        }
      } catch {
        // Not JSON payload; attempt XML parsing below.
      }

      if (body.includes("<timedtext") || body.includes("<p ")) {
        const srv3Cues = parseSrv3Captions(body);
        if (srv3Cues.length > 0) {
          attempts.push({
            format: detectFormat(captionsUrl),
            ok: true,
            parsed: "srv3",
          });
          return { cues: srv3Cues, attempts };
        }
      }

      if (body.includes("<transcript") || body.includes("<text")) {
        const xmlCues = parseXmlCaptions(body);
        if (xmlCues.length > 0) {
          attempts.push({
            format: detectFormat(captionsUrl),
            ok: true,
            parsed: "xml",
          });
          return { cues: xmlCues, attempts };
        }
      }

      if (body.includes("WEBVTT") || /\d{2}:\d{2}:\d{2}\.\d{3}\s+-->/.test(body)) {
        const vttCues = parseVttCaptions(body);
        if (vttCues.length > 0) {
          attempts.push({
            format: detectFormat(captionsUrl),
            ok: true,
            parsed: "vtt",
          });
          return { cues: vttCues, attempts };
        }
      }

      attempts.push({
        format: detectFormat(captionsUrl),
        ok: true,
        parsed: "none",
      });
    } catch {
      attempts.push({
        format: detectFormat(captionsUrl),
        ok: false,
        parsed: "none",
      });
      continue;
    }
  }

  return { cues: [], attempts };
};

const parseVideoId = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const plainIdMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/);
  if (plainIdMatch) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    const fromQuery = url.searchParams.get("v");
    if (fromQuery && /^[a-zA-Z0-9_-]{11}$/.test(fromQuery)) {
      return fromQuery;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const embedded = segments[segments.length - 1];
    if (embedded && /^[a-zA-Z0-9_-]{11}$/.test(embedded)) {
      return embedded;
    }
  } catch {
    return null;
  }

  return null;
};

const extractPlayerResponse = (
  html: string,
): Record<string, unknown> | null => {
  const patterns = [
    /ytInitialPlayerResponse\s*=\s*(\{.*?\})\s*;\s*(?:var\s+meta|<\/script>)/s,
    /"ytInitialPlayerResponse"\s*:\s*(\{.*?\})\s*,\s*"ytInitialData"/s,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match?.[1]) continue;
    try {
      return JSON.parse(match[1]);
    } catch {
      continue;
    }
  }

  return null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId: rawVideoId, lang = "en" } = await req.json();
    const videoId = parseVideoId(String(rawVideoId || ""));

    if (!videoId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Valid YouTube video ID or URL is required",
          cues: [],
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const watchRes = await fetch(watchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!watchRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to load YouTube watch page",
          cues: [],
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const html = await watchRes.text();
    const playerResponse = extractPlayerResponse(html);

    if (!playerResponse) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to extract player metadata",
          cues: [],
        }),
        {
          status: 422,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const title =
      (playerResponse as any)?.videoDetails?.title || "YouTube Song";

    const captionsData = (playerResponse as any)?.captions
      ?.playerCaptionsTracklistRenderer;
    const tracks = (captionsData?.captionTracks || []) as CaptionTrack[];

    if (!tracks.length) {
      return new Response(
        JSON.stringify({
          success: true,
          hasCaptions: false,
          reason: "no_caption_tracks",
          title,
          language: lang,
          cues: [],
          debug: {
            videoId,
            title,
            captionTrackCount: 0,
            trackLanguages: [],
          } satisfies CaptionDebug,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const preferredTracks = [
      ...tracks.filter((t) => t.languageCode === lang),
      ...tracks.filter((t) => t.languageCode?.startsWith(lang)),
      ...tracks.filter((t) => (t.vssId || "").includes(`.${lang}`)),
      ...tracks,
    ];

    const uniqueTrackMap = new Map<string, CaptionTrack>();
    for (const track of preferredTracks) {
      if (!track?.baseUrl) continue;
      if (!uniqueTrackMap.has(track.baseUrl)) {
        uniqueTrackMap.set(track.baseUrl, track);
      }
    }

    const orderedTracks = Array.from(uniqueTrackMap.values());
    let cues: CaptionCue[] = [];
    let chosenTrack: CaptionTrack | null = null;
    let fetchAttempts: CaptionDebug["fetchAttempts"] = [];

    for (const track of orderedTracks) {
      const result = await fetchCaptionsFromTrack(track);
      fetchAttempts = [...(fetchAttempts || []), ...(result.attempts || [])];
      if (result.cues.length > 0) {
        cues = result.cues;
        chosenTrack = track;
        break;
      }
    }

    if (!cues.length) {
      return new Response(
        JSON.stringify({
          success: true,
          hasCaptions: false,
          reason: "caption_stream_empty",
          title,
          language: lang,
          cues: [],
          debug: {
            videoId,
            title,
            captionTrackCount: tracks.length,
            trackLanguages: tracks.map(
              (track) => track.languageCode || track.vssId || "unknown",
            ),
            selectedTrackLanguage: chosenTrack?.languageCode,
            selectedTrackVssId: chosenTrack?.vssId,
            fetchAttempts,
          } satisfies CaptionDebug,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title,
        language: chosenTrack?.languageCode || "unknown",
        cues,
        debug: {
          videoId,
          title,
          captionTrackCount: tracks.length,
          trackLanguages: tracks.map(
            (track) => track.languageCode || track.vssId || "unknown",
          ),
          selectedTrackLanguage: chosenTrack?.languageCode,
          selectedTrackVssId: chosenTrack?.vssId,
          fetchAttempts,
        } satisfies CaptionDebug,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("youtube-captions error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to extract captions",
        cues: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
