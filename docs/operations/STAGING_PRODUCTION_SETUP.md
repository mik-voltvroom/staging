# VVOS Staging + Production setup

## Doel
Een eenvoudige en veilige straat:

`feature/* -> staging repo/main -> eigenaar akkoord -> afzonderlijke production repo -> handmatige rollout`

## Firebase projecten
Maak twee volledig gescheiden Firebase-projecten:

- Volt & Vroom Staging (`VV_STAGING_PROJECT_ID`)
- Volt & Vroom Production (`VV_PRODUCTION_PROJECT_ID`)

Gebruik geen productieklanten, echte leads of productie-secrets in staging.

## Git branches
- staging-repository `main`: geaccepteerde stagingcode
- production-repository `main`: uitsluitend exact goedgekeurde releases
- `feature/*`: wijzigingen door Alexander, Mik/Codex of andere developers

Bescherm beide `main`-branches: geen directe pushes, verplichte PR/CI en eigenaar-review.

## Firebase App Hosting
### Staging backend
- Firebase-project: staging
- GitHub live branch: `main` van de staging-repository
- Automatic rollouts: AAN
- Environment name: `staging`
- App root: repository root
- Custom domain later: `staging.voltvroom.nl`

### Production backend
- Firebase-project: production
- GitHub source: afzonderlijke private productierepository
- Live branch: `main`
- Automatic rollouts: UIT
- Environment name: `production`
- App root: repository root
- Custom domain: `www.voltvroom.nl`

Production wordt alleen uitgerold nadat Mik de staging-versie expliciet heeft goedgekeurd. Gebruik exact de geaccepteerde commit.

## Eerste inrichting na Workspace-verificatie
1. Maak deze staging-repository private en bescherm `main` met verplichte PR/CI.
2. Upgrade `voltvroom-staging` van Spark naar een geschikt billingplan; App Hosting is anders geblokkeerd.
3. Zet Firebase Environment type op `Staging`.
4. Registreer de Firebase Web App en noteer de gegenereerde clientconfig als stagingwaarden.
5. Activeer de gekozen Authentication-provider(s) en maak minimaal één eigenaaraccount.
6. Maak/controleer Firestore en Storage in een EU-regio en publiceer eerst de meegeleverde rules/indexes.
7. Provision alle waarden uit `SECRET_MATRIX.md` in staging Secret Manager.
8. Maak de staging App Hosting-backend met live branch `main`, auto rollout AAN en repository root als app root.
9. Valideer de runtime service identity en geef uitsluitend minimaal benodigde IAM-rollen.
10. Laat de eerste rollout uitvoeren en voer health-, auth- en service-hook-smokechecks uit.
11. Koppel daarna pas `staging.voltvroom.nl` en DNS.
12. Richt production later afzonderlijk en handmatig in met exact de goedgekeurde staging-snapshot.

## Definition of Done staging
- `/api/health` geeft een gezonde status.
- Login/auth is ingeschakeld voor VVOS.
- Publieke homepage laadt.
- Firestore/Storage staging zijn geïsoleerd.
- Geen Caroutlet e-mailadressen of oude merkcopy.
- Geen production secrets aanwezig.
- CI is groen.

## Definition of Done production
- Exact dezelfde commit als goedgekeurd op staging.
- CI groen.
- Production readiness check groen met productie-secrets.
- Backup/rollbackprocedure bekend.
- Custom domain + HTTPS actief.
- Health check na rollout groen.
