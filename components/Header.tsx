import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export function Header() {
  return <header className="container nav">
    <BrandLogo />
    <nav className="navlinks" aria-label="Hoofdnavigatie">
      <Link href="/#voorraad">Voorraad</Link>
      <Link href="/#waarom">Waarom hybride</Link>
      <Link href="/dashboard">Dashboard</Link>
    </nav>
    <Link href="/#contact" className="button secondary">Plan een proefrit</Link>
  </header>;
}
