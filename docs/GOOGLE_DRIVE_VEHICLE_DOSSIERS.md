# Google Drive voertuigdossiers

VVOS staging gebruikt de Firebase App Hosting runtime identity zonder service-accountkey.

## Staging-resources

- Project: `voltvroom-staging`
- Runtime-principal: `firebase-app-hosting-compute@voltvroom-staging.iam.gserviceaccount.com`
- Shared Drive: `0ACwIWboayPM-Uk9PVA`
- Hoofdmap voertuigen: `1ZoHbhdXiw_05xQeJZIlrLCRKt22rINhu`

De runtime-principal heeft alleen op zichzelf de rol `roles/iam.serviceAccountTokenCreator`. Daarmee mint de runtime via IAM Credentials een kortlevend OAuth-token met Drive-scope. Dezelfde principal heeft Contentbeheerder-toegang tot de map `03 Voertuigen`.

## Controle

Een owner of admin kan in **Dashboard → Integraties** de beveiligde staging-test starten. De test:

1. vraagt een kortlevend Drive-token aan;
2. maakt tijdelijk `VVOS_AUTH_TEST-<timestamp>` aan in `03 Voertuigen`;
3. verwijdert de testmap direct;
4. schrijft het resultaat naar de auditlog.

De test-API weigert alle omgevingen behalve `VVOS_ENV=staging`.
