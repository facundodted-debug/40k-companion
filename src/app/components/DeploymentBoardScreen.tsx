import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ZoomIn, ZoomOut, Map, X, ChevronDown } from 'lucide-react';
import { Mission } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { MISSION_MAPS } from './missionMaps';
import { SavedList } from '../../store/lists';
import { ArmySelect } from './ArmySelect';
import { listToBoardItems } from '../lib/listToBoardItems';

const BW = 600, BH = 440;
const OWN_COLOR = '#3d7ef0';
const RIVAL_COLOR = '#e84040';

// ── Types ──────────────────────────────────────────────────────────────────────
export type BaseSize = '25' | '32' | '40' | '50' | '60' | '100' | '105x70';
export type Side = 'own' | 'rival';

export interface PlaceableItem {
  id: string;
  baseSize: BaseSize;
  count: number;
  side: Side;
  x: number;
  y: number;
  rotation: number;
}

// SVG radius per base size (board: ~10 SVG units ≈ 1 inch, so 1mm ≈ 0.4 units)
const BASE_RADII: Record<string, number> = {
  '25': 5, '32': 6, '40': 8, '50': 10, '60': 12, '100': 20,
};
const OVAL_RX = 21, OVAL_RY = 14;

// Row layouts for each supported mini count
const ROW_LAYOUTS: Record<number, number[]> = {
  1:  [1],
  2:  [2],
  3:  [2, 1],
  4:  [2, 2],
  5:  [3, 2],
  6:  [3, 3],
  10: [4, 3, 3],
  11: [4, 4, 3],
  20: [5, 5, 5, 5],
};

function computeDots(count: number, spacing: number): [number, number][] {
  if (count <= 1) return [[0, 0]];
  const rows = ROW_LAYOUTS[count] ?? [count];
  const positions: [number, number][] = [];
  rows.forEach((rowCount, rowIdx) => {
    const y = (rowIdx - (rows.length - 1) / 2) * spacing;
    for (let col = 0; col < rowCount; col++) {
      positions.push([(col - (rowCount - 1) / 2) * spacing, y]);
    }
  });
  return positions;
}

export function getItemRadius(item: PlaceableItem): number {
  if (item.baseSize === '105x70') return Math.max(OVAL_RX, OVAL_RY) + 6;
  const r = BASE_RADII[item.baseSize] ?? 8;
  if (item.count <= 1) return r + 6;
  const spacing = r * 2 + 2;
  const dots = computeDots(item.count, spacing);
  const maxDist = Math.max(...dots.map(([dx, dy]) => Math.sqrt(dx * dx + dy * dy)));
  return maxDist + r + 6;
}

// ── Token shape ────────────────────────────────────────────────────────────────
export function TokenShape({ item, dragging }: { item: PlaceableItem; dragging?: boolean }) {
  const color = item.side === 'own' ? OWN_COLOR : RIVAL_COLOR;
  const fill = color + '30';
  const opacity = dragging ? 0.55 : 1;

  if (item.baseSize === '105x70') {
    return (
      <g opacity={opacity}>
        <ellipse rx={OVAL_RX + 4} ry={OVAL_RY + 4} fill={color + '10'} />
        <ellipse rx={OVAL_RX} ry={OVAL_RY} fill={fill} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }

  const r = BASE_RADII[item.baseSize] ?? 8;

  if (item.count <= 1) {
    return (
      <g opacity={opacity}>
        <circle r={r + 4} fill={color + '10'} />
        <circle r={r} fill={fill} stroke={color} strokeWidth={1.5} />
      </g>
    );
  }

  const spacing = r * 2 + 2;
  const dots = computeDots(item.count, spacing);
  const maxX = Math.max(...dots.map(([dx]) => Math.abs(dx)));
  const maxY = Math.max(...dots.map(([, dy]) => Math.abs(dy)));
  const bw = maxX * 2 + r * 2 + 4;
  const bh = maxY * 2 + r * 2 + 4;

  return (
    <g opacity={opacity}>
      <rect x={-bw / 2 - 4} y={-bh / 2 - 4} width={bw + 8} height={bh + 8} rx={6} fill={color + '0A'} />
      <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={4} fill={fill} stroke={color} strokeWidth={1.5} strokeDasharray="4,2" />
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={r} fill={fill} stroke={color} strokeWidth={1} />
      ))}
    </g>
  );
}

// ── Unit preview SVG ───────────────────────────────────────────────────────────
function UnitPreview({ item }: { item: PlaceableItem }) {
  const r = getItemRadius(item);
  const pad = 6;
  const dim = (r + pad) * 2;
  const vb = `${-(r + pad)} ${-(r + pad)} ${dim} ${dim}`;
  return (
    <svg viewBox={vb} width="100%" height="100%" style={{ overflow: 'visible' }}>
      <TokenShape item={item} />
    </svg>
  );
}

// ── Styled select ──────────────────────────────────────────────────────────────
interface SelectFieldProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: { value: string | number; label: string }[];
  disabled?: boolean;
  color?: string;
}

function SelectField({ label, value, onChange, options, disabled, color }: SelectFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <p style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 7 }}>
          {label}
        </p>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--muted)',
            border: `1px solid ${disabled ? 'rgba(255,255,255,0.07)' : color ? color + '40' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 10,
            color: disabled ? 'var(--muted-foreground)' : 'var(--foreground)',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.03em',
            padding: '12px 40px 12px 14px',
            appearance: 'none',
            WebkitAppearance: 'none',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.45 : 1,
          }}
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--muted-foreground)' }}>
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
}

// ── Selection modal ────────────────────────────────────────────────────────────
const BASE_SIZE_OPTIONS: { value: BaseSize; label: string }[] = [
  { value: '25',    label: '25mm' },
  { value: '32',    label: '32mm' },
  { value: '40',    label: '40mm' },
  { value: '50',    label: '50mm' },
  { value: '60',    label: '60mm' },
  { value: '100',   label: '100mm' },
  { value: '105x70', label: '105×70mm (oval)' },
];

const COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 10, 11, 20].map(n => ({
  value: n,
  label: n === 1 ? '1 mini' : `${n} minis`,
}));

function UnitSelectModal({ side, onAdd, onClose }: {
  side: Side;
  onAdd: (baseSize: BaseSize, count: number) => void;
  onClose: () => void;
}) {
  const [baseSize, setBaseSize] = useState<BaseSize>('32');
  const [count, setCount] = useState(1);

  const isOval = baseSize === '105x70';
  const effectiveCount = isOval ? 1 : count;
  const color = side === 'own' ? OWN_COLOR : RIVAL_COLOR;

  const previewItem: PlaceableItem = {
    id: 'preview', baseSize, count: effectiveCount, side, x: 0, y: 0, rotation: 0,
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--card)', borderTop: `1px solid ${color}30`, borderRadius: '18px 18px 0 0', padding: '0 16px 36px', maxHeight: '80%', overflowY: 'auto', boxShadow: '0 -12px 40px rgba(0,0,0,0.65)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '14px auto 20px' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 style={{ fontSize: 17, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Agregar unidad
            </h3>
            <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color }}>
              {side === 'own' ? 'Propio' : 'Oponente'}
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)', padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Dropdowns */}
        <SelectField
          label="Seleccioná una base"
          value={baseSize}
          onChange={v => setBaseSize(v as BaseSize)}
          options={BASE_SIZE_OPTIONS}
          color={color}
        />
        <SelectField
          label="Tamaño de la unidad"
          value={effectiveCount}
          onChange={v => setCount(parseInt(v))}
          options={COUNT_OPTIONS}
          disabled={isOval}
          color={color}
        />

        {/* Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0 20px' }}>
          <div style={{ width: 120, height: 120, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 8 }}>
            <UnitPreview item={previewItem} />
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={() => { onAdd(baseSize, effectiveCount); onClose(); }}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl"
          style={{ background: color, color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: `0 4px 18px ${color}40` }}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

// ── Empty / Loading states ─────────────────────────────────────────────────────
function EmptyState({ onSelectMission }: { onSelectMission: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-8 text-center">
      <div className="flex items-center justify-center rounded-2xl" style={{ width: 80, height: 80, background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Map size={32} style={{ color: 'var(--muted-foreground)' }} />
      </div>
      <div>
        <h3 style={{ fontSize: 20, color: 'var(--foreground)', marginBottom: 8 }}>Sin misión activa</h3>
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>Seleccioná una misión para ver el tablero de despliegue.</p>
      </div>
      <button onClick={onSelectMission} className="flex items-center gap-2 px-6 py-3 rounded-lg"
        style={{ background: 'var(--accent)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Elegir misión
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <p style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        Cargando tablero…
      </p>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
interface DeploymentBoardScreenProps {
  mission: Mission | null;
  lists: SavedList[];
  onBack: () => void;
  onSelectMission: () => void;
  onStartSimulation: (items: PlaceableItem[]) => void;
}

export function DeploymentBoardScreen({ mission, lists, onBack, onSelectMission, onStartSimulation }: DeploymentBoardScreenProps) {
  const [boardState, setBoardState] = useState<'empty' | 'loading' | 'ready'>('empty');
  const [scale, setScale] = useState(1);
  const [items, setItems] = useState<PlaceableItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<Side | null>(null);
  const [selectedList, setSelectedList] = useState<SavedList | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (mission) {
      setBoardState('loading');
      const t = setTimeout(() => { setItems([]); setBoardState('ready'); }, 600);
      return () => clearTimeout(t);
    } else {
      setBoardState('empty');
    }
  }, [mission]);

  const getBoardPoint = useCallback((e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = (e.clientX - rect.left) * (440 / rect.width);
    const sy = (e.clientY - rect.top) * (600 / rect.height);
    return { x: 600 - sy, y: sx };
  }, []);

  const handleItemPointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    setDraggingId(id);
    setSelectedId(id);
  }, []);

  const handleSVGPointerDown = useCallback(() => setSelectedId(null), []);

  const handleSVGPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingId) return;
    const pt = getBoardPoint(e);
    if (!pt) return;
    setItems(prev => prev.map(it => it.id === draggingId
      ? { ...it, x: Math.max(0, Math.min(BW, pt.x)), y: Math.max(0, Math.min(BH, pt.y)) }
      : it
    ));
  }, [draggingId, getBoardPoint]);

  const handleSVGPointerUp = useCallback(() => setDraggingId(null), []);

  const addUnit = useCallback((baseSize: BaseSize, count: number, side: Side) => {
    const id = `${side}-${baseSize}-${count}-${Date.now()}`;
    const cx = 300 + (Math.random() - 0.5) * 120;
    const cy = side === 'own' ? 360 + (Math.random() - 0.5) * 60 : 80 + (Math.random() - 0.5) * 60;
    setItems(prev => [...prev, { id, baseSize, count, side, x: cx, y: cy, rotation: 0 }]);
  }, []);

  const handleSelectList = useCallback((list: SavedList) => {
    setSelectedList(list);
    setItems(prev => [...prev.filter(it => it.side !== 'own'), ...listToBoardItems(list, 'own')]);
  }, []);

  const rotateItem = useCallback((id: string, delta: number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, rotation: (it.rotation + delta) % 360 } : it));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    setSelectedId(null);
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative' }}>
      <ScreenHeader
        title={mission ? mission.name : 'Tablero'}
        subtitle={mission ? mission.subtitle : undefined}
        onBack={onBack}
        right={
          mission && boardState === 'ready' ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setScale(s => Math.max(0.7, s - 0.1))}
                style={{ padding: '4px 6px', background: 'var(--muted)', borderRadius: 4, color: 'var(--muted-foreground)' }}>
                <ZoomOut size={13} />
              </button>
              <button onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
                style={{ padding: '4px 6px', background: 'var(--muted)', borderRadius: 4, color: 'var(--muted-foreground)' }}>
                <ZoomIn size={13} />
              </button>
            </div>
          ) : null
        }
      />

      {boardState === 'empty' && <EmptyState onSelectMission={onSelectMission} />}
      {boardState === 'loading' && <LoadingState />}

      {boardState === 'ready' && mission && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Board */}
          <div className="flex-1 overflow-auto p-3">
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                {MISSION_MAPS[mission.id] && (
                  <>
                    <img src={MISSION_MAPS[mission.id]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)' }} />
                  </>
                )}
                <svg
                  ref={svgRef}
                  viewBox="0 0 440 600"
                  style={{ width: '100%', display: 'block', position: 'relative', touchAction: 'none', cursor: draggingId ? 'grabbing' : 'default' }}
                  onPointerMove={handleSVGPointerMove}
                  onPointerUp={handleSVGPointerUp}
                  onPointerLeave={handleSVGPointerUp}
                  onPointerDown={handleSVGPointerDown}
                >
                  <rect width={440} height={600} fill="transparent" />
                  <g transform="translate(0, 600) rotate(-90)">
                    {Array.from({ length: Math.ceil(BW / 60) + 1 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={BH} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                    ))}
                    {Array.from({ length: Math.ceil(BH / 60) + 1 }).map((_, i) => (
                      <line key={`h${i}`} x1={0} y1={i * 60} x2={BW} y2={i * 60} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                    ))}
                    <line x1={0} y1={BH / 2} x2={BW} y2={BH / 2} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="16,8" />

                    {items.length === 0 && (
                      <text x={BW / 2} y={BH / 2 + 5} textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="18"
                        fontFamily="Barlow Condensed, sans-serif" fontWeight="600" letterSpacing="0.06em">
                        AGREGÁ UNIDADES
                      </text>
                    )}

                    {items.map(item => {
                      const isSelected = selectedId === item.id;
                      const color = item.side === 'own' ? OWN_COLOR : RIVAL_COLOR;
                      const tokenR = getItemRadius(item);
                      const btnR = tokenR + 14;
                      return (
                        <g key={item.id} transform={`translate(${item.x},${item.y})`} style={{ touchAction: 'none' }}>
                          <g
                            transform={`rotate(${item.rotation})`}
                            style={{ cursor: draggingId === item.id ? 'grabbing' : 'grab' }}
                            onPointerDown={e => handleItemPointerDown(e, item.id)}
                          >
                            <TokenShape item={item} dragging={draggingId === item.id} />
                          </g>

                          {isSelected && (
                            <circle r={tokenR} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity={0.6} />
                          )}

                          {isSelected && !draggingId && (
                            <>
                              <g transform={`translate(${-btnR * 0.87}, ${-btnR * 0.5})`} style={{ cursor: 'pointer' }}
                                onPointerDown={e => { e.stopPropagation(); rotateItem(item.id, -45); }}>
                                <circle r={11} fill="#1a1b22" stroke={color} strokeWidth="1.2" />
                                <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill={color}>↺</text>
                              </g>
                              <g transform={`translate(${btnR * 0.87}, ${-btnR * 0.5})`} style={{ cursor: 'pointer' }}
                                onPointerDown={e => { e.stopPropagation(); rotateItem(item.id, 45); }}>
                                <circle r={11} fill="#1a1b22" stroke={color} strokeWidth="1.2" />
                                <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill={color}>↻</text>
                              </g>
                              <g transform={`translate(0, ${-btnR})`} style={{ cursor: 'pointer' }}
                                onPointerDown={e => { e.stopPropagation(); removeItem(item.id); }}>
                                <circle r={11} fill="#1a1b22" stroke="#e84040" strokeWidth="1.2" />
                                <line x1={-4} y1={-4} x2={4} y2={4} stroke="#e84040" strokeWidth="1.6" strokeLinecap="round" />
                                <line x1={4} y1={-4} x2={-4} y2={4} stroke="#e84040" strokeWidth="1.6" strokeLinecap="round" />
                              </g>
                            </>
                          )}
                        </g>
                      );
                    })}
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="px-4 pb-4 pt-2">
            <p style={{ fontSize: 13, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
              Seleccioná una de tus listas
            </p>
            <ArmySelect
              lists={lists}
              selected={selectedList}
              onSelect={handleSelectList}
              placeholder={lists.length ? 'Elegí una lista' : 'No hay listas guardadas'}
            />
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', textAlign: 'center', margin: '4px 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>
              o generá las unidades
            </p>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setModal('rival')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{ background: 'rgba(232,64,64,0.12)', border: '1px solid rgba(232,64,64,0.35)', color: RIVAL_COLOR, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}
              >
                <svg width="14" height="14" viewBox="-7 -7 14 14">
                  <circle r={6} fill="rgba(232,64,64,0.25)" stroke="#e84040" strokeWidth="1.5" />
                  <line x1={-3} y1={0} x2={3} y2={0} stroke="#e84040" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1={0} y1={-3} x2={0} y2={3} stroke="#e84040" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Oponente
              </button>
              <button
                onClick={() => setModal('own')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{ background: 'rgba(61,126,240,0.12)', border: '1px solid rgba(61,126,240,0.35)', color: OWN_COLOR, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}
              >
                <svg width="14" height="14" viewBox="-7 -7 14 14">
                  <circle r={6} fill="rgba(61,126,240,0.25)" stroke="#3d7ef0" strokeWidth="1.5" />
                  <line x1={-3} y1={0} x2={3} y2={0} stroke="#3d7ef0" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1={0} y1={-3} x2={0} y2={3} stroke="#3d7ef0" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Propio
              </button>
            </div>

            <button
              onClick={() => onStartSimulation(items)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg"
              style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              <Play size={15} />
              Iniciar simulación
            </button>
          </div>
        </div>
      )}

      {modal && (
        <UnitSelectModal
          side={modal}
          onAdd={(baseSize, count) => addUnit(baseSize, count, modal)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
