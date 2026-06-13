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
  'rect-s': { baseSize: '60', useModels: false },
  'rect-l': { baseSize: '100', useModels: false },
};

const UNIT_TYPE_MAP: Record<string, { baseSize: BaseSize; count: number }> = {
  infantry: { baseSize: '32', count: 5 },
  vehicle: { baseSize: '100', count: 1 },
  monster: { baseSize: '100', count: 1 },
  character: { baseSize: '40', count: 1 },
  special: { baseSize: '60', count: 1 },
};

const SUPPORTED_COUNTS = [1, 2, 3, 4, 5, 6, 10, 11, 20];

function nearestSupportedCount(n: number): number {
  if (SUPPORTED_COUNTS.includes(n)) return n;
  return SUPPORTED_COUNTS.reduce((best, c) => Math.abs(c - n) < Math.abs(best - n) ? c : best, SUPPORTED_COUNTS[0]);
}

// Distribuye unidades en una grilla a partir del despliegue propio/rival del tablero.
export function listToBoardItems(list: SavedList, side: Side): PlaceableItem[] {
  const items: PlaceableItem[] = [];
  const baseX = 300;
  const baseY = side === 'own' ? 360 : 80;
  const rowStep = side === 'own' ? 40 : -40;

  const place = (i: number, baseSize: BaseSize, count: number, key: string) => {
    items.push({
      id: `${side}-${key}-${i}-${Date.now()}`,
      baseSize,
      count,
      side,
      x: baseX + ((i % 4) - 1.5) * 90,
      y: baseY + Math.floor(i / 4) * rowStep,
      rotation: 0,
    });
  };

  if (isArmyList(list)) {
    list.keyUnits.forEach((unit, i) => {
      const cfg = UNIT_TYPE_MAP[unit.type] ?? UNIT_TYPE_MAP.infantry;
      place(i, cfg.baseSize, cfg.count, unit.id);
    });
  } else {
    list.units.forEach((unit, i) => {
      const cfg = unit.baseType ? BASE_TYPE_MAP[unit.baseType] : undefined;
      const baseSize: BaseSize = cfg?.baseSize ?? '32';
      const count = cfg?.useModels ? nearestSupportedCount(unit.models) : 1;
      place(i, baseSize, count, unit.name.replace(/\s+/g, '-'));
    });
  }

  return items;
}
