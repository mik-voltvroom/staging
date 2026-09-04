import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const publicLinks = [
  { href: "/#uitgelicht", label: "Aanbod" },
  { href: "/inruilen", label: "Inruilen" },
  { href: "/#waarom", label: "Waarom V&V" },
  { href: "/hybride", label: "Hybride" },
  { href: "/elektrisch", label: "Elektrisch" },
  { href: "/icons", label: "Icons" },
  { href: "/kennis", label: "Kennis" },
  { href: "/uit-de-praktijk", label: "Video" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return <header className="siteHeader"><div className="container nav">
    <BrandLogo />
    <nav className="navlinks" aria-label="Hoofdnavigatie">{publicLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}</nav>
    <Link href="/keuzehulp" className="button navCta" data-vv-event="match_started">Vind mijn auto</Link>
    <details className="mobileMenu"><summary aria-label="Open navigatiemenu"><span></span><span></span><span></span></summary><nav aria-label="Mobiele navigatie">
      {publicLinks.map((link) => <Link href={link.href} key={link.href}>{link.label === "Waarom V&V" ? "Waarom Volt & Vroom" : link.label === "Video" ? "Uit de praktijk" : link.label}</Link>)}
      <Link href="/keuzehulp" data-vv-event="match_started">Vind mijn auto</Link>
      <a href="tel:+31502113883" data-vv-event="phone_click">Bel 050 211 3883</a>
    </nav></details>
  </div></header>;
}
