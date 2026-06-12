export interface DetachmentAbility {
  name: string;
  flavor: string;
  rule: string;
}

export interface DetachmentDescription {
  overview: string;
  abilities: DetachmentAbility[];
}

export const DETACHMENT_DESCRIPTIONS: Record<string, DetachmentDescription> = {

  // ── Space Marines ────────────────────────────────────────────────────────────

  'Gladius Task Force': {
    overview: 'At the start of your Command phase, you can select one of the Combat Doctrines listed below. Until the start of your next Command phase, that Combat Doctrine is active and its effects apply to all Space Marines units from your army. You can only select each Combat Doctrine once per battle.',
    abilities: [
      {
        name: 'Devastator Doctrine',
        flavor: 'The Codex Astartes details the strategic value of overwhelming firepower applied to key targets while advancing into position to eliminate threats.',
        rule: 'This unit is eligible to shoot in a turn in which it Advanced.',
      },
      {
        name: 'Tactical Doctrine',
        flavor: 'As the warring armies close upon one another and vicious fire-fights erupt, the Codex lays out strategies for swiftly seizing the initiative and combining versatility with firepower.',
        rule: 'This unit is eligible to shoot and declare a charge in a turn in which it Fell Back.',
      },
      {
        name: 'Assault Doctrine',
        flavor: 'The Codex Astartes leaves no doubt that the killing blow in most engagements must be delivered with a decisive close-quarters strike. It presents plentiful tactical means to achieve this end.',
        rule: 'This unit is eligible to declare a charge in a turn in which it Advanced.',
      },
    ],
  },

  'Spearhead Assault': {
    overview: 'Your army surges forward with overwhelming aggression. Vehicle and Monster units gain additional bonuses when they advance, turning speed into raw killing power.',
    abilities: [
      {
        name: 'Armoured Advance',
        flavor: 'The thunderous roar of engines fills the battlefield as armoured columns surge forward without hesitation.',
        rule: 'Vehicle and Monster units do not suffer the penalty to their Hit rolls for Advancing and shooting Assault weapons.',
      },
      {
        name: 'Shock and Awe',
        flavor: 'The sudden, overwhelming force of the assault leaves the enemy scrambling to respond.',
        rule: 'Once per battle round, you can re-roll one Hit roll, one Wound roll or one Damage roll for an attack made by a Vehicle or Monster unit.',
      },
    ],
  },

  'Vanguard Spearhead': {
    overview: 'Operating in the shadows ahead of the main force, Vanguard units use speed and stealth to disrupt enemy lines before the battle has truly begun.',
    abilities: [
      {
        name: 'Guerrilla Tactics',
        flavor: 'Strike fast, fade away, and never let the enemy pin down your forces — this is the Vanguard way.',
        rule: 'Infantry units can be set up in Strategic Reserves without taking up a Strategic Reserves slot.',
      },
      {
        name: 'Lightning Withdrawal',
        flavor: 'A Vanguard warrior knows when to disengage as well as when to attack.',
        rule: 'Once per turn, one Infantry unit can make a Normal move after it shoots, even if it Advanced this turn.',
      },
    ],
  },

  'Anvil Siege Force': {
    overview: 'The Anvil Siege Force specialises in fortifying positions and grinding down the enemy through relentless, methodical firepower. They do not move — they endure.',
    abilities: [
      {
        name: 'Immovable Object',
        flavor: 'Like the anvil that breaks all blows, these warriors hold their ground against any assault.',
        rule: 'Units that did not move in the Movement phase improve the AP of their ranged weapons by 1 until the end of the turn.',
      },
      {
        name: 'Siege Masters',
        flavor: 'No wall, no fortification, and no enemy stronghold has ever withstood the patience of the siege-masters.',
        rule: 'Wound rolls of 4+ made by this detachment\'s units against buildings and fortifications always succeed, regardless of Toughness.',
      },
    ],
  },

  'Righteous Crusaders': {
    overview: 'The Black Templars fight with unmatched zeal, driven by an eternal crusade against the enemies of the Emperor. Their warriors know no fear and seek out close-quarters glory.',
    abilities: [
      {
        name: 'Crusader\'s Zeal',
        flavor: 'No force in the galaxy can break the will of a Black Templar Crusader, for their faith is as unyielding as ceramite.',
        rule: 'Black Templars units do not lose models to Battleshock tests. Re-roll Advance and Charge rolls for this unit.',
      },
      {
        name: 'Oath of Crusade',
        flavor: 'Each Crusader swears an oath before battle, dedicating the slaughter to come to the Emperor\'s glory.',
        rule: 'Once per battle, you may declare a Crusade Oath. Until the end of the battle, all Black Templars units gain +1 Attack and +1 to their Advance and Charge rolls.',
      },
    ],
  },

  'Sons of Sanguinius': {
    overview: 'The Blood Angels carry both a glorious legacy and a terrible curse — the Red Thirst. In battle, their warrior nobility is matched only by their ferocious hunger for close combat.',
    abilities: [
      {
        name: 'The Red Thirst',
        flavor: 'Beneath the veneer of noble warriors lies an insatiable thirst, a dark hunger that the sons of Sanguinius struggle to contain.',
        rule: 'Add 1 to the Attacks characteristic of Blood Angels Infantry and Mounted units while they are within Engagement Range of any enemy units.',
      },
      {
        name: 'Artisans of War',
        flavor: 'Every Blood Angel is also a scholar and artist — perfection in combat is merely another form of creation.',
        rule: 'Once per battle round, you can re-roll one Hit roll or one Wound roll for an attack made by a Blood Angels unit.',
      },
    ],
  },

  // ── Necrons ──────────────────────────────────────────────────────────────────

  'Awakened Dynasty': {
    overview: 'The Awakened Dynasty rises from aeons of slumber with singular purpose — to reclaim dominion over the galaxy. Reanimation Protocols fire at peak efficiency, returning the fallen to battle again and again.',
    abilities: [
      {
        name: 'Reanimation Protocols',
        flavor: 'Death is merely an inconvenience to the Necrons. Their living metal bodies knit themselves back together through processes so advanced they appear miraculous.',
        rule: 'At the end of each phase, for each model that was destroyed this phase, roll one D6: on a 4+, that model is returned to its unit with 1 wound remaining.',
      },
      {
        name: 'Dynastic Ambition',
        flavor: 'The Silent King\'s return has reawakened ancient rivalries and long-dormant ambitions within the ruling dynasties.',
        rule: 'Once per battle, in your Command phase, you can use this ability. Until the start of your next Command phase, Reanimation Protocol rolls for your Necrons units succeed on a 3+ instead of a 4+.',
      },
    ],
  },

  'Canoptek Court': {
    overview: 'The Canoptek Court deploys swarms of mechanical constructs to support Necron warriors. These tireless automatons repair, rebuild, and recycle the battlefield dead with cold, machine efficiency.',
    abilities: [
      {
        name: 'Living Metal',
        flavor: 'The phased molecular bonding of Necron living metal allows structures damaged in battle to self-repair at a rate that defies conventional understanding.',
        rule: 'At the start of your Command phase, each Canoptek unit regains up to D3 lost wounds.',
      },
      {
        name: 'Scarab Swarm',
        flavor: 'Clouds of scarabs strip the flesh from bone and reclaim the fallen, returning raw materials to their masters.',
        rule: 'Canoptek Scarab Swarms units in this detachment can use the Reanimation Protocols ability to attempt to return one model to a Necrons unit within 6" instead of their own unit.',
      },
    ],
  },

  'Hyper Dynasty': {
    overview: 'Speed above all. The Hyper Dynasty strikes before the enemy can react, leveraging lightning-fast assault protocols to overwhelm positions before reinforcements can arrive.',
    abilities: [
      {
        name: 'Hyper-Phase Advance',
        flavor: 'Through manipulation of dimensional phase technology, Necron warriors can move through the fabric of reality at incomprehensible speeds.',
        rule: 'When this unit Advances, do not make an Advance roll. Instead, add 6" to the Move characteristic of each model in this unit until the end of the phase.',
      },
      {
        name: 'Quantum Shielding',
        flavor: 'Quantum force fields flicker in and out of phase, deflecting incoming fire that should by rights be lethal.',
        rule: 'The first time each phase that this unit would lose a wound, roll one D6: on a 5+, that wound is not lost.',
      },
    ],
  },

  // ── Tyranids ─────────────────────────────────────────────────────────────────

  'Crusher Stampede': {
    overview: 'A tide of monstrous creatures descends upon the enemy, their sheer biomass and ferocity overwhelming all resistance. The ground shakes beneath their advance.',
    abilities: [
      {
        name: 'Unstoppable Momentum',
        flavor: 'Once a Tyranid stampede is in motion, nothing short of annihilation can halt its terrible advance.',
        rule: 'Monster units in this detachment can declare a charge even if they Advanced this turn. Add 2 to Charge rolls made for Monster units.',
      },
      {
        name: 'Bio-Regeneration',
        flavor: 'The Hive Mind channels bioelectric energy to repair damage sustained by its largest creatures between assaults.',
        rule: 'At the start of your Command phase, each Monster unit in this detachment regains up to D3 lost wounds.',
      },
    ],
  },

  'Invasion Fleet': {
    overview: 'The full horror of a Tyranid Invasion Fleet descending upon a world is an event without parallel. Every creature serves the Hive Mind\'s single consuming purpose: the absorption of all biological matter.',
    abilities: [
      {
        name: 'Synaptic Imperative',
        flavor: 'Every Tyranid creature is a node in the Hive Mind\'s vast neural network, receiving and transmitting the will of the swarm.',
        rule: 'At the start of your Command phase, if your Warlord is on the battlefield, select one Synaptic Imperative. Until the start of your next Command phase, all Tyranids units gain the benefits of that Synaptic Imperative.',
      },
      {
        name: 'Voracious Appetite',
        flavor: 'The swarm does not merely destroy — it consumes, absorbing the genetic material of everything it kills.',
        rule: 'Each time a Tyranids unit destroys an enemy unit, until the end of the battle, add 1 to the Strength of all attacks made by Tyranids units.',
      },
    ],
  },

  // ── Chaos Space Marines ───────────────────────────────────────────────────────

  'Raiders from the Warp': {
    overview: 'Striking from daemonic forges and warp-touched bastions, Chaos Space Marine Warbands descend upon the mortal realm with terrifying unpredictability, their strikes empowered by the Dark Gods.',
    abilities: [
      {
        name: 'Warp Surge',
        flavor: 'The energies of the warp flood through the warriors, granting terrible strength at the cost of reason.',
        rule: 'Once per battle, in the Fight phase, you can use this ability. Until the end of the phase, add 1 to the Attacks and Strength characteristics of all Chaos Space Marines units.',
      },
      {
        name: 'Daemonic Possession',
        flavor: 'Some Chaos vehicles harbour bound daemons within their mechanical shells, granting them a terrible will of their own.',
        rule: 'Chaos vehicle units in this detachment can shoot in a turn in which they Fell Back, but must subtract 1 from their Hit rolls when they do so.',
      },
    ],
  },

  // ── Generic fallback (used when no specific description exists) ───────────────
  '__default__': {
    overview: 'This detachment provides unique strategic options for your army, granting special rules and abilities that define its battlefield role. Select this detachment to unlock its full tactical potential.',
    abilities: [
      {
        name: 'Detachment Rule',
        flavor: 'Each detachment embodies a distinct doctrine of war, tested across countless campaigns across the galaxy.',
        rule: 'Units in this detachment gain access to unique Enhancements, Stratagems, and special rules tailored to their fighting style.',
      },
    ],
  },
};

export function getDetachmentDescription(name: string): DetachmentDescription {
  return DETACHMENT_DESCRIPTIONS[name] ?? DETACHMENT_DESCRIPTIONS['__default__'];
}
