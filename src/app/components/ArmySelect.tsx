import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavedList } from '../../store/lists';
import { ArmyList } from './shared';

export function isArmyList(list: SavedList): list is ArmyList {
  return 'faction' in list && 'keyUnits' in list;
}

export function getListDisplay(list: SavedList) {
  if (isArmyList(list)) {
    return {
      name: list.name,
      detachmentName: list.detachment.name,
      totalPoints: list.totalPoints,
      color: list.faction.color,
    };
  }
  return {
    name: list.armyName,
    detachmentName: list.detachmentName ?? '—',
    totalPoints: list.totalPoints ?? 0,
    color: '#6e45e2',
  };
}

interface ArmySelectProps {
  lists: SavedList[];
  selected: SavedList | null;
  onSelect: (list: SavedList) => void;
  placeholder?: string;
}

export function ArmySelect({ lists, selected, onSelect, placeholder = 'Seleccioná una lista…' }: ArmySelectProps) {
  const [open, setOpen] = useState(false);
  const selectedDisplay = selected ? getListDisplay(selected) : null;

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
        {selectedDisplay ? (
          <>
            <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: selectedDisplay.color, flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', lineHeight: 1.2, marginBottom: 1 }}>
                {selectedDisplay.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedDisplay.detachmentName}
              </p>
            </div>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: '#3d7ef0', flexShrink: 0 }}>
              {selectedDisplay.totalPoints} pts
            </span>
          </>
        ) : (
          <span style={{ fontSize: 14, color: 'var(--muted-foreground)', flex: 1 }}>
            {placeholder}
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
            {lists.length === 0 && (
              <div className="px-3 py-3" style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>
                Sin listas guardadas. Importá una desde "Mis Listas".
              </div>
            )}
            {lists.map((list, idx) => {
              const isSel = selected?.id === list.id;
              const display = getListDisplay(list);
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
                  <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, background: display.color, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: isSel ? '#3d7ef0' : 'var(--foreground)', lineHeight: 1.2, marginBottom: 1 }}>
                      {display.name}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{display.detachmentName}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                      {display.totalPoints} pts
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
