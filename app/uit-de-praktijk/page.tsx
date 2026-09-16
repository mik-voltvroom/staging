import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";
import { YoutubeVideoLibrary } from "@/components/YoutubeVideoLibrary";
import { youtubeConfig } from "@/lib/youtube/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Uit de praktijk | Volt & Vroom",
  description: "Video's over hybride, elektrisch, VV Verified, CarCheck en onze auto's uit de praktijk.",
  alternates: { canonical: "/uit-de-praktijk" },
};

export default async function UitDePraktijkPage() {
  return <>
    <Header />
    <main className="videoHubPage">
      <section className="videoHubHero"><div className="container"><p className="eyebrow">VV Stories · Uit de praktijk</p><h1>Geen verkooppraat.<br /><em>Laat maar zien.</em></h1><p className="lead">Kijk mee met selectie, techniek, batterijcontrole, rijervaring en auto's die bij Volt &amp; Vroom binnenkomen.</p></div></section>
      <section className="section container"><YoutubeVideoLibrary channelUrl={youtubeConfig.channelUrl} subscribeUrl={youtubeConfig.subscribeUrl} /></section>
    </main>
    <SiteFooter />
  </>;
}
