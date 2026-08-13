# VVOS staging → production architectuur

## Huidige veilige grens

| Onderdeel | Staging | Production |
|---|---|---|
| GitHub | deze repository, `main` via PR | afzonderlijke private repository |
| Firebase | eigen project en App Hosting-backend | eigen project en handmatige backend-rollout |
| Config | actieve `apphosting.yaml` is staging-only | eigen actieve config; voorbeeld staat alleen onder docs |
| Secrets/data | sandbox/test, nooit echte klantdata | onafhankelijke live secrets en data |
| Rollout | automatisch na protected merge mag | handmatig na expliciete eigenaar-goedkeuring |

## Routinggrens

De middleware classificeert browser- en API-routes centraal. Publieke verkooproutes blijven bereikbaar; dashboard en interne API’s vereisen een sessie. Cron en VWE zijn expliciete machinehooks en valideren hun eigen secret fail-closed. Handler-level autorisatie blijft de definitieve controle voor rollen en permissions.

## Nog niet production-ready

- Tokenportaal gebruikt nog demo/sampled data; vervang dit door ondertekende, intrekbare en aflopende tokens voordat echte klantdata wordt gebruikt.
- Publieke lead-, RDW- en portal-endpoints hebben nog geen rate limiting/WAF-beleid.
- Firestore lead creation staat publiek open; voeg App Check, strikte veldvalidatie en abuse-monitoring toe.
- Provideraccounts, Firebase-project-ID, App Hosting-backend, domein/DNS en Secret Manager-waarden zijn externe inrichting en staan niet in git.
- Repository is momenteel public; maak hem private voordat interne logica of providerintegraties worden uitgebreid.

## Geverifieerde Firebase-status (13 augustus 2026)

- Firebase-project bestaat: `voltvroom-staging` (projectnummer `241472991923`).
- Eigenaarstoegang voor `mik@voltvroom.nl` is aanwezig.
- Project staat op het kosteloze Spark-plan; Firebase meldt expliciet dat App Hosting pas na een pricing-plan-upgrade gebruikt kan worden.
- Er is nog geen App Hosting-backend.
- Projectomgeving staat nog op `Unspecified` in plaats van `Staging`.
- Er is nog geen Firebase Web App geregistreerd, waardoor de `NEXT_PUBLIC_FIREBASE_*` configuratie nog niet beschikbaar is.
- Firebase Authentication kon zijn configuratie nog niet laden; richt dit pas in nadat de Web App en vereiste providers zijn gekozen.

De billing-upgrade is een financiële/externe keuze en wordt daarom niet automatisch uitgevoerd. Na die keuze: zet environment type op staging, registreer de Web App, configureer Authentication, provision secrets en maak pas daarna de App Hosting-backend.

## Promotieprincipe

Promotie is een overdracht van exact dezelfde geteste snapshot, niet een merge met aanvullende wijzigingen. De goedgekeurde staging-SHA, CI-uitkomst, smokechecks en rollback-SHA horen bij iedere release vastgelegd te worden.
