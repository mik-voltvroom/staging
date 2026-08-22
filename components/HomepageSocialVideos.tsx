import { SocialVideo } from "@/components/SocialVideo";
import { listPublishedSocialVideos } from "@/lib/social-video/repository";

export async function HomepageSocialVideos() {
  const videos = await listPublishedSocialVideos({ placement: "homepage", limit: 4 }).catch(() => []);
  if (videos.length === 0) return null;

  const [latestVideo, ...recentVideos] = videos;

  return <section className="section homeVideoSection" aria-labelledby="social-video-title"><div className="container">
    <div className="sectionHeading splitHeading"><div><p className="eyebrow">Volg Volt &amp; Vroom</p><h2 id="social-video-title">De nieuwste video. Recht uit de praktijk.</h2></div><div><p className="sectionIntro">Nieuwe binnenkomers, controles, uitleg en eerlijke praktijkervaring. De meest recente gepubliceerde video staat altijd vooraan.</p><a className="textButton" href="/uit-de-praktijk">Bekijk alle video's <span aria-hidden="true">→</span></a></div></div>

    <div className="latestSocialVideo">
      <div className="latestSocialVideoLabel"><span>Nieuw</span><strong>Laatste geplaatste video</strong></div>
      <SocialVideo video={latestVideo} />
    </div>

    {recentVideos.length > 0 && <div className="recentSocialVideos">
      <div className="recentSocialVideosHead"><span>Meer uit de praktijk</span><small>De laatste publicaties van Volt &amp; Vroom</small></div>
      <div className="homeVideoGrid">{recentVideos.map(video => <SocialVideo key={video.id} video={video} compact />)}</div>
    </div>}
  </div></section>;
}
