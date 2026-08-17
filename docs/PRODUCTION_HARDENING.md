# VVOS Production Hardening v1.2.1

Status: staging candidate. Production promotion remains blocked until all P0 gates are green.

## Applied in this hardening branch

- CI now runs for `staging`, `main` and hardening branches.
- CI defaults to Firebase data mode and required authentication.
- `brand:audit` is a mandatory quality gate.
- Brand audit rejects legacy Caroutlet references, legacy `AUTOMOTIVE` lockups, prohibited identity reds and glow effects.
- `.env.example` is fail-closed: Firebase + authentication are the default.
- Package version identifies the hardened candidate.

## P0 production gates

1. `npm ci` succeeds from a clean checkout on GitHub Actions.
2. Repository guard, agent audit and brand audit pass.
3. TypeScript typecheck passes.
4. Unit/integration tests pass.
5. Next.js production build passes.
6. Public production endpoints do not serve demo/sample-backed business data. Merchant feed and finance are explicit audit targets.
7. Public lead creation has abuse protection (rate limiting/App Check or equivalent) before public launch.
8. Firestore and Storage security rules are tested for anonymous users and every staff role.
9. Staging secrets are configured outside GitHub source and `npm run readiness` passes.
10. Staging smoke tests cover login, vehicle read, lead creation, Merchant output and critical dashboard routes.
11. Rollback is rehearsed before first production promotion.
12. External logo/signing uses only approved outlined master artwork.

## Promotion rule

Only the exact commit SHA that passed all staging gates may be promoted to production. No direct production edits and no rebuild with unreviewed source changes between staging approval and production.

## Brand authority

For production UI, the latest Volt & Vroom Brandbook and Design System are authoritative. The primary identity must not reintroduce the legacy `AUTOMOTIVE` lockup. CarCheck remains `CARCHECK by Volt & Vroom`; category/status colors are functional and must not become competing brand identities.
