import { MISSIONS, Mission } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { MISSION_MAPS } from './missionMaps';
import { ChevronRight } from 'lucide-react';

interface MissionSelectScreenProps {
  onSelect: (mission: Mission) => void;
  onBack: () => void;
}

const DEPLOYMENT_LABELS: Record<Mission['deployment'], string> = {
  horizontal: 'Frontal',
  diagonal:   'Diagonal',
  corner:     'Esquinas',
  hammer:     'Hammer & Anvil',
};

export function MissionSelectScreen({ onSelect, onBack }: MissionSelectScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        title="Elegir Misión"
        onBack={onBack}
        subtitle="Mapas disponibles — 11va edición"
      />

      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 p-4 pb-8">
          {MISSIONS.map(m => {
            const img = MISSION_MAPS[m.id];
            return (
              <button
                key={m.id}
                onClick={() => onSelect(m)}
                className="flex rounded-xl text-left overflow-hidden"
                style={{
                  background: 'var(--card)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'border-color 0.15s',
                  minHeight: 120,
                }}
              >
                {/* Map image */}
                <div style={{ width: 90, flexShrink: 0, position: 'relative', overflow: 'hidden', background: '#0d0e12' }}>
                  {img && (
                    <img
                      src={img}
                      alt={m.name}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col justify-between flex-1 p-3.5">
                  <div>
                    {/* Layout tag */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: 9,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--muted-foreground)',
                      background: 'var(--muted)',
                      borderRadius: 3,
                      padding: '2px 6px',
                      marginBottom: 6,
                    }}>
                      {m.layout}
                    </span>

                    {/* Mission name */}
                    <p style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: '0.03em',
                      textTransform: 'uppercase',
                      color: 'var(--foreground)',
                      lineHeight: 1.15,
                      marginBottom: 4,
                    }}>
                      {m.name}
                    </p>

                    {/* Subtitle */}
                    <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
                      {m.subtitle}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3">
                    <span style={{
                      fontSize: 10,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--primary)',
                      background: 'rgba(110,69,226,0.12)',
                      border: '1px solid rgba(110,69,226,0.25)',
                      borderRadius: 4,
                      padding: '2px 7px',
                    }}>
                      {DEPLOYMENT_LABELS[m.deployment]}
                    </span>
                    <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
