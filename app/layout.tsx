import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import "./public.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Volt & Vroom | Eerlijk advies over elektrisch en hybride",
  description: "Elektrisch of hybride? Volt & Vroom maakt techniek, gebruikskosten en accugezondheid begrijpelijk, met persoonlijk advies vanuit Groningen.",
  openGraph: { type: "website", locale: "nl_NL", siteName: "Volt & Vroom", title: "Volt & Vroom | Slim rijden. Meer genieten.", description: "Persoonlijk en transparant advies over elektrisch en hybride rijden.", url: "/", images: [{ url: "/editorial/hero-v2.png", width: 1680, height: 945, alt: "Elektrisch of hybride? Volt & Vroom helpt kiezen." }] },
  twitter: { card: "summary_large_image", title: "Volt & Vroom", description: "Eerlijk advies over elektrisch en hybride rijden.", images: ["/editorial/hero-v2.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#ffffff", colorScheme: "light", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
