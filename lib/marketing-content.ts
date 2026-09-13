export type MarketingLanding = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  lead: string;
  promise: string;
  primary: { label: string; href: string; event?: string };
  secondary: { label: string; href: string };
  highlights: string[];
  sections: { title: string; text: string }[];
  steps: { title: string; text: string }[];
  faq: { question: string; answer: string }[];
  closingTitle: string;
  closingText: string;
};

export type KnowledgeArticle = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  readTime: string;
  publishedAt: string;
  updatedAt: string;
  sections: {
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
  relatedLanding: { label: string; href: string };
};

export const marketingLandings: Record<string, MarketingLanding> = {
  elektrisch: {
    slug: "elektrische-auto-kopen-groningen",
    title: "Elektrische auto kopen in Groningen | Volt & Vroom",
    description: "Een elektrische occasion kopen in Groningen? Vergelijk bereik, laden, historie en beschikbare accudata met persoonlijk advies van Volt & Vroom.",
    eyebrow: "Elektrische occasion kopen · Groningen",
    heading: "Een elektrische auto die past bij uw echte ritten.",
    lead: "Niet alleen kijken naar de opgegeven actieradius. Wij bespreken laadmogelijkheden, dagelijkse afstand, onderhoud en beschikbare accudata voordat u beslist.",
    promise: "U krijgt een controleerbaar verhaal bij de auto én advies dat aansluit op uw gebruik.",
    primary: { label: "Bekijk elektrische occasions", href: "/#voorraad" },
    secondary: { label: "Doe de keuzehulp", href: "/keuzehulp" },
    highlights: ["Beschikbare accudata in context", "Historie en techniek beoordeeld", "Advies over laden en praktijkbereik"],
    sections: [
      { title: "Begin bij uw gebruik, niet bij het grootste bereik", text: "Voor woon-werkverkeer, gezinsritten en langere reizen gelden verschillende eisen. We leggen uw dagelijkse kilometers, vaste laadmogelijkheden en langere ritten naast de eigenschappen van de auto." },
      { title: "Vraag wat de accu-informatie werkelijk zegt", text: "Een State of Health kan nuttig zijn, maar blijft één meetmoment. Wanneer betrouwbare accudata beschikbaar is, tonen we die met uitleg over meetmethode, leeftijd en relevante voertuigcontext." },
      { title: "Controleer meer dan de aandrijflijn", text: "Ook banden, remmen, onderstel, onderhoud, schadeverleden, software en laadapparatuur bepalen of een elektrische occasion een verstandige aankoop is." },
    ],
    steps: [
      { title: "Vertel hoe u rijdt", text: "Dagelijkse afstand, langere ritten, laadplek en budget." },
      { title: "Vergelijk geschikte auto’s", text: "Bereik, laden, historie, techniek en beschikbare accudata." },
      { title: "Rijd en beslis", text: "Een proefrit en heldere uitleg, zonder druk." },
    ],
    faq: [
      { question: "Hoeveel bereik heb ik nodig?", answer: "Dat hangt af van uw normale ritten, laadmogelijkheden en hoe vaak u lange afstanden rijdt. Een passende laadroutine is vaak belangrijker dan het hoogste bereik op papier." },
      { question: "Is een hoge kilometerstand bij een elektrische auto een probleem?", answer: "Niet automatisch. Onderhoud, gebruik, laadgedrag, accustaat en algemene voertuigconditie geven samen een beter beeld dan de kilometerstand alleen." },
      { question: "Kan ik zonder eigen laadpaal elektrisch rijden?", answer: "Dat kan, maar vraagt een betrouwbare laadmogelijkheid in de buurt of op het werk. We bespreken bereikbaarheid, tarieven en uw weekritme voordat we adviseren." },
      { question: "Tonen jullie altijd een accutest?", answer: "Nee. We tonen accudata wanneer die betrouwbaar beschikbaar is en benoemen duidelijk wanneer informatie ontbreekt. Een getal zonder herkomst of context presenteren we niet als zekerheid." },
    ],
    closingTitle: "Elektrisch rijden moet in uw week passen.",
    closingText: "Vertel ons hoe u rijdt en waar u kunt laden. Dan vergelijken we alleen auto’s die daar logisch bij aansluiten.",
  },
  hybride: {
    slug: "hybride-auto-kopen-groningen",
    title: "Hybride auto kopen in Groningen | Volt & Vroom",
    description: "Een hybride occasion kopen in Groningen? Ontdek het verschil tussen full hybrid en plug-inhybride en krijg advies op basis van uw ritten en laadmogelijkheden.",
    eyebrow: "Hybride occasion kopen · Groningen",
    heading: "Hybride wanneer het voordeel ook in de praktijk klopt.",
    lead: "Full hybrid en plug-inhybride vragen om een ander gebruik. Wij maken het verschil helder en kijken welke techniek past bij uw ritten, laadmogelijkheden en verwachtingen.",
    promise: "Geen algemene voorkeur voor een aandrijflijn, maar een onderbouwde keuze voor uw situatie.",
    primary: { label: "Bekijk hybride occasions", href: "/#voorraad" },
    secondary: { label: "Vergelijk met de keuzehulp", href: "/keuzehulp" },
    highlights: ["Full hybrid en plug-in helder uitgelegd", "Praktijkgebruik boven foldercijfers", "Onderhoud en systeemwerking beoordeeld"],
    sections: [
      { title: "Full hybrid: laden tijdens het rijden", text: "Een full hybrid hoeft niet aan een laadpaal. De elektrische ondersteuning kan vooral in stad en regio prettig zijn, maar het resultaat hangt af van route, snelheid en rijstijl." },
      { title: "Plug-inhybride: alleen logisch als u laadt", text: "Een plug-inhybride kan dagelijkse ritten deels elektrisch afleggen. Zonder regelmatig laden draagt de grotere accu vooral extra gewicht mee. Daarom bespreken we uw laadmogelijkheid vooraf." },
      { title: "Bekijk het complete systeem", text: "Naast motor en transmissie letten we op onderhoud, storingshistorie, elektrische ondersteuning, laadfunctie waar van toepassing en bekende modelaandachtspunten." },
    ],
    steps: [
      { title: "Breng uw ritten in kaart", text: "Stad, snelweg, jaarafstand en langere reizen." },
      { title: "Kies het juiste type hybride", text: "Full hybrid of plug-in op basis van echt gebruik." },
      { title: "Controleer de specifieke auto", text: "Historie, techniek, onderhoud en relevante accudata." },
    ],
    faq: [
      { question: "Wat is het verschil tussen full hybrid en plug-inhybride?", answer: "Een full hybrid laadt de kleine accu tijdens het rijden en hoeft niet aan de stekker. Een plug-inhybride heeft een grotere accu die u extern laadt en kan meer kilometers elektrisch rijden." },
      { question: "Is een plug-inhybride zuinig zonder laden?", answer: "Het beoogde voordeel wordt meestal kleiner wanneer u niet regelmatig laadt. Uw ritlengte en laadritme bepalen daarom of een plug-inhybride logisch is." },
      { question: "Past een hybride bij veel snelwegkilometers?", answer: "Dat verschilt per type en model. Bij lange, constante snelwegritten is de elektrische ondersteuning vaak anders van waarde dan bij stadsverkeer. We vergelijken daarom op uw routeprofiel." },
      { question: "Wat controleren jullie bij een hybride occasion?", answer: "We beoordelen de beschikbare onderhouds- en storingshistorie, de algemene technische staat en de werking van relevante hybridefuncties. Ontbrekende informatie benoemen we." },
    ],
    closingTitle: "De juiste hybride begint met de juiste vraag.",
    closingText: "Niet ‘welke hybride is populair?’, maar ‘welke techniek past bij mijn ritten?’ Daar helpen we u persoonlijk bij.",
  },
  inruilen: {
    slug: "auto-inruilen-groningen",
    title: "Auto inruilen in Groningen | Persoonlijke indicatie",
    description: "Uw auto inruilen in Groningen? Vraag bij Volt & Vroom een persoonlijke indicatie aan op basis van kenteken, kilometerstand, onderhoud, uitvoering en staat.",
    eyebrow: "Auto inruilen · Groningen",
    heading: "Een inruilindicatie die naar de echte auto kijkt.",
    lead: "Kenteken en kilometerstand zijn het begin. Onderhoud, uitvoering, staat, schade en foto’s maken het beeld completer. Daarom beoordeelt Volt & Vroom iedere aanvraag persoonlijk.",
    promise: "U ontvangt een onderbouwde indicatie; de definitieve waarde volgt na controle van de auto.",
    primary: { label: "Start mijn inruilaanvraag", href: "/inruilen" },
    secondary: { label: "Bekijk actuele voorraad", href: "/#voorraad" },
    highlights: ["RDW-gegevens als startpunt", "Persoonlijke beoordeling", "Geen verplichting om te verkopen"],
    sections: [
      { title: "Meer dan een automatisch kentekenbod", text: "Twee auto’s van hetzelfde bouwjaar kunnen sterk verschillen door uitvoering, onderhoud, gebruik en staat. Daarom vragen we informatie die bij uw specifieke auto hoort." },
      { title: "Foto’s helpen om vooraf duidelijker te zijn", text: "Beelden van buitenkant, interieur, kilometerstand en eventuele beschadigingen helpen om verrassingen bij de uiteindelijke beoordeling te beperken." },
      { title: "De definitieve waarde volgt na controle", text: "Een online aanvraag blijft een indicatie. Pas wanneer voertuig, documenten en staat zijn gecontroleerd kan de definitieve inruilwaarde worden vastgesteld." },
    ],
    steps: [
      { title: "Controleer het kenteken", text: "We halen beschikbare openbare voertuiggegevens op." },
      { title: "Beschrijf de staat", text: "Kilometerstand, onderhoud, sleutels, opties en foto’s." },
      { title: "Ontvang persoonlijk contact", text: "Mik bespreekt de indicatie en mogelijke vervolgstap." },
    ],
    faq: [
      { question: "Is de online indicatie een definitief bod?", answer: "Nee. De gegevens geven een eerste beeld. De definitieve waarde volgt nadat de auto, documenten en opgegeven staat zijn gecontroleerd." },
      { question: "Kan ik ook inruilen zonder direct een andere auto te kiezen?", answer: "U kunt de aanvraag alvast indienen en uw situatie toelichten. Daarna bespreken we persoonlijk wat een passende vervolgstap is." },
      { question: "Welke foto’s zijn nuttig?", answer: "Een duidelijk totaalbeeld van voor-, achter- en zijkanten, interieur, kilometerstand en eventuele beschadigingen helpt bij de eerste beoordeling." },
      { question: "Ben ik verplicht om na de aanvraag te verkopen?", answer: "Nee. Een aanvraag verplicht u niet tot verkoop of aankoop." },
    ],
    closingTitle: "Vertel eerlijk hoe de auto ervoor staat.",
    closingText: "Hoe vollediger de informatie, hoe beter we vooraf kunnen uitleggen waarop de indicatie is gebaseerd.",
  },
};

export const knowledgeArticles: KnowledgeArticle[] = [
  {
    slug: "elektrische-occasion-kopen-controlepunten",
    title: "Elektrische occasion kopen: 7 controlepunten vóór u beslist",
    description: "Waar let u op bij een gebruikte elektrische auto? Zeven praktische controlepunten voor accu, bereik, laden, historie, banden, software en proefrit.",
    eyebrow: "Koopgids · Elektrisch",
    lead: "Een elektrische occasion vraagt niet per se om méér twijfel, wel om andere vragen. Met deze zeven controlepunten vergelijkt u auto’s op informatie die in dagelijks gebruik verschil maakt.",
    readTime: "7 minuten",
    publishedAt: "2026-09-04",
    updatedAt: "2026-09-04",
    sections: [
      { title: "1. Begin met uw normale week", paragraphs: ["Schrijf op hoeveel kilometer u op een gewone dag rijdt, waar de auto stilstaat en welke langere ritten regelmatig terugkomen. Zo voorkomt u dat u alleen op de hoogste actieradius selecteert.", "Kijk ook naar laden. Een vaste plek thuis of op het werk maakt elektrisch rijden vaak eenvoudiger. Zonder vaste laadplek zijn bereikbaarheid, beschikbaarheid en prijs van publieke laders onderdeel van de keuze."] },
      { title: "2. Vergelijk bruikbare actieradius, niet alleen de fabrieksopgave", paragraphs: ["De opgegeven actieradius is een gestandaardiseerde vergelijkingswaarde. In de praktijk hebben temperatuur, snelheid, wind, banden, belading en verwarming invloed.", "Vraag daarom welk bereik realistisch is voor uw belangrijkste ritten en houd marge voor omstandigheden waarin verbruik hoger ligt."] },
      { title: "3. Beoordeel beschikbare accudata in context", paragraphs: ["Een State of Health kan inzicht geven in de resterende accucapaciteit, maar de meetmethode en omstandigheden zijn belangrijk. Een percentage zonder herkomst is geen volledig oordeel.", "Vraag wie de meting heeft uitgevoerd, wanneer dat gebeurde en welke aanvullende storings- of diagnosegegevens beschikbaar zijn. Ontbreekt een meting, laat dan duidelijk uitleggen welke controles wel zijn gedaan."] },
      { title: "4. Controleer laden en meegeleverde accessoires", paragraphs: ["Bekijk de maximale AC- en DC-laadsnelheid van het specifieke model en let op het verschil tussen een piekwaarde en de laadcurve. Voor thuisladen is het laadvermogen via wisselstroom vaak relevanter dan de hoogste snellaadpiek.", "Controleer de laadpoort, probeer indien mogelijk een laadsessie en inventariseer welke kabels, adapters of mobiele lader bij de auto horen."] },
      { title: "5. Vergeet de gewone autotechniek niet", paragraphs: ["Een elektrische auto heeft minder traditionele motoronderdelen, maar banden, remmen, onderstel, airconditioning en carrosserie blijven belangrijk. Het directe koppel en voertuiggewicht kunnen de bandenslijtage beïnvloeden.", "Controleer onderhoud, schadeverleden, bandenmaat en gelijkmatige slijtage. Luister tijdens de proefrit naar bijgeluiden en test remgevoel, klimaatregeling en rijhulpsystemen."] },
      { title: "6. Bekijk software, garantie en eigenaarsfuncties", paragraphs: ["Controleer of software-updates zijn uitgevoerd en of navigatie, laadplanning, app-koppeling en beide sleutels werken. Vraag welke voertuig- en accugarantie nog geldt en welke voorwaarden daarbij horen.", "Laat accounts van vorige gebruikers verwijderen en zorg dat de auto na levering aan uw eigen account kan worden gekoppeld."] },
      { title: "7. Maak de totale vergelijking", paragraphs: ["Vergelijk aanschaf, verzekering, verwachte afschrijving, banden, onderhoud en laden. Gebruik uw eigen laadmogelijkheden en kilometers in plaats van één algemeen rekenvoorbeeld.", "Een passende elektrische occasion is niet automatisch de auto met het grootste bereik of de laagste prijs. De beste keuze is de auto waarvan gebruik, techniek en informatie samen kloppen."], bullets: ["Dagelijkse ritten en langste terugkerende route", "Praktijkbereik met voldoende marge", "Herkomst en context van accudata", "AC-laden, snelladen en laadkabels", "Onderhoud, banden, remmen en schadeverleden", "Software, sleutels, app en resterende garantie"] },
    ],
    relatedLanding: { label: "Bekijk onze aanpak voor elektrische occasions", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "soh-accu-elektrische-auto-uitleg",
    title: "SOH van een elektrische auto: wat zegt accugezondheid?",
    description: "State of Health bij een elektrische auto uitgelegd: wat het percentage kan zeggen, waarom meetmethoden verschillen en welke vragen u bij een occasion stelt.",
    eyebrow: "Uitleg · Accugezondheid",
    lead: "SOH staat voor State of Health en wordt vaak als één percentage weergegeven. Dat is nuttige informatie, zolang u weet wat er is gemeten en wat het getal niet vertelt.",
    readTime: "6 minuten",
    publishedAt: "2026-09-04",
    updatedAt: "2026-09-04",
    sections: [
      { title: "Wat betekent State of Health?", paragraphs: ["State of Health beschrijft doorgaans hoe de huidige bruikbare accucapaciteit zich verhoudt tot een referentie toen de accu nieuw was. De precieze berekening verschilt per fabrikant, diagnosemethode en databron.", "Een SOH van een bepaald percentage is daarom niet zonder meer één-op-één te vergelijken tussen verschillende merken of meetmethoden."] },
      { title: "Waarom neemt accucapaciteit af?", paragraphs: ["Lithium-ionaccu’s verouderen door tijd, temperatuur, gebruik en laadcycli. Dat proces is normaal. Hoe snel capaciteit afneemt, hangt onder meer af van accutype, temperatuurmanagement, laadgedrag en gebruiksomstandigheden.", "Een lagere capaciteit kan het beschikbare rijbereik verkleinen, maar zegt niet automatisch dat de accu defect is."] },
      { title: "Waarom kan een meting verschillen?", paragraphs: ["Sommige rapporten lezen waarden uit het batterijmanagementsysteem, andere gebruiken een rit- of laadtest. Temperatuur, laadniveau, recente ritten en software kunnen de uitkomst beïnvloeden.", "Vraag daarom altijd naar datum, meetmethode en uitvoerende partij. Een rapport met context is waardevoller dan alleen een los percentage in een advertentie."] },
      { title: "Wat zegt SOH niet?", paragraphs: ["SOH vertelt niet alles over storingen, celbalans, laadgedrag, snellaadprestaties of de staat van de rest van de auto. Ook actieradius wordt beïnvloed door weer, snelheid, banden en klimaatregeling.", "Gebruik SOH als onderdeel van een bredere technische en praktische beoordeling, niet als enig koopcriterium."] },
      { title: "Welke vragen stelt u bij een occasion?", paragraphs: ["Vraag welke accudata beschikbaar is, hoe die is verkregen en of er relevante foutcodes of werkzaamheden bekend zijn. Controleer daarnaast laadfunctie, praktijkverbruik, resterende garantie en softwarestatus."], bullets: ["Wie heeft gemeten en wanneer?", "Welke methode en referentiewaarde zijn gebruikt?", "Zijn storingen of reparaties aan het hoogvoltsysteem bekend?", "Hoe presteert AC- en DC-laden?", "Welke accugarantie geldt nog en onder welke voorwaarden?"] },
      { title: "Onze benadering", paragraphs: ["Volt & Vroom toont accudata wanneer die betrouwbaar beschikbaar is en plaatst de informatie in de context van model, leeftijd en gebruik. Wanneer gegevens ontbreken, benoemen we dat liever dan een schijnzekerheid te geven."] },
    ],
    relatedLanding: { label: "Elektrische auto’s vergelijken op uw gebruik", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "hybride-of-elektrisch-wat-past-bij-mij",
    title: "Hybride of elektrisch: wat past bij uw ritten?",
    description: "Hybride of elektrisch kiezen? Vergelijk laadmogelijkheid, dagelijkse afstand, lange ritten, gebruiksgemak en techniek met een praktisch besliskader.",
    eyebrow: "Keuzehulp · Aandrijflijn",
    lead: "De beste aandrijflijn volgt niet uit een trend, maar uit uw week. Wie kan laden, voorspelbare ritten maakt en de auto passend kiest, komt vaak tot een andere uitkomst dan iemand die veel onverwachte lange afstanden rijdt.",
    readTime: "7 minuten",
    publishedAt: "2026-09-04",
    updatedAt: "2026-09-04",
    sections: [
      { title: "Begin met drie vragen", paragraphs: ["Kunt u thuis of op het werk regelmatig laden? Hoeveel kilometer rijdt u op een normale dag? En hoe vaak maakt u ritten die duidelijk langer zijn?", "Deze vragen geven richting, maar ook budget, aanhangergebruik, beschikbare modellen en persoonlijke voorkeur tellen mee."] },
      { title: "Wanneer elektrisch vaak logisch is", paragraphs: ["Elektrisch past vaak goed wanneer laden structureel mogelijk is en dagelijkse ritten ruim binnen het realistische bereik vallen. De stille aandrijving en directe respons zijn voor veel bestuurders belangrijke voordelen.", "Voor langere reizen zijn laadplanning, snellaadcurve en netwerk langs uw routes relevanter dan alleen de maximale laadsnelheid op papier."] },
      { title: "Wanneer full hybrid vaak logisch is", paragraphs: ["Een full hybrid kan aantrekkelijk zijn wanneer u niet extern wilt of kunt laden en veel wisselende stads- en regioritten maakt. De auto regelt de elektrische ondersteuning zelf.", "Het daadwerkelijke verbruik blijft afhankelijk van model, route, snelheid en rijstijl. Een full hybrid is geen elektrische auto met een kleine accu, maar een eigen technische keuze."] },
      { title: "Wanneer een plug-inhybride past", paragraphs: ["Een plug-inhybride is vooral logisch wanneer u hem regelmatig laadt en veel dagelijkse ritten elektrisch kunt afleggen, terwijl een brandstofmotor flexibiliteit geeft voor langere afstanden.", "Wie nauwelijks laadt, benut een belangrijk deel van het systeem niet. Bespreek daarom eerlijk hoe vaak de auto aan de stekker zal staan."] },
      { title: "Vergelijk op totaal gebruik", paragraphs: ["Maak een vergelijking op basis van aanschaf, verzekering, onderhoud, banden, energie of brandstof en verwachte afschrijving. Algemene rekenvoorbeelden kunnen richting geven, maar uw eigen kilometers en laadprijs bepalen de bruikbaarheid.", "Let bij iedere occasion daarnaast op historie, technische staat en beschikbare accu-informatie. De aandrijflijn kan passend zijn terwijl een specifieke auto dat niet is."] },
      { title: "Een eenvoudig besliskader", paragraphs: ["Gebruik deze punten als start voor een gesprek en proefrit, niet als automatische uitkomst."], bullets: ["Structureel laden en voorspelbare ritten: onderzoek elektrisch", "Niet laden en veel stad/regio: vergelijk full hybrids", "Regelmatig laden plus incidenteel lange ritten: beoordeel plug-inhybride kritisch", "Veel onvoorspelbare kilometers: geef bereik en tank- of laadgemak extra gewicht", "Altijd: controleer de specifieke auto, niet alleen het type aandrijving"] },
    ],
    relatedLanding: { label: "Doe de persoonlijke Hybrid & EV Match", href: "/keuzehulp" },
  },
  {
    slug: "elektrische-auto-thuis-laden",
    title: "Een elektrische auto thuis laden: zo begint u goed",
    description: "Thuis een elektrische auto laden? Lees waar u op let bij een laadpunt, meterkast, laadvermogen, kabel en dagelijks laadritme.",
    eyebrow: "Uitleg · Thuis laden",
    lead: "Thuis laden kan elektrisch rijden overzichtelijk maken. De juiste installatie hangt af van uw parkeerplek, meterkast, auto en hoeveel kilometers u per week rijdt.",
    readTime: "6 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Begin bij de parkeerplek", paragraphs: ["Een laadpunt werkt pas prettig wanneer u de auto veilig en consequent kunt parkeren. Controleer of de plek op eigen terrein ligt, of een kabel over de stoep is toegestaan en hoe ver de meterkast van de auto staat.", "Bij een huurwoning, appartement of gedeelde parkeerplaats zijn toestemming van verhuurder, VvE of gemeente en afspraken over stroomverbruik mogelijk nodig."] },
      { title: "Laat de installatie beoordelen", paragraphs: ["Een laadpunt vraagt om een geschikte groep, beveiliging en bekabeling. Laat een erkende installateur de bestaande meterkast, kabelroute en beschikbare netcapaciteit beoordelen voordat u een keuze maakt.", "Een 1-fase- of 3-faseaansluiting en het maximale AC-laadvermogen van de auto bepalen samen wat technisch haalbaar is. De auto laadt niet sneller dan de zwakste schakel."] },
      { title: "Welk laadvermogen is nodig?", paragraphs: ["Voor veel dagelijkse ritten is langzaam of normaal AC-laden voldoende wanneer de auto meerdere uren stilstaat. Een hoger vermogen kan de laadtijd verkorten, maar vraagt soms aanpassingen en is niet voor iedere auto beschikbaar.", "Kijk naar uw weekritme in plaats van naar de hoogste waarde op een productpagina. Een betrouwbare nachtelijke laadsessie is vaak belangrijker dan een theoretische piek."] },
      { title: "Kabel, beveiliging en gebruik", paragraphs: ["Controleer of uw auto een vaste kabel of een losse Type 2-kabel gebruikt en of die bij de auto wordt geleverd. Gebruik geen verlengsnoer of beschadigde kabel voor structureel laden.", "Plan laden waar mogelijk buiten piekmomenten wanneer uw contract of laadoplossing dat ondersteunt. Houd stekker, kabel en laadpunt schoon en laat storingen controleren."] },
      { title: "Een nuchtere start", paragraphs: ["Vraag offertes op basis van dezelfde uitgangspunten en laat verbruik, installatie en eventuele abonnementskosten apart benoemen. Tarieven en technische voorschriften kunnen wijzigen; controleer die vóór installatie opnieuw."], bullets: ["Parkeerplek en toestemming geregeld", "Meterkast en kabelroute professioneel beoordeeld", "AC-laadvermogen afgestemd op de auto", "Kabel en beveiliging geschikt en onbeschadigd", "Kosten en terugkerende diensten helder vastgelegd"] },
    ],
    relatedLanding: { label: "Bekijk elektrische occasions", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "publiek-laden-elektrische-auto",
    title: "Publiek laden met een elektrische auto: wat moet u weten?",
    description: "Praktische uitleg over publieke laadpalen, laadpassen, tarieven, bezette plekken en laden onderweg met een elektrische occasion.",
    eyebrow: "Uitleg · Publiek laden",
    lead: "Zonder eigen laadpunt kunt u elektrisch rijden, maar u plant uw laadmomenten anders. Beschikbaarheid, pasvoorwaarden en prijs horen bij de beoordeling van uw dagelijkse route.",
    readTime: "6 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Verschillende soorten publieke laders", paragraphs: ["Normale openbare AC-laders staan vaak in woonwijken, bij winkels of op parkeerplaatsen. DC-snelladers zijn bedoeld voor een korter verblijf langs doorgaande routes. Het beschikbare vermogen verschilt per locatie en auto.", "Een laadpaal kan tijdelijk beperkt beschikbaar zijn door storing, bezetting of lokale regels. Kijk daarom niet alleen naar afstand, maar ook naar alternatieven in de buurt."] },
      { title: "Laadpas en starttarief", paragraphs: ["Met een laadpas of app identificeert u zich bij veel publieke laadpunten. Controleer vooraf de kWh-prijs, eventuele start- of abonnementskosten en de voorwaarden voor roaming. De prijs die u ziet kan per pas verschillen.", "Een pas die op veel plekken werkt is handig, maar niet automatisch de goedkoopste. Bewaar facturen en controleer bij onbekende aanbieders wie de exploitant is."] },
      { title: "Plan met marge", paragraphs: ["Plan een laadstop niet pas wanneer de accu bijna leeg is. Een bezette of defecte paal, omleiding, kou of tegenwind kan de resterende actieradius sneller verminderen.", "Voor dagelijks laden helpt een vaste reserve en één bekende alternatieve locatie. Voor langere ritten controleert u de route, openingstijden en eventuele betaalwijze vooraf."] },
      { title: "Na het laden", paragraphs: ["Verplaats de auto zodra het laden klaar is als de locatie of het parkeerbeleid dat vraagt. Zo blijft de plek beschikbaar voor anderen en voorkomt u mogelijke blokkeerkosten.", "Koppel de laadkabel zorgvuldig los en controleer in de app of op de paal of de sessie echt is beëindigd. Noteer een storing en gebruik een andere paal wanneer nodig."] },
      { title: "Wat betekent dit bij aankoop?", paragraphs: ["Neem publieke laadroutines mee in uw occasionkeuze. Vergelijk de bruikbare accu, AC- en DC-mogelijkheden, laadcurve en uw vaste routes; een auto met een groter bereik is niet altijd de handigste als laden onderweg traag of onpraktisch is."], bullets: ["Welke laadpunten liggen op uw normale routes?", "Welke laadpas of app gebruikt u en wat kost die?", "Welke AC- en DC-laadvermogens ondersteunt de auto?", "Welke reserve houdt u aan voor omwegen en weer?", "Is een tweede laadlocatie beschikbaar?"] },
    ],
    relatedLanding: { label: "Vergelijk elektrische occasions op uw gebruik", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "snelladen-elektrische-auto",
    title: "Snelladen uitgelegd: snelheid, laadcurve en praktijk",
    description: "Hoe werkt snelladen bij een elektrische auto? Begrijp DC-laadvermogen, laadcurve, temperatuur, prijs en de invloed op uw reisplanning.",
    eyebrow: "Uitleg · Snelladen",
    lead: "Een hoge snellaadpiek klinkt aantrekkelijk, maar de volledige laadsessie bepaalt de reistijd. Kijk naar de laadcurve, het accuniveau en uw route in plaats van naar één maximumwaarde.",
    readTime: "6 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "AC-laden en DC-snelladen", paragraphs: ["Bij AC-laden zet de auto wisselstroom via de boordlader om voor de accu. Bij DC-laden gebeurt die omzetting grotendeels in het laadstation, waardoor een hoger vermogen mogelijk kan zijn.", "Niet iedere auto ondersteunt DC-laden en het maximale vermogen verschilt per uitvoering. Controleer altijd de specificaties van het specifieke voertuig."] },
      { title: "De laadcurve is belangrijker dan de piek", paragraphs: ["Het laadvermogen is meestal het hoogst bij een lager accuniveau en neemt daarna af om de accu te beschermen. Daardoor duurt laden van een laag niveau naar ongeveer 80 procent vaak efficiënter dan doorladen tot 100 procent.", "Vergelijk daarom, wanneer betrouwbare gegevens beschikbaar zijn, de tijd voor een bruikbare hoeveelheid bereik. Een piek die maar kort wordt gehaald zegt weinig over de hele stop."] },
      { title: "Temperatuur en omstandigheden", paragraphs: ["Een koude of zeer warme accu kan langzamer laden. Sommige auto’s kunnen de accu vóór aankomst bij een snellader conditioneren; andere doen dat beperkt of alleen onder bepaalde omstandigheden.", "Ook drukte, gedeeld laadvermogen en een storing beïnvloeden de werkelijke snelheid. Plan met tijdsmarge wanneer u een afspraak of aansluiting moet halen."] },
      { title: "Kosten en accugebruik", paragraphs: ["Snelladen is vaak duurder per kWh dan laden op een vaste AC-locatie, maar tarieven verschillen per exploitant en laadpas. Controleer de actuele prijs vóór u start.", "Regelmatig snelladen is niet automatisch schadelijk, maar laadstrategie, temperatuur en modelvoorwaarden verschillen. Volg de instructies van de fabrikant en gebruik thuis of op het werk waar mogelijk AC-laden."] },
      { title: "Snelladen beoordelen bij een occasion", paragraphs: ["Vraag of de laadpoort, kabelvergrendeling en laadfunctie zijn gecontroleerd. Een proeflaadsessie is nuttig wanneer die veilig en praktisch uitvoerbaar is; een ontbrekende test is geen bewijs van een defect, maar moet wel worden benoemd."], bullets: ["Ondersteunt de specifieke uitvoering DC-laden?", "Wat is het opgegeven maximum en hoe lang blijft dat beschikbaar?", "Welke laadpas- en locatiekosten gelden op uw routes?", "Is accutemperatuurmanagement aanwezig?", "Welke laadgarantie en gebruiksvoorwaarden noemt de fabrikant?"] },
    ],
    relatedLanding: { label: "Bekijk onze aanpak voor elektrische occasions", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "elektrisch-rijden-in-de-winter",
    title: "Elektrisch rijden in de winter: bereik en voorbereiding",
    description: "Kou beïnvloedt het bereik en laden van een elektrische auto. Lees hoe u winterritten voorbereidt zonder schijnprecisie over actieradius.",
    eyebrow: "Praktijk · Winter",
    lead: "In de winter kan een elektrische auto tijdelijk minder ver komen en langzamer laden. Dat is geen vast kortingspercentage: temperatuur, snelheid, verwarming, banden en route bepalen samen het verschil.",
    readTime: "6 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Waarom kou verschil maakt", paragraphs: ["De accu werkt minder efficiënt bij lage temperaturen en verwarming vraagt energie. Ook banden, wind, nat wegdek en winterse snelheid verhogen het verbruik.", "Het effect verschilt per model, accuchemie, rit en buitentemperatuur. Gebruik een winterrit daarom als scenario met marge, niet als één universeel percentage."] },
      { title: "Voorverwarmen terwijl de auto laadt", paragraphs: ["Wanneer de auto dit ondersteunt, kunt u interieur en accu voor vertrek laten opwarmen terwijl de auto aan de lader staat. Dat kan energie uit de laadpaal gebruiken in plaats van uit de accu.", "Controleer of planning, app of voertuiginstelling goed werkt. Een ingestelde vertrektijd is niet bij ieder model hetzelfde als direct voorverwarmen."] },
      { title: "Plan uw rit met reserve", paragraphs: ["Kies bij lange ritten een laadpunt vóór de accu heel laag staat en houd een alternatief achter de hand. Snelheid aanpassen, rustig optrekken en de verwarming verstandig instellen kunnen helpen, maar vervangen geen veiligheidsmarge.", "Controleer onderweg de actuele verkeers- en weersituatie. Bij sneeuw of gladheid staan veiligheid en zicht altijd voorop."] },
      { title: "Banden, ruiten en zicht", paragraphs: ["Controleer bandenspanning volgens de voorschriften; kou kan de druk beïnvloeden. Goede profieldiepte, passende winterbanden waar nodig en schone sensoren helpen bij grip en rijhulpsystemen.", "Maak ruiten volledig vrij en gebruik geen rijhulpsysteem als vervanging voor uw eigen aandacht."] },
      { title: "Wat vraagt u bij een gebruikte EV?", paragraphs: ["Vraag naar laadgedrag, foutmeldingen, onderhoud en de werking van klimaatregeling en accutemperatuurmanagement. Een winterbereik uit een advertentie is geen garantie voor uw eigen route."], bullets: ["Plan voorverwarming en controleer of die echt start", "Houd marge voor kou, wind, verkeer en omwegen", "Controleer bandenspanning, profiel en ruitensproeiervloeistof", "Kies laadpunten met een alternatief in de buurt", "Beoordeel bereik altijd naast uw eigen snelheid en route"] },
    ],
    relatedLanding: { label: "Elektrische occasions vergelijken", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "elektrische-auto-op-vakantie",
    title: "Met een elektrische auto op vakantie: een praktische voorbereiding",
    description: "Op vakantie met een elektrische auto? Bereid route, laadstops, passen, bagage, banden en alternatieven rustig voor.",
    eyebrow: "Praktijk · Vakantie",
    lead: "Een lange EV-rit vraagt vooral om voorbereiding. Controleer uw auto en laadroute vooraf, maar laat ruimte voor verkeer, weer, bezette laders en onverwachte omwegen.",
    readTime: "6 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Ken uw vertrekpunt", paragraphs: ["Start bij voorkeur met een passende laadstatus en controleer bandenspanning, vloeistoffen, ruitenwissers, laadkabel en eventuele dak- of fietsendrager. Extra gewicht en hogere snelheid kunnen het verbruik verhogen.", "Controleer ook verzekeringsgegevens, pechhulp en documenten voor de landen waar u doorheen rijdt. Voor specifieke regels gebruikt u actuele overheids- of aanbiederinformatie."] },
      { title: "Plan laadstops als reeks, niet als één punt", paragraphs: ["Kies laadlocaties langs uw route en noteer een alternatief bij belangrijke stops. Controleer of de locatie toegankelijk is, welke stekker en betaalmethode nodig zijn en of er voorzieningen zijn wanneer u moet wachten.", "Apps en routeplanners tonen een verwachting, geen beschikbaarheidsgarantie. Kijk vlak voor vertrek opnieuw naar storingen en verkeerssituatie."] },
      { title: "Houd rekening met belading en weer", paragraphs: ["Volle bagage, een dakkoffer, tegenwind, bergen en hoge snelheden kunnen het bereik merkbaar beïnvloeden. Rijd volgens de omstandigheden en plan een extra stop wanneer de marge klein wordt.", "Gebruik de auto-instellingen voor routeplanning alleen als hulpmiddel. Controleer zelf of de voorgestelde laadpunten passen bij uw pas en voertuig."] },
      { title: "Tijdens de reis", paragraphs: ["Laad niet langer dan nodig wanneer een locatie druk is en verplaats de auto daarna volgens de lokale regels. Bewaar een laadpas en betaalmogelijkheid als reserve.", "Bij een storing: volg de instructies op de paal, probeer een andere connector of locatie en neem contact op met de exploitant. Ga niet aan een kabel of laadpunt sleutelen."] },
      { title: "Een gebruikte EV voor reizen kiezen", paragraphs: ["Let op realistisch bereik, laadcurve, zit- en bagageruimte, trekgewicht waar relevant en de laadmogelijkheden op uw vaste vakantieroutes. Een vakantieproefrit of routevergelijking is waardevoller dan alleen een WLTP-getal."], bullets: ["Laadpassen en betaalmiddelen gecontroleerd", "Minimaal één alternatief per belangrijke laadstop", "Banden, kabels, bagage en pechhulp voorbereid", "Marge voor weer, verkeer en extra gewicht", "Actuele tarieven en lokale regels opnieuw gecontroleerd"] },
    ],
    relatedLanding: { label: "Bekijk elektrische occasions", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "mild-hybrid-full-hybrid-plug-inhybride",
    title: "Mild hybrid, full hybrid of plug-inhybride: de verschillen",
    description: "Wat is het verschil tussen mild hybrid, full hybrid en plug-inhybride? Een nuchtere uitleg over laden, elektrische ondersteuning en gebruik.",
    eyebrow: "Uitleg · Hybride",
    lead: "‘Hybride’ is een verzamelnaam. Mild hybrid, full hybrid en plug-inhybride verschillen in accugrootte, laadwijze en de rol van de elektromotor.",
    readTime: "7 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Mild hybrid: ondersteuning, geen elektrische auto", paragraphs: ["Een mild-hybridsysteem ondersteunt de verbrandingsmotor met een kleine elektrische machine en accu. Het systeem kan bijvoorbeeld helpen bij optrekken, uitrollen of starten, maar rijdt doorgaans niet langdurig zelfstandig elektrisch.", "De auto laadt de kleine accu tijdens het rijden en remmen. U hoeft meestal geen laadkabel te gebruiken. Techniek en benaming verschillen per merk en uitvoering."] },
      { title: "Full hybrid: kort elektrisch rijden", paragraphs: ["Een full hybrid kan onder geschikte omstandigheden zelfstandig elektrisch rijden, vaak bij lage snelheid en beperkte belasting. De accu wordt tijdens het rijden en regeneratief remmen geladen.", "U sluit een gewone full hybrid normaal niet aan op een laadpaal. Verbruik en elektrische inzet hangen af van route, temperatuur, snelheid en rijstijl."] },
      { title: "Plug-inhybride: laden om het voordeel te benutten", paragraphs: ["Een plug-inhybride heeft een grotere accu die u extern laadt en kan daardoor dagelijkse ritten deels elektrisch afleggen. Voor langere ritten blijft de verbrandingsmotor beschikbaar.", "Zonder regelmatig laden neemt u wel extra gewicht mee, maar benut u minder van de elektrische mogelijkheid. Controleer laadpoort, kabel, laadfunctie en resterende accugarantie."] },
      { title: "Vergelijk niet alleen het label", paragraphs: ["Kijk naar uw dagelijkse kilometers, laadplek, snelweggebruik, bagage- of trekbehoefte en onderhoudsbudget. Een mild hybrid kan eenvoud bieden, een full hybrid kan bij gemengde ritten passen en een plug-inhybride kan logisch zijn wanneer laden onderdeel wordt van uw routine.", "Verbruiks- en emissiecijfers zijn gestandaardiseerde vergelijkingswaarden. Uw praktijk kan daarvan afwijken."] },
      { title: "Snelle vergelijking", paragraphs: ["Gebruik de indeling als startpunt en controleer daarna altijd de specifieke uitvoering."], bullets: ["Mild hybrid: kleine ondersteuning, doorgaans niet extern laden", "Full hybrid: korte elektrische ondersteuning, laden tijdens rijden", "Plug-inhybride: grotere accu, extern laden en meer elektrisch potentieel", "Alle drie: verbruik hangt af van model, route, weer en rijstijl", "Bij occasions: controleer historie, storingen, kabel en garantie"] },
    ],
    relatedLanding: { label: "Bekijk hybride occasions", href: "/hybride-auto-kopen-groningen" },
  },
  {
    slug: "hybride-occasion-kopen-controlepunten",
    title: "Een hybride occasion kopen: controleer deze punten",
    description: "Waar let u op bij een hybride occasion? Controleer onderhoud, batterij, aandrijflijn, laadfunctie, historie en een proefrit.",
    eyebrow: "Koopgids · Hybride",
    lead: "Een hybride occasion combineert meerdere systemen. Een goede beoordeling kijkt daarom verder dan het brandstofverbruik en de kilometerstand.",
    readTime: "7 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Bepaal eerst welk hybridesysteem u bekijkt", paragraphs: ["Controleer of de auto mild hybrid, full hybrid of plug-inhybride is en welke uitvoering op het kenteken en de documentatie staat. De laadwijze, accugrootte en onderhoudspunten verschillen.", "Bij een plug-inhybride hoort ook de vraag of u thuis of op het werk kunt laden. Zonder laadritme kan de keuze minder logisch zijn."] },
      { title: "Onderhoud en storingshistorie", paragraphs: ["Vraag naar onderhoudsboekje, facturen, terugroepacties en bekende storingen. Let op meldingen rond hybride systeem, transmissie, koeling en laadfunctie waar van toepassing.", "Een ontbrekende historie is geen automatisch afkeurpunt, maar maakt een onafhankelijke controle en prijsrisico belangrijker."] },
      { title: "Accu en laadfunctie", paragraphs: ["Vraag welke accugegevens beschikbaar zijn, wanneer ze zijn gemeten en wie dat deed. Een percentage zonder methode of datum is geen volledige diagnose.", "Test bij een plug-inhybride de laadpoort en, wanneer veilig mogelijk, een laadsessie. Controleer ook kabel, laadklep en meldingen op het dashboard."] },
      { title: "Proefrit met aandacht", paragraphs: ["Let op soepel wegrijden, overgang tussen aandrijfbronnen, remgevoel, regeneratie, geluiden en waarschuwingen. Probeer verschillende snelheden en een helling wanneer de situatie dat toelaat.", "Laat na de rit de auto opnieuw uitlezen of controleren wanneer een melding verschijnt. Verdwijnt een melding alleen tijdelijk, dan is dat relevante informatie."] },
      { title: "Kosten na aankoop", paragraphs: ["Vergelijk verzekering, banden, onderhoud, brandstof en eventuele laadkosten. Informeer naar resterende garantie en voorwaarden voor hybride- of hoogvoltbatterij.", "Laat een verkoper uitleggen wat is gecontroleerd en wat niet. Zo voorkomt u dat een algemene geruststelling wordt verward met een technische garantie."], bullets: ["Type hybride en laadbehoefte vastgesteld", "Onderhouds- en storingshistorie bekeken", "Beschikbare accudata van datum en methode voorzien", "Laadfunctie en kabel gecontroleerd bij een plug-in", "Proefrit en eventuele diagnose vastgelegd"] },
    ],
    relatedLanding: { label: "Hybride occasions vergelijken", href: "/hybride-auto-kopen-groningen" },
  },
  {
    slug: "onderhoud-elektrische-auto",
    title: "Onderhoud van een elektrische auto: wat blijft belangrijk?",
    description: "Een elektrische auto heeft minder motoronderdelen, maar onderhoud blijft nodig. Lees over banden, remmen, vloeistoffen, software en hoogvoltveiligheid.",
    eyebrow: "Onderhoud · Elektrisch",
    lead: "Minder bewegende motoronderdelen betekent niet onderhoudsvrij. Banden, remmen, onderstel, klimaatregeling en laadcomponenten verdienen bij een elektrische occasion gerichte aandacht.",
    readTime: "6 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Banden en onderstel", paragraphs: ["Elektrische auto’s zijn vaak zwaar en leveren direct koppel. Dat kan invloed hebben op bandenslijtage. Controleer profiel, spanning, gelijkmatige slijtage, uitlijning en de juiste bandenmaat.", "Ook schokdempers, draagarmen, wiellagers en stuurinrichting blijven gewone inspectiepunten. Let tijdens de proefrit op trillingen, trekken en bijgeluiden."] },
      { title: "Remmen en regeneratie", paragraphs: ["Regeneratief remmen gebruikt de elektromotor om af te remmen. Daardoor worden frictieremmen soms minder intensief gebruikt, maar schijven en blokken kunnen nog steeds slijten of corroderen.", "Test rempedaal en remkracht veilig en gelijkmatig. Laat een specialist kijken bij trillingen, geluid of een afwijkend pedaalgevoel."] },
      { title: "Vloeistoffen, klimaat en laadpoort", paragraphs: ["Koelvloeistof, remvloeistof, ruitensproeiervloeistof en airconditioning vragen volgens het onderhoudsschema aandacht. Sommige modellen hebben extra koeling voor accu en vermogenselektronica.", "Controleer laadklep, poort, afdichtingen, kabel en vergrendeling. Gebruik geen beschadigde kabel en laat storingen aan het laadsysteem onderzoeken."] },
      { title: "Software, accu en hoogvoltveiligheid", paragraphs: ["Software-updates kunnen functies en laadgedrag beïnvloeden. Vraag welke updates zijn uitgevoerd en welke waarschuwingen of foutcodes bekend zijn.", "Werk nooit zelf aan oranje hoogvoltbekabeling of een hoogvoltbatterij. Laat diagnose en reparatie uitvoeren door een daarvoor opgeleide partij. Een SOH-meting is nuttig, maar vervangt geen volledige voertuigcontrole."] },
      { title: "Onderhoudshistorie bij een occasion", paragraphs: ["Vergelijk de voorgeschreven intervallen met facturen en kilometerstand. Ontbrekende documenten hoeven niet alles te zeggen, maar maak de onzekerheid expliciet en neem die mee in de beslissing."], bullets: ["Banden, spanning en onderstel", "Remmen, regeneratie en remvloeistof", "Koeling en airconditioning", "Laadpoort, kabel en software", "Accudata, foutcodes en resterende garantie"] },
    ],
    relatedLanding: { label: "Bekijk elektrische occasions", href: "/elektrische-auto-kopen-groningen" },
  },
  {
    slug: "carcheck-ai-meta-bril-voertuigrapport",
    title: "CarCheck, AI en slimme brillen: wat staat er in een voertuigrapport?",
    description: "Lees hoe een CarCheck-voertuigrapport werkt, welke rol AI of een slimme bril kan hebben en waarom gecontroleerde brondata leidend blijft.",
    eyebrow: "CarCheck · Voertuigrapport",
    lead: "Een voertuigrapport is pas waardevol wanneer bevindingen herleidbaar zijn. AI en slimme brillen kunnen inspectiewerk ondersteunen, maar mogen ontbrekende feiten niet invullen.",
    readTime: "7 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Wat een CarCheck moet vastleggen", paragraphs: ["Een bruikbaar rapport koppelt voertuigidentificatie, datum, inspecteur, controlepunten, banden, proefrit, diagnosegegevens en advies aan één inspectie. Afwijkingen krijgen een duidelijke status en toelichting.", "Een score is een samenvatting van geregistreerde punten, geen garantie dat een auto geen verborgen gebrek heeft. De onderliggende bevindingen blijven daarom belangrijk."] },
      { title: "De huidige rapportbasis", paragraphs: ["De VVOS-voertuigcheck ondersteunt een mobiele inspectie met fysieke controlepunten, voertuiggegevens, hybride- en EV-velden en een rapportweergave. Beschikbare diagnosegegevens kunnen worden vastgelegd; een geïmporteerd Launch Health Report wordt als bron benoemd.", "Gegevens die niet zijn gemeten of gecontroleerd worden niet als positief resultaat gepresenteerd. Een demo- of testscan is geen voertuigdiagnose."] },
      { title: "Waar AI kan helpen", paragraphs: ["AI kan in de toekomst helpen bij het ordenen van notities, het samenvatten van foutcodes of het signaleren van ontbrekende velden. De bron blijft de inspectie, het diagnosebestand of een controleerbare documentatie.", "Een AI-suggestie moet door een bevoegde medewerker worden gecontroleerd voordat die in een klantgericht rapport terechtkomt. Een model mag geen foutcode, schade of accustaat verzinnen."] },
      { title: "En een Meta-bril?", paragraphs: ["Een slimme bril kan handsfree aanwijzingen of beeldregistratie mogelijk maken, maar dat is niet hetzelfde als een gevalideerde technische inspectie. Compatibiliteit, privacy, toestemming, opslag en de kwaliteit van beeldherkenning moeten eerst aantoonbaar geregeld zijn.", "Volt & Vroom publiceert alleen mogelijkheden die daadwerkelijk beschikbaar en gecontroleerd zijn. Een toekomstige bril- of AI-koppeling mag daarom niet als huidige CarCheck-functie worden verondersteld."] },
      { title: "Zo leest u een rapport kritisch", paragraphs: ["Controleer welke onderdelen werkelijk zijn bekeken, welke waarden uit een externe bron komen en welke punten niet van toepassing of niet gemeten zijn. Vraag uitleg bij een score die niet overeenkomt met de tekst.", "Gebruik het rapport samen met een proefrit, documenten en een onafhankelijke beoordeling wanneer de aankooprisico’s groot zijn."], bullets: ["Bron, datum en voertuigidentificatie zichtbaar", "Gemeten waarden gescheiden van opmerkingen of schattingen", "AI-uitvoer herkenbaar en door een mens gecontroleerd", "Geen claim over slimme-brilfuncties zonder werkende koppeling", "Beperkingen en niet-gecontroleerde punten benoemd"] },
    ],
    relatedLanding: { label: "Lees hoe VV Verified werkt", href: "/vv-verified" },
  },
  {
    slug: "youngtimer-of-klassieker-kopen",
    title: "Een youngtimer of klassieker kopen: kijk verder dan karakter",
    description: "Een youngtimer of klassieker kopen? Controleer historie, roest, techniek, onderdelen, gebruik en kosten voordat u beslist.",
    eyebrow: "Koopgids · Bijzondere auto’s",
    lead: "Een oudere auto kan karakter en rijplezier bieden, maar leeftijd maakt historie en onderhoud extra belangrijk. Koop het verhaal pas nadat u de auto zelf heeft gecontroleerd.",
    readTime: "7 minuten",
    publishedAt: "2026-09-13",
    updatedAt: "2026-09-13",
    sections: [
      { title: "Youngtimer en klassieker zijn geen technische garanties", paragraphs: ["‘Youngtimer’ wordt in Nederland vaak gebruikt voor een auto van een bepaalde leeftijd, terwijl fiscale regels en voorwaarden kunnen wijzigen. ‘Klassieker’ verwijst vooral naar leeftijd, status of liefhebberswaarde en zegt op zichzelf niets over conditie.", "Controleer actuele fiscale en verzekeringsvoorwaarden bij de Belastingdienst, verzekeraar of adviseur voordat u een financiële keuze maakt."] },
      { title: "Historie en originaliteit", paragraphs: ["Vraag naar onderhoudsfacturen, restauratiefoto’s, taxaties, keuringsrapporten en bekende eigenaren. Controleer of motor, kleur, interieur en accessoires origineel zijn of wanneer wijzigingen zijn uitgevoerd.", "Een volledig gereviseerde auto kan interessant zijn, maar de kwaliteit en documentatie van het werk bepalen de waarde. Een glanzende lak verbergt geen ontbrekende historie."] },
      { title: "Roest en constructie", paragraphs: ["Bekijk dorpels, wielranden, bodem, krikpunten, subframes, portieren en raamranden. Let op kleurverschil, bobbels, verse tectyl en naden die reparaties kunnen maskeren.", "Laat bij twijfel een specialist met brug en geschikte meetmiddelen kijken. Roest aan dragende delen kan veiligheid en kosten sterk beïnvloeden."] },
      { title: "Techniek en onderdelen", paragraphs: ["Controleer koude start, oliedruk of laadspanning waar relevant, koeling, remmen, stuurinrichting, lekkages en elektrische functies. Maak een langere proefrit wanneer de auto warm is.", "Informeer vooraf naar onderdelenbeschikbaarheid, specialistische kennis en levertijden. Een betaalbare aankoop kan duur worden wanneer een zeldzaam onderdeel of revisie nodig is."] },
      { title: "Gebruik, stalling en budget", paragraphs: ["Bepaal of u dagelijks, seizoensmatig of recreatief rijdt. Stalling, onderhoud, banden, verzekering, brandstof en onverwachte reparaties horen bij de totale kosten.", "Plan een aankoopkeuring en leg vast welke punten vóór levering worden opgelost. Bij een bijzondere auto is een onafhankelijke blik vaak meer waard dan extra snelheid."], bullets: ["Actuele fiscale en verzekeringsregels gecontroleerd", "Historie en restauratiewerk gedocumenteerd", "Roest en dragende delen professioneel bekeken", "Onderdelen, specialist en onderhoud begroot", "Gebruik, stalling en aankoopkeuring geregeld"] },
    ],
    relatedLanding: { label: "Bekijk bijzondere auto’s bij Icons", href: "/icons" },
  },
];

export function getArticle(slug: string) {
  return knowledgeArticles.find((article) => article.slug === slug);
}
