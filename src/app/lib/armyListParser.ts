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
const FACTION_KEYWORD_MAP: { match: RegExp; id: string; name: string }[] = [
  { match: /tyranids/i, id: 'tyranids', name: 'Tiránidos' },
  { match: /necrons/i, id: 'necrons', name: 'Necrons' },
  { match: /space marines/i, id: 'space-marines', name: 'Space Marines' },
  { match: /chaos space marines/i, id: 'chaos-space-marines', name: 'Chaos Space Marines' },
  { match: /astra militarum/i, id: 'astra-militarum', name: 'Astra Militarum' },
  { match: /\borks\b/i, id: 'orks', name: 'Orks' },
  { match: /t'?au/i, id: 'tau-empire', name: "Imperio T'au" },
  { match: /aeldari/i, id: 'aeldari', name: 'Aeldari' },
  { match: /custodes/i, id: 'adeptus-custodes', name: 'Adeptus Custodes' },
  { match: /death guard/i, id: 'death-guard', name: 'Death Guard' },
  { match: /world eaters/i, id: 'world-eaters', name: 'World Eaters' },
  { match: /thousand sons/i, id: 'thousand-sons', name: 'Thousand Sons' },
  { match: /drukhari/i, id: 'drukhari', name: 'Drukhari' },
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

// ── Main parser ────────────────────────────────────────────────────────────────
const HEADER_FIELD = (key: string, raw: string): string | undefined => {
  const m = raw.match(new RegExp(`^\\+\\s*${key}\\s*:\\s*(.+)$`, 'mi'));
  return m ? m[1].trim() : undefined;
};

// Matches: "Char3: 5x Hyperadapted Raveners (165 pts): wargear..."
const UNIT_LINE = /^(?:[A-Za-z]+\d*:\s*)?(\d+)x\s+(.+?)\s*\((\d+)\s*pts?\)\s*(?::\s*(.+))?$/i;

// Matches: "Enhancement: Trygon Prime (+20 pts)"
const ENHANCEMENT_LINE = /^Enhancement:\s*(.+?)\s*\(\+?(\d+)\s*pts?\)\s*$/i;

export function parseArmyListText(raw: string): { list: ImportedList | null; error?: string } {
  try {
    const text = raw.replace(/\r\n/g, '\n');

    // ── Header ──
    const factionKeyword = HEADER_FIELD('FACTION KEYWORD', text) ?? '';
    const detachmentName = HEADER_FIELD('DETACHMENT', text);
    const totalPointsRaw = HEADER_FIELD('TOTAL ARMY POINTS', text);
    const totalPoints = totalPointsRaw ? parseInt(totalPointsRaw.replace(/[^\d]/g, '')) : undefined;
    const warlordRaw = HEADER_FIELD('WARLORD', text);
    const enhancementHeaderRaw = HEADER_FIELD('ENHANCEMENT', text);
    const secondary = HEADER_FIELD('SECONDARY', text);

    const { id: factionId, name: factionName } = resolveFaction(factionKeyword);

    const detachmentInfo = lookupDetachment(factionId, detachmentName);
    const resolvedDetachmentName = detachmentInfo?.name ?? detachmentName;

    // Warlord: "Char4: Neurotyrant" → keep unit label after colon
    const warlord = warlordRaw?.replace(/^Char\d+:\s*/i, '').trim();

    // ── Body ──
    // Strip the header block: everything up to and including the last "+++++" banner line
    const bannerMatches = [...text.matchAll(/^\+{5,}.*$/gm)];
    const lastBanner = bannerMatches[bannerMatches.length - 1];
    const body = lastBanner ? text.slice(lastBanner.index! + lastBanner[0].length) : text;

    const units: ParsedUnit[] = [];
    const enhancements: ParsedEnhancement[] = [];

    const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('+'));

    for (const line of lines) {
      // Sub-lines (composition / wargear bullets) — skip, they describe the previous unit
      if (line.startsWith('•') || line.startsWith('-')) continue;

      const enhMatch = line.match(ENHANCEMENT_LINE);
      if (enhMatch) {
        enhancements.push({ name: enhMatch[1].trim(), points: parseInt(enhMatch[2]) });
        continue;
      }

      const m = line.match(UNIT_LINE);
      if (!m) continue;

      const models = parseInt(m[1]);
      const name = m[2].trim();
      const points = parseInt(m[3]);
      const wargear = m[4]?.trim();

      const base = lookupBaseSize(factionId, name);

      const isWarlord = !!wargear && /\bwarlord\b/i.test(wargear);

      units.push({
        name,
        models,
        points,
        wargear,
        isWarlord,
        baseType: base?.baseType,
        baseMm: base?.baseMm,
      });
    }

    if (units.length === 0) {
      return { list: null, error: 'No se encontraron unidades. Verificá el formato de la lista.' };
    }

    // Apply enhancement bonuses to the unit they're attached to (best-effort: warlord's unit
    // when ENHANCEMENT header references the warlord, otherwise leave as army-level bonus)
    const enhancedUnitName = enhancementHeaderRaw?.match(/on\s+Char\d+:\s*(.+)\)?$/i)?.[1]?.replace(/\)$/, '').trim();
    if (enhancedUnitName) {
      const target = units.find(u => u.name.toLowerCase() === enhancedUnitName.toLowerCase());
      if (target && enhancements[0]) {
        enhancements[0].unit = target.name;
      }
    }

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
