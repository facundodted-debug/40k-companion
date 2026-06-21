import { ScreenHeader } from './ScreenHeader';
import { OpponentUnit } from './shared';
import { UnitStatsPanel } from './UnitStatsPanel';

interface UnitDetailScreenProps {
  unit: OpponentUnit | null;
  unitName: string;
  onBack: () => void;
}

// Pantalla de 2do nivel con la ficha completa de una unidad (stats, armas,
// habilidades, keywords) — sin Consideraciones/Recomendaciones, que son
// análisis de matchup y no parte de la datasheet en sí.
export function UnitDetailScreen({ unit, unitName, onBack }: UnitDetailScreenProps) {
  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        title={unit?.name ?? unitName}
        subtitle={unit ? `${unit.keywords.slice(0, 3).join(' · ')} · ${unit.pts} pts` : undefined}
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto p-4">
        {unit ? (
          <UnitStatsPanel unit={unit} showAnalysis={false} />
        ) : (
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
            De momento no hay información sobre {unitName}.
          </p>
        )}
      </div>
    </div>
  );
}
