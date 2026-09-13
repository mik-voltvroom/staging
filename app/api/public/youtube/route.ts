import { NextResponse } from "next/server";
import { missingYoutubeFeedConfig } from "@/lib/youtube/config";
import { listYoutubeVideos } from "@/lib/youtube/service";

export const dynamic = "force-dynamic";

export async function GET() {
  if (missingYoutubeFeedConfig.length > 0) {
    return NextResponse.json({
      error: "YouTube is nog niet geconfigureerd.",
      missingConfig: missingYoutubeFeedConfig,
      videos: [],
    }, { status: 503 });
  }
  try {
    return NextResponse.json({ videos: await listYoutubeVideos() }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (error) {
    console.error("youtube_feed_failed", error);
    return NextResponse.json({ error: "De YouTube-video's konden niet worden geladen.", videos: [] }, { status: 502 });
  }
}
