import { FactionData } from './types';

const modules = import.meta.glob('./*.json', { eager: true }) as Record<string, { default: FactionData }>;

export const FACTION_DATA: Record<string, FactionData> = {};

for (const path in modules) {
  const id = path.replace('./', '').replace('.json', '');
  FACTION_DATA[id] = modules[path].default;
}
