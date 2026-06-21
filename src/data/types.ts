import { UnitType } from '../app/components/shared';

export interface WeaponProfile {
  name: string;
  range?: string;
  a: string;
  skill: string;
  s: number;
  ap: number;
  d: string;
  keywords?: string[];
}

export interface DataUnitStats {
  m: number;
  t: number;
  sv: number;
  w: number;
  ld: number;
  oc: number;
}

// Costo en pts para un tamaño de unidad puntual (ej. "10 models" -> 100 pts)
export interface ModelBand {
  models: number;
  pts: number;
}

// El MFM 11ª ed. fija precio por "instancia" (1ra, 2da, 3ra+ copia de la misma
// unidad en tu lista) y, dentro de cada instancia, por cantidad de miniaturas.
// Ej. Castigator: 1ra-2da unidad = 165pts, 3ra+ = 175pts (siempre 1 modelo).
// Ej. Celestian Sacresants: 1ra unidad 5=75/10=150pts, 2da+ unidad 5=90/10=165pts.
export interface InstanceTier {
  fromInstance: number;        // 1 = la primera vez que tomás esta unidad
  toInstance: number | null;   // null = sin tope ("3rd+")
  costs: ModelBand[];
}

// Costo en puntos de una unidad. Puede ser un número fijo (unidades sin
// variación), o un objeto con tiers por instancia/tamaño y wargear opcional.
export interface UnitPointsEntry {
  tiers: InstanceTier[];
  wargear?: Record<string, number>;
}

export type PointsValue = number | UnitPointsEntry;

export interface DetachmentEnhancement {
  name: string;
  cost: number;
  restriction?: string;
}

export interface DataUnit {
  id: string;
  name: string;
  pts?: number;
  type: UnitType;
  role: string;
  keywords: string[];
  stats: DataUnitStats;
  ranged: WeaponProfile[];
  melee: WeaponProfile[];
  abilities: string[];
  considerations: string;
  recommendations: string;
}

export interface FactionDetachmentData {
  overview: string;
  abilities: { name: string; flavor: string; rule: string }[];
  strengths: string[];
  weaknesses: string[];
}

export interface FactionData {
  id: string;
  name: string;
  detachments: Record<string, FactionDetachmentData>;
  units: DataUnit[];
}
