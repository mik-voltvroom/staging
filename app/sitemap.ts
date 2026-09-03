import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/hybride", "/elektrisch", "/icons", "/inruilen", "/keuzehulp", "/vv-verified", "/uit-de-praktijk", "/contact", "/privacy"].map((path, index) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 || path === "/uit-de-praktijk" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/privacy" ? 0.2 : path === "/uit-de-praktijk" ? 0.85 : 0.8,
  }));
}
