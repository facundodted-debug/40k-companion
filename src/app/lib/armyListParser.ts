import baseSizes from '../../data/base_sizes.json';
import detachmentsData from '../../data/detachments.json';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ParsedUnit {
  name: string;
  models: number;
  points?: number;
  wargear?: string;
  isWarlord?: boolean;
  baseType?: string;
  baseMm?: string;
}

export interface ParsedEnhancement {
  name: string;
  points?: number;
  unit?: string;
}

export interface ImportedList {
  id: string;
  armyName: string;
  source: 'html' | 'text';
  factionId?: string;
  factionName?: string;
  detachmentName?: string;
  detachmentDp?: number;
  detachmentForceDisposition?: string;
  totalPoints?: number;
  warlord?: string;
  enhancements?: ParsedEnhancement[];
  secondary?: string;
  units: ParsedUnit[];
}

// ── Faction keyword → base_sizes / FACTION_DATA id ───────────────────────────────
// Orden: nombres de facción más específicos primero (capítulos/sub-facciones), luego
// los genéricos, así "Blood Angels" no cae en un eventual match genérico de Marines.
const FACTION_KEYWORD_MAP: { match: RegExp; id: string; name: string }[] = [
  { match: /chaos space marines/i, id: 'chaos-space-marines', name: 'Chaos Space Marines' },
  { match: /blood angels/i, id: 'blood-angels', name: 'Blood Angels' },
  { match: /dark angels/i, id: 'dark-angels', name: 'Dark Angels' },
  { match: /black templars/i, id: 'black-templars', name: 'Black Templars' },
  { match: /space wolves/i, id: 'space-wolves', name: 'Space Wolves' },
  { match: /deathwatch/i, id: 'deathwatch', name: 'Deathwatch' },
  { match: /grey knights/i, id: 'grey-knights', name: 'Grey Knights' },
  { match: /ultramarines/i, id: 'ultramarines', name: 'Ultramarines' },
  { match: /iron hands/i, id: 'iron-hands', name: 'Iron Hands' },
  { match: /white scars/i, id: 'white-scars', name: 'White Scars' },
  { match: /raven guard/i, id: 'raven-guard', name: 'Raven Guard' },
  { match: /salamanders/i, id: 'salamanders', name: 'Salamanders' },
  { match: /iron warriors/i, id: 'iron-warriors', name: 'Iron Warriors' },
  { match: /red corsairs/i, id: 'red-corsairs', name: 'Red Corsairs' },
  { match: /world eaters/i, id: 'world-eaters', name: 'World Eaters' },
  { match: /thousand sons/i, id: 'thousand-sons', name: 'Thousand Sons' },
  { match: /death guard/i, id: 'death-guard', name: 'Death Guard' },
  { match: /emperor'?s children/i, id: 'emperors-children', name: "Emperor's Children" },
  { match: /chaos daemons/i, id: 'chaos-daemons', name: 'Chaos Daemons' },
  { match: /chaos knights/i, id: 'chaos-knights', name: 'Chaos Knights' },
  { match: /space marines/i, id: 'space-marines', name: 'Space Marines' },
  { match: /adeptus astartes/i, id: 'space-marines', name: 'Space Marines' },
  { match: /astra militarum/i, id: 'astra-militarum', name: 'Astra Militarum' },
  { match: /adepta sororitas/i, id: 'adepta-sororitas', name: 'Adepta Sororitas' },
  { match: /adeptus custodes|\bcustodes\b/i, id: 'adeptus-custodes', name: 'Adeptus Custodes' },
  { match: /adeptus mechanicus/i, id: 'adeptus-mechanicus', name: 'Adeptus Mechanicus' },
  { match: /imperial knights/i, id: 'imperial-knights', name: 'Imperial Knights' },
  { match: /genestealer cults?/i, id: 'genestealer-cult', name: 'Genestealer Cults' },
  { match: /\borks\b/i, id: 'orks', name: 'Orks' },
  { match: /t'?au empire|t'?au\b/i, id: 'tau-empire', name: "Imperio T'au" },
  { match: /aeldari/i, id: 'aeldari', name: 'Aeldari' },
  { match: /drukhari/i, id: 'drukhari', name: 'Drukhari' },
  { match: /leagues of votann/i, id: 'leagues-of-votann', name: 'Leagues of Votann' },
  { match: /necrons/i, id: 'necrons', name: 'Necrons' },
  { match: /tyranids/i, id: 'tyranids', name: 'Tiránidos' },
];

function resolveFaction(factionKeyword: string): { id?: string; name?: string } {
  for (const f of FACTION_KEYWORD_MAP) {
    if (f.match.test(factionKeyword)) return { id: f.id, name: f.name };
  }
  return {};
}

// ── Base size lookup ──────────────────────────────────────────────────────────
interface BaseSizeEntry {
  name: string;
  baseMm: string;
  models: number;
  baseType: string;
}

function lookupBaseSize(factionId: string | undefined, unitName: string): BaseSizeEntry | undefined {
  if (!factionId) return undefined;
  const factionEntry = (baseSizes as any)[factionId];
  const entries: BaseSizeEntry[] | undefined = factionEntry?.units;
  if (!entries) return undefined;

  const target = unitName.trim().toLowerCase();

  // 1. Exact match
  let best = entries.find(e => e.name.toLowerCase() === target);
  if (best) return best;

  // 2. Bidirectional substring match — prefer the longest matching base_sizes name
  let bestLen = 0;
  for (const e of entries) {
    const candidate = e.name.toLowerCase();
    if (target.includes(candidate) || candidate.includes(target)) {
      if (candidate.length > bestLen) {
        bestLen = candidate.length;
        best = e;
      }
    }
  }
  return best;
}

// ── Detachment lookup ────────────────────────────────────────────────────────
interface DetachmentEntry {
  name: string;
  dp: number;
  forceDisposition: string;
  isNew?: boolean;
}

function lookupDetachment(factionId: string | undefined, detachmentName: string | undefined): DetachmentEntry | undefined {
  if (!factionId || !detachmentName) return undefined;
  const factionEntry = (detachmentsData as any)[factionId];
  const entries: DetachmentEntry[] | undefined = factionEntry?.detachments;
  if (!entries) return undefined;

  const target = detachmentName.trim().toLowerCase();

  // 1. Exact match
  let best = entries.find(e => e.name.toLowerCase() === target);
  if (best) return best;

  // 2. Bidirectional substring match — prefer the longest matching name
  let bestLen = 0;
  for (const e of entries) {
    const candidate = e.name.toLowerCase();
    if (target.includes(candidate) || candidate.includes(target)) {
      if (candidate.length > bestLen) {
        bestLen = candidate.length;
        best = e;
      }
    }
  }
  return best;
}

// ── Detect format ─────────────────────────────────────────────────────────────
export function isArmyListText(raw: string): boolean {
  return /FACTION KEYWORD\s*:/i.test(raw) || /^\+{5,}/m.test(raw);
}

// Cualquier otro formato de texto (WarOrgan, WTC simple, NewRecruit/BattleScribe
// "Army Roster" en texto) que liste unidades como "<Nombre> [<N> points]" o
// "<Nombre> (<N> pts)", con o sin bullets de composición debajo.
export function isBracketListText(raw: string): boolean {
  if (isArmyListText(raw)) return false;
  if (raw.trim().startsWith('<')) return false;
  return /[\[(]\s*\d+\s*(?:points?|pts?)\s*[\])]/i.test(raw);
}

// ── Núcleo compartido: extracción de unidades a partir de líneas de texto ───────
// Reconoce el header de cada unidad ("<Nombre> [N points]"/"(N pts)", con o sin
// prefijo "Nx" y con o sin nota inline ": wargear...") y, si corresponde, los
// bullets de composición que siguen (•, -, *), sumando miniaturas según:
//  1. Prefijo "Nx" explícito en el header → manda.
//  2. Header termina en ":" sin texto (nota vacía) → se suman TODOS los bullets
//     inmediatos con prefijo "Nx" (formato "Army Roster": "1x Ravener Prime: ...").
//  3. Header sin nota ni prefijo → se suman solo los bullets de nivel más superficial
//     que tengan bullets hijos más indentados debajo (formato banner anidado).
//  4. Si nada de eso aplica, 1 miniatura por defecto.
const HEADER_PREFIX = /^(?:[A-Za-z]+\d*:\s*)?(?:(\d+)x\s+)?(.+?)\s*[\[(]\s*(\d+)\s*(?:points?|pts?)\s*[\])]\s*(?::\s*(.*))?$/i;
const BULLET_LINE = /^[•\-*]\s*(.+)$/;

function isMetaLine(line: string): boolean {
  if (line.startsWith('#')) return true;
  return /^(battle size|detachments?|show\/hide options|configuration|created with|exported|powered by|generated by|number of units|secondary|total army points|faction keyword|army roster)\b/i.test(line);
}

function indentLen(rawLine: string): number {
  const m = rawLine.match(/^[ \t]*/);
  return m ? m[0].replace(/\t/g, '    ').length : 0;
}

// Quita anotaciones de enhancement embebidas: "Nombre [+N points]" / "(+N pts)"
function extractInlineEnhancements(text: string, unitName: string, enhancements: ParsedEnhancement[]): string {
  const cleaned = text.replace(
    /([^,]+?)\s*[\[(]\+(\d+)\s*(?:points?|pts?)[\])]/gi,
    (_match, enhName, enhPts) => {
      enhancements.push({ name: enhName.trim(), points: parseInt(enhPts, 10), unit: unitName });
      return '';
    }
  );
  return cleaned.replace(/^,\s*/, '').replace(/,\s*,/g, ',').replace(/,\s*$/, '').trim();
}

function extractUnits(
  text: string,
  factionId: string | undefined,
  skipLineIndexes: Set<number> = new Set()
): { units: ParsedUnit[]; enhancements: ParsedEnhancement[] } {
  const rawLines = text.split('\n');
  const trimmed = rawLines.map(l => l.trim());
  const indents = rawLines.map(indentLen);

  const units: ParsedUnit[] = [];
  const enhancements: ParsedEnhancement[] = [];

  for (let i = 0; i < trimmed.length; i++) {
    const line = trimmed[i];
    if (!line || skipLineIndexes.has(i)) continue;
    if (BULLET_LINE.test(line) || isMetaLine(line)) continue;

    const m = line.match(HEADER_PREFIX);
    if (!m) continue;

    const explicitCount = m[1] ? parseInt(m[1], 10) : undefined;
    const name = m[2].trim();
    const points = parseInt(m[3], 10);
    const inlineNoteRaw = m[4]; // undefined (sin ":") | '' (":" sin nada) | texto

    // Bullets inmediatos (cualquier indentación), hasta línea en blanco o no-bullet
    const bullets: { indent: number; content: string }[] = [];
    let j = i + 1;
    while (j < trimmed.length) {
      const l = trimmed[j];
      if (l === '') { j++; continue; }
      const bm = l.match(BULLET_LINE);
      if (!bm) break;
      bullets.push({ indent: indents[j], content: bm[1].trim() });
      j++;
    }

    let isWarlord = false;
    const wargearParts: string[] = [];

    const feed = (seg: string): number | undefined => {
      if (/^warlord$/i.test(seg)) { isWarlord = true; return undefined; }
      const cm = seg.match(/^(\d+)x?\s+(.+)$/i);
      let cleaned = extractInlineEnhancements(seg, name, enhancements);
      if (cm) cleaned = cleaned.replace(new RegExp(`^${cm[1]}x?\\s+`, 'i'), '');
      if (cleaned) wargearParts.push(cleaned);
      return cm ? parseInt(cm[1], 10) : undefined;
    };

    let models: number;
    if (explicitCount !== undefined) {
      models = explicitCount;
      (inlineNoteRaw || '').split(',').map(s => s.trim()).filter(Boolean).forEach(feed);
      bullets.forEach(b => feed(b.content));
    } else if (inlineNoteRaw === '') {
      // header termina en ":" sin nada después → todos los bullets son grupos de modelos
      let sum = 0;
      for (const b of bullets) sum += feed(b.content) ?? 0;
      models = sum || 1;
    } else if (inlineNoteRaw !== undefined) {
      models = 1;
      inlineNoteRaw.split(',').map(s => s.trim()).filter(Boolean).forEach(feed);
      bullets.forEach(b => feed(b.content));
    } else if (bullets.length === 1) {
      // Un solo bullet tipo "20 Hormagaunts with Hormagaunt talons" → es el grupo
      // de modelos completo (formato WarOrgan), no un arma individual.
      const count = feed(bullets[0].content);
      models = count ?? 1;
    } else if (bullets.length > 0) {
      const minIndent = Math.min(...bullets.map(b => b.indent));
      let sum = 0;
      for (let k = 0; k < bullets.length; k++) {
        const b = bullets[k];
        const count = feed(b.content);
        if (b.indent === minIndent) {
          const hasChildren = !!bullets[k + 1] && bullets[k + 1].indent > minIndent;
          if (hasChildren) sum += count ?? 1;
        }
      }
      models = sum || 1;
    } else {
      models = 1;
    }

    const base = lookupBaseSize(factionId, name);

    units.push({
      name,
      models,
      points,
      wargear: wargearParts.length ? wargearParts.join('; ') : undefined,
      isWarlord,
      baseType: base?.baseType,
      baseMm: base?.baseMm,
    });

    i = j - 1;
  }

  return { units, enhancements };
}

// ── Parser formato GW App (banners "+++++") ─────────────────────────────────────
const HEADER_FIELD = (key: string, raw: string): string | undefined => {
  const m = raw.match(new RegExp(`^\\+\\s*${key}\\s*:\\s*(.+)$`, 'mi'));
  return m ? m[1].trim() : undefined;
};

export function parseArmyListText(raw: string): { list: ImportedList | null; error?: string } {
  try {
    const text = raw.replace(/\r\n/g, '\n');

    // ── Header ──
    const factionKeyword = HEADER_FIELD('FACTION KEYWORD', text) ?? '';
    const detachmentName = HEADER_FIELD('DETACHMENT', text);
    const totalPointsRaw = HEADER_FIELD('TOTAL ARMY POINTS', text);
    const totalPoints = totalPointsRaw ? parseInt(totalPointsRaw.replace(/[^\d]/g, '')) : undefined;
    const warlordRaw = HEADER_FIELD('WARLORD', text);
    const secondary = HEADER_FIELD('SECONDARY', text);

    const { id: factionId, name: factionName } = resolveFaction(factionKeyword);

    const detachmentInfo = lookupDetachment(factionId, detachmentName);
    const resolvedDetachmentName = detachmentInfo?.name ?? detachmentName;

    // Warlord: "Char4: Neurotyrant" → keep unit label after colon
    const warlordHeader = warlordRaw?.replace(/^Char\d+:\s*/i, '').trim();

    // ── Cuerpo ── (todo lo que sigue al último banner "+++++")
    const bannerMatches = [...text.matchAll(/^\+{5,}.*$/gm)];
    const lastBanner = bannerMatches[bannerMatches.length - 1];
    const body = lastBanner ? text.slice(lastBanner.index! + lastBanner[0].length) : text;
    const bodyClean = body.split('\n').filter(l => !l.trim().startsWith('+')).join('\n');

    const { units, enhancements } = extractUnits(bodyClean, factionId);

    if (units.length === 0) {
      return { list: null, error: 'No se encontraron unidades. Verificá el formato de la lista.' };
    }

    // Si el header WARLORD apunta a una unidad que no se marcó inline, marcarla acá
    if (warlordHeader) {
      const target = units.find(u => u.name.toLowerCase() === warlordHeader.toLowerCase());
      if (target) target.isWarlord = true;
    }

    const warlord = units.find(u => u.isWarlord)?.name ?? warlordHeader;
    const armyName = resolvedDetachmentName ?? factionName ?? 'Lista importada';

    return {
      list: {
        id: `text-${Date.now()}`,
        armyName,
        source: 'text',
        factionId,
        factionName,
        detachmentName: resolvedDetachmentName,
        detachmentDp: detachmentInfo?.dp,
        detachmentForceDisposition: detachmentInfo?.forceDisposition,
        totalPoints,
        warlord,
        enhancements: enhancements.length ? enhancements : undefined,
        secondary,
        units,
      },
    };
  } catch (e) {
    return { list: null, error: 'Error al procesar la lista.' };
  }
}

// ── Parser genérico (WarOrgan, WTC simple, "Army Roster" de texto, etc.) ────────
const BRACKET_TITLE_LINE = /^(.+?)\s*[\[(]\s*(\d+)\s*(?:points?|pts?)\s*[\])]\s*$/i;

export function parseBracketListText(raw: string): { list: ImportedList | null; error?: string } {
  try {
    const text = raw.replace(/\r\n/g, '\n');
    const lines = text.split('\n').map(l => l.trim());

    const titleIdx = lines.findIndex(l => l.length > 0);
    const skipLines = new Set<number>();
    if (titleIdx >= 0) skipLines.add(titleIdx);

    // ── Título / puntos totales / posible "Facción - Detachment" en el título ──
    let armyName: string | undefined;
    let totalPoints: number | undefined;
    let titleDetachmentCandidate: string | undefined;
    if (titleIdx >= 0) {
      const titleLine = lines[titleIdx];
      const m = titleLine.match(BRACKET_TITLE_LINE);
      if (m) {
        armyName = m[1].trim();
        totalPoints = parseInt(m[2], 10);
      } else {
        armyName = titleLine;
      }
      // Título tipo "Xenos - Tyranids - Subterranean Assault [- (N)] [- [N pts]]"
      if (titleLine.includes(' - ')) {
        const segments = (m ? m[1] : titleLine).split(' - ').map(s => s.trim()).filter(Boolean);
        if (segments.length >= 2) titleDetachmentCandidate = segments[segments.length - 1];
      }
    }

    // ── Facción: primero buscamos en el título completo, luego en las líneas siguientes ──
    let factionId: string | undefined;
    let factionName: string | undefined;
    {
      const resolved = resolveFaction(lines[titleIdx] ?? '');
      if (resolved.id) { factionId = resolved.id; factionName = resolved.name; }
    }
    if (!factionId) {
      const scanLimit = Math.min(lines.length, titleIdx + 8);
      for (let i = titleIdx + 1; i < scanLimit; i++) {
        const l = lines[i];
        if (!l) continue;
        const resolved = resolveFaction(l);
        if (resolved.id) {
          factionId = resolved.id;
          factionName = resolved.name;
          skipLines.add(i);
          break;
        }
      }
    }

    // ── Detachments: línea explícita "Detachment(s): A, B" o, si no hay, el último
    // segmento del título tipo "Facción - Detachment" ──
    const detLineMatch = text.match(/^\s*Detachments?\s*:\s*(.+)$/mi);
    const detachmentNames = detLineMatch
      ? detLineMatch[1].split(',').map(s => s.trim()).filter(Boolean)
      : (titleDetachmentCandidate ? [titleDetachmentCandidate] : []);
    let detachmentDp = 0;
    const forceDispositions: string[] = [];
    const resolvedDetachmentNames: string[] = [];
    for (const dn of detachmentNames) {
      const info = lookupDetachment(factionId, dn);
      resolvedDetachmentNames.push(info?.name ?? dn);
      if (info?.dp) detachmentDp += info.dp;
      if (info?.forceDisposition) forceDispositions.push(info.forceDisposition);
    }
    const detachmentName = resolvedDetachmentNames.length ? resolvedDetachmentNames.join(' / ') : undefined;

    // ── Unidades ──
    const { units, enhancements } = extractUnits(text, factionId, skipLines);

    if (units.length === 0) {
      return { list: null, error: 'No se encontraron unidades. Verificá el formato de la lista.' };
    }

    return {
      list: {
        id: `text-${Date.now()}`,
        armyName: armyName ?? factionName ?? 'Lista importada',
        source: 'text',
        factionId,
        factionName,
        detachmentName,
        detachmentDp: detachmentDp || undefined,
        detachmentForceDisposition: forceDispositions.length ? forceDispositions.join(' / ') : undefined,
        totalPoints,
        warlord: units.find(u => u.isWarlord)?.name,
        enhancements: enhancements.length ? enhancements : undefined,
        units,
      },
    };
  } catch (e) {
    return { list: null, error: 'Error al procesar la lista.' };
  }
}
