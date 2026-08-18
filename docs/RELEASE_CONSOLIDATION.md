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

## P0 validation before Work Package A can close

- [ ] clean locked dependency install
- [ ] dependency audit high-severity gate
- [ ] repository guard
- [ ] agent audit
- [ ] brand audit
- [ ] TypeScript typecheck
- [ ] complete Vitest suite
- [ ] Next.js production build
- [ ] compare remaining unique PR #14 changes against canonical RC
- [ ] identify demo/sample-backed public endpoints for Work Package B/C
- [ ] mark PR #4 / #6 / #14 as superseded only after canonical RC proves equivalent or better

## Promotion rule

Only an exact tested SHA may move forward to staging acceptance. This branch is not production-ready merely because code has been consolidated.
