# VVOS Glasses P1 — Intelligence layer

## Added
- Central `VVOSAIService`; API routes and UI components do not call an AI provider directly.
- Deterministic Dutch intent fallback via the existing context-aware parser.
- Inspection summary generation.
- Provider-neutral vision contract with suggested findings only.
- Human confirmation remains mandatory for vision findings.
- Purchase Intelligence with visible assumptions and persisted advice history.
- Handsfree `Geef inkoopadvies` response.
- Domain event publisher for automation-ready events.
- Desktop `CarCheck > Glasses Sessions` operations page.
- Dedicated Glasses CI for typecheck, Glasses tests and production build while the base repository dependency audit is separately blocked.

## Purchase Intelligence formula
`maximumPurchasePrice = expectedSalePrice - reconditioning - transport - warrantyReserve - marketing - stockCost - desiredMargin`

Defaults are sourced from current VVOS vehicle data where available. Confirmed finding repair costs are included. Findings without an explicit repair amount are intentionally not guessed; their IDs remain visible in `unpricedFindingIds` and increase risk.

A purchase offer is never executed automatically. Advice is decision support only.

## Vision safety
`VVOSAIService.analyzeVehicleImage()` requires a configured provider. Without one it fails explicitly. A successful provider response creates `Finding` records with `reviewStatus: suggested`. Only a user review can move a suggested finding to `confirmed`.

## New persistence
- `vehicles/{vehicleId}/purchase_advice/{adviceId}`
- `domain_events/{eventId}`

## New API
- `POST /api/vvos/inspection-sessions/:id/analyze`
  - `{ action: "summary" }`
  - `{ action: "vision", mediaId }`
- `POST /api/vvos/vehicles/:id/purchase-advice`

## New UI
- Purchase Intelligence panel in Glasses review.
- VVOS inspection summary in review.
- `CarCheck > Glasses Sessions` desktop management page.

## Environment variables
No new environment variables are required for the deterministic P1 layer.

A production vision provider is intentionally not configured in this branch and will require provider-specific credentials/configuration in a later integration change.

## Known limitations
- No native Meta Wearables SDK bridge yet.
- No production vision provider yet.
- No OCR provider yet.
- No offline binary/media queue yet.
- No generated PDF CarCheck report yet.
- Purchase Intelligence uses the current VVOS asking price as expected sale price unless explicitly overridden.
- Unpriced damage is reported as risk instead of silently estimated.
