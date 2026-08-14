import Image from "next/image";
import { Header } from "@/components/Header";
import { SiteFooter } from "@/components/SiteFooter";

type SegmentPageProps = {
  eyebrow: string;
  title: string;
  lead: string;
  icon: string;
  idealFor: string[];
  proof: { title: string; text: string }[];
  adviceTitle: string;
  adviceText: string;
  accent?: "copper";
};

export function SegmentPage({ eyebrow, title, lead, icon, idealFor, proof, adviceTitle, adviceText, accent }: SegmentPageProps) {
  return <>
    <Header />
    <main className={`segmentPage${accent === "copper" ? " segmentCopper" : ""}`}>
      <section className="segmentHero"><div className="container segmentHeroGrid">
        <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="lead">{lead}</p><div className="actions"><a className="button" href="/keuzehulp">Doe de keuzehulp <span aria-hidden="true">→</span></a><a className="textButton" href="/#voorraad">Bekijk het aanbod</a></div></div>
        <div className="segmentIconPanel"><Image src={icon} alt="" width={92} height={92} /><p>De juiste aandrijflijn.</p><strong>Aantoonbaar de juiste auto.</strong></div>
      </div></section>
      <section className="section container"><div className="sectionHeading splitHeading"><div><p className="eyebrow">Past dit bij u?</p><h2>Een logische keuze wanneer…</h2></div><p className="sectionIntro">Uw dagelijkse gebruik is belangrijker dan de trend. Dit zijn de situaties waarin deze categorie vaak goed past.</p></div><ul className="fitGrid">{idealFor.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}</ul></section>
      <section className="section segmentProof"><div className="container"><div className="sectionHeading"><p className="eyebrow">Informatie vóór verkoop</p><h2>Wij laten zien wat ertoe doet.</h2></div><div className="proofCards">{proof.map(item => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div></section>
      <section className="section container segmentAdvice"><div><p className="eyebrow">Persoonlijk advies</p><h2>{adviceTitle}</h2></div><div><p className="lead">{adviceText}</p><a className="button" href="/keuzehulp">Start Hybrid &amp; EV Match <span aria-hidden="true">→</span></a></div></section>
    </main>
    <SiteFooter />
  </>;
}
