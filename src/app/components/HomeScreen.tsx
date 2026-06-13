import { Swords, Map, Clock, ChevronRight, Zap, BookOpen, History } from 'lucide-react';
import { ArmyList } from './shared';
import { FactionBadge } from './ScreenHeader';
import { SavedList } from '../../store/lists';
import { MatchupRecord } from '../../store/matchups';

function isArmyList(list: SavedList): list is ArmyList {
  return 'faction' in list && 'keyUnits' in list;
}

interface HomeScreenProps {
  lists: SavedList[];
  listsLoading: boolean;
  lastMatchup: MatchupRecord | null;
  matchupsLoading: boolean;
  onGoMatchup: () => void;
  onGoLists: () => void;
  onGoPractica: () => void;
}

export function HomeScreen({ lists, listsLoading, lastMatchup, matchupsLoading, onGoMatchup, onGoLists, onGoPractica }: HomeScreenProps) {
  const activeList = lists[0];
  const activeArmyList = activeList && isArmyList(activeList) ? activeList : null;

  return (
    <div className="flex flex-col gap-0 h-full overflow-y-auto pb-4">
      {/* Hero header */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            style={{
              width: 6, height: 6, background: 'var(--accent)', borderRadius: 1,
              transform: 'rotate(45deg)',
            }}
          />
          <span style={{ fontSize: 11, color: 'var(--accent)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            40K Companion
          </span>
        </div>
        <h1 style={{ fontSize: 26, color: 'var(--foreground)', lineHeight: 1.15, marginBottom: 4 }}>
          Listo para<br />el combate
        </h1>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
          {lists.length > 0 ? `${lists.length} ejércitos guardados` : 'Importá tu primera lista para empezar'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="px-4 pt-4">
        <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Acciones rápidas
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onGoMatchup}
            className="flex-1 flex flex-col items-start gap-2 p-3.5 rounded-lg"
            style={{ background: 'var(--primary)', border: '1px solid rgba(110,69,226,0.3)' }}
          >
            <Swords size={18} style={{ color: 'rgba(255,255,255,0.9)' }} />
            <span style={{ color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Nuevo<br />Matchup
            </span>
          </button>
          <button
            onClick={onGoPractica}
            className="flex-1 flex flex-col items-start gap-2 p-3.5 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Map size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Tablero<br />de práctica
            </span>
          </button>
          <button
            onClick={onGoLists}
            className="flex-1 flex flex-col items-start gap-2 p-3.5 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Zap size={18} style={{ color: '#2db57c' }} />
            <span style={{ color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
              Ver mis<br />listas
            </span>
          </button>
        </div>
      </div>

      {/* Last matchup */}
      <div className="px-4 pt-5">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Último matchup
          </p>
          {lastMatchup && (
            <div className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
              <Clock size={11} />
              <span>{new Date(lastMatchup.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
        {!matchupsLoading && !lastMatchup && (
          <div
            className="w-full rounded-lg p-4 flex items-center gap-3"
            style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'var(--muted)', flexShrink: 0 }}>
              <History size={18} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Todavía no analizaste ningún matchup. Configurá uno para empezar.
            </p>
          </div>
        )}
        {lastMatchup && (
          <button
            onClick={onGoMatchup}
            className="w-full rounded-lg p-4 text-left"
            style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FactionBadge abbr={lastMatchup.ownFactionAbbr} color={lastMatchup.ownFactionColor} size="sm" />
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>vs</span>
                <FactionBadge abbr={lastMatchup.rivalAbbr} color={lastMatchup.rivalColor} size="sm" />
              </div>
              <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Fortalezas', color: '#2db57c', count: lastMatchup.strengthsCount },
                { label: 'Debilidades', color: '#e84040', count: lastMatchup.weaknessesCount },
                { label: 'Acciones', color: '#6e45e2', count: lastMatchup.actionsCount },
              ].map(b => (
                <div
                  key={b.label}
                  className="flex items-center gap-1.5 px-2 py-1 rounded"
                  style={{ background: b.color + '15', border: `1px solid ${b.color}33` }}
                >
                  <span style={{ color: b.color, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{b.count}</span>
                  <span style={{ color: b.color, fontSize: 10, opacity: 0.8, fontFamily: "'Barlow Condensed', sans-serif" }}>{b.label}</span>
                </div>
              ))}
            </div>
          </button>
        )}
      </div>

      {/* Active list */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Lista activa
          </p>
          {lists.length > 0 && (
            <button onClick={onGoLists} style={{ color: 'var(--primary)', fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif" }}>Ver todas</button>
          )}
        </div>

        {!listsLoading && !activeList && (
          <button
            onClick={onGoLists}
            className="w-full rounded-lg p-4 flex items-center gap-3 text-left"
            style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'var(--muted)', flexShrink: 0 }}>
              <BookOpen size={18} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
              Sin listas guardadas. Importá una desde "Mis Listas" para verla acá.
            </p>
          </button>
        )}

        {activeArmyList && (
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--card)', border: `1px solid ${activeArmyList.faction.color}33` }}
          >
            <div className="flex items-center justify-between mb-2">
              <FactionBadge abbr={activeArmyList.faction.abbr} color={activeArmyList.faction.color} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                {activeArmyList.totalPoints} PTS
              </span>
            </div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 4 }}>
              {activeArmyList.name}
            </p>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{activeArmyList.detachment.name}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {activeArmyList.keyUnits.map(u => (
                <span
                  key={u.id}
                  style={{
                    background: activeArmyList.faction.color + '15',
                    border: `1px solid ${activeArmyList.faction.color}30`,
                    color: activeArmyList.faction.color,
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
          </div>
        )}

        {activeList && !activeArmyList && (
          <div
            className="rounded-lg p-4"
            style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--primary)', background: 'rgba(110,69,226,0.12)', border: '1px solid rgba(110,69,226,0.25)', borderRadius: 3, padding: '2px 6px' }}>
                Importada
              </span>
              {activeList.totalPoints && (
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                  {activeList.totalPoints} PTS
                </span>
              )}
            </div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 4 }}>
              {activeList.armyName}
            </p>
            {activeList.factionName && <p style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{activeList.factionName}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
