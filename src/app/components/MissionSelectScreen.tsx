import { MISSIONS, Mission } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { MISSION_MAPS } from './missionMaps';

// ── Coordinate system ─────────────────────────────────────────────────────────
// SVG viewBox: "0 0 70 100" (portrait display)
// Content group transform: translate(0,100) rotate(-90)
// Inside the group, landscape space is 100 wide × 70 tall.
// Mapping: portrait_x = y_content, portrait_y = 100 - x_content

interface MissionSelectScreenProps {
  onSelect: (mission: Mission) => void;
  onBack: () => void;
}

// ── Terrain blob ──────────────────────────────────────────────────────────────
function Terrain({ x, y, w, h, rot = 0 }: { x: number; y: number; w: number; h: number; rot?: number }) {
  return (
    <rect
      x={-w / 2} y={-h / 2}
      width={w} height={h}
      rx={Math.min(w, h) * 0.38}
      fill="rgba(148,155,175,0.13)"
      stroke="rgba(200,208,228,0.26)"
      strokeWidth="0.55"
      transform={`translate(${x},${y}) rotate(${rot})`}
    />
  );
}

// ── No-man's-land objective — skull diamond ───────────────────────────────────
function SkullObj({ x, y }: { x: number; y: number }) {
  const s = 4.2;
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon
        points={`0,${-s} ${s * 0.82},0 0,${s} ${-s * 0.82},0`}
        fill="rgba(240,146,14,0.18)"
        stroke="rgba(240,146,14,0.85)"
        strokeWidth="0.75"
      />
      {/* Skull head */}
      <circle r={s * 0.31} fill="rgba(240,146,14,0.48)" />
      {/* Eyes */}
      <circle cx={-s * 0.13} cy={-s * 0.07} r={s * 0.10} fill="rgba(13,14,18,0.75)" />
      <circle cx={s * 0.13} cy={-s * 0.07} r={s * 0.10} fill="rgba(13,14,18,0.75)" />
    </g>
  );
}

// ── Deployment-zone castle objective ──────────────────────────────────────────
function CastleObj({ x, y, color }: { x: number; y: number; color: string }) {
  const s = 3.4;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={s + 1.8} fill={color + '20'} stroke={color} strokeWidth="0.85" />
      {/* Tower base */}
      <rect x={-s * 0.68} y={-s * 0.48} width={s * 1.36} height={s * 1.12} fill={color + '62'} rx="0.5" />
      {/* Three merlons */}
      <rect x={-s * 0.62} y={-s * 1.08} width={s * 0.33} height={s * 0.65} fill={color} rx="0.3" />
      <rect x={-s * 0.14} y={-s * 1.08} width={s * 0.33} height={s * 0.65} fill={color} rx="0.3" />
      <rect x={s * 0.29} y={-s * 1.08} width={s * 0.33} height={s * 0.65} fill={color} rx="0.3" />
    </g>
  );
}

// ── Deployment zone fills ─────────────────────────────────────────────────────
const RC = 'rgba(232,64,64,';   // rival color prefix
const OC = 'rgba(61,126,240,';  // own color prefix

function Zones({ d }: { d: Mission['deployment'] }) {
  switch (d) {
    case 'horizontal':
      return (
        <>
          <rect x={0} y={0} width={100} height={20} fill={RC + '0.30)'} />
          <rect x={0} y={50} width={100} height={20} fill={OC + '0.26)'} />
          <line x1={0} y1={20} x2={100} y2={20} stroke={RC + '0.55)'} strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1={0} y1={50} x2={100} y2={50} stroke={OC + '0.5)'} strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1={0} y1={35} x2={100} y2={35} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" strokeDasharray="6,4" />
        </>
      );
    case 'diagonal':
      return (
        <>
          <polygon points="0,0 100,0 100,22 55,32 0,37" fill={RC + '0.28)'} />
          <polygon points="0,70 100,70 100,48 45,38 0,33" fill={OC + '0.24)'} />
          <polyline points="0,37 55,32 100,22" fill="none" stroke={RC + '0.5)'} strokeWidth="0.6" strokeDasharray="3,2" />
          <polyline points="0,33 45,38 100,48" fill="none" stroke={OC + '0.45)'} strokeWidth="0.6" strokeDasharray="3,2" />
        </>
      );
    case 'corner':
      return (
        <>
          <path d="M 0,0 L 62,0 A 62,52 0 0,1 0,52 Z" fill={RC + '0.28)'} />
          <path d="M 100,70 L 38,70 A 62,52 0 0,1 100,18 Z" fill={OC + '0.24)'} />
          <path d="M 62,0 A 62,52 0 0,1 0,52" fill="none" stroke={RC + '0.5)'} strokeWidth="0.6" strokeDasharray="3,2" />
          <path d="M 38,70 A 62,52 0 0,1 100,18" fill="none" stroke={OC + '0.45)'} strokeWidth="0.6" strokeDasharray="3,2" />
        </>
      );
    case 'hammer':
      return (
        <>
          <rect x={0} y={0} width={20} height={70} fill={RC + '0.30)'} />
          <rect x={80} y={0} width={20} height={70} fill={OC + '0.26)'} />
          <line x1={20} y1={0} x2={20} y2={70} stroke={RC + '0.55)'} strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1={80} y1={0} x2={80} y2={70} stroke={OC + '0.5)'} strokeWidth="0.6" strokeDasharray="3,2" />
          <line x1={50} y1={0} x2={50} y2={70} stroke="rgba(255,255,255,0.04)" strokeWidth="0.4" strokeDasharray="6,4" />
        </>
      );
    default:
      return null;
  }
}

// ── Layout data (in 100×70 landscape content space) ──────────────────────────
interface T { x: number; y: number; w: number; h: number; rot?: number }
interface O { x: number; y: number; k: 'skull' | 'r' | 'b' }

const LAYOUTS: Record<string, { t: T[]; o: O[] }> = {
  // Sweeping Engagement — horizontal, 5 obj
  // Portrait view: LEFT=rival, RIGHT=own, CENTER strip=NML
  sweep: {
    t: [
      // Rival zone (y=0-20)
      { x: 30, y: 6, w: 16, h: 9, rot: 15 }, { x: 72, y: 8, w: 14, h: 8, rot: -25 },
      // NML (y=20-50)
      { x: 15, y: 26, w: 14, h: 8, rot: -10 }, { x: 42, y: 23, w: 12, h: 7, rot: 20 },
      { x: 55, y: 35, w: 18, h: 10, rot: -5 }, { x: 80, y: 30, w: 14, h: 8, rot: -20 },
      { x: 25, y: 44, w: 12, h: 7, rot: 8 }, { x: 65, y: 46, w: 12, h: 7, rot: 14 },
      // Own zone (y=50-70)
      { x: 20, y: 61, w: 14, h: 8, rot: 20 }, { x: 74, y: 63, w: 16, h: 8, rot: -14 },
    ],
    o: [
      { x: 50, y: 10, k: 'r' }, { x: 50, y: 62, k: 'b' },
      { x: 80, y: 35, k: 'skull' }, { x: 50, y: 35, k: 'skull' }, { x: 20, y: 35, k: 'skull' },
    ],
  },

  // Dawn of War — horizontal, 5 obj (different terrain layout)
  dawn: {
    t: [
      { x: 18, y: 7, w: 18, h: 9, rot: -10 }, { x: 72, y: 9, w: 14, h: 8, rot: 20 },
      { x: 14, y: 27, w: 14, h: 8, rot: 15 }, { x: 38, y: 24, w: 16, h: 9, rot: -5 },
      { x: 60, y: 35, w: 18, h: 10, rot: 5 }, { x: 85, y: 35, w: 14, h: 8, rot: -20 },
      { x: 30, y: 45, w: 14, h: 8, rot: 8 }, { x: 70, y: 47, w: 14, h: 8, rot: -12 },
      { x: 50, y: 7, w: 12, h: 6, rot: 25 }, { x: 48, y: 63, w: 14, h: 8, rot: -5 },
    ],
    o: [
      { x: 50, y: 9, k: 'r' }, { x: 50, y: 63, k: 'b' },
      { x: 80, y: 35, k: 'skull' }, { x: 50, y: 35, k: 'skull' }, { x: 20, y: 35, k: 'skull' },
    ],
  },

  // Vital Ground — hammer, 5 obj
  // Portrait: TOP=own, BOTTOM=rival, CENTER strip=NML (vertical)
  vital: {
    t: [
      // Rival zone (x=0-20)
      { x: 8, y: 12, w: 12, h: 7, rot: -25 }, { x: 8, y: 55, w: 12, h: 7, rot: 20 },
      // NML (x=20-80)
      { x: 27, y: 14, w: 14, h: 8, rot: -15 }, { x: 32, y: 28, w: 14, h: 9, rot: 8 },
      { x: 28, y: 45, w: 14, h: 8, rot: -10 }, { x: 53, y: 15, w: 12, h: 7, rot: 15 },
      { x: 50, y: 38, w: 14, h: 9, rot: -5 },
      // Own zone (x=80-100)
      { x: 88, y: 10, w: 12, h: 7, rot: 20 }, { x: 88, y: 54, w: 12, h: 7, rot: -18 },
    ],
    o: [
      { x: 10, y: 35, k: 'r' }, { x: 90, y: 35, k: 'b' },
      { x: 35, y: 12, k: 'skull' }, { x: 50, y: 35, k: 'skull' }, { x: 35, y: 57, k: 'skull' },
    ],
  },

  // Vanguard Strike — diagonal, 5 obj
  // Rival: upper-left of content → bottom-left in portrait after rotation
  // Own: lower-right of content → upper-right in portrait
  vanguard: {
    t: [
      // Rival zone (upper-left of content)
      { x: 75, y: 8, w: 16, h: 9, rot: -20 }, { x: 68, y: 30, w: 12, h: 7, rot: 8 },
      // NML strip
      { x: 35, y: 20, w: 14, h: 8, rot: 12 }, { x: 50, y: 35, w: 18, h: 10, rot: -6 },
      { x: 32, y: 18, w: 12, h: 7, rot: -18 },
      // Own zone (lower-right of content)
      { x: 22, y: 48, w: 14, h: 8, rot: 15 }, { x: 18, y: 63, w: 14, h: 8, rot: -20 },
    ],
    o: [
      { x: 80, y: 8, k: 'r' }, { x: 20, y: 62, k: 'b' },
      { x: 70, y: 12, k: 'skull' }, { x: 50, y: 35, k: 'skull' }, { x: 30, y: 58, k: 'skull' },
    ],
  },

  // Search & Destroy — diagonal, 6 obj
  search: {
    t: [
      { x: 72, y: 8, w: 16, h: 8, rot: -20 }, { x: 28, y: 22, w: 14, h: 9, rot: 10 },
      { x: 65, y: 42, w: 12, h: 7, rot: -5 }, { x: 45, y: 14, w: 14, h: 8, rot: 15 },
      { x: 50, y: 35, w: 16, h: 10, rot: -8 }, { x: 34, y: 55, w: 14, h: 8, rot: 12 },
      { x: 22, y: 18, w: 12, h: 7, rot: -25 }, { x: 18, y: 57, w: 14, h: 8, rot: 18 },
    ],
    o: [
      { x: 80, y: 8, k: 'r' }, { x: 20, y: 62, k: 'b' },
      { x: 70, y: 12, k: 'skull' }, { x: 50, y: 35, k: 'skull' },
      { x: 30, y: 58, k: 'skull' }, { x: 30, y: 35, k: 'skull' },
    ],
  },

  // Crucible of Battle — corner, 6 obj
  // Rival arc: bottom-left in portrait / Own arc: upper-right in portrait
  crucible: {
    t: [
      // Rival arc zone (low x, low y in content = bottom-left in portrait)
      { x: 18, y: 12, w: 18, h: 10, rot: -30 }, { x: 12, y: 38, w: 12, h: 7, rot: 10 },
      // NML
      { x: 36, y: 22, w: 14, h: 8, rot: 5 }, { x: 55, y: 10, w: 14, h: 8, rot: -10 },
      { x: 52, y: 38, w: 16, h: 9, rot: 8 },
      // Own arc zone (high x, high y in content = upper-right in portrait)
      { x: 75, y: 22, w: 12, h: 7, rot: -15 }, { x: 85, y: 55, w: 14, h: 8, rot: 20 },
      { x: 44, y: 58, w: 12, h: 7, rot: -5 },
    ],
    o: [
      { x: 20, y: 15, k: 'r' }, { x: 80, y: 55, k: 'b' },
      { x: 70, y: 10, k: 'skull' }, { x: 50, y: 35, k: 'skull' },
      { x: 30, y: 60, k: 'skull' }, { x: 25, y: 50, k: 'skull' },
    ],
  },
};

const DEPLOYMENT_LABELS: Record<Mission['deployment'], string> = {
  horizontal: 'Frontal largo',
  diagonal: 'Diagonal',
  corner: 'Esquinas',
  hammer: 'Hammer & Anvil',
};

// ── Mission map thumbnail ─────────────────────────────────────────────────────
function MissionPreview({ missionId }: { missionId: string }) {
  const img = MISSION_MAPS[missionId];
  return (
    <div style={{ position: 'relative', width: '100%', paddingBottom: '142%', borderRadius: 4, overflow: 'hidden', background: '#0d0e12' }}>
      {img && (
        <img
          src={img}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function MissionSelectScreen({ onSelect, onBack }: MissionSelectScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Elegir Misión" onBack={onBack} subtitle="Seleccioná el mapa de despliegue" />

      <div className="flex-1 overflow-y-auto p-4">
        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
          Misiones disponibles — Temporada 11
        </p>
        <div className="grid grid-cols-2 gap-3">
          {MISSIONS.map(m => (
            <button
              key={m.id}
              onClick={() => onSelect(m)}
              className="flex flex-col gap-2 p-3 rounded-lg text-left"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)', transition: 'border-color 0.15s' }}
            >
              {/* Map preview */}
              <div style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <MissionPreview missionId={m.id} />
              </div>

              {/* Info */}
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', lineHeight: 1.2, marginBottom: 2 }}>
                  {m.name}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted-foreground)', marginBottom: 4 }}>{m.subtitle}</p>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--muted-foreground)', background: 'var(--muted)', borderRadius: 3, padding: '1px 5px' }}>
                    {DEPLOYMENT_LABELS[m.deployment]}
                  </span>
                  <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(240,146,14,0.1)', border: '1px solid rgba(240,146,14,0.2)', borderRadius: 3, padding: '1px 5px' }}>
                    {m.objectives} obj.
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
