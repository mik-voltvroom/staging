import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { IconsInventoryCarousel } from "@/components/IconsInventoryCarousel";
import { SiteFooter } from "@/components/SiteFooter";
import { isIconsVehicle, listPublicVehicles } from "@/lib/repositories/public-vehicle-repository";

export const metadata: Metadata = {
  title: "Volt & Vroom Icons | Gebouwd voor liefhebbers",
  description: "Icons — gebouwd voor liefhebbers van auto’s met karakter, historie en een verhaal dat verder gaat dan de brochure.",
  alternates: { canonical: "/icons" },
};

export default async function IconsPage() {
  const vehicles = (await listPublicVehicles(100)).filter(isIconsVehicle);

  return <>
    <Header />
    <main className="iconsPage">
      <section className="iconsHero">
        <div className="container iconsHeroGrid">
          <div>
            <p className="eyebrow">ICONS — Gebouwd voor liefhebbers</p>
            <h1>Auto’s met een verhaal.</h1>
            <p className="iconsHeroLead">Youngtimers, klassiekers in spe en bijzondere sportieve auto’s. Geselecteerd op karakter, historie en techniek — voor liefhebbers die voelen dat de juiste auto meer is dan vervoer.</p>
            <a className="button iconsPrimaryCta" href="#icons-voorraad">Bekijk het Icons-aanbod <span aria-hidden="true">→</span></a>
          </div>
          <div className="iconsHeroArtwork" aria-label="Icons: circuit en klassieker" role="img">
            <span className="iconsCircuitLine" aria-hidden="true" />
            <span className="iconsHeroMark" aria-hidden="true">V&V</span>
            <p>Karakter. Historie. Rijbeleving.</p>
          </div>
        </div>
      </section>

      <section className="section container iconsPrinciples">
        <div className="sectionHeading splitHeading">
          <div><p className="eyebrow">De Icons-norm</p><h2>Gemaakt om lang naar te blijven kijken.</h2></div>
          <p className="sectionIntro">Een bijzondere auto verdient meer context. Wij maken zichtbaar wat de auto bijzonder maakt én wat u moet weten voordat u instapt.</p>
        </div>
        <div className="iconsPrincipleGrid">
          <article><span>01</span><h3>Historie die klopt</h3><p>Onderhoud, eigenaarschap en documentatie vormen het verhaal achter de auto.</p></article>
          <article><span>02</span><h3>Techniek zonder ruis</h3><p>Relevante aandachtspunten en technische staat worden concreet uitgelegd.</p></article>
          <article><span>03</span><h3>Karakter met standaard</h3><p>Bijzonder in uitstraling, rustig en transparant in onze begeleiding.</p></article>
        </div>
      </section>

      <IconsInventoryCarousel vehicles={vehicles} />
    </main>
    <SiteFooter />
  </>;
}
