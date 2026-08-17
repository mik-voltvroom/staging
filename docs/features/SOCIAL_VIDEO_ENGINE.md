# VV Stories / Social Video Engine v1

Status: featurebranch `agent/social-video-engine-v1`. Geen productie- of accountkoppelingen.

## Doel

Sociale video is een VVOS-contentobject met commerciële context. De website toont alleen door VVOS goedgekeurde records en laadt externe spelers pas na expliciete interactie.

## Datamodel

Firestore collectie: `socialVideos`.

Belangrijkste velden:
- `id`: deterministisch op basis van platform + externe video-identiteit;
- `platform`: `tiktok | youtube | instagram | native`;
- `sourceUrl`, `externalId`, `embedUrl`, `thumbnailUrl`;
- `status`: `draft | review | published | archived | unavailable`;
- `sourceState`: `unchecked | available | unavailable | unknown`;
- `sourceCheckedAt`;
- `contentType`, `brand`, `model`, `vehicleIds`, `carCheckId`, `vvVerifiedId`;
- `placements`: homepage, inventory, vehicleDetail, carCheck, knowledge;
- interne analytics-tellers.

Interne analytics en bronstatus worden niet via de publieke SocialVideo allow-list ontsloten.

## Importflow

1. Medewerker plakt een ondersteunde HTTPS-URL in VVOS.
2. Provider herkent platform en externe ID.
3. VVOS normaliseert de URL en maakt een deterministisch document-ID.
4. Firestore `create()` blokkeert een dubbele import atomisch.
5. Nieuwe video start in `review`.
6. Medewerker kiest relaties en plaatsingen.
7. Pas status `published` maakt het record publiek opvraagbaar.

Ondersteunde handmatige bronnen in v1:
- YouTube watch, Shorts, youtu.be;
- volledige TikTok `/video/{id}` URLs;
- Instagram `/reel/{id}` en `/p/{id}` URLs.

## Publicatie

Publiek:
- `/uit-de-praktijk`;
- maximaal vier homepage-items;
- voertuigdetail via `vehicleIds` + `vehicleDetail`;
- VV Verified / CarCheck via `carCheck` placement.

Alle publieke queries filteren op `status == published`.

## Privacy en performance

- Geen OAuth of social access tokens in v1.
- Geen client-side credentials.
- Externe iframe verschijnt pas na klik.
- YouTube gebruikt `youtube-nocookie.com`.
- Alleen publiek-veilige velden verlaten de server.
- Verwijderde bronnen kunnen via de interne broncontrole naar `unavailable` worden gezet; zo verdwijnen ze uit publieke queries.

## Broncontrole

Interne endpoint:

`POST /api/social-videos/{id}/availability`

Gedrag:
- vereist `socialVideos.write`;
- gebruikt alleen providergebonden externe URLs;
- 5 seconden timeout;
- 404/410 => `unavailable` en video-status `unavailable`;
- 2xx/3xx => `available`;
- rate-limit/andere fout => `unknown`, geen destructieve statuswijziging;
- wanneer een eerder onbeschikbare bron terugkomt, gaat de video naar `review`, niet automatisch terug naar `published`.

De broncontrole is in v1 handmatig vanuit VVOS. Automatisch periodiek controleren hoort bij een latere scheduler/automation-stap en mag pas na stagingacceptatie worden geactiveerd.

## Analytics

Publieke events worden provider-neutraal vastgelegd. De huidige kern bevat onder andere:
- `video_impression`;
- `video_play`;
- `video_vehicle_click`;
- `video_carcheck_click`;
- contact-/proefritgerelateerde videoconversies.

VVOS bewaart alleen tellingen per video voor deze eerste release; klantdata wordt niet in het SocialVideo-object opgeslagen.

## Rechten

- owner/admin/marketing: beheer;
- sales/workshop: lezen volgens de huidige permissions;
- publieke bezoeker: uitsluitend `published` allow-listed metadata.

## Nog niet geactiveerd

- TikTok/YouTube/Meta OAuth;
- automatische social-inbox;
- automatische socialpublicatie;
- periodieke availability scheduler;
- native mastervideo upload naar eigen storage;
- AI-autopublicatie;
- volledige lead/deal/marge-attributie;
- productie-release.

## Voorraadkoppeling

Wanneer de echte voorraadfeed beschikbaar is:
1. gebruik het definitieve VVOS vehicle ID als `vehicleIds[]`;
2. valideer dat een voertuig publiek publiceerbaar is voordat een videolink publiek wordt getoond;
3. koppel modelvideo's los van voertuig-specifieke video's;
4. test sold/archived gedrag zodat oude voertuigvideo's niet naar een niet-bestaande CTA linken.

## Releasegate

Niet mergen/deployen zolang niet groen:
- dependency audit;
- repo guard;
- agent audit;
- TypeScript typecheck;
- Vitest;
- Next.js production build;
- review van publieke data allow-list;
- staging smoke-test na expliciet akkoord.
