import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, ZoomIn, ZoomOut, Map, X } from 'lucide-react';
import { Mission } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { MISSION_MAPS } from './missionMaps';

const BW = 600, BH = 440;
const OWN_COLOR = '#3d7ef0';
const RIVAL_COLOR = '#e84040';

export interface BoardUnit {
  id: string;
  name: string;
  shortName: string;
  type: 'infantry' | 'vehicle' | 'monster' | 'character' | 'special';
  side: 'own' | 'rival';
  x: number;
  y: number;
}

// ── Base types ─────────────────────────────────────────────────────────────────
export type BaseType =
  | 'solo-30' | 'solo-40' | 'solo-60' | 'solo-100'
  | 'unit-5'  | 'unit-6'  | 'unit-10' | 'unit-11'
  | 'oval'    | 'rect-s'  | 'rect-l';

export type Side = 'own' | 'rival';

export interface PlaceableItem {
  id: string;
  baseType: BaseType;
  side: Side;
  x: number;
  y: number;
  rotation: number;
}

// Board radius / dimensions per base type (SVG units, 10 units = 1")
export const BASE_SIZE: Record<BaseType, { w: number; h: number }> = {
  'solo-30':  { w: 15, h: 15 },
  'solo-40':  { w: 20, h: 20 },
  'solo-60':  { w: 30, h: 30 },
  'solo-100': { w: 50, h: 50 },
  'unit-5':   { w: 42, h: 28 },
  'unit-6':   { w: 42, h: 28 },
  'unit-10':  { w: 56, h: 42 },
  'unit-11':  { w: 56, h: 42 },
  'oval':     { w: 50, h: 30 },
  'rect-s':   { w: 55, h: 35 },
  'rect-l':   { w: 80, h: 50 },
};

// ── SVG token on board ─────────────────────────────────────────────────────────
export const UNIT_DOTS: Record<string, [number, number][]> = {
  'unit-5':  [[-14,-7],[0,-7],[14,-7],[-7,7],[7,7]],
  'unit-6':  [[-14,-7],[0,-7],[14,-7],[-14,7],[0,7],[14,7]],
  'unit-10': [[-18,-14],[-6,-14],[6,-14],[18,-14],[-18,0],[-6,0],[6,0],[18,0],[-12,14],[0,14]],  //wait, let me fix
  'unit-11': [[-18,-14],[-6,-14],[6,-14],[18,-14],[-18,0],[-6,0],[6,0],[18,0],[-18,14],[-6,14],[6,14]],
};
// Fix unit-10 dots
UNIT_DOTS['unit-10'] = [[-18,-14],[-6,-14],[6,-14],[18,-14],[-12,-4],[0,-4],[12,-4],[-18,10],[-6,10],[6,10]];

export function TokenShape({ item, dragging }: { item: PlaceableItem; dragging?: boolean }) {
  const color = item.side === 'own' ? OWN_COLOR : RIVAL_COLOR;
  const fill = color + '30';
  const opacity = dragging ? 0.55 : 1;
  const { w, h } = BASE_SIZE[item.baseType];

  switch (item.baseType) {
    case 'solo-30': case 'solo-40': case 'solo-60': case 'solo-100': {
      const r = w / 2;
      return (
        <g opacity={opacity}>
          <circle r={r + 4} fill={color + '10'} />
          <circle r={r} fill={fill} stroke={color} strokeWidth={1.5} />
        </g>
      );
    }
    case 'unit-5': case 'unit-6': case 'unit-10': case 'unit-11': {
      const dr = 7;
      const dots = UNIT_DOTS[item.baseType];
      return (
        <g opacity={opacity}>
          <rect x={-w/2 - 4} y={-h/2 - 4} width={w + 8} height={h + 8} rx={6} fill={color + '0A'} />
          <rect x={-w/2} y={-h/2} width={w} height={h} rx={4} fill={fill} stroke={color} strokeWidth={1.5} strokeDasharray="4,2" />
          {dots.map(([dx, dy], i) => (
            <circle key={i} cx={dx} cy={dy} r={dr} fill={fill} stroke={color} strokeWidth={1} />
          ))}
        </g>
      );
    }
    case 'oval':
      return (
        <g opacity={opacity}>
          <ellipse rx={w/2 + 4} ry={h/2 + 4} fill={color + '10'} />
          <ellipse rx={w/2} ry={h/2} fill={fill} stroke={color} strokeWidth={1.5} />
        </g>
      );
    case 'rect-s': case 'rect-l':
      return (
        <g opacity={opacity}>
          <rect x={-w/2 - 4} y={-h/2 - 4} width={w + 8} height={h + 8} rx={5} fill={color + '10'} />
          <rect x={-w/2} y={-h/2} width={w} height={h} rx={4} fill={fill} stroke={color} strokeWidth={1.5} />
        </g>
      );
  }
}

// ── Base selection modal ───────────────────────────────────────────────────────
interface BaseCardProps {
  baseType: BaseType;
  label: string;
  side: Side;
  onSelect: () => void;
}

function BaseSvgPreview({ baseType }: { baseType: BaseType }) {
  const size = 52;
  const cx = size / 2, cy = size / 2;

  switch (baseType) {
    case 'solo-30':
      return <svg width={size} height={size}><circle cx={cx} cy={cy} r={10} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
    case 'solo-40':
      return <svg width={size} height={size}><circle cx={cx} cy={cy} r={14} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
    case 'solo-60':
      return <svg width={size} height={size}><circle cx={cx} cy={cy} r={18} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
    case 'solo-100':
      return <svg width={size} height={size}><circle cx={cx} cy={cy} r={22} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
    case 'unit-5': {
      const pts: [number,number][] = [[16,18],[26,18],[36,18],[21,30],[31,30]];
      return <svg width={size} height={size}>{pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={6} fill="none" stroke="currentColor" strokeWidth="1.3"/>)}<rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>;
    }
    case 'unit-6': {
      const pts: [number,number][] = [[14,18],[26,18],[38,18],[14,30],[26,30],[38,30]];
      return <svg width={size} height={size}>{pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={6} fill="none" stroke="currentColor" strokeWidth="1.3"/>)}<rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>;
    }
    case 'unit-10': {
      const pts: [number,number][] = [[10,14],[20,14],[30,14],[40,14],[10,24],[20,24],[30,24],[40,24],[15,34],[35,34]];
      return <svg width={size} height={size}>{pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={4.5} fill="none" stroke="currentColor" strokeWidth="1.2"/>)}<rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>;
    }
    case 'unit-11': {
      const pts: [number,number][] = [[8,12],[19,12],[30,12],[41,12],[8,22],[19,22],[30,22],[41,22],[8,33],[19,33],[30,33]];
      return <svg width={size} height={size}>{pts.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={4} fill="none" stroke="currentColor" strokeWidth="1.1"/>)}<rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/></svg>;
    }
    case 'oval':
      return <svg width={size} height={size}><ellipse cx={cx} cy={cy} rx={21} ry={13} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
    case 'rect-s':
      return <svg width={size} height={size}><rect x={8} y={14} width={36} height={24} rx={3} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
    case 'rect-l':
      return <svg width={size} height={size}><rect x={5} y={12} width={42} height={28} rx={3} fill="none" stroke="currentColor" strokeWidth="1.5" /><rect x={4} y={4} width={size-8} height={size-8} rx={7} fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" /></svg>;
  }
}

function BaseCard({ baseType, label, side, onSelect }: BaseCardProps) {
  const color = side === 'own' ? OWN_COLOR : RIVAL_COLOR;
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
      style={{
        background: 'var(--muted)',
        border: `1px solid rgba(255,255,255,0.08)`,
        color: color,
        transition: 'border-color 0.15s, background 0.15s',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      <BaseSvgPreview baseType={baseType} />
      <span style={{
        fontSize: 10,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        color: 'var(--foreground)',
        lineHeight: 1.2,
        textAlign: 'center',
        paddingInline: 4,
      }}>
        {label}
      </span>
    </button>
  );
}

const BASE_SECTIONS: { title: string; items: { type: BaseType; label: string }[] }[] = [
  {
    title: 'Solo',
    items: [
      { type: 'solo-30',  label: '30mm' },
      { type: 'solo-40',  label: '40mm' },
      { type: 'solo-60',  label: '60mm' },
      { type: 'solo-100', label: '100mm' },
    ],
  },
  {
    title: 'Unidades',
    items: [
      { type: 'unit-5',  label: '5 minis' },
      { type: 'unit-6',  label: '6 minis' },
      { type: 'unit-10', label: '10 minis' },
      { type: 'unit-11', label: '11 minis' },
    ],
  },
  {
    title: 'Vehículos',
    items: [
      { type: 'oval',   label: 'Ovalada' },
      { type: 'rect-s', label: 'Rect. chica' },
      { type: 'rect-l', label: 'Rect. grande' },
    ],
  },
];

function UnitSelectModal({ side, onSelect, onClose }: { side: Side; onSelect: (bt: BaseType) => void; onClose: () => void }) {
  const color = side === 'own' ? OWN_COLOR : RIVAL_COLOR;
  const label = side === 'own' ? 'Propio' : 'Oponente';

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '18px 18px 0 0',
          padding: '0 16px 32px',
          maxHeight: '82%',
          overflowY: 'auto',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '14px auto 18px' }} />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 style={{ fontSize: 17, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Seleccioná la unidad
            </h3>
            <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
              {label}
            </span>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)', padding: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Sections */}
        {BASE_SECTIONS.map(section => (
          <div key={section.title} className="mb-5">
            <p style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              {section.title}
            </p>
            <div className="flex gap-2">
              {section.items.map(it => (
                <BaseCard
                  key={it.type}
                  baseType={it.type}
                  label={it.label}
                  side={side}
                  onSelect={() => { onSelect(it.type); onClose(); }}
                />
              ))}
            </div>
          </div>
        ))}
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
  onBack: () => void;
  onSelectMission: () => void;
  onStartSimulation: (items: PlaceableItem[]) => void;
}

export function DeploymentBoardScreen({ mission, onBack, onSelectMission, onStartSimulation }: DeploymentBoardScreenProps) {
  const [boardState, setBoardState] = useState<'empty' | 'loading' | 'ready'>('empty');
  const [scale, setScale] = useState(1);
  const [items, setItems] = useState<PlaceableItem[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<Side | null>(null);
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

  const handleSVGPointerDown = useCallback(() => {
    setSelectedId(null);
  }, []);

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

  const addUnit = useCallback((baseType: BaseType, side: Side) => {
    const id = `${side}-${baseType}-${Date.now()}`;
    const cx = side === 'own' ? 300 + (Math.random() - 0.5) * 120 : 300 + (Math.random() - 0.5) * 120;
    const cy = side === 'own' ? 360 + (Math.random() - 0.5) * 60  : 80  + (Math.random() - 0.5) * 60;
    setItems(prev => [...prev, { id, baseType, side, x: cx, y: cy, rotation: 0 }]);
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
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 0 1px rgba(255,255,255,0.04)' }}>
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
                    {/* Subtle grid */}
                    {Array.from({ length: Math.ceil(BW / 60) + 1 }).map((_, i) => (
                      <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={BH} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                    ))}
                    {Array.from({ length: Math.ceil(BH / 60) + 1 }).map((_, i) => (
                      <line key={`h${i}`} x1={0} y1={i * 60} x2={BW} y2={i * 60} stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
                    ))}
                    <line x1={0} y1={BH/2} x2={BW} y2={BH/2} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="16,8" />

                    {/* Empty state hint */}
                    {items.length === 0 && (
                      <text
                        x={BW / 2} y={BH / 2 + 5}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.18)"
                        fontSize="18"
                        fontFamily="Barlow Condensed, sans-serif"
                        fontWeight="600"
                        letterSpacing="0.06em"
                      >
                        AGREGÁ UNIDADES
                      </text>
                    )}

                    {/* Unit tokens */}
                    {items.map(item => {
                      const isSelected = selectedId === item.id;
                      const color = item.side === 'own' ? OWN_COLOR : RIVAL_COLOR;
                      const { w, h } = BASE_SIZE[item.baseType];
                      const tokenR = Math.max(w, h) / 2 + 10;
                      const btnR = tokenR + 14;
                      return (
                        <g
                          key={item.id}
                          transform={`translate(${item.x},${item.y})`}
                          style={{ touchAction: 'none' }}
                        >
                          {/* Draggable token */}
                          <g
                            transform={`rotate(${item.rotation})`}
                            style={{ cursor: draggingId === item.id ? 'grabbing' : 'grab' }}
                            onPointerDown={e => handleItemPointerDown(e, item.id)}
                          >
                            <TokenShape item={item} dragging={draggingId === item.id} />
                          </g>

                          {/* Selection ring */}
                          {isSelected && (
                            <circle
                              r={tokenR}
                              fill="none"
                              stroke={color}
                              strokeWidth="1"
                              strokeDasharray="4,3"
                              opacity={0.6}
                            />
                          )}

                          {/* Controls: rotate CCW, rotate CW, delete */}
                          {isSelected && !draggingId && (
                            <>
                              {/* Rotate CCW (-45°) */}
                              <g
                                transform={`translate(${-btnR * 0.87}, ${-btnR * 0.5})`}
                                style={{ cursor: 'pointer' }}
                                onPointerDown={e => { e.stopPropagation(); rotateItem(item.id, -45); }}
                              >
                                <circle r={11} fill="#1a1b22" stroke={color} strokeWidth="1.2" />
                                <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill={color}>↺</text>
                              </g>

                              {/* Rotate CW (+45°) */}
                              <g
                                transform={`translate(${btnR * 0.87}, ${-btnR * 0.5})`}
                                style={{ cursor: 'pointer' }}
                                onPointerDown={e => { e.stopPropagation(); rotateItem(item.id, 45); }}
                              >
                                <circle r={11} fill="#1a1b22" stroke={color} strokeWidth="1.2" />
                                <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill={color}>↻</text>
                              </g>

                              {/* Delete */}
                              <g
                                transform={`translate(0, ${-btnR})`}
                                style={{ cursor: 'pointer' }}
                                onPointerDown={e => { e.stopPropagation(); removeItem(item.id); }}
                              >
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
            {/* Add unit buttons */}
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setModal('rival')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{
                  background: 'rgba(232,64,64,0.12)',
                  border: '1px solid rgba(232,64,64,0.35)',
                  color: RIVAL_COLOR,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}
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
                style={{
                  background: 'rgba(61,126,240,0.12)',
                  border: '1px solid rgba(61,126,240,0.35)',
                  color: OWN_COLOR,
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}
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

      {/* Unit select modal */}
      {modal && (
        <UnitSelectModal
          side={modal}
          onSelect={bt => addUnit(bt, modal)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
