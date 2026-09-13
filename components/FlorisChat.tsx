"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./FlorisChat.module.css";

type Source = { title: string; url: string };
type Message = { id: string; role: "user" | "assistant"; content: string; sources?: Source[] };
type ApiResponse = { ok: boolean; answer?: string; error?: string; sources?: Source[]; vehicle?: { name: string; trim: string } | null };

function id(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function vehicleSlug(pathname: string): string | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "voorraad" || !parts[1]) return undefined;
  try { return decodeURIComponent(parts[1]); } catch { return parts[1]; }
}

function initialMessage(hasVehicle: boolean): Message {
  return {
    id: id(),
    role: "assistant",
    content: hasVehicle
      ? "Hoi, ik ben Floris. Vraag me alles over deze auto — verbruik, actieradius, laden, opties of wegenbelasting."
      : "Hoi, ik ben Floris, de digitale auto-adviseur van Volt & Vroom. Waar kan ik mee helpen?",
  };
}

export function FlorisChat() {
  const pathname = usePathname() || "/";
  const slug = useMemo(() => vehicleSlug(pathname), [pathname]);
  const hidden = pathname.startsWith("/dashboard") || pathname.startsWith("/login") || pathname.startsWith("/portal");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [initialMessage(Boolean(slug))]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([initialMessage(Boolean(slug))]);
    setInput("");
    setError("");
  }, [slug]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (hidden) return null;

  const suggestions = slug
    ? ["Wat is het praktijkverbruik?", "Hoe ver kom ik in de winter?", "Hoe lang duurt 10–80% laden?", "Welke opties zijn bevestigd?", "Wat is de wegenbelasting?"]
    : ["Elektrisch of hybride?", "Welke actieradius heb ik nodig?", "Wat kost thuisladen?", "Hoe werkt wegenbelasting voor EV’s?"];

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    const userMessage: Message = { id: id(), role: "user", content: trimmed };
    const history = messages.filter(message => message !== messages[0]).slice(-8).map(message => ({ role: message.role, content: message.content }));
    setMessages(current => [...current, userMessage]);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/public/floris", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: trimmed, ...(slug ? { slug } : {}), history }),
      });
      const payload = await response.json().catch(() => ({})) as ApiResponse;
      if (!response.ok || !payload.ok || !payload.answer) throw new Error(payload.error || "Floris kon niet antwoorden.");
      setMessages(current => [...current, { id: id(), role: "assistant", content: payload.answer!, sources: payload.sources }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Floris kan deze vraag nu niet beantwoorden.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return <div className={styles.root}>
    {open ? <section className={styles.panel} role="dialog" aria-label="Chat met Floris">
      <header className={styles.header}>
        <div className={styles.avatar}>F</div>
        <div><strong>Floris</strong><span>Digitale auto-adviseur · Volt & Vroom</span></div>
        <button className={styles.close} type="button" onClick={() => setOpen(false)} aria-label="Floris sluiten">×</button>
      </header>
      <div className={styles.trustLine}><i /> Antwoorden op basis van VVOS-data. Actuele regels worden live gecontroleerd.</div>
      <div className={styles.messages} ref={scrollRef} aria-live="polite">
        {messages.map(message => <div key={message.id} className={`${styles.message} ${message.role === "user" ? styles.user : styles.assistant}`}>
          <div>{message.content}</div>
          {message.sources?.length ? <div className={styles.sources}><span>Bronnen</span>{message.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a>)}</div> : null}
        </div>)}
        {busy ? <div className={`${styles.message} ${styles.assistant} ${styles.typing}`}><i /><i /><i /></div> : null}
      </div>
      {messages.length <= 1 ? <div className={styles.suggestions}>{suggestions.map(suggestion => <button type="button" key={suggestion} onClick={() => void send(suggestion)}>{suggestion}</button>)}</div> : null}
      {error ? <div className={styles.error}>{error}</div> : null}
      <form className={styles.form} onSubmit={submit}>
        <input value={input} onChange={event => setInput(event.target.value)} maxLength={800} placeholder="Vraag Floris iets over de auto…" aria-label="Vraag aan Floris" disabled={busy} />
        <button type="submit" disabled={busy || !input.trim()} aria-label="Vraag versturen">↑</button>
      </form>
      <p className={styles.disclaimer}>Floris kan zich vergissen. Voor aankoopbeslissingen bevestigen we belangrijke gegevens graag persoonlijk.</p>
    </section> : null}
    <button className={styles.launcher} type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} aria-label={open ? "Floris sluiten" : "Vraag Floris"}>
      <span className={styles.launcherIcon}>F</span><span>Vraag Floris</span>
    </button>
  </div>;
}
