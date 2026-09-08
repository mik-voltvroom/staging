import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/login"] },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: ["/dashboard/", "/api/", "/login"] },
      { userAgent: "ChatGPT-User", allow: "/", disallow: ["/dashboard/", "/api/", "/login"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
