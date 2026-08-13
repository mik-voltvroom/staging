# VVOS secret matrix

Secrets worden nooit in `.env.example`, GitHub commits of ChatGPT-prompts met echte waarden opgeslagen.

| Secret/config | Staging | Production | Opslag |
|---|---|---|---|
| Firebase client config | eigen project | eigen project | App Hosting/Firebase system |
| Admin credentials | eigen project | eigen project | bij voorkeur Application Default Credentials |
| CRON_SECRET | apart | apart | Secret Manager |
| PORTAL_TOKEN_SECRET | apart | apart | Secret Manager |
| AUDIT_HASH_SALT | apart | apart | Secret Manager |
| VWE webhook/API | sandbox/test | live | Secret Manager |
| RDW/API credentials | test waar mogelijk | live | Secret Manager |
| Google Merchant | test/uit | live | Secret Manager |
| WhatsApp | sandbox/test | live | Secret Manager |
| Email provider | test | live | Secret Manager |
| Payment provider | test mode | live mode | Secret Manager |

Een secret mag nooit tussen staging en production worden hergebruikt als daarmee echte side-effects mogelijk zijn.

## Firebase staging-blokkers

Voor de eerste staging-rollout moeten minimaal de volgende Secret Manager-namen bestaan en aan de App Hosting-backend zijn gekoppeld: `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`, `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID`, `CRON_SECRET`, `VWE_WEBHOOK_SECRET`, `PORTAL_TOKEN_SECRET` en `AUDIT_HASH_SALT`.

Firebase Admin gebruikt bij voorkeur de runtime service identity (Application Default Credentials). Voeg alleen `FIREBASE_ADMIN_*` secrets toe wanneer die identity niet volstaat; commit nooit een service-account JSON-bestand.
