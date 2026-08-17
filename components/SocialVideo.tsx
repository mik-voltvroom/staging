"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PublicSocialVideo } from "@/lib/social-video/model";

declare global {
  interface Window { dataLayer?: Array<Record<string, unknown>>; }
}

function track(event: string, video: PublicSocialVideo, extra: Record<string, unknown> = {}) {
  const payload = { event, video_id: video.id, video_platform: video.platform, video_title: video.title, ...extra };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent("vv:analytics", { detail: payload }));
}

export function SocialVideo({ video, compact = false }: { video: PublicSocialVideo; compact?: boolean }) {
  const [active, setActive] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const observed = useRef(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || observed.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && !observed.current) {
        observed.current = true;
        track("video_impression", video);
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [video]);

  function activate() {
    setActive(true);
    track("video_play", video);
  }

  const ratioClass = video.aspectRatio === "16:9" ? "socialVideoLandscape" : "socialVideoPortrait";
  return <article ref={cardRef} className={`socialVideoCard ${ratioClass}${compact ? " socialVideoCompact" : ""}`}>
    <div className="socialVideoMedia">
      {active && video.embedUrl ? (
        <iframe src={video.embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
      ) : (
        <button type="button" className="socialVideoPoster" onClick={activate} aria-label={`Speel video af: ${video.title}`}>
          {video.thumbnailUrl ? <Image src={video.thumbnailUrl} alt="" fill sizes={video.aspectRatio === "9:16" ? "(max-width: 640px) 82vw, 280px" : "(max-width: 900px) 100vw, 560px"} /> : <span className="socialVideoFallback" aria-hidden="true"><b>VV</b></span>}
          <span className="socialVideoPlay" aria-hidden="true">▶</span>
          <span className="socialVideoPlatform">{video.platform}</span>
        </button>
      )}
    </div>
    <div className="socialVideoCopy">
      {(video.brand || video.model) && <span className="socialVideoMeta">{[video.brand, video.model].filter(Boolean).join(" · ")}</span>}
      <h3>{video.title}</h3>
      {video.description && !compact && <p>{video.description}</p>}
      {video.vehicleIds.length > 0 && <a href={`/voorraad/${video.vehicleIds[0]}`} data-vv-event="video_vehicle_click" onClick={() => track("video_vehicle_click", video, { vehicle_id: video.vehicleIds[0] })}>Bekijk de auto <span aria-hidden="true">→</span></a>}
      {video.vvVerifiedId && <a href="/vv-verified" data-vv-event="video_carcheck_click" onClick={() => track("video_carcheck_click", video)}>Bekijk VV Verified <span aria-hidden="true">→</span></a>}
    </div>
  </article>;
}
