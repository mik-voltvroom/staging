import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/hybride", "/elektrisch", "/icons", "/keuzehulp", "/vv-verified", "/contact", "/privacy"].map((path, index) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/privacy" ? 0.2 : 0.8,
  }));
}
