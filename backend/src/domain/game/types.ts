export type CardType = 'golpe' | 'guarda' | 'fluxo' | 'escoria';
export type Sigil =
  | 'malho'
  | 'placa'
  | 'fole'
  | 'brasa'
  | 'pinca'
  | 'lingote'
  | 'rebite'
  | 'fuligem'
  | 'faisca'
  | 'sucata';
export type RunPhase =
  'MAP' | 'COMBAT' | 'REWARD' | 'SHOP' | 'REST' | 'WON' | 'LOST';
export type NodeKind = 'COMBAT' | 'SHOP' | 'REST' | 'BOSS';
export type IntentKind = 'ATTACK' | 'DEFEND' | 'HEAVY';

export interface CardEffect {
  damage?: number;
  block?: number;
  draw?: number;
  burn?: number;
  energyGain?: number;
  selfDamage?: number;
  exhaust?: boolean;
  unplayable?: boolean;
}

export interface CardDef {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  sigil: Sigil;
  text: string;
  effect: CardEffect;
  shopCost?: number;
}

export interface EnemyPattern {
  kind: IntentKind;
  value: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  maxHp: number;
  patterns: EnemyPattern[];
}

export interface CardInstance {
  instanceId: string;
  cardId: string;
}

export interface Intent {
  kind: IntentKind;
  value: number;
}

export interface Combatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  burn: number;
  intent?: Intent;
}

export interface CombatState {
  player: Combatant;
  enemies: Combatant[];
  energy: number;
  maxEnergy: number;
  hand: CardInstance[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];
  turn: number;
  log: string[];
}

export interface MapNode {
  id: string;
  index: number;
  kind: NodeKind;
  enemyId?: string;
  cleared: boolean;
}

export interface RunState {
  id: string;
  userId: string;
  seed: number;
  rng: number;
  seq: number;
  phase: RunPhase;
  hp: number;
  maxHp: number;
  gold: number;
  floor: number;
  map: MapNode[];
  deck: CardInstance[];
  combat: CombatState | null;
  shopOffer: string[];
  rewardOffer: string[];
  score: number;
}

export interface ScoreEntry {
  id: string;
  userId: string;
  playerName: string;
  score: number;
  floors: number;
  won: boolean;
  createdAt: string;
}
