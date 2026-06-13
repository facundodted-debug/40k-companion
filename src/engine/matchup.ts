import { ArmyList, OpponentUnit, UnitWeapon } from '../app/components/shared';
import { getDetachmentDescription } from '../app/components/DetachmentDescriptions';
import { FACTION_DATA } from '../data';
import { DataUnit, FactionData, WeaponProfile } from '../data/types';

export interface MatchupInput {
  ownList: ArmyList | null;
  rivalFactionId: string;
  rivalDetachment?: string;
}

export interface MatchupOutput {
  opponentUnits: OpponentUnit[];
  strengths: string[];
  weaknesses: string[];
  gameplan: string[];
}

// Subfacciones de Space Marines sin datos propios: usan el arsenal genérico de la
// Adeptus Astartes como referencia cuando no se especifica un detachment con datos.
const SPACE_MARINE_SUBFACTIONS = new Set([
  'black-templars', 'blood-angels', 'dark-angels', 'deathwatch', 'grey-knights',
  'imperial-fists', 'iron-hands', 'raven-guard', 'salamanders', 'space-wolves',
  'ultramarines', 'white-scars',
]);

function getFactionData(factionId: string): FactionData | undefined {
  const direct = FACTION_DATA[factionId];
  if (direct && direct.units.length > 0) return direct;
  if (SPACE_MARINE_SUBFACTIONS.has(factionId)) return FACTION_DATA['space-marines'];
  return direct;
}

function formatWeapon(w: WeaponProfile): UnitWeapon {
  return {
    name: w.name,
    range: w.range ?? 'Melee',
    a: w.a,
    skill: w.skill,
    s: String(w.s),
    ap: String(w.ap),
    d: w.d,
  };
}

function toOpponentUnit(u: DataUnit): OpponentUnit {
  return {
    name: u.name,
    pts: u.pts,
    keywords: u.keywords,
    stats: {
      m: `${u.stats.m}"`,
      t: u.stats.t,
      sv: `${u.stats.sv}+`,
      w: u.stats.w,
      ld: `${u.stats.ld}+`,
      oc: u.stats.oc,
    },
    ranged: u.ranged.map(formatWeapon),
    melee: u.melee.map(formatWeapon),
    abilities: u.abilities,
    considerations: u.considerations,
    recommendations: u.recommendations,
  };
}

function hasHighAp(unit: DataUnit, threshold = -3): boolean {
  return [...unit.ranged, ...unit.melee].some(w => w.ap <= threshold);
}

function hasHighStrength(unit: DataUnit, threshold = 8): boolean {
  return [...unit.ranged, ...unit.melee].some(w => w.s >= threshold);
}

const DANGEROUS_KEYWORDS = ['LETHAL HITS', 'DEVASTATING WOUNDS', 'SUSTAINED HITS', 'PRECISION'];

function findDangerousKeywords(unit: DataUnit): string[] {
  const found = new Set<string>();
  for (const w of [...unit.ranged, ...unit.melee]) {
    for (const kw of w.keywords ?? []) {
      const upper = kw.toUpperCase();
      if (DANGEROUS_KEYWORDS.some(d => upper.includes(d))) found.add(kw);
    }
  }
  for (const a of unit.abilities) {
    const upper = a.toUpperCase();
    if (DANGEROUS_KEYWORDS.some(d => upper.includes(d))) found.add(a);
  }
  return [...found];
}

export function analyzeMatchup(input: MatchupInput): MatchupOutput {
  const { ownList, rivalFactionId, rivalDetachment } = input;

  const rivalData = getFactionData(rivalFactionId);
  const rivalUnitsAll = rivalData?.units ?? [];
  const rivalDetachmentNames = rivalData ? Object.keys(rivalData.detachments) : [];
  const rivalDetName = (rivalDetachment && rivalData?.detachments[rivalDetachment])
    ? rivalDetachment
    : rivalDetachmentNames[0];
  const rivalDet = rivalDetName ? rivalData?.detachments[rivalDetName] : undefined;

  const ownData = ownList ? getFactionData(ownList.faction.id) : undefined;
  const ownDet = getDetachmentDescription(ownList?.detachment.name ?? '');
  const ownUnitsData = (ownList?.keyUnits ?? [])
    .map(u => ownData?.units.find(d => d.id === u.id))
    .filter((u): u is DataUnit => !!u);
  const ownDetachmentName = ownList?.detachment.name ?? 'tu detachment';

  // ── Top rival units by points ──────────────────────────────────────────────
  const opponentUnits = [...rivalUnitsAll]
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 5)
    .map(toOpponentUnit);

  // ── Fortalezas ──────────────────────────────────────────────────────────────
  const strengths: string[] = [];

  // Own detachment abilities as advantages
  for (const ability of ownDet.abilities.slice(0, 2)) {
    strengths.push(`${ownDetachmentName} — ${ability.name}: ${ability.rule}`);
  }

  // Anti-tank: rival has high T units, own list has high S / high AP weapons
  const toughRivals = rivalUnitsAll.filter(u => u.stats.t >= 8).sort((a, b) => b.stats.t - a.stats.t);
  if (toughRivals.length > 0) {
    const ownPunchers = ownUnitsData.filter(u => hasHighStrength(u) || hasHighAp(u));
    if (ownPunchers.length > 0) {
      const puncher = ownPunchers[0];
      const target = toughRivals[0];
      strengths.push(
        `${puncher.name} puede dañar de forma fiable a unidades de alto Toughness como ${target.name} (T${target.stats.t}) gracias a su perfil de alto AP/Fuerza.`
      );
    } else {
      strengths.push(
        `Aunque el rival presenta unidades de Toughness alto (ej. ${toughRivals[0].name}, T${toughRivals[0].stats.t}), concentrar el fuego de toda tu lista en un único turno puede derribarlas.`
      );
    }
  }

  // High-save rivals: own list high AP weapons
  const heavyArmorRivals = rivalUnitsAll.filter(u => u.stats.sv <= 2);
  if (heavyArmorRivals.length > 0) {
    const ownAp = ownUnitsData.filter(u => hasHighAp(u, -2));
    if (ownAp.length > 0) {
      strengths.push(
        `${ownAp[0].name} ignora gran parte de la salvación de ${heavyArmorRivals[0].name} (Sv${heavyArmorRivals[0].stats.sv}+) gracias a su alto AP.`
      );
    }
  }

  // Pull from rival detachment weaknesses as exploitable strengths
  if (rivalDet) {
    for (const w of rivalDet.weaknesses.slice(0, 2)) {
      strengths.push(`Podés explotar que el rival usa ${rivalDetName}: ${w}`);
    }
  }

  // Generic fallback strengths from own detachment description
  if (strengths.length < 4 && ownDet.abilities.length > 2) {
    strengths.push(`${ownDetachmentName} — ${ownDet.abilities[2].name}: ${ownDet.abilities[2].rule}`);
  }
  while (strengths.length < 4) {
    if (ownList) {
      strengths.push(`Tu lista (${ownList.name}, ${ownList.totalPoints} pts) tiene un buen equilibrio de roles para adaptarse a este matchup.`);
    } else {
      strengths.push('Guardá una lista propia para ver fortalezas específicas de tu ejército en este matchup.');
    }
  }

  // ── Debilidades ─────────────────────────────────────────────────────────────
  const weaknesses: string[] = [];

  // Rival detachment abilities as threats
  if (rivalDet) {
    for (const ability of rivalDet.abilities.slice(0, 2)) {
      weaknesses.push(`El detachment rival ${rivalDetName} usa ${ability.name}: ${ability.rule}`);
    }
  }

  // Dangerous keywords on rival units
  for (const unit of [...rivalUnitsAll].sort((a, b) => b.pts - a.pts)) {
    const found = findDangerousKeywords(unit);
    if (found.length > 0) {
      weaknesses.push(`${unit.name} cuenta con ${found.join(', ')}, lo que aumenta su letalidad efectiva contra tus unidades.`);
      break;
    }
  }

  // OC comparison
  const ownAvgOc = ownUnitsData.length > 0
    ? ownUnitsData.reduce((sum, u) => sum + u.stats.oc, 0) / ownUnitsData.length
    : 0;
  const rivalMaxOc = rivalUnitsAll.length > 0 ? Math.max(...rivalUnitsAll.map(u => u.stats.oc)) : 0;
  if (rivalMaxOc > ownAvgOc) {
    const ocUnit = rivalUnitsAll.find(u => u.stats.oc === rivalMaxOc);
    weaknesses.push(`${ocUnit?.name ?? 'Unidades rivales'} tiene OC${rivalMaxOc}, superior al promedio de OC de tu lista — vas a perder carreras por objetivos en igualdad de condiciones.`);
  }

  // Pull from rival detachment strengths as own struggles
  if (rivalDet) {
    for (const s of rivalDet.strengths.slice(0, 2)) {
      if (weaknesses.length >= 3) break;
      weaknesses.push(`El rival es fuerte en: ${s}`);
    }
  }

  while (weaknesses.length < 3) {
    weaknesses.push(`Sin información detallada del rival más allá de ${rivalDetName ?? 'su lista base'}, mantené reservas flexibles para adaptarte durante la partida.`);
  }

  // ── Plan de juego ───────────────────────────────────────────────────────────
  const gameplan: string[] = [];

  // Priority target
  if (opponentUnits.length > 0) {
    const top = opponentUnits[0];
    gameplan.push(`Priorizá eliminar a ${top.name} (${top.pts} pts) en los primeros turnos antes de que ejerza su impacto completo.`);
  }

  // Use own detachment ability as plan action
  if (ownDet.abilities.length > 0) {
    gameplan.push(`Secuenciá tu turno para sacar el máximo provecho de ${ownDet.abilities[0].name} (${ownDetachmentName}).`);
  }

  // Unit role mix plan
  const vehicleCount = (ownList?.keyUnits ?? []).filter(u => u.type === 'vehicle' || u.type === 'monster').length;
  const infantryCount = (ownList?.keyUnits ?? []).filter(u => u.type === 'infantry').length;
  if (vehicleCount > 0 && infantryCount > 0) {
    gameplan.push(`Usá tus unidades de Vehicle/Monster para abrir brechas mientras la infantería avanza para tomar y mantener objetivos.`);
  } else if (infantryCount > 0) {
    gameplan.push(`Avanzá en oleadas escalonadas con tu infantería para no exponer toda la lista al fuego rival en un solo turno.`);
  } else {
    gameplan.push(`Mantené tus unidades pesadas agrupadas para proteger su flanco mientras avanzan hacia los objetivos.`);
  }

  // Generic deployment-based plan
  gameplan.push(`Reservá unidades de respuesta rápida para reaccionar a las jugadas del rival con ${rivalDetName ?? 'su detachment'}, en vez de comprometerte por completo en T1.`);

  return {
    opponentUnits,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    gameplan: gameplan.slice(0, 4),
  };
}
