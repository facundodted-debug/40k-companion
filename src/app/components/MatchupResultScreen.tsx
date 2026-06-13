import React, { useState, useEffect, useMemo } from 'react';
import { Shield, AlertTriangle, Target, ChevronDown, RefreshCw, Skull, Swords } from 'lucide-react';
import { ScreenHeader, FactionBadge } from './ScreenHeader';
import { OpponentUnit, UnitWeapon, ArmyList } from './shared';
import { SavedList } from '../../store/lists';
import { analyzeMatchup } from '../../engine/matchup';

interface MatchupResultScreenProps {
  ownList: SavedList | null;
  rivalList: SavedList | null;
  onBack: () => void;
  onNewMatchup: () => void;
}

// ── Loading state ──────────────────────────────────────────────────────────────

function LoadingState({ ownName, rivalName }: { ownName: string; rivalName: string }) {
  const steps = ['Analizando sinergia…', 'Calculando ventajas…', 'Generando plan de juego…'];
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100;
        return p + 3;
      });
    }, 50);
    const stepInterval = setInterval(() => {
      setStepIdx(s => Math.min(s + 1, steps.length - 1));
    }, 900);
    return () => { clearInterval(interval); clearInterval(stepInterval); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8 text-center">
      {/* Rotating crest */}
      <div style={{ position: 'relative', width: 80, height: 80 }}>
        <svg viewBox="0 0 80 80" style={{ width: 80, height: 80, animation: 'spin 3s linear infinite' }}>
          <polygon points="40,4 56,14 56,66 40,76 24,66 24,14" fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.5" />
          <polygon points="40,16 50,22 50,58 40,64 30,58 30,22" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
          <circle cx="40" cy="40" r="8" fill="var(--primary)" opacity="0.2" />
          <circle cx="40" cy="40" r="4" fill="var(--primary)" opacity="0.6" />
        </svg>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>

      <div className="w-full">
        <div className="flex justify-between items-center mb-2">
          <span style={{ fontSize: 13, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {steps[stepIdx]}
          </span>
          <span style={{ fontSize: 12, color: 'var(--primary)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>
            {Math.min(progress, 99)}%
          </span>
        </div>
        <div style={{ height: 4, background: 'var(--muted)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 2, transition: 'width 0.05s linear' }} />
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
        Cruzando datos de{' '}
        <span style={{ color: 'var(--own)' }}>{ownName}</span>
        {' '}vs{' '}
        <span style={{ color: '#e84040' }}>{rivalName}</span>
      </p>
    </div>
  );
}

// ── Opponent key units ─────────────────────────────────────────────────────────

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
        {/* Header */}
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

function OpponentUnitAccordion({ unit }: { unit: OpponentUnit }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid rgba(232,64,64,0.2)', borderRadius: 10, overflow: 'hidden', background: 'var(--card)' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: open ? 'rgba(232,64,64,0.08)' : 'transparent', transition: 'background 0.15s' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Skull size={13} style={{ color: '#e84040', flexShrink: 0 }} />
          <div className="text-left min-w-0">
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--foreground)', lineHeight: 1.1 }}>
              {unit.name}
            </p>
            <p style={{ fontSize: 10, color: 'var(--muted-foreground)', lineHeight: 1.2 }}>
              {unit.keywords.slice(0, 3).join(' · ')} · {unit.pts} pts
            </p>
          </div>
        </div>
        <ChevronDown
          size={15}
          style={{ color: 'var(--muted-foreground)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 8 }}
        />
      </button>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px 16px' }}>
          {/* Stats row */}
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

          {/* Weapons */}
          <WeaponTable weapons={unit.ranged} type="ranged" />
          <WeaponTable weapons={unit.melee} type="melee" />

          {/* Abilities */}
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

          {/* Considerations */}
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

          {/* Recommendations */}
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
      )}
    </div>
  );
}

// ── Main result screen ─────────────────────────────────────────────────────────

interface BlockProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  items: string[];
}

function AnalysisBlock({ icon, label, color, bgColor, borderColor, items }: BlockProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: bgColor, border: `1px solid ${borderColor}` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color }}>{icon}</div>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: 1,
                background: color,
                flexShrink: 0,
                marginTop: 6,
                transform: 'rotate(45deg)',
              }}
            />
            <p style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.5 }}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function isArmyList(list: SavedList): list is ArmyList {
  return 'faction' in list && 'keyUnits' in list;
}

export function MatchupResultScreen({ ownList, rivalList, onBack, onNewMatchup }: MatchupResultScreenProps) {
  const [loading, setLoading] = useState(true);

  const analysis = useMemo(() => analyzeMatchup({ ownList, rivalList }), [ownList, rivalList]);

  const ownAbbr = ownList && isArmyList(ownList) ? ownList.faction.abbr : '???';

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        title="Resultado Matchup"
        onBack={onBack}
        right={
          !loading && (
            <button
              onClick={onNewMatchup}
              style={{ color: 'var(--primary)', fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <RefreshCw size={12} />
              Nuevo
            </button>
          )
        }
      />

      {loading ? (
        <LoadingState ownName={analysis.ownName} rivalName={analysis.rivalName} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* VS header */}
          <div
            className="flex items-center justify-between px-4 py-3 mx-4 mt-4 rounded-lg"
            style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-2">
              <FactionBadge abbr={ownAbbr} color="var(--own)" size="sm" />
              <div>
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', lineHeight: 1 }}>
                  {analysis.ownName}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>{analysis.ownDetachmentName}</p>
              </div>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.08em' }}>VS</span>
            <div className="flex items-center gap-2 flex-row-reverse">
              <FactionBadge abbr={analysis.rivalAbbr} color={analysis.rivalColor} size="sm" />
              <div className="text-right">
                <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', lineHeight: 1 }}>
                  {analysis.rivalName}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>
                  {analysis.rivalDetachmentName}
                </p>
              </div>
            </div>
          </div>

          {!analysis.ownDataAvailable && (
            <p className="mx-4 mt-3" style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              De momento no hay información sobre {analysis.ownName}.
            </p>
          )}
          {!analysis.rivalDataAvailable && (
            <p className="mx-4 mt-3" style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              De momento no hay información sobre {analysis.rivalName}.
            </p>
          )}

          {/* Analysis blocks */}
          <div className="flex flex-col gap-3 px-4 mt-4">
            <AnalysisBlock
              icon={<Shield size={16} />}
              label="Fortalezas"
              color="#2db57c"
              bgColor="rgba(45,181,124,0.1)"
              borderColor="rgba(45,181,124,0.25)"
              items={analysis.strengths}
            />
            <AnalysisBlock
              icon={<AlertTriangle size={16} />}
              label="Debilidades"
              color="#e84040"
              bgColor="rgba(232,64,64,0.1)"
              borderColor="rgba(232,64,64,0.25)"
              items={analysis.weaknesses}
            />
            <AnalysisBlock
              icon={<Target size={16} />}
              label="Plan de juego"
              color="#6e45e2"
              bgColor="rgba(110,69,226,0.1)"
              borderColor="rgba(110,69,226,0.25)"
              items={analysis.gameplan}
            />
          </div>

          {/* Opponent key units */}
          <div className="px-4 mt-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Skull size={14} style={{ color: '#e84040' }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--foreground)' }}>
                Unidades clave del oponente
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {analysis.opponentUnits.length === 0 && (
                <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                  De momento no hay información sobre {analysis.rivalName}.
                </p>
              )}
              {analysis.opponentUnits.map((unit, i) => (
                <OpponentUnitAccordion key={i} unit={unit} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
