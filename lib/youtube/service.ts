import { hasYoutubeFeedConfig, youtubeConfig } from "@/lib/youtube/config";

export const youtubeCategories = ["Alles", "Auto’s", "Uitleg", "CarCheck", "Reviews", "Afleveringen", "Showroom", "Shorts", "AI & Meta-bril"] as const;
export type YoutubeCategory = (typeof youtubeCategories)[number];

export type YoutubeVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  category: YoutubeCategory;
  isShort: boolean;
  videoUrl: string;
  embedUrl: string;
};

type SearchItem = {
  id?: { videoId?: string };
  snippet?: { title?: string; description?: string; publishedAt?: string; thumbnails?: { high?: { url?: string }; medium?: { url?: string } } };
};

type VideoItem = { id?: string; contentDetails?: { duration?: string } };

function youtubeApiUrl(path: string, params: Record<string, string>) {
  const query = new URLSearchParams({ ...params, key: youtubeConfig.apiKey });
  return `https://www.googleapis.com/youtube/v3/${path}?${query.toString()}`;
}

function isoDurationSeconds(value: string): number {
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return Number.POSITIVE_INFINITY;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

function categoryFor(title: string, isShort: boolean): YoutubeCategory {
  if (isShort) return "Shorts";
  const normalized = title.toLocaleLowerCase("nl-NL");
  if (/(meta.?bril|ray-ban|ai\b|kunstmatige intelligentie)/i.test(normalized)) return "AI & Meta-bril";
  if (/(carcheck|vv verified|controlepunt|accu gezondheid)/i.test(normalized)) return "CarCheck";
  if (/(review|rijtest|ervaring|getest)/i.test(normalized)) return "Reviews";
  if (/(aflever|ophalen|geleverd|overhandig)/i.test(normalized)) return "Afleveringen";
  if (/(showroom|binnengekomen|voorraad|occasion)/i.test(normalized)) return "Showroom";
  if (/(uitleg|hoe werkt|wat is|verschil|laad|onderhoud|hybride|elektrisch)/i.test(normalized)) return "Uitleg";
  return "Auto’s";
}

async function youtubeFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const response = await fetch(youtubeApiUrl(path, params), { next: { revalidate: 300 } });
  const payload = await response.json() as T & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || "YouTube kon de videolijst niet laden.");
  return payload;
}

export async function listYoutubeVideos(): Promise<YoutubeVideo[]> {
  if (!hasYoutubeFeedConfig) throw new Error("YouTube-feedconfiguratie ontbreekt.");
  const search = await youtubeFetch<{ items?: SearchItem[] }>("search", {
    part: "snippet",
    channelId: youtubeConfig.channelId,
    maxResults: "50",
    order: "date",
    type: "video",
  });
  const items = (search.items || []).filter(item => item.id?.videoId && item.snippet?.title && item.snippet.publishedAt);
  if (items.length === 0) return [];
  const ids = items.map(item => item.id!.videoId!).join(",");
  const details = await youtubeFetch<{ items?: VideoItem[] }>("videos", { part: "contentDetails", id: ids });
  const durations = new Map((details.items || []).map(item => [item.id, isoDurationSeconds(item.contentDetails?.duration || "")]));

  return items.map(item => {
    const id = item.id!.videoId!;
    const snippet = item.snippet!;
    const isShort = (durations.get(id) || Number.POSITIVE_INFINITY) <= 60;
    return {
      id,
      title: snippet.title!,
      description: snippet.description || "",
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || "",
      publishedAt: snippet.publishedAt!,
      category: categoryFor(snippet.title!, isShort),
      isShort,
      videoUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0`,
    };
  });
}
