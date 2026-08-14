import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = { title: "Privacy | Volt & Vroom", description: "Lees hoe Volt & Vroom zorgvuldig omgaat met persoonsgegevens.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return <><Header /><main className="container legalPage"><p className="eyebrow">Privacy</p><h1>Uw gegevens, helder uitgelegd.</h1><p className="lead">Volt &amp; Vroom gebruikt de gegevens uit het contactformulier en de keuzehulp uitsluitend om uw aanvraag te beantwoorden en onze dienstverlening uit te voeren.</p><section><h2>Welke gegevens verwerken we?</h2><p>Uw naam, contactgegevens, interesse, gebruiksprofiel en de toelichting die u zelf invult. We vragen niet meer dan nodig is voor persoonlijk advies.</p><h2>Waarom verwerken we deze gegevens?</h2><p>Om advies te geven, een proefrit te plannen, vragen over voorraad te beantwoorden of een mogelijke inruil te bespreken.</p><h2>Bewaren en delen</h2><p>Gegevens worden niet verkocht. We bewaren ze niet langer dan nodig voor de aanvraag, onze administratie en wettelijke verplichtingen.</p><h2>Uw rechten</h2><p>U kunt vragen om inzage, correctie of verwijdering via <a href="mailto:mik@voltvroom.nl">mik@voltvroom.nl</a>.</p><h2>Contact</h2><p>Volt &amp; Vroom, Euvelgunnerweg 50, 9723 CW Groningen. Telefoon: <a href="tel:+31502113883">050 211 3883</a>.</p></section></main><SiteFooter /></>;
}
