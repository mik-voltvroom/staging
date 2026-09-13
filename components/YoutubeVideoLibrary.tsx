"use client";

import { useEffect, useMemo, useState } from "react";
import { youtubeCategories, type YoutubeVideo } from "@/lib/youtube/service";

type FeedState = { status: "loading" } | { status: "ready"; videos: YoutubeVideo[] } | { status: "error"; message: string; missingConfig?: string[] };

const dateFormatter = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric" });

export function YoutubeVideoLibrary({ channelUrl, subscribeUrl }: { channelUrl?: string; subscribeUrl?: string }) {
  const [state, setState] = useState<FeedState>({ status: "loading" });
  const [category, setCategory] = useState("Alles");
  const [query, setQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public/youtube", { signal: controller.signal })
      .then(async response => {
        const data = await response.json() as { videos?: YoutubeVideo[]; error?: string; missingConfig?: string[] };
        if (!response.ok) throw Object.assign(new Error(data.error || "De videolijst kon niet worden geladen."), { missingConfig: data.missingConfig });
        return data;
      })
      .then(data => setState({ status: "ready", videos: data.videos || [] }))
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        const failure = error instanceof Error ? error : new Error("De videolijst kon niet worden geladen.");
        const missingConfig = typeof error === "object" && error !== null && "missingConfig" in error && Array.isArray(error.missingConfig)
          ? error.missingConfig as string[]
          : undefined;
        setState({ status: "error", message: failure.message, missingConfig });
      });
    return () => controller.abort();
  }, []);

  const visible = useMemo(() => {
    if (state.status !== "ready") return [];
    const normalizedQuery = query.trim().toLocaleLowerCase("nl-NL");
    return state.videos.filter(video =>
      (category === "Alles" || video.category === category) &&
      (!normalizedQuery || `${video.title} ${video.description}`.toLocaleLowerCase("nl-NL").includes(normalizedQuery)),
    );
  }, [category, query, state]);

  return <div className="youtubeLibrary">
    <div className="youtubeLibraryToolbar">
      <label className="youtubeSearch"><span>Zoek in de video’s</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Titel of onderwerp" type="search" /></label>
      <div className="videoFilterBar" role="group" aria-label="Filter video's">{youtubeCategories.map(item => <button key={item} type="button" className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
    {state.status === "loading" && <div className="youtubeVideoGrid" aria-busy="true">{[1, 2, 3].map(item => <div className="youtubeSkeleton" key={item} />)}</div>}
    {state.status === "error" && <div className="videoEmptyState youtubeError"><strong>{state.message}</strong>{state.missingConfig?.length ? <p>Ontbrekende configuratie: {state.missingConfig.join(", ")}.</p> : <p>Probeer het later opnieuw.</p>}</div>}
    {state.status === "ready" && visible.length === 0 && <div className="videoEmptyState"><strong>{query || category !== "Alles" ? "Geen video’s gevonden." : "Nog geen video’s gepubliceerd."}</strong><p>{query || category !== "Alles" ? "Pas je zoekopdracht of categorie aan." : "Nieuwe praktijkvideo’s verschijnen hier zodra ze op het kanaal staan."}</p></div>}
    {state.status === "ready" && visible.length > 0 && <div className="youtubeVideoGrid">{visible.map(video => <article className="youtubeVideoCard" key={video.id}>
      <div className={`youtubeVideoMedia ${video.isShort ? "youtubeVideoShort" : ""}`}>
        {activeVideo === video.id ? <iframe src={video.embedUrl} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /> : <button type="button" className="youtubePoster" onClick={() => setActiveVideo(video.id)} aria-label={`Speel video af: ${video.title}`}><img src={video.thumbnailUrl} alt="" loading="lazy" /><span className="socialVideoPlay" aria-hidden="true">▶</span></button>}
      </div>
      <div className="youtubeVideoCopy"><div className="youtubeVideoMeta"><span>{video.category}</span><time dateTime={video.publishedAt}>{dateFormatter.format(new Date(video.publishedAt))}</time></div><h2>{video.title}</h2>{video.description && <p>{video.description}</p>}<a href={video.videoUrl} target="_blank" rel="noopener noreferrer">Bekijk op YouTube <span aria-hidden="true">↗</span></a></div>
    </article>)}</div>}
    <div className="youtubeLibraryFooter"><p>Meer zien van Volt &amp; Vroom?</p>{subscribeUrl && <a className="button" href={subscribeUrl} target="_blank" rel="noopener noreferrer">Abonneer op YouTube</a>}{channelUrl && <a className="textButton" href={channelUrl} target="_blank" rel="noopener noreferrer">Naar het kanaal <span aria-hidden="true">↗</span></a>}</div>
  </div>;
}
