import { useState } from 'react';
import { ChevronRight, ChevronDown, Check, X } from 'lucide-react';
import { ArmyList } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { motion, AnimatePresence } from 'motion/react';
import { FACTION_CATEGORIES, FactionAccordion, SubFaction, FactionCategory } from './FactionData';
import { useListStore } from '../../store/lists';

// ── Army list select ───────────────────────────────────────────────────────────

interface ArmySelectProps {
  lists: ArmyList[];
  selected: ArmyList | null;
  onSelect: (list: ArmyList) => void;
}

function ArmySelect({ lists, selected, onSelect }: ArmySelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 rounded-lg text-left"
        style={{
          background: selected ? 'rgba(61,126,240,0.1)' : 'var(--card)',
          border: `1px solid ${selected ? 'rgba(61,126,240,0.35)' : 'rgba(255,255,255,0.09)'}`,
          transition: 'all 0.15s',
        }}
      >
        {selected ? (
          <>
            <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: selected.faction.color, flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', lineHeight: 1.2, marginBottom: 1 }}>
                {selected.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selected.detachment.name}
              </p>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: '#3d7ef0', flexShrink: 0 }}>
              {selected.totalPoints} pts
            </span>
          </>
        ) : (
          <span style={{ fontSize: 14, color: 'var(--muted-foreground)', flex: 1 }}>
            Seleccioná una lista…
          </span>
        )}
        <ChevronDown
          size={16}
          style={{ color: 'var(--muted-foreground)', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              background: '#1a1d26',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              zIndex: 50,
              overflow: 'hidden',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            }}
          >
            {lists.map((list, idx) => {
              const isSel = selected?.id === list.id;
              return (
                <button
                  key={list.id}
                  onClick={() => { onSelect(list); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left"
                  style={{
                    background: isSel ? 'rgba(61,126,240,0.1)' : 'transparent',
                    borderBottom: idx < lists.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 0.1s',
                  }}
                >
                  <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: list.faction.color, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: isSel ? '#3d7ef0' : 'var(--foreground)', lineHeight: 1.2, marginBottom: 1 }}>
                      {list.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{list.detachment.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                      {list.totalPoints} pts
                    </span>
                    {isSel && <Check size={12} style={{ color: '#3d7ef0' }} />}
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Detachment selector ────────────────────────────────────────────────────────

interface DetachmentSelectorProps {
  subfaction: SubFaction;
  categoryColor: string;
  selected: string;
  onSelect: (det: string) => void;
}

function DetachmentSelector({ subfaction, categoryColor, selected, onSelect }: DetachmentSelectorProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${categoryColor}35`, background: categoryColor + '08' }}
    >
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: categoryColor }}>
          Detachment rival
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>— opcional</span>
      </div>

      <button
        onClick={() => onSelect('')}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: !selected ? 'rgba(107,114,128,0.12)' : 'transparent' }}
      >
        <div style={{ width: 1, height: 18, borderRadius: 1, background: !selected ? 'var(--muted-foreground)' : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
        <span style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>
          No sé / Cualquiera
        </span>
        {!selected && <Check size={13} style={{ color: 'var(--muted-foreground)' }} />}
      </button>

      {subfaction.detachments.map((det, i) => {
        const isSel = selected === det;
        return (
          <button
            key={det}
            onClick={() => onSelect(det)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
            style={{
              background: isSel ? categoryColor + '18' : 'transparent',
              borderBottom: i < subfaction.detachments.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              transition: 'background 0.12s',
            }}
          >
            <div style={{ width: 1, height: 18, borderRadius: 1, background: isSel ? categoryColor : 'rgba(255,255,255,0.1)', flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: isSel ? 700 : 500, letterSpacing: '0.03em', textTransform: 'uppercase', color: isSel ? categoryColor : 'var(--foreground)', transition: 'color 0.12s' }}>
              {det}
            </span>
            {isSel && (
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: categoryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={11} style={{ color: 'white' }} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

interface MatchupConfigScreenProps {
  onBack: () => void;
  onCreateList: () => void;
  onAnalyze: (ownList: ArmyList, rivalFaction: { id: string; name: string; color: string; abbr: string }, rivalDetachment?: string) => void;
}

export function MatchupConfigScreen({ onBack, onCreateList, onAnalyze }: MatchupConfigScreenProps) {
  const { lists } = useListStore();
  const [ownList, setOwnList] = useState<ArmyList | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [selectedSubfaction, setSelectedSubfaction] = useState<SubFaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FactionCategory | null>(null);
  const [selectedDetachment, setSelectedDetachment] = useState<string>('');

  const handleSubfactionSelect = (sub: SubFaction, cat: FactionCategory) => {
    setSelectedSubfaction(sub);
    setSelectedCategory(cat);
    setSelectedDetachment('');
  };

  const effectiveOwnList = ownList ?? lists[0] ?? null;
  const canAnalyze = !!effectiveOwnList && !!selectedSubfaction;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title="Configurar Matchup" onBack={onBack} />

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex flex-col gap-5">

          {/* Tu ejército */}
          <section>
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Tu ejército
            </p>
            {lists.length > 0 ? (
              <ArmySelect lists={lists} selected={effectiveOwnList} onSelect={setOwnList} />
            ) : (
              <div
                className="flex flex-col items-center gap-3 p-4 rounded-lg text-center"
                style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
                  Todavía no creaste ninguna lista de ejército.
                </p>
                <button
                  onClick={onCreateList}
                  className="px-4 py-2 rounded-lg"
                  style={{ background: 'var(--accent)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  Crear lista
                </button>
              </div>
            )}
          </section>

          {/* VS divider */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.1em', padding: '3px 10px', background: 'var(--muted)', borderRadius: 20 }}>
              VS
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Facción rival */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Facción rival
              </p>
              <span style={{ fontSize: 10, color: '#e84040', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>*</span>
              {selectedSubfaction && (
                <button
                  onClick={() => { setSelectedSubfaction(null); setSelectedCategory(null); setSelectedDetachment(''); }}
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
                  onSelect={handleSubfactionSelect}
                  isOpen={openAccordion === cat.id}
                  onToggle={() => setOpenAccordion(o => o === cat.id ? null : cat.id)}
                />
              ))}
            </div>
          </section>

          {/* Detachment rival */}
          <AnimatePresence>
            {selectedSubfaction && selectedCategory && (
              <motion.section
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <DetachmentSelector
                  subfaction={selectedSubfaction}
                  categoryColor={selectedCategory.color}
                  selected={selectedDetachment}
                  onSelect={setSelectedDetachment}
                />
              </motion.section>
            )}
          </AnimatePresence>

          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* CTA */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        {selectedSubfaction && selectedCategory && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
            style={{ background: selectedCategory.color + '12', border: `1px solid ${selectedCategory.color}30` }}
          >
            <div style={{ width: 6, height: 6, borderRadius: 1, background: selectedCategory.color, transform: 'rotate(45deg)', flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: selectedCategory.color }}>
                {selectedSubfaction.name}
              </span>
              {selectedDetachment && (
                <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 6 }}>
                  · {selectedDetachment}
                </span>
              )}
            </div>
          </div>
        )}
        <button
          onClick={() => {
            if (!canAnalyze || !effectiveOwnList || !selectedSubfaction || !selectedCategory) return;
            onAnalyze(
              effectiveOwnList,
              { id: selectedSubfaction.id, name: selectedSubfaction.name, color: selectedCategory.color, abbr: selectedSubfaction.name.slice(0, 3).toUpperCase() },
              selectedDetachment || undefined,
            );
          }}
          disabled={!canAnalyze}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg"
          style={{
            background: canAnalyze ? 'var(--accent)' : 'var(--muted)',
            color: canAnalyze ? 'white' : 'var(--muted-foreground)',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
        >
          Analizar matchup
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
