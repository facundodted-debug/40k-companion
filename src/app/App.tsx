import { useState } from 'react';
import { User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { MyListsScreen } from './components/MyListsScreen';
import { CreateListScreen } from './components/CreateListScreen';
import { MatchupConfigScreen } from './components/MatchupConfigScreen';
import { MatchupResultScreen } from './components/MatchupResultScreen';
import { MissionSelectScreen } from './components/MissionSelectScreen';
import { DeploymentBoardScreen } from './components/DeploymentBoardScreen';
import { TurnSimulationScreen } from './components/TurnSimulationScreen';
import { BottomNav } from './components/BottomNav';
import { Mission } from './components/shared';
import { PlaceableItem } from './components/DeploymentBoardScreen';
import { SavedList, useListStore } from '../store/lists';
import { ArmyList } from './components/shared';
import { useMatchupHistory } from '../store/matchups';
import { useProfile, ProfileData } from '../store/profile';

/* MARKER-MAKE-KIT-INVOKED */

function isArmyList(list: SavedList): list is ArmyList {
  return 'faction' in list && 'keyUnits' in list;
}

type ActiveTab = 0 | 1 | 2 | 3 | 4;
type Screen =
  | 'home'
  | 'my-lists'
  | 'create-list'
  | 'matchup-config'
  | 'matchup-result'
  | 'mission-select'
  | 'deployment-board'
  | 'turn-simulation'
  | 'profile';

const TAB_DEFAULT_SCREEN: Record<ActiveTab, Screen> = {
  0: 'home',
  1: 'my-lists',
  2: 'matchup-config',
  3: 'mission-select',
  4: 'profile',
};

function ProfileScreen({ profile, loading, saveProfile }: { profile: ProfileData | null; loading: boolean; saveProfile: (data: ProfileData) => void }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileData>({ playerName: '', favoriteFaction: '', gamesPlayed: 0, winRate: 0 });

  const startEditing = () => {
    setForm(profile ?? { playerName: '', favoriteFaction: '', gamesPlayed: 0, winRate: 0 });
    setEditing(true);
  };

  const handleSave = () => {
    saveProfile(form);
    setEditing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: 26, color: 'var(--foreground)', marginBottom: 4 }}>Perfil</h1>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Configuración y preferencias</p>
      </div>

      {!loading && !profile && !editing && (
        <div className="flex flex-col items-center justify-center flex-1 gap-5 px-8 text-center pb-24">
          <div className="flex items-center justify-center rounded-2xl" style={{ width: 80, height: 80, background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <User size={32} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 20, color: 'var(--foreground)', marginBottom: 8 }}>Sin datos de perfil</h3>
            <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
              Configurá tu nombre de jugador y facción favorita para personalizar la app.
            </p>
          </div>
          <button
            onClick={startEditing}
            className="px-6 py-2.5 rounded-lg"
            style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Completar perfil
          </button>
        </div>
      )}

      {!loading && (profile || editing) && !editing && profile && (
        <div className="flex flex-col gap-3 p-4">
          {[
            { label: 'Nombre de jugador', value: profile.playerName || '—' },
            { label: 'Facción favorita', value: profile.favoriteFaction || '—' },
            { label: 'Partidas registradas', value: String(profile.gamesPlayed) },
            { label: 'Win rate', value: `${profile.winRate}%` },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{item.label}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--foreground)' }}>{item.value}</span>
            </div>
          ))}
          <button
            onClick={startEditing}
            className="mt-1 p-3 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)', color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Editar perfil
          </button>
          <div
            className="mt-2 p-3 rounded-lg flex items-center justify-between"
            style={{ background: 'rgba(110,69,226,0.1)', border: '1px solid rgba(110,69,226,0.25)' }}
          >
            <span style={{ fontSize: 13, color: 'var(--primary)' }}>Edición</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
              WARHAMMER 40K — 11ª ED.
            </span>
          </div>
        </div>
      )}

      {editing && (
        <div className="flex flex-col gap-3 p-4">
          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Nombre de jugador</span>
            <input
              value={form.playerName}
              onChange={e => setForm(f => ({ ...f, playerName: e.target.value }))}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--foreground)', fontSize: 14 }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Facción favorita</span>
            <input
              value={form.favoriteFaction}
              onChange={e => setForm(f => ({ ...f, favoriteFaction: e.target.value }))}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--foreground)', fontSize: 14 }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Partidas registradas</span>
            <input
              type="number"
              value={form.gamesPlayed}
              onChange={e => setForm(f => ({ ...f, gamesPlayed: parseInt(e.target.value) || 0 }))}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--foreground)', fontSize: 14 }}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Win rate (%)</span>
            <input
              type="number"
              value={form.winRate}
              onChange={e => setForm(f => ({ ...f, winRate: parseInt(e.target.value) || 0 }))}
              className="p-3 rounded-lg"
              style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.09)', color: 'var(--foreground)', fontSize: 14 }}
            />
          </label>
          <div className="flex gap-2 mt-2">
            {profile && (
              <button
                onClick={() => setEditing(false)}
                className="flex-1 p-3 rounded-lg"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 p-3 rounded-lg"
              style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(0);
  const [screen, setScreen] = useState<Screen>('home');
  const [rivalList, setRivalList] = useState<SavedList | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [boardItems, setBoardItems] = useState<PlaceableItem[]>([]);
  const [activeList, setActiveList] = useState<SavedList | null>(null);

  const listStore = useListStore();
  const matchupStore = useMatchupHistory();
  const profileStore = useProfile();

  const navigate = (s: Screen) => setScreen(s);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setScreen(TAB_DEFAULT_SCREEN[tab]);
  };

  const screenKey = screen;

  const screenEl = (() => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            lists={listStore.lists}
            listsLoading={listStore.loading}
            lastMatchup={matchupStore.lastMatchup}
            matchupsLoading={matchupStore.loading}
            onGoMatchup={() => { setActiveTab(2); navigate('matchup-config'); }}
            onGoLists={() => { setActiveTab(1); navigate('my-lists'); }}
            onGoPractica={() => { setActiveTab(3); navigate('mission-select'); }}
          />
        );
      case 'my-lists':
        return (
          <MyListsScreen
            onCreateList={() => navigate('create-list')}
            listStore={listStore}
            onGoMatchup={(list: SavedList) => { setActiveList(list); setActiveTab(2); navigate('matchup-config'); }}
          />
        );
      case 'create-list':
        return (
          <CreateListScreen
            onBack={() => navigate('my-lists')}
            onSave={() => navigate('my-lists')}
          />
        );
      case 'matchup-config':
        return (
          <MatchupConfigScreen
            lists={listStore.lists}
            ownList={activeList}
            onSelectOwnList={setActiveList}
            rivalList={rivalList}
            onSelectRivalList={setRivalList}
            onImportList={listStore.addList}
            onBack={() => { setActiveTab(0); navigate('home'); }}
            onAnalyze={(rival) => {
              setRivalList(rival);
              if (activeList) {
                const ownAbbr = isArmyList(activeList) ? activeList.faction.abbr : (activeList.factionName?.slice(0, 3).toUpperCase() ?? '???');
                const ownColor = isArmyList(activeList) ? activeList.faction.color : '#6e45e2';
                const ownName = isArmyList(activeList) ? activeList.name : activeList.armyName;
                const rivalAbbr = isArmyList(rival) ? rival.faction.abbr : (rival.factionName?.slice(0, 3).toUpperCase() ?? '???');
                const rivalColor = isArmyList(rival) ? rival.faction.color : '#e84040';
                const rivalName = isArmyList(rival) ? rival.name : rival.armyName;
                const rivalDetachmentName = isArmyList(rival) ? rival.detachment.name : rival.detachmentName;
                matchupStore.addRecord({
                  ownListId: activeList.id,
                  ownListName: ownName,
                  ownFactionAbbr: ownAbbr,
                  ownFactionColor: ownColor,
                  rivalName,
                  rivalAbbr,
                  rivalColor,
                  rivalDetachment: rivalDetachmentName,
                  strengthsCount: 3,
                  weaknessesCount: 2,
                  actionsCount: 4,
                });
              }
              navigate('matchup-result');
            }}
          />
        );
      case 'matchup-result':
        return rivalList ? (
          <MatchupResultScreen
            ownList={activeList}
            rivalList={rivalList}
            onBack={() => navigate('matchup-config')}
            onNewMatchup={() => navigate('matchup-config')}
          />
        ) : null;
      case 'mission-select':
        return (
          <MissionSelectScreen
            onBack={() => { setActiveTab(0); navigate('home'); }}
            onSelect={(mission) => { setSelectedMission(mission); navigate('deployment-board'); }}
          />
        );
      case 'deployment-board':
        return (
          <DeploymentBoardScreen
            mission={selectedMission}
            lists={listStore.lists}
            onBack={() => navigate('mission-select')}
            onSelectMission={() => navigate('mission-select')}
            onStartSimulation={(items) => { setBoardItems(items); navigate('turn-simulation'); }}
          />
        );
      case 'turn-simulation':
        return (
          <TurnSimulationScreen
            mission={selectedMission}
            initialItems={boardItems}
            onBack={() => navigate('deployment-board')}
          />
        );
      case 'profile':
        return <ProfileScreen profile={profileStore.profile} loading={profileStore.loading} saveProfile={profileStore.saveProfile} />;
      default:
        return null;
    }
  })();

  const showBottomNav = screen !== 'create-list' && screen !== 'matchup-result' && screen !== 'turn-simulation';

  return (
    /* Outer centering wrapper — shows a phone frame on desktop */
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: '#080809', minHeight: '100vh' }}
    >
      {/* Phone frame */}
      <div
        style={{
          width: '100%',
          maxWidth: 390,
          height: '100vh',
          maxHeight: 844,
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--background)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.8)',
          borderRadius: 44,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
        className="dark"
      >
        {/* Status bar notch area */}
        <div style={{ height: 12, background: 'var(--background)', flexShrink: 0 }} />

        {!onboarded ? (
          <OnboardingScreen onComplete={() => setOnboarded(true)} />
        ) : (
          <>
            {/* Main content */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={screenKey}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
                >
                  {screenEl}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom nav */}
            {showBottomNav && (
              <BottomNav active={activeTab} onChange={handleTabChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
