"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm({ vehicles }: { vehicles: { id: string; label: string }[] }) {
  const [state, setState] = useState<FormState>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    const form = new FormData(event.currentTarget);
    const interest = String(form.get("interest") || "Adviesgesprek");
    const vehicleId = String(form.get("vehicleId") || "");
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(form.get("name") || ""), email: String(form.get("email") || "") || undefined, phone: String(form.get("phone") || "") || undefined, vehicleId: vehicleId || undefined, channel: "website", message: `${interest}: ${String(form.get("message") || "Geen aanvullende toelichting.")}`, consent: form.get("consent") === "on" }) }).catch(() => null);

    if (response?.ok) { setState("success"); event.currentTarget.reset(); } else { setState("error"); }
  }

  return <form className="contactForm" onSubmit={submit}>
    <div className="formHeader"><span>Persoonlijk antwoord</span><strong>Meestal binnen één werkdag</strong></div>
    <div className="formGrid publicFormGrid">
      <label>Naam<input name="name" autoComplete="name" minLength={2} required /></label><label>Telefoon<input name="phone" type="tel" autoComplete="tel" minLength={8} /></label><label className="span2">E-mailadres<input name="email" type="email" autoComplete="email" required /></label>
      <label>Waarmee kunnen we helpen?<select name="interest" defaultValue="Adviesgesprek"><option>Adviesgesprek</option><option>Proefrit plannen</option><option>Inruil bespreken</option><option>Vraag over voorraad</option></select></label><label>Voorkeursauto<select name="vehicleId" defaultValue=""><option value="">Nog geen voorkeur</option>{vehicles.map(vehicle => <option value={vehicle.id} key={vehicle.id}>{vehicle.label}</option>)}</select></label>
      <label className="span2">Vertel kort hoe u rijdt<textarea name="message" rows={4} placeholder="Bijvoorbeeld: 60 km per dag, vooral snelweg, thuis laden is mogelijk." /></label>
    </div>
    <label className="consent"><input name="consent" type="checkbox" required /><span>Ik ga ermee akkoord dat Volt &amp; Vroom mijn gegevens gebruikt om contact op te nemen. Lees het <a href="/privacy">privacybeleid</a>.</span></label>
    <button className="button wide" type="submit" disabled={state === "submitting"}>{state === "submitting" ? "Wordt verstuurd…" : "Vraag advies aan"}</button>
    <p className="formFeedback" aria-live="polite">{state === "success" ? "Bedankt. Uw aanvraag is ontvangen; we nemen persoonlijk contact met u op." : state === "error" ? "Versturen lukt nu niet. Bel 050 211 3883 of mail naar mik@voltvroom.nl." : ""}</p>
  </form>;
}
