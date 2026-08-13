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
1. Maak de zakelijke GitHub-identiteit en Volt & Vroom GitHub-organisatie.
2. Maak een private repository, bijvoorbeeld `volt-vroom-platform`.
3. Importeer deze repository.
4. Maak branch `staging` vanaf `main`.
5. Stel branch protection in.
6. Maak beide Firebase-projecten.
7. Activeer Blaze/App Hosting indien Firebase dit vereist.
8. Maak staging App Hosting backend met live branch `staging`, auto rollout AAN, Environment `staging`.
9. Maak production App Hosting backend met live branch `main`, auto rollout UIT, Environment `production`.
10. Voeg secrets per Firebase-project toe via Secret Manager / App Hosting Environment.
11. Deploy staging en voer de smoke test uit.
12. Pas pas daarna DNS voor production aan.

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
