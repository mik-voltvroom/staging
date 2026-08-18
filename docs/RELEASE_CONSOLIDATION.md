# VVOS Release Consolidation — Work Package A

Date: 2026-08-18
Canonical working branch: `rc/consolidation-v1.3.0`
Status: draft / not deployed / not merged

## Source lines

### Functional baseline
`agent/social-video-engine-v1`

Contains the public website sprint plus VV Stories / Social Video Engine. This line already includes the current Volt & Vroom public design, VV Verified, contact/conversion work, lead hardening, Social Video Engine, Firestore Social Video rules/index definitions and regression tests.

### Hardening input
`hardening/v1.2.1` / PR #14

Selected controls are being applied onto the functional baseline instead of replacing newer application files.

## Consolidated controls

- `.env.example` is fail-closed: staging + Firebase + auth required by default.
- CI uses staging/Firebase/auth defaults and covers `rc/**` branches.
- repository guard, agent audit and brand audit are separate mandatory CI gates.
- `brand:audit` blocks legacy Caroutlet identity, legacy AUTOMOTIVE lockups, prohibited red identity colors and glow-style drift.
- production hardening gates are stored in `docs/PRODUCTION_HARDENING.md`.
- package metadata remains lockfile-consistent during consolidation; release naming is tracked by branch/PR until an intentional release-version bump updates both package files together.

## Conflict policy

1. Never overwrite newer website/Social Video functionality with older hardening branch files wholesale.
2. Security/release controls from hardening are applied selectively.
3. Where a hardening asset conflicts with the current Design System, the current approved brand asset wins.
4. No merge to main, staging deploy, Firebase Rules deploy, IAM/settings change or production action is part of Work Package A without explicit approval.

## Design drift decision log

### App icon
The hardening branch favicon used colors outside the current Design System palette. It was not copied. `app/icon.svg` in the canonical RC is derived from the current VV symbol and uses Paper White, Deep Ink `#0D1117` and Electric Blue `#168BFF`.

## PR #14 equivalence review

All five files changed by PR #14 were compared against the canonical RC:

| Hardening file | RC decision |
|---|---|
| `.env.example` | Equivalent fail-closed Firebase/auth defaults retained. |
| `.github/workflows/ci.yml` | Hardening gates retained; branch coverage expanded to `agent/**` and `rc/**`. |
| `docs/PRODUCTION_HARDENING.md` | P0 gates retained and extended with canonical consolidation/promotion rules. |
| `package.json` | `brand:audit` retained. Functional font dependencies from the newer website baseline retained. Package and lockfile version remain mutually consistent until the release-version decision. |
| `scripts/brand-audit.mjs` | Hardening implementation retained unchanged. |

No remaining PR #14 application file needs to be copied. The hardening branch is seven commits beyond its merge base, but its complete five-file deliverable is represented in this RC with the deliberate differences above.

## Demo/sample-backed endpoint inventory

Classification is based on the RC route policy with `VVOS_REQUIRE_AUTH=true` and `VVOS_DATA_MODE=firebase`.

| Surface | Exposure | RC result | Follow-up |
|---|---|---|---|
| `/api/merchant-feed` | public | Corrected: reads Firestore inventory in Firebase mode and returns `503` when unavailable; sample feed remains local-demo only. | Replace the current euro-based vehicle price model with integer cents in Commercial Core. |
| `/voorraad/[slug]` | public | Corrected: sample detail pages are not generated in Firebase mode; available vehicles are resolved server-side from Firestore. | Add the full CarCheck/VV Verified vehicle evidence model after the real inventory contract is finalized. |
| `/api/rdw/vehicle` | public | Corrected: no fabricated vehicle fallback in Firebase mode; missing adapter returns `503`. | Add provider timeout/schema validation and abuse protection. |
| `/api/portal/[token]`, `/portal/[token]` | public | Corrected: sample portal is blocked in Firebase mode. | Replace predictable sample tokens with hashed, expiring, revocable portal grants and repository-backed minimized responses. |
| `/api/public/social-videos/**` | public by design | Corrected routing drift: public read/event endpoints now bypass browser-session middleware while retaining their handler-level allow-list and same-site controls. | Add distributed event-rate limiting before high-volume launch. |
| `/api/payments/create` | authenticated | Corrected: returns `503`, `not_created`, and no payment URL until a provider transaction is actually verified. | Implement provider adapter, idempotency and eurocent amounts. |
| `/api/merchant-sync` | authenticated | Corrected: configured credentials no longer produce a fake `queued/live` result; returns `configured-unverified` and `not_started`. | Implement and verify the real Merchant transport. |
| `/api/deals`, `/api/workorders`, `/api/warranty` | authenticated | Sample-backed reads and non-persistent preview mutations remain. | Work Package B: repository-backed persistence, strict schemas and stable IDs. |
| `/api/finance/dashboard`, `/api/finance/invoices`, `/api/finance/reconcile` | authenticated | Sample-backed and euro-based preview finance remains. | Work Package B: cents migration, ledger persistence and verified reconciliation. |
| `/api/vwe/import` | secret-protected hook | Fails closed on missing/invalid secret, but still returns a demo preview when Admin Firestore is absent and accepts broad payloads. | Work Package C: strict schema, unknown-field rejection, limits and batches of at most 500 writes. |
| dashboard pages and client repositories | authenticated UI | Several views still import sample data or use the demo store. | Work Package B/C: replace by server repositories before production acceptance. |

Public sample/business data is therefore blocked on the identified public production surfaces in Firebase mode. This does not make the internal Commercial Core production-ready; the authenticated preview endpoints above remain explicit P0 blockers.

## P0 validation before Work Package A can close

- [ ] clean locked dependency install
- [ ] dependency audit high-severity gate
- [ ] repository guard
- [ ] agent audit
- [ ] brand audit
- [ ] TypeScript typecheck
- [ ] complete Vitest suite
- [ ] Next.js production build
- [x] compare remaining unique PR #14 changes against canonical RC
- [x] identify demo/sample-backed public endpoints for Work Package B/C
- [ ] mark PR #4 / #6 / #14 as superseded only after canonical RC proves equivalent or better

## Promotion rule

Only an exact tested SHA may move forward to staging acceptance. This branch is not production-ready merely because code has been consolidated.
