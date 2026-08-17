# VVOS Firebase Management Connector

## Doel
Een beperkte server-side beheerbridge voor Firebase/Google Cloud. De connector gebruikt dezelfde Google runtime identity als App Hosting of het bestaande Firebase Admin service-account.

## Endpoint
`GET /api/admin/firebase` vereist `integrations.read` en retourneert alleen project- en servicestatus plus het bestaan van toegestane secrets. Secretwaarden worden nooit geretourneerd.

`POST /api/admin/firebase` vereist `integrations.write` en accepteert `{ "name": "...", "value": "..." }`.

## Allowlist
De connector mag uitsluitend deze secrets aanmaken/updaten:
- `GOOGLE_DRIVE_CLIENT_EMAIL`
- `GOOGLE_DRIVE_PRIVATE_KEY`

Uitbreiding van deze lijst vereist een codewijziging en review. Er is bewust geen generieke Secret Manager proxy.

## IAM
De runtime identity heeft voor deze functies minimaal toegang nodig om de twee allowlisted secrets te bekijken, aan te maken en nieuwe versies toe te voegen. Geef geen Owner-rol. Gebruik least privilege in het staging-project.

## Veiligheidsregels
- alleen server-side;
- bestaande VVOS RBAC blijft leidend;
- secretwaarden worden nooit gelogd of teruggestuurd;
- Google Cloud access tokens worden alleen in-memory gebruikt;
- productie en staging blijven gescheiden.

## Google Drive activering
Na het plaatsen van beide Drive-secrets moet het Google Drive service-account toegang krijgen tot de map waarvan `GOOGLE_DRIVE_VEHICLES_FOLDER_ID` in `apphosting.yaml` staat. Daarna kan de bestaande vehicle dossier endpoint live provisionen.
