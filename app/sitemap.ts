import type { MetadataRoute } from "next";
import { knowledgeArticles, marketingLandings } from "@/lib/marketing-content";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";

export default function sitemap(): MetadataRoute.Sitemap {
  const evergreen = ["", "/hybride", "/elektrisch", "/icons", "/inruilen", "/keuzehulp", "/vv-verified", "/uit-de-praktijk", "/contact", "/privacy"];
  const marketing = Object.values(marketingLandings).map((page) => `/${page.slug}`);
  const knowledge = ["/kennis", ...knowledgeArticles.map((article) => `/kennis/${article.slug}`)];

  return [...evergreen, ...marketing, ...knowledge].map((path, index) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: index === 0 || path === "/uit-de-praktijk" || path === "/kennis" ? "weekly" : "monthly",
    priority: index === 0 ? 1 : path === "/privacy" ? 0.2 : marketing.includes(path) ? 0.9 : knowledge.includes(path) ? 0.8 : 0.8,
  }));
}
