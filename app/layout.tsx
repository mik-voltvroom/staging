import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Volt & Vroom | Slimmer hybride rijden",
  description: "Geteste hybride auto's, transparante informatie en lage gebruikskosten.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.voltvroom.nl")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="nl"><body><AuthProvider>{children}</AuthProvider></body></html>;
}
