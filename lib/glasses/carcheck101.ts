import type { Finding, InspectionChecklistItem, InspectionSession, InspectionSectionId } from "@/lib/glasses/model";

export type CarCheckDecision = "INCOMPLETE" | "VV_APPROVED" | "REPAIR_REQUIRED" | "REJECTED";

export interface CarCheck101Definition {
  number: number;
  id: string;
  section: InspectionSectionId;
  category: string;
  label: string;
  safetyCritical?: boolean;
}

const d = (number: number, id: string, section: InspectionSectionId, category: string, label: string, safetyCritical = false): CarCheck101Definition => ({ number, id, section, category, label, safetyCritical });

export const CARCHECK_101: readonly CarCheck101Definition[] = [
  d(1,"identification_license_plate","identification","Identificatie","Kenteken komt overeen met voertuig en documenten"),
  d(2,"identification_vin_physical","identification","Identificatie","VIN/chassisnummer fysiek gecontroleerd"),
  d(3,"identification_vin_registration","identification","Identificatie","VIN komt overeen met voertuigregistratie"),
  d(4,"identification_vehicle_spec","identification","Identificatie","Merk, model en uitvoering vastgesteld"),
  d(5,"identification_year","identification","Identificatie","Bouwjaar / datum eerste toelating gecontroleerd"),
  d(6,"identification_mileage","identification","Identificatie","Kilometerstand gecontroleerd en plausibel"),
  d(7,"identification_keys","identification","Identificatie","Aantal sleutels gecontroleerd"),
  d(8,"documentation_maintenance","documentation","Documentatie","Onderhoudshistorie aanwezig en beoordeeld"),
  d(9,"documentation_apk","documentation","Documentatie","APK-status en vervaldatum gecontroleerd"),
  d(10,"documentation_recalls","documentation","Documentatie","Terugroepacties / campagnes gecontroleerd"),
  d(11,"documentation_damage_history","documentation","Documentatie","Schade- en reparatiehistorie beoordeeld"),
  d(12,"body_front_bumper","body","Carrosserie","Voorbumper visueel gecontroleerd"),
  d(13,"body_hood_front","body","Carrosserie","Motorkap en voorzijde gecontroleerd"),
  d(14,"body_front_left_fender","body","Carrosserie","Linker voorscherm gecontroleerd"),
  d(15,"body_front_right_fender","body","Carrosserie","Rechter voorscherm gecontroleerd"),
  d(16,"body_front_left_door","body","Carrosserie","Linker voorportier gecontroleerd"),
  d(17,"body_front_right_door","body","Carrosserie","Rechter voorportier gecontroleerd"),
  d(18,"body_rear_left","body","Carrosserie","Linker achterzijde / portier gecontroleerd"),
  d(19,"body_rear_right","body","Carrosserie","Rechter achterzijde / portier gecontroleerd"),
  d(20,"body_roof","body","Carrosserie","Dak en daklijsten gecontroleerd"),
  d(21,"body_tailgate","body","Carrosserie","Achterklep / kofferdeksel gecontroleerd"),
  d(22,"body_rear_bumper","body","Carrosserie","Achterbumper gecontroleerd"),
  d(23,"body_paint_variance","body","Carrosserie","Lakverschillen / overspuitwerk beoordeeld"),
  d(24,"body_panel_alignment","body","Carrosserie","Plaatnaden en carrosserie-uitlijning gecontroleerd"),
  d(25,"body_corrosion","body","Carrosserie","Roest / corrosie gecontroleerd"),
  d(26,"glass_windshield","glass_lighting","Glas & verlichting","Voorruit op schade en steenslag gecontroleerd",true),
  d(27,"glass_side_rear","glass_lighting","Glas & verlichting","Zijruiten en achterruit gecontroleerd"),
  d(28,"lighting_headlights","glass_lighting","Glas & verlichting","Koplampen functioneren en zijn onbeschadigd",true),
  d(29,"lighting_rear","glass_lighting","Glas & verlichting","Achterlichten functioneren en zijn onbeschadigd",true),
  d(30,"lighting_indicators","glass_lighting","Glas & verlichting","Richtingaanwijzers / alarmlichten gecontroleerd",true),
  d(31,"lighting_other","glass_lighting","Glas & verlichting","Mist-/dagrij-/kentekenverlichting gecontroleerd",true),
  d(32,"interior_driver_seat","interior","Interieur","Bestuurdersstoel staat en werking"),
  d(33,"interior_passenger_seat","interior","Interieur","Passagiersstoel staat en werking"),
  d(34,"interior_rear_seats","interior","Interieur","Achterbank / overige zitplaatsen gecontroleerd"),
  d(35,"interior_seatbelts","interior","Interieur","Veiligheidsgordels en sluitingen gecontroleerd",true),
  d(36,"interior_trim","interior","Interieur","Dashboard / bekleding / hemel staat"),
  d(37,"interior_windows","interior","Interieur","Ramen en elektrische bediening gecontroleerd"),
  d(38,"interior_locking","interior","Interieur","Centrale vergrendeling / keyless gecontroleerd"),
  d(39,"interior_climate","interior","Interieur","Airconditioning / klimaatregeling getest"),
  d(40,"interior_heating","interior","Interieur","Stoel-/stuurverwarming indien aanwezig getest"),
  d(41,"interior_infotainment","interior","Interieur","Infotainment / navigatie / audio getest"),
  d(42,"interior_parking_aids","interior","Interieur","Camera's / parkeersensoren getest"),
  d(43,"interior_trunk","interior","Interieur","Kofferbak, vloer en gereedschap gecontroleerd"),
  d(44,"tire_front_left","tires_wheels","Banden & wielen","Band linksvoor profiel en beschadigingen",true),
  d(45,"tire_front_right","tires_wheels","Banden & wielen","Band rechtsvoor profiel en beschadigingen",true),
  d(46,"tire_rear_left","tires_wheels","Banden & wielen","Band linksachter profiel en beschadigingen",true),
  d(47,"tire_rear_right","tires_wheels","Banden & wielen","Band rechtsachter profiel en beschadigingen",true),
  d(48,"tires_dot_match","tires_wheels","Banden & wielen","DOT/leeftijd en gelijkwaardigheid banden",true),
  d(49,"wheels_condition","tires_wheels","Banden & wielen","Velgen op schade / vervorming gecontroleerd"),
  d(50,"tires_pressure_tpms","tires_wheels","Banden & wielen","Bandenspanning / TPMS gecontroleerd",true),
  d(51,"brakes_front_pads","brakes","Remmen","Remblokken voorzijde beoordeeld",true),
  d(52,"brakes_front_discs","brakes","Remmen","Remschijven voorzijde beoordeeld",true),
  d(53,"brakes_rear_pads","brakes","Remmen","Remblokken achterzijde beoordeeld",true),
  d(54,"brakes_rear_discs","brakes","Remmen","Remschijven achterzijde beoordeeld",true),
  d(55,"brakes_lines","brakes","Remmen","Remleidingen / slangen visueel gecontroleerd",true),
  d(56,"brakes_parking","brakes","Remmen","Parkeerrem / elektrische parkeerrem getest",true),
  d(57,"chassis_front_dampers","chassis","Onderstel","Schokdempers voor gecontroleerd",true),
  d(58,"chassis_rear_dampers","chassis","Onderstel","Schokdempers achter gecontroleerd",true),
  d(59,"chassis_springs","chassis","Onderstel","Veren gecontroleerd",true),
  d(60,"chassis_arms_bushes","chassis","Onderstel","Draagarmen / rubbers / fusees gecontroleerd",true),
  d(61,"chassis_wheel_bearings","chassis","Onderstel","Wiellagers gecontroleerd",true),
  d(62,"chassis_steering","chassis","Onderstel","Stuurinrichting / speling gecontroleerd",true),
  d(63,"chassis_underbody","chassis","Onderstel","Onderzijde / bodemplaten / lekkages gecontroleerd",true),
  d(64,"drivetrain_engine_bay","drivetrain","Aandrijving","Motorruimte algemene visuele controle"),
  d(65,"drivetrain_engine_oil","drivetrain","Aandrijving","Motorolie niveau / conditie indien van toepassing"),
  d(66,"drivetrain_coolant","drivetrain","Aandrijving","Koelvloeistof niveau / conditie",true),
  d(67,"drivetrain_fluids","drivetrain","Aandrijving","Overige vloeistoffen gecontroleerd"),
  d(68,"drivetrain_belts_hoses","drivetrain","Aandrijving","Riemen / slangen / aansluitingen visueel gecontroleerd"),
  d(69,"drivetrain_cold_start","drivetrain","Aandrijving","Koude start / inschakeling aandrijving beoordeeld"),
  d(70,"drivetrain_idle_noise","drivetrain","Aandrijving","Stationair / loopcultuur / abnormale geluiden"),
  d(71,"drivetrain_transmission","drivetrain","Aandrijving","Transmissie inschakeling en werking",true),
  d(72,"drivetrain_shafts","drivetrain","Aandrijving","Aandrijfassen / homokineten gecontroleerd",true),
  d(73,"drivetrain_exhaust","drivetrain","Aandrijving","Uitlaatsysteem gecontroleerd indien aanwezig"),
  d(74,"electronics_12v_battery","electronics_12v","12V & elektronica","12V-accu conditie / spanning beoordeeld"),
  d(75,"electronics_cluster","electronics_12v","12V & elektronica","Instrumentenpaneel zonder ongewenste waarschuwingen",true),
  d(76,"electronics_obd_scan","electronics_12v","12V & elektronica","OBD volledige voertuigscan uitgevoerd"),
  d(77,"electronics_active_dtcs","electronics_12v","12V & elektronica","Actieve foutcodes beoordeeld",true),
  d(78,"electronics_stored_dtcs","electronics_12v","12V & elektronica","Historische / opgeslagen foutcodes beoordeeld"),
  d(79,"electronics_adas","electronics_12v","12V & elektronica","ADAS-/veiligheidssystemen zonder storingsmelding",true),
  d(80,"hybrid_ev_hv_system","hybrid_ev","Hybride / EV","Hoogvolt-systeem visueel / diagnostisch gecontroleerd",true),
  d(81,"hybrid_ev_soh","hybrid_ev","Hybride / EV","HV-accu State of Health vastgelegd indien uitleesbaar"),
  d(82,"hybrid_ev_cell_balance","hybrid_ev","Hybride / EV","Celspanningsbalans / afwijkingen beoordeeld indien uitleesbaar",true),
  d(83,"hybrid_ev_thermal","hybrid_ev","Hybride / EV","HV-accutemperaturen / thermisch management beoordeeld",true),
  d(84,"hybrid_ev_charge_port","hybrid_ev","Hybride / EV","Laadpoort en laadklep gecontroleerd",true),
  d(85,"hybrid_ev_ac","hybrid_ev","Hybride / EV","AC-laden functioneel getest indien van toepassing",true),
  d(86,"hybrid_ev_dc","hybrid_ev","Hybride / EV","DC-snelladen / laadcommunicatie beoordeeld indien van toepassing",true),
  d(87,"hybrid_ev_cables","hybrid_ev","Hybride / EV","Laadkabel(s) aanwezig en staat gecontroleerd"),
  d(88,"hybrid_ev_range","hybrid_ev","Hybride / EV","Elektrische actieradius / energiegegevens vastgelegd"),
  d(89,"hybrid_ev_regen","hybrid_ev","Hybride / EV","Regeneratief remmen functioneert normaal",true),
  d(90,"road_test_steering","road_test","Proefrit","Stuurgedrag / rechtuitloop beoordeeld",true),
  d(91,"road_test_braking","road_test","Proefrit","Remgedrag tijdens proefrit beoordeeld",true),
  d(92,"road_test_acceleration","road_test","Proefrit","Acceleratie / vermogensafgifte beoordeeld"),
  d(93,"road_test_drivetrain","road_test","Proefrit","Transmissie / aandrijflijn onder belasting beoordeeld",true),
  d(94,"road_test_noise","road_test","Proefrit","Trillingen / bijgeluiden / resonanties beoordeeld"),
  d(95,"road_test_assistance","road_test","Proefrit","Cruise control / rijhulpsystemen functioneel getest"),
  d(96,"road_test_post_temperature","road_test","Proefrit","Temperatuur / waarschuwingen na proefrit gecontroleerd",true),
  d(97,"final_safety_review","final_check","Eindcontrole","Alle veiligheidskritische punten beoordeeld",true),
  d(98,"final_repairs","final_check","Eindcontrole","Benodigde herstelwerkzaamheden vastgelegd"),
  d(99,"final_repair_cost","final_check","Eindcontrole","Totale herstelkosten indicatief vastgesteld"),
  d(100,"final_vv_standard","final_check","Eindcontrole","Voertuig voldoet aan VV verkoopstandaard",true),
  d(101,"final_advice","final_check","Eindcontrole","Eindadvies: vrijgeven / herstellen / afwijzen",true),
] as const;

export function createCarCheck101Checklist(): InspectionChecklistItem[] {
  if (CARCHECK_101.length !== 101) throw new Error(`VV CarCheck 101 definitie bevat ${CARCHECK_101.length} punten.`);
  return CARCHECK_101.map(point => ({ id: point.id, number: point.number, section: point.section, category: point.category, label: point.label, safetyCritical: Boolean(point.safetyCritical), status: "pending" }));
}

export function carCheckPoint(id: string): CarCheck101Definition | undefined { return CARCHECK_101.find(point => point.id === id); }

export interface CarCheck101Result {
  total: 101;
  handled: number;
  good: number;
  attention: number;
  rejected: number;
  notApplicable: number;
  progressPercent: number;
  scorePercent: number;
  openDeviations: number;
  safetyCriticalRejected: number;
  repairCostCents: number;
  unpricedFindings: number;
  decision: CarCheckDecision;
  releaseBlocked: boolean;
  reason: string;
}

export function evaluateCarCheck101(session: Pick<InspectionSession,"checklist"|"findings">): CarCheck101Result {
  const checklist = session.checklist;
  const handled = checklist.filter(item => item.status !== "pending").length;
  const good = checklist.filter(item => item.status === "ok").length;
  const attention = checklist.filter(item => item.status === "attention").length;
  const rejected = checklist.filter(item => item.status === "fail").length;
  const notApplicable = checklist.filter(item => item.status === "na").length;
  const safetyCriticalRejected = checklist.filter(item => item.safetyCritical && item.status === "fail").length;
  const confirmed = session.findings.filter(f => f.reviewStatus === "confirmed");
  const repairCostCents = confirmed.reduce((sum,f) => sum + (f.estimatedRepairCostCents ?? 0),0);
  const unpricedFindings = confirmed.filter(f => f.estimatedRepairCostCents === undefined && f.severity !== "info").length;
  const openDeviations = attention + rejected + confirmed.filter(f => f.severity !== "info").length;
  const denominator = Math.max(1, good + attention + rejected);
  const scorePercent = Math.max(0, Math.round(((good + attention * 0.5) / denominator) * 100));
  let decision: CarCheckDecision = "INCOMPLETE";
  let reason = "Inspectie nog niet compleet.";
  if (handled === 101) {
    if (safetyCriticalRejected > 0) { decision = "REJECTED"; reason = `${safetyCriticalRejected} veiligheidskritische afkeurpunt(en) blokkeren vrijgave.`; }
    else if (rejected > 0 || attention > 0 || confirmed.some(f => ["minor","attention","major","critical"].includes(f.severity))) { decision = "REPAIR_REQUIRED"; reason = "Afwijkingen moeten eerst worden hersteld of expliciet afgehandeld."; }
    else { decision = "VV_APPROVED"; reason = "Alle 101 punten zijn afgehandeld zonder open afwijkingen."; }
  }
  return { total:101, handled, good, attention, rejected, notApplicable, progressPercent:Math.round(handled/101*100), scorePercent, openDeviations, safetyCriticalRejected, repairCostCents, unpricedFindings, decision, releaseBlocked: decision !== "VV_APPROVED", reason };
}

export function applyFindingCost(findings: Finding[], findingId: string, cents: number): Finding[] { return findings.map(f => f.id === findingId ? { ...f, estimatedRepairCostCents: cents } : f); }
