import { ArmyList, OpponentUnit, UnitWeapon } from '../app/components/shared';
import { SavedList } from '../store/lists';
import { getDetachmentDescription, hasDetachmentDescription } from '../app/components/DetachmentDescriptions';
import { FACTION_DATA } from '../data';
import { DataUnit, FactionData, WeaponProfile } from '../data/types';

export interface MatchupInput {
  ownList: SavedList | null;
  rivalList: SavedList | null;
}

export interface MatchupOutput {
  opponentUnits: OpponentUnit[];
  strengths: string[];
  weaknesses: string[];
  gameplan: string[];
  ownName: string;
  ownDetachmentName: string;
  ownDataAvailable: boolean;
  rivalName: string;
  rivalDetachmentName: string;
  rivalAbbr: string;
  rivalColor: string;
  rivalDataAvailable: boolean;
}

function isArmyList(list: SavedList): list is ArmyList {
  return 'faction' in list && 'keyUnits' in list;
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

interface ListInfo {
  factionId?: string;
  detachmentName?: string;
  displayName: string;
  unitNames: string[];
  abbr: string;
  color: string;
}

function getListInfo(list: SavedList | null, fallbackColor: string): ListInfo {
  if (!list) {
    return { displayName: 'Sin lista', unitNames: [], abbr: '???', color: fallbackColor };
  }
  if (isArmyList(list)) {
    return {
      factionId: list.faction.id,
      detachmentName: list.detachment.name,
      displayName: list.name,
      unitNames: list.keyUnits.map(u => u.name),
      abbr: list.faction.abbr,
      color: list.faction.color,
    };
  }
  return {
    factionId: list.factionId,
    detachmentName: list.detachmentName,
    displayName: list.armyName,
    unitNames: list.units.map(u => u.name),
    abbr: list.factionName ? list.factionName.slice(0, 3).toUpperCase() : '???',
    color: fallbackColor,
  };
}

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchUnitsByName(dataUnits: DataUnit[], names: string[]): DataUnit[] {
  if (names.length === 0) return [];
  const normNames = names.map(normalizeName);
  return dataUnits.filter(u => {
    const un = normalizeName(u.name);
    return normNames.some(n => un.includes(n) || n.includes(un));
  });
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
  const { ownList, rivalList } = input;

  const ownInfo = getListInfo(ownList, '#3d7ef0');
  const rivalInfo = getListInfo(rivalList, '#e84040');

  const rivalData = rivalInfo.factionId ? getFactionData(rivalInfo.factionId) : undefined;
  const rivalUnitsAll = rivalData?.units ?? [];
  const rivalDataAvailable = rivalUnitsAll.length > 0;

  // Unidades específicas de la lista rival (si no matchean ninguna, usamos toda la facción)
  const rivalUnitsMatched = matchUnitsByName(rivalUnitsAll, rivalInfo.unitNames);
  const rivalUnitsForAnalysis = rivalUnitsMatched.length > 0 ? rivalUnitsMatched : rivalUnitsAll;

  const rivalDetachmentNames = rivalData ? Object.keys(rivalData.detachments) : [];
  const rivalDetName = (rivalInfo.detachmentName && rivalData?.detachments[rivalInfo.detachmentName])
    ? rivalInfo.detachmentName
    : rivalDetachmentNames[0];
  const rivalDet = rivalDetName ? rivalData?.detachments[rivalDetName] : undefined;

  const ownData = ownInfo.factionId ? getFactionData(ownInfo.factionId) : undefined;
  const ownDataAvailable = (ownData?.units.length ?? 0) > 0;
  const ownUnitsData = ownList && isArmyList(ownList)
    ? (ownList.keyUnits ?? []).map(u => ownData?.units.find(d => d.id === u.id)).filter((u): u is DataUnit => !!u)
    : matchUnitsByName(ownData?.units ?? [], ownInfo.unitNames);

  const ownDet = ownInfo.detachmentName && hasDetachmentDescription(ownInfo.detachmentName)
    ? getDetachmentDescription(ownInfo.detachmentName)
    : undefined;
  const ownDetachmentName = ownInfo.detachmentName ?? 'tu detachment';

  // ── Top rival units by points ──────────────────────────────────────────────
  const opponentUnits = rivalDataAvailable
    ? [...rivalUnitsForAnalysis].sort((a, b) => b.pts - a.pts).slice(0, 5).map(toOpponentUnit)
    : [];

  // ── Fortalezas ──────────────────────────────────────────────────────────────
  const strengths: string[] = [];

  // Own detachment abilities as advantages
  if (ownDet) {
    for (const ability of ownDet.abilities.slice(0, 2)) {
      strengths.push(`${ownDetachmentName} — ${ability.name}: ${ability.rule}`);
    }
  }

  // Anti-tank: rival has high T units, own list has high S / high AP weapons
  const toughRivals = rivalUnitsForAnalysis.filter(u => u.stats.t >= 8).sort((a, b) => b.stats.t - a.stats.t);
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
  const heavyArmorRivals = rivalUnitsForAnalysis.filter(u => u.stats.sv <= 2);
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
  if (ownDet && strengths.length < 4 && ownDet.abilities.length > 2) {
    strengths.push(`${ownDetachmentName} — ${ownDet.abilities[2].name}: ${ownDet.abilities[2].rule}`);
  }
  while (strengths.length < 4) {
    if (ownList) {
      const pts = isArmyList(ownList) ? ownList.totalPoints : (ownList.totalPoints ?? 0);
      strengths.push(`Tu lista (${ownInfo.displayName}${pts ? `, ${pts} pts` : ''}) tiene un buen equilibrio de roles para adaptarse a este matchup.`);
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
  for (const unit of [...rivalUnitsForAnalysis].sort((a, b) => b.pts - a.pts)) {
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
  const rivalMaxOc = rivalUnitsForAnalysis.length > 0 ? Math.max(...rivalUnitsForAnalysis.map(u => u.stats.oc)) : 0;
  if (rivalMaxOc > ownAvgOc) {
    const ocUnit = rivalUnitsForAnalysis.find(u => u.stats.oc === rivalMaxOc);
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
    if (rivalDataAvailable) {
      weaknesses.push(`Sin información detallada del rival más allá de ${rivalDetName ?? 'su lista base'}, mantené reservas flexibles para adaptarte durante la partida.`);
    } else {
      weaknesses.push(`Sin información cargada sobre ${rivalInfo.displayName}, jugá de forma conservadora hasta conocer su composición en mesa.`);
    }
  }

  // ── Plan de juego ───────────────────────────────────────────────────────────
  const gameplan: string[] = [];

  // Priority target
  if (opponentUnits.length > 0) {
    const top = opponentUnits[0];
    gameplan.push(`Priorizá eliminar a ${top.name} (${top.pts} pts) en los primeros turnos antes de que ejerza su impacto completo.`);
  } else {
    gameplan.push(`Cargá la lista de ${rivalInfo.displayName} para obtener un plan de juego específico contra sus unidades.`);
  }

  // Use own detachment ability as plan action
  if (ownDet && ownDet.abilities.length > 0) {
    gameplan.push(`Secuenciá tu turno para sacar el máximo provecho de ${ownDet.abilities[0].name} (${ownDetachmentName}).`);
  }

  // Unit role mix plan
  const ownKeyUnits = ownList && isArmyList(ownList) ? ownList.keyUnits : [];
  const vehicleCount = ownKeyUnits.filter(u => u.type === 'vehicle' || u.type === 'monster').length;
  const infantryCount = ownKeyUnits.filter(u => u.type === 'infantry').length;
  if (vehicleCount > 0 && infantryCount > 0) {
    gameplan.push(`Usá tus unidades de Vehicle/Monster para abrir brechas mientras la infantería avanza para tomar y mantener objetivos.`);
  } else if (infantryCount > 0) {
    gameplan.push(`Avanzá en oleadas escalonadas con tu infantería para no exponer toda la lista al fuego rival en un solo turno.`);
  } else {
    gameplan.push(`Mantené tus unidades pesadas agrupadas para proteger su flanco mientras avanzan hacia los objetivos.`);
  }

  // Generic deployment-based plan
  gameplan.push(`Reservá unidades de respuesta rápida para reaccionar a las jugadas del rival con ${rivalDetName ?? rivalInfo.detachmentName ?? 'su detachment'}, en vez de comprometerte por completo en T1.`);

  return {
    opponentUnits,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 3),
    gameplan: gameplan.slice(0, 4),
    ownName: ownInfo.displayName,
    ownDetachmentName: ownInfo.detachmentName ?? '—',
    ownDataAvailable,
    rivalName: rivalInfo.displayName,
    rivalDetachmentName: rivalInfo.detachmentName ?? 'Detachment desconocido',
    rivalAbbr: rivalInfo.abbr,
    rivalColor: rivalInfo.color,
    rivalDataAvailable,
  };
}
