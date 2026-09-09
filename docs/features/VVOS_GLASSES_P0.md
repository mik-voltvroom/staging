# VVOS Glasses — P0

## Doel
VVOS Glasses is de handsfree CarCheck-laag van VVOS. P0 levert een werkende companion-interface zonder de voertuiglogica afhankelijk te maken van één brilfabrikant.

## Architectuur
`WearableDeviceAdapter → VVOS Companion → /api/vvos/inspection-sessions → inspection service/repository → Firestore + Storage + audit log`

De browsercamera is de eerste echte adapter. `MetaCompanionAdapter` is bewust alleen een contract: de native Meta Wearables SDK wordt pas aangesloten wanneer de companion-app/native bridge wordt gebouwd. De simulator gebruikt `MockGlassesAdapter` en is alleen buiten productie bereikbaar via `/dev/glasses`.

## Datamodel
Firestore root: `inspection_sessions/{inspectionId}`.

Subcollecties:
- `observations`
- `findings`
- `media`
- `processed_commands` voor idempotente command-verwerking

Media staat private in Firebase Storage onder:
`vehicles/{vehicleId}/inspections/{inspectionId}/{section}/{mediaId}.{ext}`

Uploads gebruiken een kortlevende signed PUT URL. VVOS markeert media pas als `uploaded` nadat Storage het object bevestigt.

## P0 API
- `GET|POST /api/vvos/inspection-sessions`
- `GET|PATCH /api/vvos/inspection-sessions/:id`
- `POST /api/vvos/inspection-sessions/:id/commands`
- `POST /api/vvos/inspection-sessions/:id/observations`
- `GET|POST /api/vvos/inspection-sessions/:id/media`
- `PATCH /api/vvos/inspection-sessions/:id/findings`
- `POST /api/vvos/inspection-sessions/:id/complete`

## Rechten
Nieuwe permissions: `inspections.read` en `inspections.write`.

Huidige VVOS-rollen worden hergebruikt:
- owner/admin: read + write
- sales: read + write (buyer-workflow valt in P0 onder sales)
- workshop: read + write (technician)
- finance/readonly: read
- marketing: geen inspectietoegang

Een toekomstige role-refactor kan aparte `buyer`, `technician` en `manager` claims introduceren zonder het inspectiedomein te wijzigen.

## Voice/NLU P0
P0 bevat een contextuele Nederlandse command parser als veilige lokale fallback. Hij begrijpt onder meer kilometerstand, wielpositie, profieldiepte, schade, ontbreken van reservesleutel, navigatie en positieve observaties. Een kaal “3,4 millimeter” wordt op basis van het huidige wiel geïnterpreteerd.

Dit is bewust nog niet de uiteindelijke AI-NLU. P1 voegt `VVOSAIService.classifyVoiceIntent()` toe; dezelfde typed commands blijven de domeingrens.

## Offline
Spraak-/tekstcommando's worden lokaal in een queue gezet en met een stabiele idempotency key opnieuw verzonden zodra de verbinding terugkomt. Foto's worden in P0 niet offline gebufferd; daarvoor is IndexedDB/blob-queueing nodig in P1.

## Niet gesimuleerd in P0
- Meta Wearables native SDK
- AI Vision damage detection
- automatisch PDF CarCheck Report
- Purchase Intelligence / maximale inkoopprijs
- video-opname
- OCR/kenteken/VIN-herkenning
- offline media queue
- automatische gezichtsblur en blur van kentekens van derden (private signed storage is in P0 wel actief)
- Display/Neural Band HUD

De UI toont deze onderdelen niet als voltooid. De P0-dataset en interfaces zijn er wel op voorbereid.

## Acceptatieflow
1. verbind VVOS Companion-camera;
2. selecteer bestaand VVOS-voertuig;
3. start inspectie;
4. zeg `Kilometerstand 42.831`;
5. maak foto;
6. zeg `Velg rechtsvoor heeft lichte stoeprandschade`;
7. markeer onderdelen goed en navigeer verder;
8. stop en controleer bevindingen/media;
9. bevestig of verwijder bevindingen;
10. sla CarCheck definitief op.
