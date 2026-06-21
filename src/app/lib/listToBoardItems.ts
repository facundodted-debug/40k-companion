import { SavedList } from '../../store/lists';
import { ArmyList } from '../components/shared';
import { PlaceableItem, BaseSize, Side } from '../components/DeploymentBoardScreen';

function isArmyList(list: SavedList): list is ArmyList {
  return 'faction' in list && 'keyUnits' in list;
}

const BASE_TYPE_MAP: Record<string, { baseSize: BaseSize; useModels: boolean }> = {
  'solo-30': { baseSize: '32', useModels: false },
  'solo-40': { baseSize: '40', useModels: false },
  'solo-60': { baseSize: '60', useModels: false },
  'solo-100': { baseSize: '100', useModels: false },
  'unit-5': { baseSize: '40', useModels: true },
  'unit-6': { baseSize: '40', useModels: true },
  'unit-10': { baseSize: '32', useModels: true },
  'unit-11': { baseSize: '32', useModels: true },
  'oval': { baseSize: '105x70', useModels: false },
  'rect-s': { baseSize: 'rect-s', useModels: false },
  'rect-l': { baseSize: 'rect-l', useModels: false },
};

// base_sizes.json colapsa todos los óvalos bajo baseType:"oval" — el tamaño real
// (motos 75×42mm, jetbikes 90×52mm, etc.) está en el texto libre de baseMm.
function ovalSizeFromMm(baseMm: string | undefined): BaseSize {
  const m = baseMm?.match(/(\d+)\s*x\s*(\d+)\s*mm/i);
  if (!m) return '105x70';
  const key = `${m[1]}x${m[2]}` as BaseSize;
  return (['75x42', '90x52', '105x70'] as BaseSize[]).includes(key) ? key : '75x42';
}

const UNIT_TYPE_MAP: Record<string, { baseSize: BaseSize; count: number }> = {
  infantry: { baseSize: '32', count: 5 },
  vehicle: { baseSize: 'rect-s', count: 1 },
  monster: { baseSize: '100', count: 1 },
  character: { baseSize: '40', count: 1 },
  special: { baseSize: '60', count: 1 },
};

const SUPPORTED_COUNTS = [1, 2, 3, 4, 5, 6, 10, 11, 20];

function nearestSupportedCount(n: number): number {
  if (SUPPORTED_COUNTS.includes(n)) return n;
  return SUPPORTED_COUNTS.reduce((best, c) => Math.abs(c - n) < Math.abs(best - n) ? c : best, SUPPORTED_COUNTS[0]);
}

// Genera siglas legibles a partir del nombre de una unidad (ej. "Red Terror" -> "RT").
function abbreviate(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return words.map(w => w[0]).join('').toUpperCase().slice(0, 4);
  }
  return name.slice(0, 3).toUpperCase();
}

const BW = 600, BH = 440;

// Distribuye unidades en una grilla centrada en el tablero (despliegue propio/rival).
export function listToBoardItems(list: SavedList, side: Side): PlaceableItem[] {
  const entries: { baseSize: BaseSize; count: number; key: string; label: string }[] = [];

  if (isArmyList(list)) {
    list.keyUnits.forEach(unit => {
      const cfg = UNIT_TYPE_MAP[unit.type] ?? UNIT_TYPE_MAP.infantry;
      entries.push({ baseSize: cfg.baseSize, count: cfg.count, key: unit.id, label: abbreviate(unit.shortName || unit.name) });
    });
  } else {
    list.units.forEach(unit => {
      const cfg = unit.baseType ? BASE_TYPE_MAP[unit.baseType] : undefined;
      const baseSize: BaseSize = unit.baseType === 'oval' ? ovalSizeFromMm(unit.baseMm) : (cfg?.baseSize ?? '32');
      const count = cfg?.useModels ? nearestSupportedCount(unit.models) : 1;
      entries.push({ baseSize, count, key: unit.name.replace(/\s+/g, '-'), label: abbreviate(unit.name) });
    });
  }

  const cols = 4;
  const colSpacing = BW / (cols + 1);
  const numRows = Math.max(1, Math.ceil(entries.length / cols));

  // Banda de despliegue: mitad propia (cerca de y=BH) o rival (cerca de y=0), con margen.
  const margin = 30;
  const bandStart = side === 'own' ? BH / 2 + margin : margin;
  const bandEnd = side === 'own' ? BH - margin : BH / 2 - margin;
  const rowStep = numRows > 1 ? (bandEnd - bandStart) / (numRows - 1) : 0;

  return entries.map((entry, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      id: `${side}-${entry.key}-${i}-${Date.now()}`,
      baseSize: entry.baseSize,
      count: entry.count,
      side,
      x: colSpacing * (col + 1),
      y: bandStart + row * rowStep,
      rotation: 0,
      label: entry.label,
    };
  });
}
