import { PointsValue } from './types';
import pointsData from './points.json';

// points.json: { "<factionId>": { "<unitId>": PointsValue } }
// unitId usa el mismo id en inglés que DataUnit.id (FACTION_DATA), no slugs en español —
// así el merge en index.ts funciona por igualdad exacta de claves.
export const POINTS: Record<string, Record<string, PointsValue>> = pointsData as any;

export interface ResolveOpts {
  instance?: number;        // 1ra, 2da, 3ra... copia de esta unidad en la lista (default 1)
  models?: number;          // cantidad de miniaturas (default: la más chica disponible)
  wargearKeys?: string[];   // claves de wargear.json a sumar
}

// Resuelve el costo final en puntos de una unidad según instancia (1ra/2da/3ra+
// copia en la lista), cantidad de miniaturas, y opciones de equipo elegidas.
export function resolveUnitPoints(value: PointsValue | undefined, opts: ResolveOpts = {}): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;

  const tier = value.tiers.find(t => {
    const instance = opts.instance ?? 1;
    return instance >= t.fromInstance && (t.toInstance == null || instance <= t.toInstance);
  }) ?? value.tiers[0];
  if (!tier || tier.costs.length === 0) return undefined;

  const models = opts.models ?? Math.min(...tier.costs.map(c => c.models));
  const band = tier.costs.find(c => c.models === models)
    ?? tier.costs.reduce((best, c) => Math.abs(c.models - models) < Math.abs(best.models - models) ? c : best, tier.costs[0]);

  let pts = band.pts;
  if (value.wargear && opts.wargearKeys) {
    for (const key of opts.wargearKeys) pts += value.wargear[key] ?? 0;
  }
  return pts;
}

// Tamaño "default" para poblar el catálogo (FactionData.units[].pts): 1ra instancia,
// el tamaño de unidad más chico disponible.
export function defaultModelsFor(value: PointsValue): number {
  if (typeof value === 'number') return 1;
  const firstTier = value.tiers[0];
  if (!firstTier || firstTier.costs.length === 0) return 1;
  return Math.min(...firstTier.costs.map(c => c.models));
}
