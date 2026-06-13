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

export interface DataUnit {
  id: string;
  name: string;
  pts: number;
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
