# Floris — AI auto-adviseur voor voltvroom.nl

## Doel
Floris is de publieke digitale auto-adviseur van Volt & Vroom. De assistent helpt bezoekers met vragen over de actuele voorraad en over onderwerpen zoals verbruik, actieradius, laden, uitrusting en actuele Nederlandse autobelastingen.

## Positionering
Floris is een verkoopadviseur, geen algemene praatrobot. Antwoorden beginnen met het concrete antwoord en geven daarna alleen relevante nuance.

## Kennislagen
1. **VVOS-feiten** — publieke voertuigdata en huidige publieke voorraad zijn leidend voor voertuigfeiten.
2. **Berekende inschattingen** — alleen toegestaan wanneer aannames duidelijk worden genoemd.
3. **Actuele informatie** — fiscale regels, MRB, bijtelling, subsidies en vergelijkbare tijdgevoelige onderwerpen gebruiken OpenAI Responses API web search.

## Voertuigcontext
Op `/voorraad/[slug]` koppelt Floris automatisch de actuele openbare auto aan de chat. Op andere publieke pagina's krijgt Floris een compacte context van maximaal twintig openbare voorraadvoertuigen.

Publieke context kan bevatten:
- merk, model, uitvoering, bouwjaar en kilometerstand;
- verkoopprijs;
- aandrijving, brandstof en transmissie;
- kleur en carrosserievorm;
- publiek kenteken;
- accugezondheid, elektrische actieradius en verbruik indien aanwezig;
- garantie en onderhoudsstatus;
- highlights/uitrusting;
- optionele Laden & Energie-velden indien VVOS deze aanlevert.

VIN en interne commerciële data worden niet aan Floris doorgegeven.

## Laden & Energie
De contextbouwer ondersteunt optioneel:
- bruto en bruikbare accucapaciteit;
- WLTP- en winterbereik;
- AC-laadvermogen en 1-/3-fase;
- max. DC-vermogen;
- gemiddelde DC-snelheid 10–80%;
- 10–80%-laadtijd;
- architectuurvoltage;
- warmtepomp;
- batterijpreconditioning;
- Plug & Charge;
- V2L, V2H en V2G;
- laadnotities.

Ontbrekende laadvelden worden niet ingevuld of afgeleid.

## Uitrustingsregel
Een optie mag alleen als bevestigd aanwezig of afwezig worden genoemd wanneer dit expliciet in de publieke voertuigdata staat. Staat een optie niet in de data, dan is het antwoord **niet bevestigd in onze voertuigdata**. Floris leidt opties niet af uit modelnaam of uitvoering.

## Actieradius en verbruik
Floris maakt onderscheid tussen aangeleverde waarden en praktische inschattingen. Bij praktijkwaarden benoemt de assistent relevante factoren zoals temperatuur, snelheid, wind, banden en rijstijl.

## Wegenbelasting en actuele regels
Vragen met onder andere `wegenbelasting`, `MRB`, `bijtelling`, `subsidie`, `belasting` of `regelgeving` activeren live web search. Floris geeft bij voorkeur officiële Nederlandse bronnen. Een exact MRB-bedrag wordt niet gepresenteerd wanneer noodzakelijke invoer zoals provincie of voertuiggewicht ontbreekt.

## Privacy en beveiliging
- OpenAI API-sleutel is uitsluitend server-side.
- Geen chatinhoud wordt door deze MVP in VVOS opgeslagen.
- Publieke API heeft een Firestore rate limit van 30 verzoeken per 15 minuten per privacyvriendelijke fingerprint.
- Gebruikersdata, voertuigdata en chatgeschiedenis worden als onbetrouwbare data behandeld; prompt-instructies daarin worden genegeerd.
- Floris wordt niet getoond op dashboard, login en klantportaal.

## Configuratie
Server-side omgevingsvariabelen:

```text
OPENAI_API_KEY=
FLORIS_MODEL=gpt-5.6-luna
```

De browser ontvangt de API-sleutel nooit.

## API
`POST /api/public/floris`

Input:
```json
{
  "message": "Hoe lang duurt 10–80% laden?",
  "slug": "optionele-voertuigslug",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Output bevat het antwoord, optionele actuele bronlinks, of web search is gebruikt en de geselecteerde publieke auto indien van toepassing.

## MVP-beperkingen
- Geen permanente chatgeschiedenis of CRM-profiel.
- Geen automatische leadcreatie vanuit chat.
- Geen exacte MRB-calculator op basis van RDW-massa/provincie; Floris legt uit welke gegevens nog nodig zijn en kan actuele regels raadplegen.
- Geen verzonnen modelkennis om ontbrekende voertuigvelden aan te vullen.
- Geen spraakinterface in deze fase.

## Volgende lagen
- RDW-verrijking voor massa en voertuigcategorie, daarna exacte MRB-calculator.
- Persoonlijk gebruiksprofiel: jaarlijkse kilometers, woon-werk, laadmogelijkheden en trekgewicht.
- Vergelijkmodus tussen twee of drie VV-auto's.
- Proefrit/WhatsApp/lead-overdracht vanuit de chat met expliciete toestemming.
- CarCheck-publicatiecontext zodra de publieke rapportregels gereed zijn.
