# VVOS staging → production architectuur

## Huidige veilige grens

| Onderdeel | Staging | Production |
|---|---|---|
| GitHub | deze private repository, `main` via PR | afzonderlijke private repository |
| Firebase | project `voltvroom-staging`; App Hosting-backend nog niet aangemaakt | eigen project en handmatige backend-rollout |
| Config | actieve `apphosting.yaml` is staging-only | eigen actieve config; voorbeeld staat alleen onder docs |
| Secrets/data | sandbox/test, nooit echte klantdata | onafhankelijke live secrets en data |
| Rollout | automatisch na protected merge mag | handmatig na expliciete eigenaar-goedkeuring |

## Routinggrens

De middleware classificeert browser- en API-routes centraal. Publieke verkooproutes blijven bereikbaar; dashboard en interne API's vereisen een sessie. Cron en VWE zijn expliciete machinehooks en valideren hun eigen secret fail-closed. Handler-level autorisatie blijft de definitieve controle voor rollen en permissions.

## Nog niet production-ready

- Tokenportaal gebruikt nog demo/sampled data; vervang dit door ondertekende, intrekbare en aflopende tokens voordat echte klantdata wordt gebruikt.
- Publieke lead-, RDW- en portal-endpoints hebben nog geen rate limiting/WAF-beleid.
- Lead creation vereist nu een ingelogd staff-account. Activeer App Check pas nadat de webapp is uitgerold en getest; voortijdige enforcement kan staging blokkeren.
- App Hosting, domein/DNS en externe provideraccounts zijn nog niet ingericht.

## Geverifieerde Firebase-status (13 augustus 2026)

- Firebase-project bestaat: `voltvroom-staging` (projectnummer `241472991923`).
- Eigenaarstoegang voor `mik@voltvroom.nl` is aanwezig.
- Billing staat op Blaze Free Trial. Production is niet aangeraakt.
- Firebase Web App `VVOS Staging` is geregistreerd; de publieke clientconfig staat in `apphosting.yaml`.
- Email/Password Authentication is ingeschakeld. Er is nog geen eigenaaraccount of custom role claim aangemaakt.
- Firestore Standard en de default Storage-bucket staan in `europe-west4`.
- Firestore- en Storage Rules zijn gepubliceerd. De samengestelde indexes voor `vehicles` en `leads` zijn aangemaakt.
- `CRON_SECRET`, `VWE_WEBHOOK_SECRET`, `PORTAL_TOKEN_SECRET` en `AUDIT_HASH_SALT` bestaan in Secret Manager; hun waarden staan niet in git.
- Environment type blijft `Unspecified`: de Firebase-console bood alleen `Unspecified` en `Production`, niet `Staging`.
- PR #1 is na expliciete eigenaar-goedkeuring als commit `543586f87f532875b9c5af5a5e5cccd9b46064bd` naar staging `main` gemerged; de post-merge `quality`-check is geslaagd.
- Er is nog geen App Hosting-backend. De GitHub-import blijft hangen omdat voor het persoonlijke GitHub-account geen Firebase GitHub App is geïnstalleerd. Installeer de app met toegang tot uitsluitend `mik-voltvroom/staging` nadat PR #1 is goedgekeurd.
- De lokale-brondeploy via Firebase CLI is voorbereid als fallback. Afronding vereist een eenmalige Google-herauthenticatie door de eigenaar. Browserupload vereist daarnaast dat de ChatGPT Chrome-extensie toegang tot bestands-URL's heeft.

Na het aanmaken van de backend moet de runtime service identity minimaal `Secret Manager Secret Accessor` krijgen voor alleen de vier runtime-secrets. Daarna kan de eerste staging-rollout en smokecheck plaatsvinden.

## Promotieprincipe

Promotie is een overdracht van exact dezelfde geteste snapshot, niet een merge met aanvullende wijzigingen. De goedgekeurde staging-SHA, CI-uitkomst, smokechecks en rollback-SHA horen bij iedere release vastgelegd te worden.
