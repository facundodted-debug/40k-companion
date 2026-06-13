import { FactionData } from './types';

const modules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: FactionData }>;

export const FACTION_DATA: Record<string, FactionData> = {};

for (const path in modules) {
  if (path.includes('base_sizes') || path.includes('detachments')) continue;
  const id = path.replace('./', '').replace('.json', '');
  FACTION_DATA[id] = modules[path].default;
}

export const BASE_SIZES = (import.meta.glob('./base_sizes.json', { eager: true }) as Record<string, { default: any }>)['./base_sizes.json'].default;

export const DETACHMENTS = (import.meta.glob('./detachments.json', { eager: true }) as Record<string, { default: any }>)['./detachments.json'].default;
