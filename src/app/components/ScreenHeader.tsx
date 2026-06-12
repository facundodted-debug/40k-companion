import { ArrowLeft } from 'lucide-react';
import React from 'react';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  subtitle?: string;
}

export function ScreenHeader({ title, onBack, right, subtitle }: ScreenHeaderProps) {
  return (
    <header
      style={{
        background: 'rgba(13,14,18,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
      }}
      className="flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center justify-center w-8 h-8 rounded"
          style={{ color: 'var(--muted-foreground)', background: 'var(--muted)' }}
        >
          <ArrowLeft size={16} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h2
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--foreground)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 1 }}>{subtitle}</p>
        )}
      </div>
      {right && <div className="flex items-center">{right}</div>}
    </header>
  );
}

interface FactionBadgeProps {
  abbr: string;
  color: string;
  size?: 'sm' | 'md';
}

export function FactionBadge({ abbr, color, size = 'md' }: FactionBadgeProps) {
  const px = size === 'sm' ? 6 : 8;
  const py = size === 'sm' ? 2 : 3;
  return (
    <span
      style={{
        background: color + '22',
        border: `1px solid ${color}55`,
        color: color,
        borderRadius: 4,
        padding: `${py}px ${px}px`,
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: size === 'sm' ? 10 : 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase' as const,
      }}
    >
      {abbr}
    </span>
  );
}

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
}

export function Chip({ label, selected, onClick, color }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected
          ? (color ? color + '22' : 'var(--primary)') + (color ? '' : '')
          : 'var(--muted)',
        border: `1px solid ${selected ? (color || 'var(--primary)') : 'transparent'}`,
        color: selected ? (color || 'var(--primary)') : 'var(--muted-foreground)',
        borderRadius: 20,
        padding: '6px 12px',
        fontFamily: "'Barlow Condensed', sans-serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase' as const,
        transition: 'all 0.15s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {label}
    </button>
  );
}
