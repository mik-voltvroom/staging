import { SocialVideo } from "@/components/SocialVideo";
import { listPublishedSocialVideos } from "@/lib/social-video/repository";

export async function HomepageSocialVideos() {
  const videos = await listPublishedSocialVideos({ placement: "homepage", limit: 4 }).catch(() => []);
  if (videos.length === 0) return null;
  return <section className="section homeVideoSection"><div className="container">
    <div className="sectionHeading splitHeading"><div><p className="eyebrow">Uit de praktijk</p><h2>Echte auto's. Echte uitleg.</h2></div><div><p className="sectionIntro">Bekijk hoe wij auto's selecteren, controleren en in de praktijk beoordelen.</p><a className="textButton" href="/uit-de-praktijk">Bekijk alle video's <span aria-hidden="true">→</span></a></div></div>
    <div className="homeVideoGrid">{videos.map(video => <SocialVideo key={video.id} video={video} compact />)}</div>
  </div></section>;
}
