import type { Metadata } from "next";
import { SegmentPage } from "@/components/SegmentPage";

export const metadata: Metadata = { title: "Elektrische occasions Groningen | Volt & Vroom", description: "Geteste elektrische occasions met SOH-rapport, praktijkrange, laadadvies en aantoonbare historie bij Volt & Vroom Groningen.", alternates: { canonical: "/elektrisch" } };

export default function ElektrischPage() {
  return <SegmentPage eyebrow="Elektrische occasions · Noord-Nederland" title="Elektrisch wanneer het klopt." lead="Elektrisch rijden is stil, direct en efficiënt. Wij maken batterijconditie, praktijkbereik, laden en totale gebruikskosten begrijpelijk voordat u kiest." icon="/brand/icons/elektrisch.svg" idealFor={["U kunt thuis of op het werk structureel laden.", "Uw dagelijkse ritten zijn voorspelbaar en passen ruim binnen de praktijkrange.", "U wilt lagere gebruikskosten en bent bereid het laden onderdeel van uw routine te maken."]} proof={[{ title: "SOH-rapport", text: "De gemeten accugezondheid wordt in percentage getoond en in normale taal uitgelegd." }, { title: "Praktijkrange", text: "U ziet een realistische bandbreedte voor zomer, winter en uw gebruikssituatie." }, { title: "Laden en kosten", text: "Laadsnelheid, laadmogelijkheden en verwachte energie- en onderhoudskosten staan naast elkaar." }]} adviceTitle="Bereik is meer dan één getal." adviceText="Temperatuur, snelheid, wielen en laadgedrag hebben invloed. Wij bespreken daarom niet alleen de fabrieksopgave, maar vooral wat u in uw dagelijkse gebruik kunt verwachten." />;
}
