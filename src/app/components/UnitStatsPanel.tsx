import { AlertTriangle, Target, Swords } from 'lucide-react';
import { OpponentUnit, UnitWeapon } from './shared';

// ── Stats / weapons (compartido con MatchupResultScreen y MyListsScreen) ────────

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: 'var(--foreground)', letterSpacing: '0.02em' }}>
        {value}
      </span>
    </div>
  );
}

function WeaponTable({ weapons, type }: { weapons: UnitWeapon[]; type: 'ranged' | 'melee' }) {
  if (weapons.length === 0) return null;
  const skillLabel = type === 'ranged' ? 'BS' : 'WS';
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1.5">
        {type === 'ranged'
          ? <Target size={10} style={{ color: 'var(--muted-foreground)' }} />
          : <Swords size={10} style={{ color: 'var(--muted-foreground)' }} />}
        <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {type === 'ranged' ? 'Armas a distancia' : 'Armas cuerpo a cuerpo'}
        </span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex px-2 py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ flex: 1, fontSize: 8, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Nombre</span>
          {['Rng', 'A', skillLabel, 'S', 'AP', 'D'].map(h => (
            <span key={h} style={{ width: 26, textAlign: 'center', fontSize: 8, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>
        {weapons.map((w, i) => (
          <div key={i} className="flex items-center px-2 py-1.5" style={{ borderBottom: i < weapons.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <span style={{ flex: 1, fontSize: 11, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.01em' }}>{w.name}</span>
            {[w.range, w.a, w.skill, w.s, w.ap, w.d].map((v, vi) => (
              <span key={vi} style={{ width: 26, textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif" }}>{v}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Panel completo de stats/armas/habilidades/consideraciones de una unidad — usado
// tanto dentro del accordion de MatchupResultScreen como en el modal de Mis Listas.
export function UnitStatsPanel({ unit }: { unit: OpponentUnit }) {
  return (
    <div>
      <div
        className="flex justify-between px-3 py-2.5 rounded-lg mb-4"
        style={{ background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.15)' }}
      >
        <StatCell label="M" value={unit.stats.m} />
        <StatCell label="T" value={unit.stats.t} />
        <StatCell label="Sv" value={unit.stats.sv} />
        <StatCell label="W" value={unit.stats.w} />
        <StatCell label="Ld" value={unit.stats.ld} />
        <StatCell label="OC" value={unit.stats.oc} />
      </div>

      <WeaponTable weapons={unit.ranged} type="ranged" />
      <WeaponTable weapons={unit.melee} type="melee" />

      {unit.abilities.length > 0 && (
        <div className="mb-4">
          <span style={{ fontSize: 9, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Habilidades
          </span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {unit.abilities.map((a, i) => (
              <span key={i} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(110,69,226,0.15)', border: '1px solid rgba(110,69,226,0.3)', color: '#a78bfa', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="p-3 rounded-lg mb-2"
        style={{ background: 'rgba(232,64,64,0.07)', border: '1px solid rgba(232,64,64,0.18)' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertTriangle size={11} style={{ color: '#e84040' }} />
          <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#e84040' }}>
            Consideraciones
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--foreground)', lineHeight: 1.55 }}>{unit.considerations}</p>
      </div>

      <div
        className="p-3 rounded-lg"
        style={{ background: 'rgba(110,69,226,0.09)', border: '1px solid rgba(110,69,226,0.25)' }}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <Target size={11} style={{ color: '#6e45e2' }} />
          <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a78bfa' }}>
            Recomendaciones
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--foreground)', lineHeight: 1.55 }}>{unit.recommendations}</p>
      </div>
    </div>
  );
}
