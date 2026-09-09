# VVOS CarCheck 101

## Bron
De leidende functionele bron is de interne Google Sheet **VV CarCheck - 101-punten voertuiginspectie**. VVOS implementeert deze standaard en onderhoudt geen parallelle, afwijkende checklist.

## Hoofdregel
Een VV CarCheck is pas volledig wanneer exact 101 van 101 punten zijn afgehandeld. Elk punt krijgt een status:

- `ok` — GOED
- `attention` — AANDACHT
- `fail` — AFKEUR
- `na` — NVT
- `pending` — nog niet afgehandeld

Een losse observatie telt niet als afgehandeld punt zolang geen status is vastgelegd.

## Beslispad
1. Minder dan 101/101 → `INCOMPLETE`
2. 101/101 + veiligheidskritische afkeur → `REJECTED`
3. 101/101 + overige afwijkingen → `REPAIR_REQUIRED`
4. 101/101 zonder open afwijkingen → `VV_APPROVED`

De UI vertaalt dit naar:

- **VV APPROVED**
- **HERSTEL VEREIST**
- **AFGEWEZEN**
- **INSPECTIE NOG NIET COMPLEET**

## Glasses-bediening
De medewerker kan contextueel per actueel punt zeggen:

- `goed`
- `aandacht`
- `afkeur`
- `n.v.t.`

VVOS slaat de status op het actieve genummerde controlepunt op. Bij `goed`, `aandacht`, `afkeur` of `n.v.t.` beweegt de handsfree flow naar het volgende punt.

Meetwaarden zoals kilometerstand en bandprofiel worden rechtstreeks aan het relevante 101-punt gekoppeld. Schadeobservaties markeren het huidige controlepunt als `attention` of `fail` afhankelijk van severity en maken daarnaast een gestructureerde Finding aan.

## Veiligheid
Veiligheidskritische punten zijn expliciet gemarkeerd in `lib/glasses/carcheck101.ts`. Een `fail` op zo'n punt blokkeert vrijgave. De blokkade kan niet via de gewone `completed` status worden omzeild.

## Persistente uitkomst
Bij definitieve afronding bewaart `InspectionSession`:

- `carCheckDecision`
- `carCheckScorePercent`
- `carCheckHandledPoints`
- `carCheckReleaseBlocked`
- `carCheckRepairCostCents`

Hiermee kan dezelfde uitkomst later worden gebruikt voor rapportage, voorraadbeslissingen, Purchase Intelligence, klantportaal en managementrapportages.

## Testverplichtingen
CI moet minimaal bewijzen:

- definitie bevat exact 101 punten;
- punt 1 en punt 101 zijn correct aanwezig;
- incomplete inspectie kan niet positief worden vrijgegeven;
- 101/101 zonder afwijkingen resulteert in `VV_APPROVED`;
- veiligheidskritische afkeur resulteert in `REJECTED`;
- niet-kritische afwijking resulteert in `REPAIR_REQUIRED`;
- TypeScript strict en production build slagen.
