import { useState } from 'react';
import { ChevronRight, Code2 } from 'lucide-react';
import { ScreenHeader } from './ScreenHeader';
import { SavedList } from '../../store/lists';
import { ArmySelect } from './ArmySelect';
import { HtmlImportModal } from './MyListsScreen';
import { ImportedList } from '../lib/armyListParser';

// ── Main screen ────────────────────────────────────────────────────────────────

interface MatchupConfigScreenProps {
  lists: SavedList[];
  ownList: SavedList | null;
  onSelectOwnList: (list: SavedList) => void;
  rivalList: SavedList | null;
  onSelectRivalList: (list: SavedList) => void;
  onImportList: (list: ImportedList) => void;
  onBack: () => void;
  onAnalyze: (rivalList: SavedList) => void;
}

export function MatchupConfigScreen({ lists, ownList, onSelectOwnList, rivalList, onSelectRivalList, onImportList, onBack, onAnalyze }: MatchupConfigScreenProps) {
  const [showImportModal, setShowImportModal] = useState(false);

  const canAnalyze = !!ownList && !!rivalList;

  const handleImport = (list: ImportedList) => {
    onImportList(list);
    onSelectRivalList(list);
  };

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
            <ArmySelect lists={lists} selected={ownList} onSelect={onSelectOwnList} />
          </section>

          {/* VS divider */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, color: 'var(--muted-foreground)', letterSpacing: '0.1em', padding: '3px 10px', background: 'var(--muted)', borderRadius: 20 }}>
              VS
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Lista rival */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Lista rival
              </p>
              <span style={{ fontSize: 10, color: '#e84040', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>*</span>
            </div>
            <div className="flex flex-col gap-2">
              <ArmySelect
                lists={lists}
                selected={rivalList}
                onSelect={onSelectRivalList}
                placeholder="Elegí la lista rival"
              />
              <button
                onClick={() => setShowImportModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
                style={{ background: 'rgba(232,64,64,0.1)', border: '1px solid rgba(232,64,64,0.3)', color: '#e84040', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                <Code2 size={14} />
                Cargar lista
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.5, marginTop: 8 }}>
              El análisis (unidades, detachment, fortalezas/debilidades) se basa en la lista rival cargada, no en toda la facción.
            </p>
          </section>

          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* CTA */}
      <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button
          onClick={() => { if (canAnalyze && rivalList) onAnalyze(rivalList); }}
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

      {showImportModal && (
        <HtmlImportModal onImport={handleImport} onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
