import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SubFaction {
  id: string;
  name: string;
  detachments: string[];
}

export interface FactionCategory {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  subfactions: SubFaction[];
}

// ── Data ───────────────────────────────────────────────────────────────────────

export const FACTION_CATEGORIES: FactionCategory[] = [
  {
    id: 'space-marines',
    name: 'Space Marines',
    color: '#3d7ef0',
    accentColor: 'rgba(61,126,240,0.12)',
    subfactions: [
      { id: 'black-templars',  name: 'Black Templars',  detachments: ['Righteous Crusaders', 'Templar Crusade', 'Vow-Bearers'] },
      { id: 'blood-angels',    name: 'Blood Angels',    detachments: ["Sons of Sanguinius", "Dante's Chosen", 'Red Thirst Unleashed'] },
      { id: 'dark-angels',     name: 'Dark Angels',     detachments: ['Unforgiven Task Force', 'Deathwing Host', 'Ravenwing Strike'] },
      { id: 'deathwatch',      name: 'Deathwatch',      detachments: ['Spectrus Kill Team', 'Fortis Kill Team', 'Watch Company'] },
      { id: 'grey-knights',    name: 'Grey Knights',    detachments: ['Teleport Strike Force', 'Warding Host', 'Swordbearers'] },
      { id: 'imperial-fists',  name: 'Imperial Fists',  detachments: ['Siege Breakers', 'Fist of Dorn', 'Wall Wardens'] },
      { id: 'iron-hands',      name: 'Iron Hands',      detachments: ['Ironstorm Spearhead', 'Clan Raukaan', 'Steel Behemoths'] },
      { id: 'raven-guard',     name: 'Raven Guard',     detachments: ['Vanguard Spearhead', 'Shadow Operations', "Shrike's Wing"] },
      { id: 'salamanders',     name: 'Salamanders',     detachments: ['Flamecraft', 'Promethean Brotherhood', "Vulkan's Chosen"] },
      { id: 'space-wolves',    name: 'Space Wolves',    detachments: ['Champions of Fenris', 'Stormlance Task Force', 'Wulfen Brotherhood'] },
      { id: 'ultramarines',    name: 'Ultramarines',    detachments: ['Gladius Task Force', 'Spearhead Assault', 'Vanguard Spearhead', 'Anvil Siege Force'] },
      { id: 'white-scars',     name: 'White Scars',     detachments: ['Storming the Lines', 'Lightning Strike Force', 'Khanate Brotherhood'] },
    ],
  },
  {
    id: 'imperium',
    name: 'Armies of the Imperium',
    color: '#c8941a',
    accentColor: 'rgba(200,148,26,0.12)',
    subfactions: [
      { id: 'adepta-sororitas',   name: 'Adepta Sororitas',      detachments: ['Hallowed Martyrs', 'Penitent Host', 'Righteous Rage'] },
      { id: 'adeptus-custodes',   name: 'Adeptus Custodes',      detachments: ['Talons of the Emperor', 'Solar Watch', 'Auric Champions'] },
      { id: 'adeptus-mechanicus', name: 'Adeptus Mechanicus',    detachments: ['Cohort Cybernetica', 'Rad-Zone Corps', 'Skitarii Hunter Cohort'] },
      { id: 'adeptus-titanicus',  name: 'Adeptus Titanicus',     detachments: ['Titan Battlegroup', 'Axiom Maniple', 'Reaver Lance'] },
      { id: 'astra-militarum',    name: 'Astra Militarum',       detachments: ['Combined Regiment', 'Hammer of the Emperor', 'Mechanised Infantry'] },
      { id: 'agents-imperium',    name: 'Agents of the Imperium',detachments: ['Inquisitorial Agents', 'Kill Team Attachment'] },
      { id: 'imperial-knights',   name: 'Imperial Knights',      detachments: ['Noble Lance', 'Questor Imperialis', 'Wardens of the Flame'] },
    ],
  },
  {
    id: 'chaos',
    name: 'Armies of Chaos',
    color: '#8b2121',
    accentColor: 'rgba(139,33,33,0.15)',
    subfactions: [
      { id: 'chaos-daemons',       name: 'Chaos Daemons',       detachments: ['Warp Invasion', 'Daemonic Incursion', 'Blood Tide'] },
      { id: 'chaos-knights',       name: 'Chaos Knights',       detachments: ['Traitoris Lance', 'Iconoclast Horde', 'Dread Court'] },
      { id: 'chaos-space-marines', name: 'Chaos Space Marines', detachments: ['Raiders from the Warp', 'Tide of Traitors', 'Pactbound Zealots'] },
      { id: 'death-guard',         name: 'Death Guard',         detachments: ['Plague Company', 'Inexorable Advance', 'Contagion of Despair'] },
      { id: 'emperors-children',   name: "Emperor's Children",  detachments: ['Kakophoni', "Slaanesh's Finest", 'Perfect Predators'] },
      { id: 'iron-warriors',       name: 'Iron Warriors',       detachments: ['Siege Masters', "Warsmith's Legion", 'Grand Battery'] },
      { id: 'red-corsairs',        name: 'Red Corsairs',        detachments: ['Renegade Raiders', 'Corsair Warband', "Blackheart's Chosen"] },
      { id: 'thousand-sons',       name: 'Thousand Sons',       detachments: ['Cult of Magic', 'Arcane Warding', 'Sorcerous Cabal'] },
      { id: 'titanicus-traitoris', name: 'Titanicus Traitoris', detachments: ['Traitor Battlegroup', 'Corrupt Maniple'] },
      { id: 'world-eaters',        name: 'World Eaters',        detachments: ['Berzerker Warband', 'Skulls for the Skull Throne', "Angron's Chosen"] },
    ],
  },
  {
    id: 'xenos',
    name: 'Xenos Armies',
    color: '#6e45e2',
    accentColor: 'rgba(110,69,226,0.12)',
    subfactions: [
      { id: 'aeldari',             name: 'Aeldari',             detachments: ['Warhost', 'Aspect Host', 'Strands of Fate'] },
      { id: 'drukhari',            name: 'Drukhari',            detachments: ['Realspace Raiders', 'Haemonculus Covens', 'Skysplinter Assault'] },
      { id: 'genestealer-cult',    name: 'Genestealer Cult',    detachments: ['Cult Ambush', 'Bladed Cog', 'Pauper Princes'] },
      { id: 'leagues-of-votann',   name: 'Leagues of Votann',   detachments: ['Hernkyn Yaegirs', 'Oathband', 'Votann Warriors'] },
      { id: 'necrons',             name: 'Necrons',             detachments: ['Awakened Dynasty', 'Canoptek Court', 'Hyper Dynasty', 'Starshatter Arsenal'] },
      { id: 'orks',                name: 'Orks',                detachments: ['Waaagh!', 'Bully Boyz', 'Flash Gitz Marauders', 'Dakka Dakka Dakka'] },
      { id: 'tau-empire',          name: "T'au Empire",         detachments: ['Kauyon', "Mont'ka", 'Retaliation Cadre', "Dal'yth Sept"] },
      { id: 'tyranids',            name: 'Tyranids',            detachments: ['Crusher Stampede', 'Invasion Fleet', 'Synaptic Nexus', 'Assimilation Swarm'] },
    ],
  },
];

// ── Shared accordion component ─────────────────────────────────────────────────

interface FactionAccordionProps {
  category: FactionCategory;
  selectedSubfaction: SubFaction | null;
  onSelect: (subfaction: SubFaction, category: FactionCategory) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function FactionAccordion({
  category,
  selectedSubfaction,
  onSelect,
  isOpen,
  onToggle,
}: FactionAccordionProps) {
  const hasSelection = category.subfactions.some(s => s.id === selectedSubfaction?.id);

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${hasSelection ? category.color + '50' : 'rgba(255,255,255,0.07)'}`,
        background: hasSelection ? category.accentColor : 'var(--card)',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {/* Category header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: category.color,
            transform: 'rotate(45deg)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            flex: 1,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: hasSelection ? category.color : 'var(--foreground)',
            textAlign: 'left',
          }}
        >
          {category.name}
        </span>

        {/* Hint when closed + something selected inside */}
        {hasSelection && selectedSubfaction && !isOpen && (
          <span
            style={{
              fontSize: 10,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 600,
              color: category.color,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginRight: 4,
              maxWidth: 100,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {selectedSubfaction.name}
          </span>
        )}

        <ChevronDown
          size={15}
          style={{
            color: hasSelection ? category.color : 'var(--muted-foreground)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.22s',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Subfaction list */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {category.subfactions.map((sub, i) => {
                const isSelected = selectedSubfaction?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelect(sub, category)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left"
                    style={{
                      background: isSelected ? category.color + '18' : 'transparent',
                      borderBottom:
                        i < category.subfactions.length - 1
                          ? '1px solid rgba(255,255,255,0.04)'
                          : 'none',
                      transition: 'background 0.12s',
                    }}
                  >
                    {/* Indent rule */}
                    <div
                      style={{
                        width: 1,
                        height: 18,
                        borderRadius: 1,
                        background: isSelected ? category.color : 'rgba(255,255,255,0.1)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 500,
                        letterSpacing: '0.03em',
                        textTransform: 'uppercase',
                        color: isSelected ? category.color : 'var(--foreground)',
                        transition: 'color 0.12s',
                      }}
                    >
                      {sub.name}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: category.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={11} style={{ color: 'white' }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
