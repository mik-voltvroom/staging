"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

export function LoginForm() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function login() {
    setError("");
    if (!auth) { location.href = "/dashboard"; return; }
    try { setBusy(true); await signInWithEmailAndPassword(auth, email, password); location.href = "/dashboard"; }
    catch { setError("Inloggen is niet gelukt. Controleer uw gegevens."); setBusy(false); }
  }
  return <div className="loginCard"><p className="eyebrow">Volt & Vroom Operating System</p><h1>Welkom terug</h1><p>Log in voor voorraad, leads en integraties.</p><label>E-mailadres<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Wachtwoord<input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} /></label>{error && <p className="formError">{error}</p>}<button type="button" className="button wide" onClick={login} disabled={busy}>{busy ? "Inloggen…" : "Inloggen"}</button>{!auth && <div className="demoNotice">Demo-modus: klik op inloggen zonder gegevens.</div>}</div>;
}
