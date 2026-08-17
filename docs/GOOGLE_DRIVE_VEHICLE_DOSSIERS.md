# Google Drive voertuigdossiers

VVOS kan per voertuig idempotent een Google Drive-dossier aanmaken onder `03 Voertuigen`.

## Naamgeving
`[KENTEKEN] – [MERK] [MODEL] – [LAATSTE 6 VIN]`. Zonder kenteken/VIN gebruikt VVOS veilige fallbacks.

## Structuur
01 Inkoop; 02 Eigenarenhistorie; 03 Onderhoud; 04 Technisch rapport; 05 Diagnose & SOH; 06 Foto's; 07 Video's; 08 Werkzaamheden; 09 Advertentie; 10 Koopovereenkomst; 11 Aflevering; 12 Garantie & Aftersales.

## Configuratie
Server-side secrets: `GOOGLE_DRIVE_CLIENT_EMAIL`, `GOOGLE_DRIVE_PRIVATE_KEY`, `GOOGLE_DRIVE_VEHICLES_FOLDER_ID`. Deel de doelmap met het service-account. Secrets horen nooit in Git.

## API
`POST /api/vehicles/:id/drive-dossier` vereist `vehicles.write`. De route leest het voertuig server-side uit Firestore, maakt of hergebruikt de Drive-map, maakt ontbrekende submappen en schrijft de Drive metadata terug naar het voertuigrecord.

## Veiligheid
De integratie gebruikt de beperkte `drive.file` scope, server-side OAuth en een expliciete parent-folder. Een bestaande `driveDossier.folderId` wordt hergebruikt zodat herhaalde calls geen dubbele dossiers veroorzaken.
