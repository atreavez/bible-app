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
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const preferredTrack =
      tracks.find((t) => t.languageCode === lang) ||
      tracks.find((t) => t.languageCode?.startsWith(lang)) ||
      tracks.find((t) => (t.vssId || "").includes(`.${lang}`)) ||
      tracks[0];

    const captionsUrl = `${preferredTrack.baseUrl}&fmt=json3`;
    const captionsRes = await fetch(captionsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!captionsRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch captions stream",
          cues: [],
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const captionsJson = await captionsRes.json();
    const events = Array.isArray(captionsJson?.events)
      ? captionsJson.events
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

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        title,
        language: preferredTrack.languageCode || "unknown",
        cues,
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
