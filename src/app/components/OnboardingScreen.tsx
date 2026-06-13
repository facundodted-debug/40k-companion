import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Zap, BookOpen, Swords } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: Zap,
    iconColor: '#f0920e',
    title: 'Tu escuadra,\nsiempre lista',
    body: 'Consultá reglas, listas y sinergias en segundos. Diseñado para los 2 minutos antes de la batalla.',
    graphic: <OnboardingGraphicA />,
  },
  {
    icon: BookOpen,
    iconColor: '#3d7ef0',
    title: 'Construí\ntu lista',
    body: 'Guardá tus ejércitos con facción, detachment y unidades clave. Acceso instantáneo en cualquier momento.',
    graphic: <OnboardingGraphicB />,
  },
  {
    icon: Swords,
    iconColor: '#6e45e2',
    title: 'Dominá\nel matchup',
    body: 'Seleccioná tu rival y obtené fortalezas, debilidades y un plan de juego en 3 toques.',
    graphic: <OnboardingGraphicC />,
  },
];

function OnboardingGraphicA() {
  return (
    <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 240 }}>
      {/* Geometric 40K-style crest */}
      <polygon points="100,10 140,35 140,85 100,110 60,85 60,35" fill="none" stroke="#f0920e" strokeWidth="1.5" opacity="0.6" />
      <polygon points="100,25 125,42 125,78 100,95 75,78 75,42" fill="none" stroke="#f0920e" strokeWidth="1" opacity="0.3" />
      {/* Center cross */}
      <line x1="100" y1="40" x2="100" y2="80" stroke="#f0920e" strokeWidth="1.5" opacity="0.8" />
      <line x1="80" y1="60" x2="120" y2="60" stroke="#f0920e" strokeWidth="1.5" opacity="0.8" />
      {/* Corner ornaments */}
      <rect x="20" y="20" width="8" height="8" fill="none" stroke="#6e45e2" strokeWidth="1" opacity="0.5" />
      <rect x="172" y="20" width="8" height="8" fill="none" stroke="#6e45e2" strokeWidth="1" opacity="0.5" />
      <rect x="20" y="92" width="8" height="8" fill="none" stroke="#6e45e2" strokeWidth="1" opacity="0.5" />
      <rect x="172" y="92" width="8" height="8" fill="none" stroke="#6e45e2" strokeWidth="1" opacity="0.5" />
      {/* Horizontal rule lines */}
      <line x1="20" y1="60" x2="55" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <line x1="145" y1="60" x2="180" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    </svg>
  );
}

function OnboardingGraphicB() {
  return (
    <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 240 }}>
      {/* List cards */}
      <rect x="20" y="15" width="160" height="32" rx="4" fill="#1a1d26" stroke="rgba(61,126,240,0.4)" strokeWidth="1" />
      <rect x="28" y="22" width="16" height="16" rx="2" fill="#3d7ef022" stroke="#3d7ef0" strokeWidth="1" />
      <text x="54" y="32" fill="#eceef4" fontSize="9" fontFamily="Barlow Condensed, sans-serif" letterSpacing="0.04em">GLADIUS TASK FORCE</text>
      <text x="54" y="42" fill="#6b7280" fontSize="7" fontFamily="Inter, sans-serif">Space Marines · 1980 pts</text>
      <rect x="158" y="24" width="14" height="12" rx="2" fill="#3d7ef022" />

      <rect x="20" y="55" width="160" height="32" rx="4" fill="#1a1d26" stroke="rgba(45,181,124,0.3)" strokeWidth="1" />
      <rect x="28" y="62" width="16" height="16" rx="2" fill="#2db57c22" stroke="#2db57c" strokeWidth="1" />
      <text x="54" y="72" fill="#eceef4" fontSize="9" fontFamily="Barlow Condensed, sans-serif" letterSpacing="0.04em">AWAKENED DYNASTY</text>
      <text x="54" y="82" fill="#6b7280" fontSize="7" fontFamily="Inter, sans-serif">Necrons · 1750 pts</text>

      {/* FAB hint */}
      <circle cx="170" cy="108" r="10" fill="#f0920e" />
      <text x="170" y="112" fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">+</text>
    </svg>
  );
}

function OnboardingGraphicC() {
  return (
    <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: 240 }}>
      {/* VS layout */}
      <rect x="10" y="30" width="75" height="60" rx="4" fill="#3d7ef015" stroke="#3d7ef055" strokeWidth="1" />
      <text x="47" y="52" fill="#3d7ef0" fontSize="8" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" letterSpacing="0.04em">MIS MARINES</text>
      <text x="47" y="66" fill="#eceef4" fontSize="11" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">SM</text>
      <text x="47" y="80" fill="#6b7280" fontSize="7" textAnchor="middle" fontFamily="Inter, sans-serif">1980 pts</text>

      <text x="100" y="65" fill="#6e45e2" fontSize="12" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">VS</text>

      <rect x="115" y="30" width="75" height="60" rx="4" fill="#e8404015" stroke="#e8404055" strokeWidth="1" />
      <text x="152" y="52" fill="#e84040" fontSize="8" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" letterSpacing="0.04em">RIVAL</text>
      <text x="152" y="66" fill="#eceef4" fontSize="11" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif" fontWeight="700">NEC</text>
      <text x="152" y="80" fill="#6b7280" fontSize="7" textAnchor="middle" fontFamily="Inter, sans-serif">Necrons</text>

      {/* Analysis blocks */}
      <rect x="10" y="98" width="55" height="14" rx="2" fill="#2db57c22" stroke="#2db57c55" strokeWidth="1" />
      <text x="37" y="108" fill="#2db57c" fontSize="7" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif">FORTALEZAS</text>
      <rect x="72" y="98" width="55" height="14" rx="2" fill="#e8404022" stroke="#e8404055" strokeWidth="1" />
      <text x="100" y="108" fill="#e84040" fontSize="7" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif">DEBILIDADES</text>
      <rect x="134" y="98" width="55" height="14" rx="2" fill="#6e45e222" stroke="#6e45e255" strokeWidth="1" />
      <text x="161" y="108" fill="#6e45e2" fontSize="7" textAnchor="middle" fontFamily="Barlow Condensed, sans-serif">PLAN</text>
    </svg>
  );
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [slide, setSlide] = useState(0);
  const S = SLIDES[slide];
  const Icon = S.icon;

  const advance = () => {
    if (slide < SLIDES.length - 1) setSlide(s => s + 1);
    else onComplete();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      {/* Skip */}
      <div className="flex justify-end px-5 pt-4">
        <button
          onClick={onComplete}
          style={{ fontSize: 13, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.04em', textTransform: 'uppercase' }}
        >
          Saltar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-6 w-full"
          >
            {/* Graphic */}
            <div className="flex items-center justify-center w-full" style={{ maxHeight: 140 }}>
              {S.graphic}
            </div>

            {/* Icon + label */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: S.iconColor + '18', border: `1px solid ${S.iconColor}44` }}
            >
              <Icon size={12} style={{ color: S.iconColor }} />
              <span style={{ color: S.iconColor, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Warhammer 40K — 11ª Edición
              </span>
            </div>

            {/* Title */}
            <h1 style={{ textAlign: 'center', whiteSpace: 'pre-line', fontSize: 32, color: 'var(--foreground)', lineHeight: 1.1 }}>
              {S.title}
            </h1>

            {/* Body */}
            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 15, lineHeight: 1.6, maxWidth: 280 }}>
              {S.body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div className="flex flex-col items-center gap-5 px-6 pb-8">
        {/* Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === slide ? 'var(--primary)' : 'var(--muted)',
                transition: 'all 0.25s',
              }}
            />
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={advance}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          {slide < SLIDES.length - 1 ? 'Continuar' : 'Comenzar'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
