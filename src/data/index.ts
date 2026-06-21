import { FactionData } from './types';
import { POINTS, resolveUnitPoints, defaultModelsFor } from './points';

const modules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: FactionData }>;

export const FACTION_DATA: Record<string, FactionData> = {};

for (const path in modules) {
  if (path.includes('base_sizes') || path.includes('detachments') || path.includes('points')) continue;
  const id = path.replace('./', '').replace('.json', '');
  const faction = modules[path].default;
  const factionPoints = POINTS[id];
  if (factionPoints && faction.units) {
    for (const unit of faction.units) {
      const entry = factionPoints[unit.id];
      if (entry === undefined) continue;
      unit.pts = resolveUnitPoints(entry, { models: defaultModelsFor(entry) });
    }
  }
  FACTION_DATA[id] = faction;
}

export const BASE_SIZES = (import.meta.glob('./base_sizes.json', { eager: true }) as Record<string, { default: any }>)['./base_sizes.json'].default;

export const DETACHMENTS = (import.meta.glob('./detachments.json', { eager: true }) as Record<string, { default: any }>)['./detachments.json'].default;
