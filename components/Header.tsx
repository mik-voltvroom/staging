import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  return <header className="siteHeader"><div className="container nav"><BrandLogo /><nav className="navlinks" aria-label="Hoofdnavigatie"><Link href="/#voorraad">Voorraad</Link><Link href="/#waarom">Onze zekerheid</Link><Link href="/#advies">Persoonlijk advies</Link></nav><Link href="/#advies" className="button navCta">Plan een gesprek</Link><details className="mobileMenu"><summary aria-label="Open navigatiemenu"><span></span><span></span><span></span></summary><nav aria-label="Mobiele navigatie"><Link href="/#voorraad">Voorraad</Link><Link href="/#waarom">Onze zekerheid</Link><Link href="/#advies">Persoonlijk advies</Link><a href="tel:+31502113883">Bel 050 211 3883</a></nav></details></div></header>;
}
