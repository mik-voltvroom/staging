export function requiresCurrentWebInfo(question: string): boolean {
  return /wegenbelasting|motorrijtuigenbelasting|\bmrb\b|bijtelling|belastingdienst|belasting|subsidie|fiscale|tarief|regelgeving|wetgeving|actueel|vandaag|dit jaar|2026/i.test(question);
}
