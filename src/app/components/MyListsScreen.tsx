import { ArmyList } from './shared';
import { Plus, ChevronRight, BookOpen, Upload } from 'lucide-react';
import { ScreenHeader } from './ScreenHeader';
import { FactionBadge } from './ScreenHeader';
import { useListStore } from '../../store/lists';

interface MyListsScreenProps {
  onCreateList: () => void;
  onGoMatchup: (list: ArmyList) => void;
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-8 text-center">
      <div
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 80, height: 80, background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <BookOpen size={32} style={{ color: 'var(--muted-foreground)' }} />
      </div>
      <div>
        <h3 style={{ fontSize: 20, color: 'var(--foreground)', marginBottom: 8 }}>
          Sin listas guardadas
        </h3>
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Creá tu primera lista de ejército para acceder al análisis de matchup.
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 px-6 py-3 rounded-lg"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-foreground)',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <Plus size={16} />
        Crear mi primera lista
      </button>
    </div>
  );
}

function ListCard({ list, onMatchup }: { list: ArmyList; onMatchup: () => void }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--card)', border: `1px solid ${list.faction.color}25` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <FactionBadge abbr={list.faction.abbr} color={list.faction.color} />
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>
            {list.totalPoints}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif" }}>PTS</span>
        </div>
      </div>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 3 }}>
        {list.name}
      </p>
      <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 12 }}>
        {list.detachment.name}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {list.keyUnits.map(u => (
          <span
            key={u.id}
            style={{
              background: list.faction.color + '15',
              border: `1px solid ${list.faction.color}30`,
              color: list.faction.color,
              borderRadius: 3,
              padding: '2px 6px',
              fontSize: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {u.shortName}
          </span>
        ))}
      </div>
      <button
        onClick={onMatchup}
        className="w-full flex items-center justify-center gap-2 py-2 rounded"
        style={{
          background: 'var(--primary)',
          color: 'white',
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Analizar matchup
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

export function MyListsScreen({ onCreateList, onGoMatchup }: MyListsScreenProps) {
  const { lists } = useListStore();
  const isEmpty = lists.length === 0;

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        title="Mis Listas"
        subtitle={!isEmpty ? `${lists.length} ejércitos guardados` : undefined}
      />

      {isEmpty ? (
        <EmptyState onCreate={onCreateList} />
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 p-4 pb-24">
            {lists.map(list => (
              <ListCard
                key={list.id}
                list={list}
                onMatchup={() => onGoMatchup(list)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      {!isEmpty && (
        <div
          className="absolute left-0 right-0 flex gap-2 px-4 py-3"
          style={{
            bottom: 64,
            background: 'linear-gradient(to top, var(--background) 60%, transparent)',
            zIndex: 10,
          }}
        >
          <button
            onClick={() => alert('Próximamente')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg"
            style={{
              background: 'var(--muted)',
              color: 'var(--muted-foreground)',
              border: '1px solid rgba(255,255,255,0.10)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <Upload size={14} />
            Importar lista
          </button>
          <button
            onClick={onCreateList}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg"
            style={{
              background: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 16px rgba(240,146,14,0.3)',
            }}
          >
            <Plus size={14} />
            Nueva lista
          </button>
        </div>
      )}
    </div>
  );
}
