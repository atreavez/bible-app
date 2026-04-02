const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://api.piped.projectsegfau.lt",
  "https://pipedapi.in.projectsegfau.lt",
  "https://pipedapi.leptons.xyz",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Query is required", items: [] }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const searchQuery = `${query} gospel worship`;

    for (const instance of PIPED_INSTANCES) {
      try {
        const url = `${instance}/search?q=${encodeURIComponent(searchQuery)}&filter=music_songs`;
        console.log(`Trying ${instance}...`);
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        if (!res.ok) {
          console.log(`${instance} returned ${res.status}`);
          continue;
        }

        const data = await res.json();
        const items = (data.items || [])
          .filter((item: any) => item.url && item.title && item.type === "stream")
          .slice(0, 20)
          .map((item: any, i: number) => {
            const videoId = (item.url || "").replace("/watch?v=", "");
            return {
              id: `yt-${i}-${videoId}`,
              title: item.title || "Unknown",
              artist: item.uploaderName || "Unknown Artist",
              youtubeId: videoId,
              thumbnail:
                item.thumbnail ||
                `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              duration: item.duration || 0,
            };
          });

        console.log(`${instance} returned ${items.length} results`);
        return new Response(
          JSON.stringify({ success: true, items }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (e) {
        console.log(`${instance} failed: ${e}`);
        continue;
      }
    }

    // All instances failed — fallback empty
    return new Response(
      JSON.stringify({ success: true, items: [] }),
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
