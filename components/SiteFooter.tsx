import { BrandLogo } from "@/components/BrandLogo";

export function SiteFooter() {
  return <footer className="siteFooter"><div className="container footerTop"><div><BrandLogo dark /><p>Slim rijden. Meer genieten.</p></div><div><strong>Ontdek</strong><a href="/hybride">Hybride</a><a href="/elektrisch">Elektrisch</a><a href="/icons">Icons</a><a href="/#voorraad">Aanbod</a></div><div><strong>Advies</strong><a href="/keuzehulp">Hybrid &amp; EV Match</a><a href="/#waarom">Onze norm</a><a href="/#advies">Contact</a></div><div><strong>Contact</strong><a href="tel:+31502113883">050 211 3883</a><a href="mailto:mik@voltvroom.nl">mik@voltvroom.nl</a><span>Euvelgunnerweg 50</span><span>9723 CW Groningen</span></div></div><div className="container footerBottom"><span>© 2026 Volt &amp; Vroom</span><div><a href="/privacy">Privacy</a><a href="/login">VVOS-login</a></div></div></footer>;
}
