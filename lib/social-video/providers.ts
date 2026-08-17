import type { SocialVideoPlatform } from "@/lib/social-video/model";

export type ResolvedSocialVideo = {
  platform: SocialVideoPlatform;
  externalId?: string;
  canonicalUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
  aspectRatio: "9:16" | "16:9";
  suggestedTitle: string;
};

export interface SocialVideoProvider {
  platform: SocialVideoPlatform;
  canHandle(url: URL): boolean;
  resolve(url: URL): Promise<ResolvedSocialVideo>;
}

function youtubeId(url: URL): string | null {
  if (url.hostname === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
  if (url.hostname.endsWith("youtube.com")) {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (["shorts", "embed"].includes(parts[0] ?? "")) return parts[1] ?? null;
  }
  return null;
}

const youtubeProvider: SocialVideoProvider = {
  platform: "youtube",
  canHandle(url) {
    return Boolean(youtubeId(url));
  },
  async resolve(url) {
    const id = youtubeId(url);
    if (!id || !/^[A-Za-z0-9_-]{6,20}$/.test(id)) throw new Error("Ongeldige YouTube-video-URL.");
    const isShort = url.pathname.includes("/shorts/");
    return {
      platform: "youtube",
      externalId: id,
      canonicalUrl: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      aspectRatio: isShort ? "9:16" : "16:9",
      suggestedTitle: "YouTube-video",
    };
  },
};

function tiktokId(url: URL): string | null {
  if (!url.hostname.endsWith("tiktok.com")) return null;
  const match = url.pathname.match(/\/video\/(\d+)/);
  return match?.[1] ?? null;
}

const tiktokProvider: SocialVideoProvider = {
  platform: "tiktok",
  canHandle(url) {
    return Boolean(tiktokId(url));
  },
  async resolve(url) {
    const id = tiktokId(url);
    if (!id) throw new Error("Gebruik een volledige TikTok video-URL met /video/{id}.");
    return {
      platform: "tiktok",
      externalId: id,
      canonicalUrl: url.toString(),
      embedUrl: `https://www.tiktok.com/player/v1/${id}?controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&timestamp=1&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=1`,
      aspectRatio: "9:16",
      suggestedTitle: "TikTok-video",
    };
  },
};

const instagramProvider: SocialVideoProvider = {
  platform: "instagram",
  canHandle(url) {
    return url.hostname.endsWith("instagram.com") && /^\/(reel|p)\//.test(url.pathname);
  },
  async resolve(url) {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[1];
    if (!id) throw new Error("Ongeldige Instagram-URL.");
    return {
      platform: "instagram",
      externalId: id,
      canonicalUrl: url.toString(),
      embedUrl: `${url.origin}/${parts[0]}/${id}/embed/`,
      aspectRatio: "9:16",
      suggestedTitle: "Instagram-video",
    };
  },
};

const providers: SocialVideoProvider[] = [youtubeProvider, tiktokProvider, instagramProvider];

export async function resolveSocialVideoUrl(sourceUrl: string): Promise<ResolvedSocialVideo> {
  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    throw new Error("Ongeldige video-URL.");
  }
  if (url.protocol !== "https:") throw new Error("Alleen HTTPS-video-URL's zijn toegestaan.");
  const provider = providers.find(candidate => candidate.canHandle(url));
  if (!provider) throw new Error("Dit videoplatform of URL-formaat wordt nog niet ondersteund.");
  return provider.resolve(url);
}
