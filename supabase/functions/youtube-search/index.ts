const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, mode = "search", maxResults = 20 } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required", items: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsedMaxResults = Number.isFinite(Number(maxResults))
      ? Math.max(1, Math.min(30, Number(maxResults)))
      : 20;

    const year = new Date().getFullYear();
    const normalizedQuery = query.trim();
    const searchQuery = mode === "trending"
      ? `${normalizedQuery} gospel music latest trending ${year} this week`
      : `${normalizedQuery} gospel worship`;
    // sp=EgIQAQ%3D%3D filters for videos only
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}&sp=EgIQAQ%3D%3D`;

    console.log("Fetching YouTube search:", searchQuery);

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error("YouTube returned status:", res.status);
      return new Response(
        JSON.stringify({ success: true, items: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await res.text();

    // Extract ytInitialData JSON from the page
    const match = html.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (!match) {
      console.error("Could not find ytInitialData in response");
      return new Response(
        JSON.stringify({ success: true, items: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = JSON.parse(match[1]);
    const sections =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    const items: Array<{
      id: string;
      title: string;
      artist: string;
      youtubeId: string;
      thumbnail: string;
      duration: number;
    }> = [];

    for (const section of sections) {
      const contents = section?.itemSectionRenderer?.contents || [];
      for (const item of contents) {
        const vid = item?.videoRenderer;
        if (!vid || !vid.videoId) continue;

        const title = vid.title?.runs?.[0]?.text || "Unknown";
        const author = vid.ownerText?.runs?.[0]?.text || "Unknown Artist";
        const videoId = vid.videoId;
        const thumbnail =
          vid.thumbnail?.thumbnails?.slice(-1)?.[0]?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        // Parse duration from text like "3:45"
        const durationText = vid.lengthText?.simpleText || "0:00";
        const parts = durationText.split(":").map(Number);
        const duration =
          parts.length === 3
            ? parts[0] * 3600 + parts[1] * 60 + parts[2]
            : parts[0] * 60 + (parts[1] || 0);

        items.push({
          id: `yt-${items.length}-${videoId}`,
          title,
          artist: author,
          youtubeId: videoId,
          thumbnail,
          duration,
        });

        if (items.length >= parsedMaxResults) break;
      }
      if (items.length >= parsedMaxResults) break;
    }

    console.log(`Found ${items.length} results for "${searchQuery}"`);

    return new Response(
      JSON.stringify({ success: true, items }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Search failed", items: [] }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
