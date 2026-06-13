import { useState, useEffect, useRef } from 'react';
import { ChevronRight, BookOpen, Code2, X, CheckCircle, AlertCircle, ChevronDown, Crown, Sparkles } from 'lucide-react';
import { SAMPLE_LIST, ArmyList, FACTIONS } from './shared';
import { ScreenHeader } from './ScreenHeader';
import { FactionBadge } from './ScreenHeader';
import { isArmyListText, parseArmyListText, ImportedList, ParsedUnit } from '../lib/armyListParser';

// ── HTML parser ────────────────────────────────────────────────────────────────
const SKIP_PREFIXES = [
  'abilities', 'ability', 'configuration', 'weapon', 'rule', 'keyword',
  'stratagems', 'detachment', 'faction', 'points', 'total', 'pts',
  'warlord', 'enhancement', 'chapter', 'options',
];

function parseArmyHtml(raw: string): { list: ImportedList | null; error?: string } {
  // GW-style text export (header banner + unit list) — dedicated parser with base-size lookup
  if (isArmyListText(raw)) {
    return parseArmyListText(raw);
  }

  try {
    const isHtml = raw.trim().startsWith('<');
    let doc: Document;

    if (isHtml) {
      doc = new DOMParser().parseFromString(raw, 'text/html');
    } else {
      // Treat as plain text wrapped in a body
      doc = new DOMParser().parseFromString(`<body><pre>${raw}</pre></body>`, 'text/html');
    }

    // ── Army name ──
    const nameEl =
      doc.querySelector('#nameLabel') ||
      doc.querySelector('.roster-title') ||
      doc.querySelector('.force-name') ||
      doc.querySelector('h1');
    const rawTitle = nameEl?.textContent?.trim() ?? doc.title ?? '';
    const armyName = rawTitle.replace(/\s*\[.*?\]\s*/g, '').replace(/\s*\(.*?pts.*?\)\s*/gi, '').trim() || 'Lista importada';

    // ── Total points ──
    const ptsMatch = rawTitle.match(/\[?(\d{3,5})\s*pts?\]?/i) || raw.match(/Total.*?(\d{3,5})\s*pts?/i);
    const totalPoints = ptsMatch ? parseInt(ptsMatch[1]) : undefined;

    const units: ParsedUnit[] = [];
    const seen = new Set<string>();

    const addUnit = (name: string, models: number, points?: number) => {
      const key = name.toLowerCase().trim();
      if (!key || seen.has(key) || key.length < 3 || key.length > 80) return;
      if (SKIP_PREFIXES.some(p => key.startsWith(p))) return;
      if (/^[\d\s\-]+$/.test(key)) return;
      seen.add(key);
      units.push({ name: name.trim(), models, points });
    };

    // Strategy 1 — Battlescribe rootselection elements
    const rootSels = doc.querySelectorAll('.rootselection');
    if (rootSels.length > 0) {
      rootSels.forEach(sel => {
        const nameEl = sel.querySelector('.selectionName') ?? sel.querySelector('.bold');
        if (!nameEl) return;
        const text = nameEl.textContent ?? '';
        const cleaned = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
        const mxMatch = text.match(/^(\d+)[x×]\s*/i);
        const models = mxMatch ? parseInt(mxMatch[1]) : 1;
        const pts = text.match(/(\d+)\s*pts?/i);
        addUnit(cleaned.replace(/^\d+[x×]\s*/i, ''), models, pts ? parseInt(pts[1]) : undefined);
      });
    }

    // Strategy 2 — table rows (Battlescribe / New Recruit HTML)
    if (units.length === 0) {
      doc.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;
        const nameTd = cells[0].textContent?.trim() ?? '';
        const ptsTd = cells[cells.length - 1].textContent?.trim() ?? '';
        if (!nameTd) return;
        const mxMatch = nameTd.match(/^(\d+)[x×]\s*/i);
        const models = mxMatch ? parseInt(mxMatch[1]) : 1;
        const pts = parseInt(ptsTd);
        addUnit(nameTd.replace(/^\d+[x×]\s*/i, ''), models, isNaN(pts) ? undefined : pts);
      });
    }

    // Strategy 3 — paragraph / bold tags (common Battlescribe HTML)
    if (units.length === 0) {
      doc.querySelectorAll('p, li, .bold, b').forEach(el => {
        if (el.querySelector('p, li, b')) return; // skip containers
        const text = el.textContent?.trim() ?? '';
        if (!text || text.length < 3 || text.length > 100) return;
        const mxMatch = text.match(/^(\d+)[x×]\s*/i);
        const xnMatch = text.match(/[x×]\s*(\d+)\s*$/i);
        const models = mxMatch ? parseInt(mxMatch[1]) : xnMatch ? parseInt(xnMatch[1]) : 1;
        const pts = text.match(/\[?(\d+)\s*pts?\]?/i);
        const name = text
          .replace(/^\d+[x×]\s*/i, '')
          .replace(/[x×]\s*\d+\s*$/i, '')
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .trim();
        addUnit(name, models, pts ? parseInt(pts[1]) : undefined);
      });
    }

    // Strategy 4 — plain text lines
    if (units.length === 0) {
      const lines = (doc.body?.textContent ?? raw).split('\n');
      lines.forEach(line => {
        const t = line.trim();
        if (!t || t.length < 3 || t.length > 100) return;
        const mxMatch = t.match(/^(\d+)[x×]\s+(.+)/);
        const xnMatch = t.match(/^(.+?)\s+[x×]\s*(\d+)/);
        if (mxMatch) {
          const pts = mxMatch[2].match(/\[(\d+)/);
          addUnit(mxMatch[2].replace(/\[.*/, '').trim(), parseInt(mxMatch[1]), pts ? parseInt(pts[1]) : undefined);
        } else if (xnMatch) {
          const pts = t.match(/\[(\d+)/);
          addUnit(xnMatch[1].trim(), parseInt(xnMatch[2]), pts ? parseInt(pts[1]) : undefined);
        } else if (/^[A-ZÁÉÍÓÚÑ]/.test(t) && !/^(HQ|Troop|Elite|Fast|Heavy|Flyer|Fort|Lord)s?$/i.test(t)) {
          const pts = t.match(/\[(\d+)/);
          addUnit(t.replace(/\[.*/, '').trim(), 1, pts ? parseInt(pts[1]) : undefined);
        }
      });
    }

    if (units.length === 0) {
      return { list: null, error: 'No se encontraron unidades. Verificá el formato del HTML.' };
    }

    return {
      list: { id: `html-${Date.now()}`, armyName, source: 'html', totalPoints, units },
    };
  } catch (e) {
    return { list: null, error: 'Error al procesar el HTML.' };
  }
}

// ── Processing steps ───────────────────────────────────────────────────────────
const STEPS = ['Analizando contenido...', 'Identificando unidades...', 'Calculando miniaturas...'];

function ProcessingIndicator({ step }: { step: number }) {
  return (
    <div className="flex flex-col items-center gap-5 py-8">
      {/* Spinner */}
      <div style={{ position: 'relative', width: 52, height: 52 }}>
        <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', inset: 0 }}>
          <circle cx="26" cy="26" r="22" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <circle cx="26" cy="26" r="22" fill="none" stroke="var(--primary)" strokeWidth="3"
            strokeLinecap="round" strokeDasharray="138" strokeDashoffset="100"
            style={{ transformOrigin: '26px 26px', animation: 'spin 0.9s linear infinite' }} />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2 w-full px-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div style={{
              width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < step ? 'rgba(45,181,124,0.15)' : i === step ? 'rgba(110,69,226,0.15)' : 'var(--muted)',
              border: `1px solid ${i < step ? 'rgba(45,181,124,0.4)' : i === step ? 'rgba(110,69,226,0.4)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.3s',
            }}>
              {i < step
                ? <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#2db57c" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                : i === step
                  ? <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--primary)' }} />
                  : null
              }
            </div>
            <span style={{
              fontSize: 13,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.02em',
              color: i <= step ? 'var(--foreground)' : 'var(--muted-foreground)',
              transition: 'color 0.3s',
            }}>
              {s}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Result preview ─────────────────────────────────────────────────────────────
function ListPreview({ list, onConfirm }: { list: ImportedList; onConfirm: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const totalModels = list.units.reduce((s, u) => s + u.models, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Header card */}
      <div style={{ background: 'rgba(45,181,124,0.07)', border: '1px solid rgba(45,181,124,0.2)', borderRadius: 10, padding: '12px 14px' }}>
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle size={14} style={{ color: '#2db57c' }} />
          <span style={{ fontSize: 11, color: '#2db57c', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Lista procesada
          </span>
        </div>
        <p style={{ fontSize: 17, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 2 }}>
          {list.armyName}
        </p>
        {list.factionName && (
          <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 6 }}>{list.factionName}</p>
        )}
        <div className="flex gap-3 flex-wrap mb-1">
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{list.units.length} unidades</span>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{totalModels} miniaturas</span>
          {list.totalPoints && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif" }}>{list.totalPoints} pts</span>}
          {list.detachmentDp != null && <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{list.detachmentDp} DP</span>}
          {list.detachmentForceDisposition && <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{list.detachmentForceDisposition}</span>}
        </div>
        {list.warlord && (
          <div className="flex items-center gap-1.5 mt-1">
            <Crown size={12} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>Warlord: <span style={{ color: 'var(--foreground)' }}>{list.warlord}</span></span>
          </div>
        )}
        {list.enhancements?.map((e, i) => (
          <div key={i} className="flex items-center gap-1.5 mt-1">
            <Sparkles size={12} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>
              {e.name}{e.unit ? <> en <span style={{ color: 'var(--foreground)' }}>{e.unit}</span></> : null} (+{e.points} pts)
            </span>
          </div>
        ))}
      </div>

      {/* Unit list */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between px-4 py-3"
        >
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Unidades detectadas
          </span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>

        {expanded && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {list.units.map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2.5"
                style={{ borderBottom: i < list.units.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {u.isWarlord && <Crown size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                  <span style={{ fontSize: 13, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {u.baseMm && (
                    <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '1px 6px' }}>
                      {u.baseMm}
                    </span>
                  )}
                  {u.points && (
                    <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif" }}>
                      {u.points}pts
                    </span>
                  )}
                  <span style={{
                    fontSize: 11,
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 700,
                    color: 'var(--primary)',
                    background: 'rgba(110,69,226,0.12)',
                    border: '1px solid rgba(110,69,226,0.2)',
                    borderRadius: 4,
                    padding: '2px 7px',
                    letterSpacing: '0.04em',
                  }}>
                    ×{u.models}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        className="w-full flex items-center justify-center py-3.5 rounded-xl"
        style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', boxShadow: '0 4px 18px rgba(110,69,226,0.35)' }}
      >
        Confirmar importación
      </button>
    </div>
  );
}

// ── Import modal (HTML) ────────────────────────────────────────────────────────
type ModalPhase = 'input' | 'processing' | 'preview' | 'error';

function HtmlImportModal({ onImport, onClose }: { onImport: (list: ImportedList) => void; onClose: () => void }) {
  const [phase, setPhase] = useState<ModalPhase>('input');
  const [html, setHtml] = useState('');
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<ImportedList | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleValidate = async () => {
    if (!html.trim()) return;
    setPhase('processing');
    setStep(0);

    // Animate steps
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 650));
    }

    const { list, error } = parseArmyHtml(html);
    if (list) {
      setResult(list);
      setPhase('preview');
    } else {
      setErrorMsg(error ?? 'No se pudo procesar la lista.');
      setPhase('error');
    }
  };

  return (
    <ModalShell title="Cargá tu lista" source="html" onClose={onClose}>
      {phase === 'input' && (
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.55 }}>
            Pegá tu lista exportada como texto (formato Warhammer App / WTC) o el HTML exportado desde <b style={{ color: 'var(--foreground)' }}>Battlescribe</b> o <b style={{ color: 'var(--foreground)' }}>New Recruit</b>.
          </p>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            placeholder="Pegá tu lista aquí..."
            rows={8}
            style={{
              width: '100%',
              background: 'var(--muted)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              color: 'var(--foreground)',
              fontSize: 12,
              fontFamily: 'monospace',
              padding: '12px',
              resize: 'none',
              outline: 'none',
              lineHeight: 1.5,
            }}
          />
          <button
            onClick={handleValidate}
            disabled={!html.trim()}
            className="w-full flex items-center justify-center py-3.5 rounded-xl"
            style={{
              background: html.trim() ? 'var(--primary)' : 'var(--muted)',
              color: html.trim() ? 'white' : 'var(--muted-foreground)',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
              transition: 'background 0.15s',
            }}
          >
            Validar
          </button>
        </div>
      )}

      {phase === 'processing' && <ProcessingIndicator step={step} />}

      {phase === 'preview' && result && (
        <ListPreview list={result} onConfirm={() => { onImport(result); onClose(); }} />
      )}

      {phase === 'error' && (
        <div className="flex flex-col items-center gap-5 py-4">
          <AlertCircle size={36} style={{ color: '#e84040' }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: 'var(--foreground)', fontWeight: 600, marginBottom: 8 }}>No se pudo procesar</p>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{errorMsg}</p>
          </div>
          <button
            onClick={() => { setPhase('input'); setHtml(''); }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg"
            style={{ background: 'var(--muted)', color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
          >
            Intentar de nuevo
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ── Modal shell ────────────────────────────────────────────────────────────────
function ModalShell({ title, source, onClose, children }: {
  title: string;
  source: 'html' | 'yellowscribe';
  onClose: () => void;
  children: React.ReactNode;
}) {
  const accent = source === 'yellowscribe' ? '#f0920e' : 'var(--primary)';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
      onClick={onClose}>
      <div
        style={{ background: 'var(--card)', borderTop: `1px solid ${accent}30`, borderRadius: '18px 18px 0 0', padding: '0 16px 36px', maxHeight: '88%', overflowY: 'auto', boxShadow: '0 -12px 40px rgba(0,0,0,0.65)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, margin: '14px auto 20px' }} />
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${accent}18`, border: `1px solid ${accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {source === 'html'
                ? <Code2 size={15} style={{ color: accent }} />
                : <Zap size={15} style={{ color: accent }} />
              }
            </div>
            <h3 style={{ fontSize: 16, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {title}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)', padding: 6 }}>
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Imported list card ─────────────────────────────────────────────────────────
function ImportedListCard({ list }: { list: ImportedList }) {
  const [expanded, setExpanded] = useState(false);
  const totalModels = list.units.reduce((s, u) => s + u.models, 0);
  const sourceColor = 'var(--primary)';
  const sourceLabel = list.source === 'text' ? 'Lista' : 'HTML';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: sourceColor, background: `${sourceColor}15`, border: `1px solid ${sourceColor}30`, borderRadius: 3, padding: '2px 6px' }}>
            {sourceLabel}
          </span>
          {list.totalPoints && (
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Barlow Condensed', sans-serif", color: 'var(--accent)' }}>
              {list.totalPoints} <span style={{ fontSize: 10, color: 'var(--muted-foreground)' }}>pts</span>
            </span>
          )}
        </div>
        <p style={{ fontSize: 16, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 2 }}>
          {list.armyName}
        </p>
        {list.factionName && (
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 4 }}>{list.factionName}</p>
        )}
        <div className="flex gap-3">
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{list.units.length} unidades</span>
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{totalModels} miniaturas</span>
        </div>
      </div>

      {/* Expandable unit list */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
      >
        <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {expanded ? 'Ocultar unidades' : 'Ver unidades'}
        </span>
        <ChevronDown size={13} style={{ color: 'var(--muted-foreground)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {list.units.map((u, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-2"
              style={{ borderBottom: i < list.units.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
            >
              <span style={{ fontSize: 12, color: 'var(--foreground)', fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {u.name}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                {u.baseMm && (
                  <span style={{ fontSize: 10, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif", border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4, padding: '1px 6px' }}>
                    {u.baseMm}
                  </span>
                )}
                <span style={{ fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: sourceColor, background: `${sourceColor}12`, border: `1px solid ${sourceColor}25`, borderRadius: 4, padding: '1px 6px' }}>
                  ×{u.models}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Skeleton & empty ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-lg p-4 animate-pulse" style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <div style={{ width: 48, height: 20, background: 'var(--muted)', borderRadius: 4 }} />
        <div style={{ width: 60, height: 14, background: 'var(--muted)', borderRadius: 4 }} />
      </div>
      <div style={{ width: '60%', height: 16, background: 'var(--muted)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: '40%', height: 12, background: 'var(--muted)', borderRadius: 4 }} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-8 text-center pb-24">
      <div className="flex items-center justify-center rounded-2xl" style={{ width: 80, height: 80, background: 'var(--muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <BookOpen size={32} style={{ color: 'var(--muted-foreground)' }} />
      </div>
      <div>
        <h3 style={{ fontSize: 20, color: 'var(--foreground)', marginBottom: 8 }}>Sin listas guardadas</h3>
        <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
          Importá tu lista desde Battlescribe, New Recruit o Yellowscribe para acceder al análisis.
        </p>
      </div>
    </div>
  );
}

// ── Existing list card ─────────────────────────────────────────────────────────
function ListCard({ list, onMatchup }: { list: ArmyList; onMatchup: () => void }) {
  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--card)', border: `1px solid ${list.faction.color}25` }}>
      <div className="flex items-start justify-between mb-2">
        <FactionBadge abbr={list.faction.abbr} color={list.faction.color} />
        <div className="flex items-center gap-1.5">
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{list.totalPoints}</span>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)', fontFamily: "'Barlow Condensed', sans-serif" }}>PTS</span>
        </div>
      </div>
      <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase', color: 'var(--foreground)', marginBottom: 3 }}>{list.name}</p>
      <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 12 }}>{list.detachment.name}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {list.keyUnits.map(u => (
          <span key={u.id} style={{ background: list.faction.color + '15', border: `1px solid ${list.faction.color}30`, color: list.faction.color, borderRadius: 3, padding: '2px 6px', fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
            {u.shortName}
          </span>
        ))}
      </div>
      <button onClick={onMatchup} className="w-full flex items-center justify-center gap-2 py-2 rounded"
        style={{ background: 'var(--primary)', color: 'white', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Analizar matchup <ChevronRight size={13} />
      </button>
    </div>
  );
}

const MOCK_LIST_2: ArmyList = {
  id: 'list-2',
  name: 'Awakened Force',
  faction: FACTIONS[2],
  detachment: { id: 'awakened', name: 'Awakened Dynasty', factionId: 'necrons' },
  keyUnits: [
    { id: 'warriors', name: 'Guerreros Necron', shortName: 'GUE', type: 'infantry', points: 90, factionId: 'necrons', role: 'Tropa' },
    { id: 'overlord', name: 'Señor de la Cripta', shortName: 'OVR', type: 'character', points: 85, factionId: 'necrons', role: 'Líder' },
    { id: 'c-tan', name: "C'tan Shard", shortName: "C'TN", type: 'monster', points: 250, factionId: 'necrons', role: 'Especial' },
  ],
  totalPoints: 1850,
};

// ── Screen ─────────────────────────────────────────────────────────────────────
interface MyListsScreenProps {
  onCreateList: () => void;
  onGoMatchup: (list: ArmyList) => void;
}

type ViewState = 'loading' | 'filled';
type ModalType = 'html' | null;

export function MyListsScreen({ onGoMatchup }: MyListsScreenProps) {
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [importedLists, setImportedLists] = useState<ImportedList[]>([]);
  const [modal, setModal] = useState<ModalType>(null);
  const existingLists = [SAMPLE_LIST, MOCK_LIST_2];

  useEffect(() => {
    const t = setTimeout(() => setViewState('filled'), 900);
    return () => clearTimeout(t);
  }, []);

  const handleImport = (list: ImportedList) => {
    setImportedLists(prev => [list, ...prev]);
  };

  const totalLists = existingLists.length + importedLists.length;

  return (
    <div className="flex flex-col h-full" style={{ position: 'relative' }}>
      <ScreenHeader
        title="Mis Listas"
        subtitle={viewState === 'filled' ? `${totalLists} ejércitos guardados` : undefined}
      />

      {viewState === 'loading' && (
        <div className="flex flex-col gap-3 p-4 overflow-y-auto">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      )}

      {viewState === 'filled' && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-3 p-4 pb-28">
            {/* Imported lists first */}
            {importedLists.map(l => <ImportedListCard key={l.id} list={l} />)}

            {/* Existing mock lists */}
            {existingLists.map(l => (
              <ListCard key={l.id} list={l} onMatchup={() => onGoMatchup(l)} />
            ))}
          </div>
        </div>
      )}

      {/* Action bar */}
      <div
        className="absolute left-0 right-0 flex gap-2 px-4 py-3"
        style={{ bottom: 64, background: 'linear-gradient(to top, var(--background) 60%, transparent)', zIndex: 10 }}
      >
        <button
          onClick={() => setModal('html')}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg"
          style={{ background: 'rgba(110,69,226,0.12)', border: '1px solid rgba(110,69,226,0.3)', color: 'var(--primary)', fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
        >
          <Code2 size={14} />
          Cargá tu lista
        </button>
      </div>

      {modal === 'html' && (
        <HtmlImportModal onImport={handleImport} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
