"use client";

import { useEffect, useState } from "react";
import type { IntegrationStatus } from "@/types";

export function IntegrationsPanel() {
  const [items, setItems] = useState<IntegrationStatus[]>([]);
  const [merchantMessage, setMerchantMessage] = useState("");
  const [driveMessage, setDriveMessage] = useState("");

  useEffect(() => {
    fetch("/api/integrations/status").then((response) => response.json()).then(setItems);
  }, []);

  async function syncMerchant() {
    setMerchantMessage("Synchroniseren…");
    const data = await fetch("/api/merchant-sync", { method: "POST" }).then((response) => response.json());
    setMerchantMessage(data.message ?? data.error);
  }

  async function testDrive() {
    setDriveMessage("Drive-runtime-authenticatie controleren…");
    const response = await fetch("/api/integrations/drive-test", { method: "POST" });
    const data = await response.json();
    setDriveMessage(response.ok ? data.message : `Drive-test mislukt: ${data.error ?? "onbekende fout"}`);
  }

  return (
    <>
      <div className="integrationGrid">
        {items.map((item) => (
          <article className="panel integrationCard" key={item.key}>
            <div className="panelHeader">
              <h2>{item.label}</h2>
              <span className={`modeBadge ${item.mode}`}>{item.mode}</span>
            </div>
            <p>{item.detail}</p>
            <small>{item.configured ? "Configuratie gevonden" : "Nog niet gekoppeld"}</small>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Beveiligde staging-controle</p>
            <h2>Google Drive runtime-authenticatie</h2>
          </div>
          <button className="button" type="button" onClick={testDrive}>Test Drive-toegang</button>
        </div>
        {driveMessage && <p className="syncMessage">{driveMessage}</p>}
        <p className="helper">Maakt tijdelijk een map <code>VVOS_AUTH_TEST-…</code> in <code>03 Voertuigen</code> en verwijdert die direct na de controle.</p>
      </section>

      <section className="panel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Publicatie</p>
            <h2>Merchant Center synchronisatie</h2>
          </div>
          <button className="button" type="button" onClick={syncMerchant}>Nu synchroniseren</button>
        </div>
        {merchantMessage && <p className="syncMessage">{merchantMessage}</p>}
        <p className="helper">De XML-feed blijft beschikbaar op <code>/api/merchant-feed</code>. API-push wordt actief zodra Google-credentials zijn toegevoegd.</p>
      </section>
    </>
  );
}
