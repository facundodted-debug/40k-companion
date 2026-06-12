export type UnitType = 'infantry' | 'vehicle' | 'monster' | 'character' | 'special';

export type Faction = {
  id: string;
  name: string;
  abbr: string;
  color: string;
};

export type Detachment = {
  id: string;
  name: string;
  factionId: string;
};

export type Unit = {
  id: string;
  name: string;
  shortName: string;
  type: UnitType;
  points: number;
  factionId: string;
  role: string;
};

export type ArmyList = {
  id: string;
  name: string;
  faction: Faction;
  detachment: Detachment;
  keyUnits: Unit[];
  totalPoints: number;
};

export type Mission = {
  id: string;
  name: string;
  subtitle: string;
  deployment: 'horizontal' | 'diagonal' | 'corner' | 'hammer';
  objectives: number;
};

export type RivalFaction = {
  id: string;
  name: string;
  color: string;
  abbr: string;
};

export interface UnitWeapon {
  name: string;
  range: string;
  a: string;
  skill: string;
  s: string;
  ap: string;
  d: string;
}

export interface OpponentUnit {
  name: string;
  pts: number;
  keywords: string[];
  stats: { m: string; t: number; sv: string; w: number; ld: string; oc: number };
  ranged: UnitWeapon[];
  melee: UnitWeapon[];
  abilities: string[];
  considerations: string;
  recommendations: string;
}

export const FACTIONS: Faction[] = [
  { id: 'space-marines', name: 'Space Marines', abbr: 'SM', color: '#3d7ef0' },
  { id: 'chaos-space-marines', name: 'Chaos Space Marines', abbr: 'CSM', color: '#8b2121' },
  { id: 'necrons', name: 'Necrons', abbr: 'NEC', color: '#2d9e4f' },
  { id: 'tyranids', name: 'Tiránidos', abbr: 'TYR', color: '#9c2d9c' },
  { id: 'tau', name: "Imperio T'au", abbr: "T'AU", color: '#3baaeb' },
  { id: 'aeldari', name: 'Aeldari', abbr: 'AEL', color: '#d4a843' },
  { id: 'orks', name: 'Orks', abbr: 'ORK', color: '#4a7a1e' },
  { id: 'death-guard', name: 'Death Guard', abbr: 'DG', color: '#6a7a3a' },
  { id: 'thousand-sons', name: 'Thousand Sons', abbr: 'TS', color: '#1a4a8b' },
  { id: 'world-eaters', name: 'World Eaters', abbr: 'WE', color: '#b22222' },
  { id: 'drukhari', name: 'Drukhari', abbr: 'DRU', color: '#6b1a7a' },
  { id: 'custodes', name: 'Adeptus Custodes', abbr: 'CUS', color: '#c8941a' },
];

export const DETACHMENTS: Record<string, Detachment[]> = {
  'space-marines': [
    { id: 'gladius', name: 'Gladius Task Force', factionId: 'space-marines' },
    { id: 'spearhead', name: 'Spearhead Assault', factionId: 'space-marines' },
    { id: 'vanguard', name: 'Vanguard Spearhead', factionId: 'space-marines' },
    { id: 'anvil', name: 'Anvil Siege Force', factionId: 'space-marines' },
  ],
  'necrons': [
    { id: 'awakened', name: 'Awakened Dynasty', factionId: 'necrons' },
    { id: 'canoptek', name: 'Canoptek Court', factionId: 'necrons' },
    { id: 'hyper', name: 'Hyper Dynasty', factionId: 'necrons' },
    { id: 'starshatter', name: 'Starshatter Arsenal', factionId: 'necrons' },
  ],
  'tyranids': [
    { id: 'crusher', name: 'Crusher Stampede', factionId: 'tyranids' },
    { id: 'invasion', name: 'Invasion Fleet', factionId: 'tyranids' },
    { id: 'synaptic', name: 'Synaptic Nexus', factionId: 'tyranids' },
  ],
  'chaos-space-marines': [
    { id: 'raiders', name: 'Raiders from the Warp', factionId: 'chaos-space-marines' },
    { id: 'tide', name: 'Tide of Traitors', factionId: 'chaos-space-marines' },
    { id: 'pactbound', name: 'Pactbound Zealots', factionId: 'chaos-space-marines' },
  ],
};

export const UNITS: Record<string, Unit[]> = {
  'space-marines': [
    { id: 'terminators', name: 'Escuadra Terminator', shortName: 'TERM', type: 'infantry', points: 200, factionId: 'space-marines', role: 'Élite' },
    { id: 'intercessors', name: 'Intercessors', shortName: 'INT', type: 'infantry', points: 85, factionId: 'space-marines', role: 'Tropa' },
    { id: 'captain-term', name: 'Capitán Terminator', shortName: 'CAP', type: 'character', points: 110, factionId: 'space-marines', role: 'Líder' },
    { id: 'redemptor', name: 'Dreadnought Redemptor', shortName: 'RED', type: 'vehicle', points: 185, factionId: 'space-marines', role: 'Vehículo' },
    { id: 'aggressors', name: 'Aggressors', shortName: 'AGG', type: 'infantry', points: 110, factionId: 'space-marines', role: 'Élite' },
    { id: 'impulsor', name: 'Impulsor', shortName: 'IMP', type: 'vehicle', points: 75, factionId: 'space-marines', role: 'Transporte' },
    { id: 'librarian', name: 'Bibliotecario', shortName: 'LIB', type: 'character', points: 70, factionId: 'space-marines', role: 'Psíquico' },
    { id: 'hellblasters', name: 'Hellblasters', shortName: 'HBL', type: 'infantry', points: 100, factionId: 'space-marines', role: 'Élite' },
  ],
  'necrons': [
    { id: 'warriors', name: 'Guerreros Necron', shortName: 'GUE', type: 'infantry', points: 90, factionId: 'necrons', role: 'Tropa' },
    { id: 'immortals', name: 'Inmortales', shortName: 'INM', type: 'infantry', points: 90, factionId: 'necrons', role: 'Tropa' },
    { id: 'overlord', name: 'Señor de la Cripta', shortName: 'OVR', type: 'character', points: 85, factionId: 'necrons', role: 'Líder' },
    { id: 'doomsday-ark', name: 'Doomsday Ark', shortName: 'DDA', type: 'vehicle', points: 195, factionId: 'necrons', role: 'Vehículo' },
    { id: 'c-tan', name: "C'tan Shard", shortName: "C'TN", type: 'monster', points: 250, factionId: 'necrons', role: 'Especial' },
    { id: 'lychguard', name: 'Lychguard', shortName: 'LYC', type: 'infantry', points: 90, factionId: 'necrons', role: 'Élite' },
    { id: 'cryptek', name: 'Cryptek', shortName: 'CRY', type: 'character', points: 50, factionId: 'necrons', role: 'Soporte' },
    { id: 'ghost-ark', name: 'Ghost Ark', shortName: 'GHA', type: 'vehicle', points: 145, factionId: 'necrons', role: 'Transporte' },
  ],
};

export const MISSIONS: Mission[] = [
  { id: 'sweep', name: 'Sweeping Engagement', subtitle: 'Despliegue frontal largo', deployment: 'horizontal', objectives: 5 },
  { id: 'vanguard', name: 'Vanguard Strike', subtitle: 'Zonas diagonales estrechas', deployment: 'diagonal', objectives: 5 },
  { id: 'crucible', name: 'Crucible of Battle', subtitle: 'Zonas de esquina', deployment: 'corner', objectives: 6 },
  { id: 'dawn', name: 'Dawn of War', subtitle: 'Despliegue amplio', deployment: 'horizontal', objectives: 5 },
  { id: 'vital', name: 'Vital Ground', subtitle: 'Presión hacia adelante', deployment: 'hammer', objectives: 5 },
  { id: 'search', name: 'Search & Destroy', subtitle: 'Líneas de visión largas', deployment: 'diagonal', objectives: 6 },
];

export const INITIAL_BOARD_UNITS = [
  { id: 'own-1', name: 'Terminators', shortName: 'TERM', type: 'infantry' as const, side: 'own' as const, x: 200, y: 380 },
  { id: 'own-2', name: 'Captain', shortName: 'CAP', type: 'character' as const, side: 'own' as const, x: 300, y: 390 },
  { id: 'own-3', name: 'Redemptor', shortName: 'RED', type: 'vehicle' as const, side: 'own' as const, x: 100, y: 370 },
  { id: 'own-4', name: 'Aggressors', shortName: 'AGG', type: 'infantry' as const, side: 'own' as const, x: 450, y: 385 },
  { id: 'rival-1', name: 'Warriors', shortName: 'GUE', type: 'infantry' as const, side: 'rival' as const, x: 200, y: 60 },
  { id: 'rival-2', name: 'Overlord', shortName: 'OVR', type: 'character' as const, side: 'rival' as const, x: 310, y: 55 },
  { id: 'rival-3', name: "C'tan Shard", shortName: "C'TN", type: 'monster' as const, side: 'rival' as const, x: 420, y: 65 },
  { id: 'rival-4', name: 'Doomsday', shortName: 'DDA', type: 'vehicle' as const, side: 'rival' as const, x: 120, y: 60 },
];

export const SAMPLE_LIST: ArmyList = {
  id: 'list-1',
  name: 'Gladius Agresivo',
  faction: FACTIONS[0],
  detachment: DETACHMENTS['space-marines'][0],
  keyUnits: [
    UNITS['space-marines'][0],
    UNITS['space-marines'][2],
    UNITS['space-marines'][3],
    UNITS['space-marines'][4],
  ],
  totalPoints: 1980,
};
