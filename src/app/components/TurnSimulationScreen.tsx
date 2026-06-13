import React, { useState, useRef, useCallback } from 'react';
import { ChevronRight, RotateCcw, X } from 'lucide-react';
import { Mission } from './shared';
import { PlaceableItem, TokenShape, getItemRadius } from './DeploymentBoardScreen';
import { ScreenHeader } from './ScreenHeader';
import { MISSION_MAPS } from './missionMaps';

const BW = 600, BH = 440;
const OWN_COLOR = '#3d7ef0';
const RIVAL_COLOR = '#e84040';

// ── D6 SVG face ────────────────────────────────────────────────────────────────
const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-6, -6], [6, 6]],
  3: [[-6, -6], [0, 0], [6, 6]],
  4: [[-6, -6], [6, -6], [-6, 6], [6, 6]],
  5: [[-6, -6], [6, -6], [0, 0], [-6, 6], [6, 6]],
  6: [[-6, -6], [6, -6], [-6, 0], [6, 0], [-6, 6], [6, 6]],
};

function D6Face({ value, size = 36 }: { value: number; size?: number }) {
  const dots = DOT_POSITIONS[value] ?? DOT_POSITIONS[1];
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`-${r} -${r} ${size} ${size}`}>
      <rect
        x={-r + 2} y={-r + 2} width={size - 4} height={size - 4} rx={(size - 4) * 0.2}
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
      />
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={size * 0.075} fill="rgba(255,255,255,0.85)" />
      ))}
    </svg>
  );
}

// ── Dice roll modal ────────────────────────────────────────────────────────────
function DiceModal({ onClose }: { onClose: () => void }) {
  const [count, setCount] = useState(6);
  const [results, setResults] = useState<number[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const grouped: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  results.forEach(r => { grouped[r]++; });

  const rollDice = () => {
    setSelected(new Set());
    setResults(Array.from({ length: count }, () => Math.ceil(Math.random() * 6)));
  };

  const reroll = () => {
    if (selected.size === 0) return;
    const kept = results.filter(r => !selected.has(r));
    const rerollCount = [...selected].reduce((sum, face) => sum + grouped[face], 0);
    const fresh = Array.from({ length: rerollCount }, () => Math.ceil(Math.random() * 6));
    setResults([...kept, ...fresh]);
    setSelected(new Set());
  };

  const toggleSelect = (face: number) => {
    if (grouped[face] === 0) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(face) ? next.delete(face) : next.add(face);
      return next;
    });
  };

  return (
    <div
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40, display: 'flex', alignItems: 'flex-end' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', background: 'var(--card)', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', padding: '20px 16px 32px', boxShadow: '0 -8px 40px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 20px' }} />
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ fontSize: 18, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Calcular tirada
          </h3>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)', padding: 4 }}><X size={16} /></button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label style={{ fontSize: 13, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Cant. de dados
          </label>
          <input
            type="number" min={1} max={30} value={count}
            onChange={e => { setCount(Math.max(1, Math.min(30, parseInt(e.target.value) || 1))); setResults([]); }}
            style={{ width: 70, background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, color: 'var(--foreground)', fontSize: 18, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", textAlign: 'center', padding: '6px 8px', outline: 'none' }}
          />
          <button onClick={rollDice} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
            style={{ background: 'var(--accent)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Lanzar
          </button>
        </div>

        <div style={{ minHeight: 80, padding: '12px 10px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
          {results.length === 0 ? (
            <div className="flex items-center justify-center" style={{ minHeight: 56 }}>
              <span style={{ fontSize: 12, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Presioná Lanzar</span>
            </div>
          ) : (
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map(face => {
                const n = grouped[face];
                const isSelected = selected.has(face);
                return (
                  <div key={face} className="flex flex-col items-center gap-1 flex-1" style={{ opacity: n > 0 ? 1 : 0.22 }}>
                    <D6Face value={face} size={32} />
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: n > 0 ? 'var(--foreground)' : 'var(--muted-foreground)' }}>×{n}</span>
                    <button
                      onClick={() => toggleSelect(face)}
                      disabled={n === 0}
                      style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${isSelected ? '#f0920e' : 'rgba(255,255,255,0.2)'}`, background: isSelected ? 'rgba(240,146,14,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: n > 0 ? 'pointer' : 'default', transition: 'all 0.15s', flexShrink: 0 }}
                    >
                      {isSelected && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#f0920e" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {selected.size > 0 && (
          <button onClick={reroll} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mt-3"
            style={{ background: 'rgba(240,146,14,0.15)', border: '1px solid rgba(240,146,14,0.4)', color: '#f0920e', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Rerollear ({[...selected].reduce((sum, f) => sum + grouped[f], 0)} dados)
          </button>
        )}

        {results.length > 0 && (
          <div className="flex justify-between mt-2">
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Total: {results.length}</span>
            <span style={{ fontSize: 11, color: 'var(--primary)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Suma: {results.reduce((a, b) => a + b, 0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Turn summary panel ─────────────────────────────────────────────────────────
interface TurnSummaryPanelProps {
  turn: number;
  onClose: () => void;
  onNextTurn: () => void;
}

function TurnSummaryPanel({ turn, onClose, onNextTurn }: TurnSummaryPanelProps) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', borderTop: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px 16px 0 0', padding: '16px 16px 24px', zIndex: 30, boxShadow: '0 -8px 32px rgba(0,0,0,0.5)' }}>
      <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '0 auto 16px' }} />
      <div className="flex items-center justify-between mb-4">
        <h3 style={{ fontSize: 18, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>Fin del Turno {turn}</h3>
        <button onClick={onClose} style={{ color: 'var(--muted-foreground)', fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Cerrar</button>
      </div>
      <button onClick={onNextTurn} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
        style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Turno {turn + 1}
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
interface TurnSimulationScreenProps {
  mission: Mission | null;
  initialItems: PlaceableItem[];
  onBack: () => void;
}

export function TurnSimulationScreen({ mission, initialItems, onBack }: TurnSimulationScreenProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [items, setItems] = useState<PlaceableItem[]>(() => initialItems);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [turn, setTurn] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [activeMode, setActiveMode] = useState<'move' | 'shoot' | 'charge'>('move');
  const [dieValue, setDieValue] = useState(6);
  const [showDiceModal, setShowDiceModal] = useState(false);

  const modeColors: Record<'move' | 'shoot' | 'charge', string> = {
    move: OWN_COLOR, shoot: '#f0920e', charge: '#e84040',
  };

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
    const pt = getBoardPoint(e);
    setDraggingId(id);
    setDragStart(pt);
    setSelectedId(id);
  }, [getBoardPoint]);

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

  const handleSVGPointerUp = useCallback(() => {
    setDraggingId(null);
    setDragStart(null);
  }, []);

  const rotateItem = useCallback((id: string, delta: number) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, rotation: (it.rotation + delta) % 360 } : it));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(it => it.id !== id));
    setSelectedId(null);
  }, []);

  const [chargeDice, setChargeDice] = useState<[number, number]>([6, 6]);

  const rollAdvanceDie = () => setDieValue(Math.ceil(Math.random() * 6));
  const rollChargeDice = () => setChargeDice([Math.ceil(Math.random() * 6), Math.ceil(Math.random() * 6)]);

  const resetBoard = () => {
    setItems(initialItems);
    setTurn(1);
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative' }}>
      <ScreenHeader
        title={`Turno ${turn}`}
        subtitle={mission?.name}
        onBack={onBack}
        right={
          <button
            onClick={resetBoard}
            style={{ color: 'var(--muted-foreground)', padding: '4px 6px', background: 'var(--muted)', borderRadius: 4 }}
          >
            <RotateCcw size={13} />
          </button>
        }
      />

      {/* Mode selector */}
      <div className="flex gap-2 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {(['move', 'shoot', 'charge'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setActiveMode(mode)}
            className="flex-1 py-1.5 rounded"
            style={{
              background: activeMode === mode ? modeColors[mode] + '22' : 'var(--muted)',
              border: `1px solid ${activeMode === mode ? modeColors[mode] + '60' : 'transparent'}`,
              color: activeMode === mode ? modeColors[mode] : 'var(--muted-foreground)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            }}
          >
            {mode === 'move' ? 'Mover' : mode === 'shoot' ? 'Disparar' : 'Cargar'}
          </button>
        ))}
        <button
          onClick={() => setShowSummary(true)}
          className="py-1.5 px-3 rounded"
          style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          Fin
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-hidden p-2">
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.09)', height: '100%' }}>
          {mission && MISSION_MAPS[mission.id] && (
            <>
              <img src={MISSION_MAPS[mission.id]} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.78)', pointerEvents: 'none' }} />
            </>
          )}
          <svg
            ref={svgRef}
            viewBox="0 0 440 600"
            style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none', cursor: draggingId ? 'grabbing' : 'default' }}
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
              <line x1={0} y1={BH / 2} x2={BW} y2={BH / 2} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="16,8" />

              {/* Movement ruler */}
              {draggingId && dragStart && (() => {
                const draggingItem = items.find(it => it.id === draggingId);
                if (!draggingItem) return null;
                const tx = draggingItem.x, ty = draggingItem.y;
                const dx = tx - dragStart.x, dy = ty - dragStart.y;
                const distSVG = Math.sqrt(dx * dx + dy * dy);
                const distInches = distSVG / 10;
                if (distSVG < 4) return null;
                const mx = (dragStart.x + tx) / 2, my = (dragStart.y + ty) / 2;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                const perpAngle = angle + 90;
                const tickLen = 5;
                const perpX = Math.cos((perpAngle * Math.PI) / 180) * tickLen;
                const perpY = Math.sin((perpAngle * Math.PI) / 180) * tickLen;
                const color = OWN_COLOR;
                return (
                  <g>
                    {/* Dashed ruler line */}
                    <line
                      x1={dragStart.x} y1={dragStart.y}
                      x2={tx} y2={ty}
                      stroke={color} strokeWidth="1.5" strokeDasharray="6,3" opacity="0.7"
                    />
                    {/* Start tick */}
                    <line x1={dragStart.x - perpX} y1={dragStart.y - perpY} x2={dragStart.x + perpX} y2={dragStart.y + perpY} stroke={color} strokeWidth="1.5" opacity="0.7" />
                    {/* End tick */}
                    <line x1={tx - perpX} y1={ty - perpY} x2={tx + perpX} y2={ty + perpY} stroke={color} strokeWidth="1.5" opacity="0.7" />
                    {/* Distance label */}
                    <rect x={mx - 28} y={my - 14} width={56} height={28} rx={6} fill="rgba(13,14,18,0.95)" stroke={color} strokeWidth="1.5" />
                    <text x={mx} y={my + 6} fill={color} fontSize="16" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700" letterSpacing="0.02em">
                      {distInches.toFixed(1)}"
                    </text>
                  </g>
                );
              })()}

              {/* Empty hint */}
              {items.length === 0 && (
                <text x={BW / 2} y={BH / 2 + 5} textAnchor="middle" fill="rgba(255,255,255,0.18)" fontSize="18" fontFamily="Barlow Condensed, sans-serif" fontWeight="600" letterSpacing="0.06em">
                  SIN UNIDADES
                </text>
              )}

              {/* Unit tokens */}
              {items.map(item => {
                const isSelected = selectedId === item.id;
                const color = item.side === 'own' ? OWN_COLOR : RIVAL_COLOR;
                const tokenR = getItemRadius(item);
                const btnR = tokenR + 14;
                return (
                  <g key={item.id} transform={`translate(${item.x},${item.y})`} style={{ touchAction: 'none' }}>
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
                      <circle r={tokenR} fill="none" stroke={color} strokeWidth="1" strokeDasharray="4,3" opacity={0.6} />
                    )}

                    {/* Controls: rotate CCW, rotate CW, delete */}
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

      {/* Action row — Mover */}
      {activeMode === 'move' && (
        <div className="flex items-center gap-3 px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,14,18,0.95)' }}>
          <button
            onClick={rollAdvanceDie}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
            style={{ background: 'rgba(61,126,240,0.15)', border: '1px solid rgba(61,126,240,0.3)', color: OWN_COLOR, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Avanzar
          </button>
          <div onClick={rollAdvanceDie} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <D6Face value={dieValue} size={40} />
          </div>
        </div>
      )}

      {/* Action row — Cargar */}
      {activeMode === 'charge' && (
        <div className="flex items-center gap-3 px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,14,18,0.95)' }}>
          <button
            onClick={rollChargeDice}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
            style={{ background: 'rgba(232,64,64,0.15)', border: '1px solid rgba(232,64,64,0.35)', color: RIVAL_COLOR, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Cargar
          </button>
          <div className="flex gap-2 items-center" onClick={rollChargeDice} style={{ cursor: 'pointer', flexShrink: 0 }}>
            <D6Face value={chargeDice[0]} size={40} />
            <D6Face value={chargeDice[1]} size={40} />
          </div>
        </div>
      )}

      {/* Action row — Disparar */}
      {activeMode === 'shoot' && (
        <div className="flex items-center px-4 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(13,14,18,0.95)' }}>
          <button
            onClick={() => setShowDiceModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg"
            style={{ background: 'rgba(240,146,14,0.15)', border: '1px solid rgba(240,146,14,0.35)', color: '#f0920e', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Disparar
          </button>
        </div>
      )}

      {/* Turn summary sheet */}
      {showSummary && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 20 }} onClick={() => setShowSummary(false)}>
          <div onClick={e => e.stopPropagation()}>
            <TurnSummaryPanel
              turn={turn}
              onClose={() => setShowSummary(false)}
              onNextTurn={() => { setTurn(t => t + 1); setShowSummary(false); }}
            />
          </div>
        </div>
      )}

      {showDiceModal && <DiceModal onClose={() => setShowDiceModal(false)} />}
    </div>
  );
}
