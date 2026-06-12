import { useState } from 'react';
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
import { ArmyList, Mission, RivalFaction } from './components/shared';
import { PlaceableItem } from './components/DeploymentBoardScreen';

/* MARKER-MAKE-KIT-INVOKED */

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

function ProfileScreen() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h1 style={{ fontSize: 26, color: 'var(--foreground)', marginBottom: 4 }}>Perfil</h1>
        <p style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>Configuración y preferencias</p>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {[
          { label: 'Nombre de jugador', value: 'Comandante Severus' },
          { label: 'Facción favorita', value: 'Space Marines' },
          { label: 'Partidas registradas', value: '24' },
          { label: 'Win rate', value: '62%' },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>{item.label}</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: '0.03em', color: 'var(--foreground)' }}>{item.value}</span>
          </div>
        ))}
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
    </div>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(0);
  const [screen, setScreen] = useState<Screen>('home');
  const [ownList, setOwnList] = useState<ArmyList | null>(null);
  const [rivalFaction, setRivalFaction] = useState<RivalFaction | null>(null);
  const [rivalDetachment, setRivalDetachment] = useState<string | undefined>();
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [boardItems, setBoardItems] = useState<PlaceableItem[]>([]);

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
            onGoMatchup={() => { setActiveTab(2); navigate('matchup-config'); }}
            onGoLists={() => { setActiveTab(1); navigate('my-lists'); }}
            onGoPractica={() => { setActiveTab(3); navigate('mission-select'); }}
          />
        );
      case 'my-lists':
        return (
          <MyListsScreen
            onCreateList={() => navigate('create-list')}
            onGoMatchup={(_list: ArmyList) => { setActiveTab(2); navigate('matchup-config'); }}
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
            onBack={() => { setActiveTab(0); navigate('home'); }}
            onCreateList={() => navigate('create-list')}
            onAnalyze={(list, faction, detachment) => {
              setOwnList(list);
              setRivalFaction(faction);
              setRivalDetachment(detachment);
              navigate('matchup-result');
            }}
          />
        );
      case 'matchup-result':
        return ownList && rivalFaction ? (
          <MatchupResultScreen
            ownList={ownList}
            rivalFaction={rivalFaction}
            rivalDetachment={rivalDetachment}
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
        return <ProfileScreen />;
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
