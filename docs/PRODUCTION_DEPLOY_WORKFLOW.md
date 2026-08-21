# Volt & Vroom Production Deploy Workflow

Status: ACTIVE
Created: 2026-08-21
Release branch: `release/production-2026-08-21`
Frozen baseline: `eeb8e3f56ae8590c89913a5b1ea8d2b74e41fe26`

## Deploy policy

From the start of this workflow, the production release baseline is frozen. No new product features are added to the release branch. Only deploy blockers, security fixes, test fixes, configuration corrections and production-hardening changes may be added until production go-live is completed.

Normal feature work should not be merged into the release branch during this window.

## Workflow

1. Main/release freeze
   - Freeze current deploy candidate.
   - Create a dedicated production release branch from the known baseline.
   - Only blocker/security/configuration fixes are allowed on the release branch.

2. CI fully green
   - Repository guard
   - Agent audit
   - Brand audit
   - TypeScript typecheck
   - Unit/integration tests
   - Firestore rules emulator tests
   - Production Next.js build

3. Create separate production Firebase/App Hosting backend
   - Do not point the staging backend at production.
   - Production must have its own environment values and runtime identity.

4. Configure production secrets
   - Hexon/Mobilox credentials
   - CRON secret
   - Portal token secret
   - Audit hash salt
   - Required Firebase production configuration

5. Deploy Firestore rules and indexes

6. Validate Firebase Storage IAM
   - Confirm App Hosting runtime can create/read required vehicle image objects.
   - Do not grant broad Owner/Editor permissions.

7. Deploy production build to temporary App Hosting URL

8. Production smoke test
   - Homepage
   - Mobile navigation
   - Inventory listing
   - Vehicle detail
   - Contact/lead form
   - VVOS login/dashboard

9. Run one real Mobilox end-to-end mutation
   - add/change vehicle
   - exact response `1`
   - integration event written
   - 1920x1280 image copied to Firebase Storage
   - permanent image URL written to Firestore
   - vehicle visible in website and VVOS

10. Validate VVOS inventory
    - website and VVOS use the same Firestore `vehicles` source
    - add/change/delete/archive behavior verified

11. SEO production check
    - production index/follow
    - staging noindex/nofollow
    - canonical URLs
    - OpenGraph
    - structured data
    - sitemap/robots

12. Connect `voltvroom.nl` / `www.voltvroom.nl`

13. Validate HTTPS and canonical redirects

14. Monitor first 24 hours
    - App Hosting/build errors
    - Mobilox/Hexon mutations
    - image ingestion
    - leads
    - Firebase runtime errors

## Production go/no-go gates

Production go-live is allowed only when all four are true:

- CI is fully green.
- Production Firebase/App Hosting is isolated from staging.
- Firebase Storage write from the production runtime succeeds.
- A real Mobilox end-to-end mutation succeeds and is visible in both website and VVOS.

## Current step

Step 1 is active. A production release branch has been created from the frozen baseline. The next action is Step 2: establish a fully green CI result on the release candidate.
