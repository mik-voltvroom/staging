import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

const offerLinks = [
  { href: "/voorraad", label: "Volledig aanbod" },
  { href: "/hybride", label: "Hybride" },
  { href: "/elektrisch", label: "Elektrisch" },
  { href: "/icons", label: "Icons" },
  { href: "/#waarom", label: "Waarom Volt & Vroom" },
];

const inspirationLinks = [
  { href: "/kennis", label: "Kennisbank" },
  { href: "/uit-de-praktijk", label: "Uit de praktijk" },
];

const mobileLinks = [
  ...offerLinks,
  { href: "/inruilen", label: "Inruilen" },
  ...inspirationLinks,
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return <header className="siteHeader"><div className="container nav">
    <BrandLogo />
    <nav className="navlinks" aria-label="Hoofdnavigatie">
      <details className="navDropdown" name="desktop-navigation"><summary>Aanbod <span aria-hidden="true">⌄</span></summary><div className="navDropdownPanel">
        {offerLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </div></details>
      <details className="navDropdown" name="desktop-navigation"><summary>Kennis <span aria-hidden="true">⌄</span></summary><div className="navDropdownPanel">
        {inspirationLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      </div></details>
      <Link href="/inruilen">Inruilen</Link>
      <Link href="/contact">Contact</Link>
    </nav>
    <Link href="/keuzehulp" className="button navCta" data-vv-event="match_started">Vind mijn auto</Link>
    <details className="mobileMenu"><summary aria-label="Open navigatiemenu"><span></span><span></span><span></span></summary><nav aria-label="Mobiele navigatie">
      {mobileLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
      <Link href="/keuzehulp" data-vv-event="match_started">Vind mijn auto</Link>
      <a href="tel:+31619163531" data-vv-event="phone_click">Bel 06 19 16 35 31</a>
    </nav></details>
  </div></header>;
}
