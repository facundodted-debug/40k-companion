import { useState } from 'react';
import { Search, Check, ChevronRight, X, BookOpen, Swords, Shield, Zap } from 'lucide-react';
import { getDetachmentDescription } from './DetachmentDescriptions';
import { UNITS, Unit, ArmyList } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { FACTION_CATEGORIES, FactionAccordion, SubFaction, FactionCategory } from './FactionData';
import { motion, AnimatePresence } from 'motion/react';
import { useListStore } from '../../store/lists';

type Step = 'faction' | 'config' | 'detachment' | 'units';

interface BattleSize {
  id: 'incursion' | 'strike-force' | 'onslaught';
  label: string;
  pts: number;
  dp: number;
  description: string;
}

const BATTLE_SIZES: BattleSize[] = [
  { id: 'incursion',    label: 'Incursion',    pts: 1000, dp: 2, description: 'Escaramuza táctica de élite' },
  { id: 'strike-force', label: 'Strike Force', pts: 2000, dp: 3, description: 'Batalla estándar de campaña' },
  { id: 'onslaught',   label: 'Onslaught',    pts: 3000, dp: 3, description: 'Guerra total sin cuartel' },
];

// DP cost for each detachment (1–3). Unlisted detachments default to 1.
const DETACHMENT_DP: Record<string, number> = {
  'Gladius Task Force':   1,
  'Spearhead Assault':    1,
  'Vanguard Spearhead':   1,
  'Anvil Siege Force':    1,
  'Righteous Crusaders':  2,
  'Sons of Sanguinius':   2,
  'Awakened Dynasty':     1,
  'Canoptek Court':       1,
  'Hyper Dynasty':        2,
  'Starshatter Arsenal':  2,
  'Crusher Stampede':     2,
  'Invasion Fleet':       2,
  'Synaptic Nexus':       3,
  'Raiders from the Warp': 2,
  'Tide of Traitors':     1,
  'Pactbound Zealots':    3,
};

function getDetachmentDP(name: string): number {
  return DETACHMENT_DP[name] ?? 1;
}

interface CreateListScreenProps {
  onBack: () => void;
  onSave: () => void;
}

// ── Step indicator ─────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ['faction', 'config', 'detachment', 'units'];
  const labels = ['Facción', 'Config', 'Detach.', 'Unidades'];
  const currentIdx = steps.indexOf(step);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'contents' }}>
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex items-center justify-center rounded"
              style={{
                width: 22,
                height: 22,
                background: i < currentIdx ? 'var(--primary)' : i === currentIdx ? 'var(--accent)' : 'var(--muted)',
                border: `1px solid ${i === currentIdx ? 'var(--accent)' : 'transparent'}`,
              }}
            >
              {i < currentIdx ? (
                <Check size={11} style={{ color: 'white' }} />
              ) : (
                <span style={{ fontSize: 10, fontWeight: 700, color: i === currentIdx ? 'white' : 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {i + 1}
                </span>
              )}
            </div>
            <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: i === currentIdx ? 'var(--accent)' : i < currentIdx ? 'var(--primary)' : 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
              {labels[i]}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ height: 1, background: i < currentIdx ? 'var(--primary)' : 'rgba(255,255,255,0.08)', margin: '0 4px', marginBottom: 14 }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Unit token shape ───────────────────────────────────────────────────────────

function UnitTypeShape({ type }: { type: Unit['type'] }) {
  const size = 14;
  const colors: Record<Unit['type'], string> = {
    infantry: '#3d7ef0',
    vehicle: '#f0920e',
    monster: '#e84040',
    character: '#6e45e2',
    special: '#2db57c',
  };
  const color = colors[type];

  if (type === 'infantry') return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <rect x="1" y="1" width="12" height="12" rx="2" fill={color + '30'} stroke={color} strokeWidth="1.5" />
    </svg>
  );
  if (type === 'vehicle') return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill={color + '30'} stroke={color} strokeWidth="1.5" />
    </svg>
  );
  if (type === 'monster') return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill={color + '30'} stroke={color} strokeWidth="1.5" strokeDasharray="2,1" />
    </svg>
  );
  if (type === 'character') return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <polygon points="7,1 13,7 7,13 1,7" fill={color + '30'} stroke={color} strokeWidth="1.5" />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <polygon points="7,1 9,5 13,5 10,8 11,13 7,10 3,13 4,8 1,5 5,5" fill={color + '30'} stroke={color} strokeWidth="1" />
    </svg>
  );
}

// ── DP pip display ─────────────────────────────────────────────────────────────

function DPPips({ cost, color }: { cost: number; color: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 1,
            background: i <= cost ? color : 'rgba(255,255,255,0.12)',
            transform: 'rotate(45deg)',
            transition: 'background 0.15s',
          }}
        />
      ))}
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function CreateListScreen({ onBack, onSave }: CreateListScreenProps) {
  const { addList } = useListStore();
  const [step, setStep] = useState<Step>('faction');
  const [listName, setListName] = useState('');

  // Faction step
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedSubfaction, setSelectedSubfaction] = useState<SubFaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FactionCategory | null>(null);

  // Config step
  const [battleSize, setBattleSize] = useState<BattleSize | null>(null);

  // Detachment step — multi-select
  const [selectedDetachments, setSelectedDetachments] = useState<string[]>([]);

  // Units step
  const [selectedUnits, setSelectedUnits] = useState<Unit[]>([]);
  const [unitSearch, setUnitSearch] = useState('');

  const dpBudget = battleSize?.dp ?? 3;
  const dpSpent = selectedDetachments.reduce((sum, d) => sum + getDetachmentDP(d), 0);

  const subfactionUnits: Unit[] = (() => {
    if (!selectedSubfaction) return [];
    if (UNITS[selectedSubfaction.id]) return UNITS[selectedSubfaction.id];
    if (selectedCategory?.id === 'space-marines') return UNITS['space-marines'] || [];
    if (selectedSubfaction.id === 'necrons') return UNITS['necrons'] || [];
    return UNITS['space-marines'] || [];
  })();

  const filteredUnits = subfactionUnits.filter(u =>
    u.name.toLowerCase().includes(unitSearch.toLowerCase()) ||
    u.shortName.toLowerCase().includes(unitSearch.toLowerCase())
  );

  const toggleUnit = (unit: Unit) => {
    setSelectedUnits(prev => {
      if (prev.find(u => u.id === unit.id)) return prev.filter(u => u.id !== unit.id);
      if (prev.length >= 5) return prev;
      return [...prev, unit];
    });
  };

  const toggleDetachment = (det: string) => {
    const cost = getDetachmentDP(det);
    setSelectedDetachments(prev => {
      if (prev.includes(det)) return prev.filter(d => d !== det);
      if (dpSpent + cost > dpBudget) return prev; // over budget
      return [...prev, det];
    });
  };

  const canAdvance =
    step === 'faction' ? !!selectedSubfaction :
    step === 'config' ? !!battleSize :
    step === 'detachment' ? selectedDetachments.length > 0 :
    selectedUnits.length >= 3;

  const factionColor = selectedCategory?.color ?? 'var(--primary)';

  const handleAdvance = () => {
    if (step === 'faction' && selectedSubfaction) setStep('config');
    else if (step === 'config' && battleSize) setStep('detachment');
    else if (step === 'detachment' && selectedDetachments.length > 0) setStep('units');
    else if (step === 'units' && canAdvance && selectedSubfaction && selectedCategory && battleSize) {
      const detachmentName = selectedDetachments[0];
      const newList: ArmyList = {
        id: crypto.randomUUID(),
        name: listName.trim() || `${selectedSubfaction.name} — ${battleSize.label}`,
        faction: {
          id: selectedSubfaction.id,
          name: selectedSubfaction.name,
          abbr: selectedSubfaction.name.slice(0, 3).toUpperCase(),
          color: selectedCategory.color,
        },
        detachment: {
          id: detachmentName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: detachmentName,
          factionId: selectedSubfaction.id,
        },
        keyUnits: selectedUnits,
        totalPoints: battleSize.pts,
      };
      addList(newList);
      onSave();
    }
  };

  const handleBack = () => {
    if (step === 'faction') onBack();
    else if (step === 'config') setStep('faction');
    else if (step === 'detachment') setStep('config');
    else setStep('detachment');
  };

  const battleSizeIcons = {
    incursion: <Shield size={20} />,
    'strike-force': <Swords size={20} />,
    onslaught: <Zap size={20} />,
  };

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        title={
          step === 'faction' ? 'Facción' :
          step === 'config' ? 'Configuración' :
          step === 'detachment' ? 'Detachment' :
          'Unidades clave'
        }
        onBack={handleBack}
        subtitle={step === 'units' ? `${selectedUnits.length}/5 seleccionadas (mín. 3)` : undefined}
      />
      <StepIndicator step={step} />

      <div className="flex-1 overflow-y-auto">

        {/* ── Step 1: Faction accordion ── */}
        {step === 'faction' && (
          <div className="p-4 flex flex-col gap-4">
            <input
              value={listName}
              onChange={e => setListName(e.target.value)}
              placeholder="Nombre de la lista (opcional)"
              style={{
                width: '100%',
                background: 'var(--input-background)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '10px 14px',
                color: 'var(--foreground)',
                fontSize: 14,
                outline: 'none',
              }}
            />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Tu facción
                </p>
                {selectedSubfaction && (
                  <button
                    onClick={() => { setSelectedSubfaction(null); setSelectedCategory(null); }}
                    className="flex items-center gap-1 ml-auto px-2 py-0.5 rounded"
                    style={{ background: 'rgba(232,64,64,0.12)', border: '1px solid rgba(232,64,64,0.25)', color: '#e84040' }}
                  >
                    <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.04em' }}>Limpiar</span>
                    <X size={10} />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {FACTION_CATEGORIES.map(cat => (
                  <FactionAccordion
                    key={cat.id}
                    category={cat}
                    selectedSubfaction={selectedSubfaction}
                    onSelect={(sub, c) => {
                      setSelectedSubfaction(sub);
                      setSelectedCategory(c);
                      setSelectedDetachments([]);
                      setSelectedUnits([]);
                    }}
                    isOpen={openAccordion === cat.id}
                    onToggle={() => setOpenAccordion(o => o === cat.id ? null : cat.id)}
                  />
                ))}
              </div>
            </div>

            <div style={{ height: 8 }} />
          </div>
        )}

        {/* ── Step 2: Config (battle size) ── */}
        {step === 'config' && (
          <div className="p-4 flex flex-col gap-4">
            {/* Faction pill */}
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: factionColor + '15', border: `1px solid ${factionColor}35` }}
            >
              <div style={{ width: 6, height: 6, borderRadius: 1, background: factionColor, transform: 'rotate(45deg)' }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: factionColor }}>
                {selectedSubfaction?.name}
              </span>
            </div>

            <div>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Battle Size
              </p>

              <div className="flex flex-col gap-3">
                {BATTLE_SIZES.map(bs => {
                  const isSel = battleSize?.id === bs.id;
                  return (
                    <button
                      key={bs.id}
                      onClick={() => setBattleSize(bs)}
                      className="flex items-center gap-4 p-4 rounded-xl text-left"
                      style={{
                        background: isSel ? factionColor + '14' : 'var(--card)',
                        border: `1px solid ${isSel ? factionColor + '70' : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.18s',
                      }}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background: isSel ? factionColor + '20' : 'var(--muted)',
                          border: `1px solid ${isSel ? factionColor + '40' : 'rgba(255,255,255,0.07)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSel ? factionColor : 'var(--muted-foreground)',
                          flexShrink: 0,
                          transition: 'all 0.18s',
                        }}
                      >
                        {battleSizeIcons[bs.id]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 17, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: isSel ? factionColor : 'var(--foreground)', transition: 'color 0.15s' }}>
                            {bs.label}
                          </span>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.03em' }}>
                            {bs.pts.toLocaleString()} pts
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 6 }}>
                          {bs.description}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <DPPips cost={bs.dp} color={isSel ? factionColor : 'rgba(255,255,255,0.35)'} />
                          <span style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: isSel ? factionColor : 'var(--muted-foreground)', transition: 'color 0.15s' }}>
                            {bs.dp} DP disponibles
                          </span>
                        </div>
                      </div>

                      {/* Check */}
                      {isSel && (
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: factionColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Check size={13} style={{ color: 'white' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Detachment (multi-select) ── */}
        {step === 'detachment' && selectedSubfaction && selectedCategory && (
          <div className="p-4">
            {/* Faction + battle size summary */}
            <div className="flex items-center gap-2 mb-4">
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-0"
                style={{ background: factionColor + '15', border: `1px solid ${factionColor}35` }}
              >
                <div style={{ width: 6, height: 6, borderRadius: 1, background: factionColor, transform: 'rotate(45deg)', flexShrink: 0 }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: factionColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedSubfaction.name}
                </span>
                {battleSize && (
                  <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
                    {battleSize.label}
                  </span>
                )}
              </div>
            </div>

            {/* Header row: label + DP counter */}
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Elegí el detachment
              </p>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                style={{
                  background: dpSpent >= dpBudget ? factionColor + '20' : 'var(--muted)',
                  border: `1px solid ${dpSpent >= dpBudget ? factionColor + '50' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                }}
              >
                <DPPips cost={dpSpent} color={factionColor} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: dpSpent >= dpBudget ? factionColor : 'var(--muted-foreground)', transition: 'color 0.2s' }}>
                  {dpSpent} / {dpBudget} DP
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {selectedSubfaction.detachments.map((det) => {
                const isSel = selectedDetachments.includes(det);
                const cost = getDetachmentDP(det);
                const wouldExceed = !isSel && dpSpent + cost > dpBudget;
                const desc = getDetachmentDescription(det);

                return (
                  <div
                    key={det}
                    style={{
                      borderRadius: 10,
                      overflow: 'hidden',
                      border: `1px solid ${isSel ? factionColor + '60' : wouldExceed ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)'}`,
                      background: isSel ? factionColor + '12' : 'var(--card)',
                      opacity: wouldExceed ? 0.45 : 1,
                      transition: 'border-color 0.18s, background 0.18s, opacity 0.18s',
                    }}
                  >
                    {/* Row header */}
                    <button
                      onClick={() => !wouldExceed && toggleDetachment(det)}
                      disabled={wouldExceed}
                      className="w-full flex items-center gap-3 p-4 text-left"
                    >
                      {/* Selection indicator */}
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          border: `1.5px solid ${isSel ? factionColor : 'rgba(255,255,255,0.2)'}`,
                          background: isSel ? factionColor : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'all 0.15s',
                        }}
                      >
                        {isSel && <Check size={10} style={{ color: 'white' }} />}
                      </div>

                      <span style={{
                        flex: 1,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 15,
                        fontWeight: isSel ? 700 : 500,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        color: isSel ? factionColor : 'var(--foreground)',
                        transition: 'color 0.15s',
                      }}>
                        {det}
                      </span>

                      {/* DP cost badge */}
                      <div className="flex items-center gap-1.5 mr-1">
                        <DPPips cost={cost} color={isSel ? factionColor : 'rgba(255,255,255,0.35)'} />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.03em', color: isSel ? factionColor : 'var(--muted-foreground)', minWidth: 20 }}>
                          {cost}dp
                        </span>
                      </div>

                      {!isSel && <BookOpen size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0, opacity: 0.4 }} />}
                    </button>

                    {/* Expanded description */}
                    <AnimatePresence initial={false}>
                      {isSel && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{
                            borderTop: `1px solid ${factionColor}25`,
                            padding: '14px 16px 16px',
                            background: 'rgba(0,0,0,0.2)',
                          }}>
                            <p style={{ fontSize: 12, color: 'rgba(236,238,244,0.75)', lineHeight: 1.65, marginBottom: 14 }}>
                              {desc.overview}
                            </p>
                            <div className="flex flex-col gap-3">
                              {desc.abilities.map((ability) => (
                                <div key={ability.name}>
                                  <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 3 }}>
                                    {ability.name}
                                  </p>
                                  <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(236,238,244,0.5)', lineHeight: 1.6, marginBottom: 4 }}>
                                    {ability.flavor}
                                  </p>
                                  <p style={{ fontSize: 12, color: 'rgba(236,238,244,0.85)', lineHeight: 1.55 }}>
                                    {ability.rule}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 4: Units ── */}
        {step === 'units' && selectedSubfaction && (
          <div className="p-4">
            <AnimatePresence>
              {selectedUnits.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4"
                >
                  <p style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                    Seleccionadas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedUnits.map(u => (
                      <button
                        key={u.id}
                        onClick={() => toggleUnit(u)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded"
                        style={{ background: factionColor + '20', border: `1px solid ${factionColor}50`, color: factionColor }}
                      >
                        <UnitTypeShape type={u.type} />
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{u.shortName}</span>
                        <X size={10} />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative mb-3">
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
              <input
                value={unitSearch}
                onChange={e => setUnitSearch(e.target.value)}
                placeholder="Buscar unidad..."
                style={{
                  width: '100%',
                  background: 'var(--input-background)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: '9px 14px 9px 34px',
                  color: 'var(--foreground)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              {subfactionUnits.length === 0 && (
                <div className="text-center py-8">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
                    Unidades de {selectedSubfaction.name} no disponibles aún.
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>
                    Podés guardar la lista y agregarlas luego.
                  </p>
                </div>
              )}
              {filteredUnits.map(u => {
                const isSel = !!selectedUnits.find(s => s.id === u.id);
                const isDisabled = !isSel && selectedUnits.length >= 5;
                return (
                  <button
                    key={u.id}
                    onClick={() => !isDisabled && toggleUnit(u)}
                    disabled={!!isDisabled}
                    className="flex items-center gap-3 p-3 rounded-lg text-left"
                    style={{
                      background: isSel ? factionColor + '15' : 'var(--card)',
                      border: `1px solid ${isSel ? factionColor + '50' : 'rgba(255,255,255,0.07)'}`,
                      opacity: isDisabled ? 0.4 : 1,
                      transition: 'all 0.15s',
                    }}
                  >
                    <UnitTypeShape type={u.type} />
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: isSel ? factionColor : 'var(--foreground)', marginBottom: 1, transition: 'color 0.15s' }}>
                        {u.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{u.role}</span>
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{u.points} pts</span>
                      </div>
                    </div>
                    {isSel && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: factionColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={11} style={{ color: 'white' }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {/* Summary pill */}
        {(step === 'config' || step === 'detachment' || step === 'units') && selectedSubfaction && selectedCategory && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 overflow-hidden"
            style={{ background: factionColor + '10', border: `1px solid ${factionColor}25` }}
          >
            <div style={{ width: 5, height: 5, borderRadius: 1, background: factionColor, transform: 'rotate(45deg)', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: factionColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedSubfaction.name}
            </span>
            {battleSize && (
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>· {battleSize.label}</span>
            )}
            {selectedDetachments.length > 0 && step === 'units' && (
              <span style={{ fontSize: 11, color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                · {selectedDetachments.join(', ')}
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleAdvance}
          disabled={!canAdvance}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg"
          style={{
            background: canAdvance ? 'var(--accent)' : 'var(--muted)',
            color: canAdvance ? 'white' : 'var(--muted-foreground)',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
        >
          {step === 'units' ? 'Guardar lista' : 'Continuar'}
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
