import { Home, BookOpen, Swords, Map, User } from 'lucide-react';
import { motion } from 'motion/react';

type Tab = 0 | 1 | 2 | 3 | 4;

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS = [
  { icon: Home, label: 'Inicio' },
  { icon: BookOpen, label: 'Mis Listas' },
  { icon: Swords, label: 'Matchup' },
  { icon: Map, label: 'Práctica' },
  { icon: User, label: 'Perfil' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      style={{
        background: 'rgba(13,14,18,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
      className="flex items-center justify-around px-2 pb-safe"
    >
      {TABS.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = active === i;
        return (
          <button
            key={i}
            onClick={() => onChange(i as Tab)}
            className="flex flex-col items-center gap-0.5 py-2.5 px-3 relative flex-1"
            style={{ minHeight: 56 }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-x-2 top-0 h-0.5 rounded-b"
                style={{ background: 'var(--primary)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              style={{
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                transition: 'color 0.15s',
              }}
            />
            <span
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
                transition: 'color 0.15s',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
