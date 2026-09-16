const trim = (value: string | undefined) => value?.trim() || "";

export const youtubeConfig = {
  apiKey: trim(process.env.YOUTUBE_API_KEY),
  channelId: trim(process.env.YOUTUBE_CHANNEL_ID),
  channelUrl: trim(process.env.YOUTUBE_CHANNEL_URL),
  subscribeUrl: trim(process.env.YOUTUBE_SUBSCRIBE_URL),
};

export const missingYoutubeFeedConfig = [
  !youtubeConfig.apiKey ? "YOUTUBE_API_KEY" : null,
  !youtubeConfig.channelId ? "YOUTUBE_CHANNEL_ID" : null,
].filter((value): value is string => Boolean(value));

export const missingYoutubePresentationConfig = [
  !youtubeConfig.channelUrl ? "YOUTUBE_CHANNEL_URL" : null,
  !youtubeConfig.subscribeUrl ? "YOUTUBE_SUBSCRIBE_URL" : null,
].filter((value): value is string => Boolean(value));

export const hasYoutubeFeedConfig = missingYoutubeFeedConfig.length === 0;
