import type { CardDef, EnemyDef } from './types';

export const PLAYER_MAX_HP = 60;
export const STARTING_GOLD = 50;
export const STARTING_ENERGY = 3;
export const DRAW_PER_TURN = 5;
export const REST_HEAL = 25;
export const COMBAT_GOLD = 40;
export const BOSS_GOLD = 80;

export const CARDS: CardDef[] = [
  {
    id: 'malho-quente',
    name: 'Malho quente',
    type: 'golpe',
    cost: 1,
    sigil: 'malho',
    text: '6 de dano',
    effect: { damage: 6 },
    shopCost: 40,
  },
  {
    id: 'placa-escoria',
    name: 'Placa de escória',
    type: 'guarda',
    cost: 1,
    sigil: 'placa',
    text: '5 de bloco',
    effect: { block: 5 },
    shopCost: 40,
  },
  {
    id: 'sopro-fole',
    name: 'Sopro do fole',
    type: 'fluxo',
    cost: 0,
    sigil: 'fole',
    text: 'Compre 1. 2 de dano',
    effect: { draw: 1, damage: 2 },
    shopCost: 50,
  },
  {
    id: 'brasa-viva',
    name: 'Brasa viva',
    type: 'golpe',
    cost: 2,
    sigil: 'brasa',
    text: '4 de dano. Queima 2',
    effect: { damage: 4, burn: 2 },
    shopCost: 55,
  },
  {
    id: 'faisca',
    name: 'Faísca',
    type: 'golpe',
    cost: 0,
    sigil: 'faisca',
    text: '4 de dano',
    effect: { damage: 4 },
    shopCost: 45,
  },
  {
    id: 'pinca-quente',
    name: 'Pinça quente',
    type: 'golpe',
    cost: 1,
    sigil: 'pinca',
    text: '8 de dano',
    effect: { damage: 8 },
    shopCost: 50,
  },
  {
    id: 'lingote',
    name: 'Lingote',
    type: 'golpe',
    cost: 2,
    sigil: 'lingote',
    text: '10 de dano',
    effect: { damage: 10 },
    shopCost: 60,
  },
  {
    id: 'sucata',
    name: 'Sucata',
    type: 'guarda',
    cost: 0,
    sigil: 'sucata',
    text: '4 de bloco',
    effect: { block: 4 },
    shopCost: 40,
  },
  {
    id: 'rebite',
    name: 'Rebite',
    type: 'guarda',
    cost: 1,
    sigil: 'rebite',
    text: '8 de bloco',
    effect: { block: 8 },
    shopCost: 50,
  },
  {
    id: 'fole-extra',
    name: 'Fole extra',
    type: 'fluxo',
    cost: 1,
    sigil: 'fole',
    text: 'Compre 2',
    effect: { draw: 2 },
    shopCost: 55,
  },
  {
    id: 'temperar',
    name: 'Temperar',
    type: 'fluxo',
    cost: 1,
    sigil: 'brasa',
    text: '+1 energia. 3 de bloco',
    effect: { energyGain: 1, block: 3 },
    shopCost: 50,
  },
  {
    id: 'fuligem',
    name: 'Fuligem',
    type: 'escoria',
    cost: 0,
    sigil: 'fuligem',
    text: 'Injogável. Fica no baralho',
    effect: { unplayable: true },
  },
  {
    id: 'cinza',
    name: 'Cinza',
    type: 'escoria',
    cost: 0,
    sigil: 'fuligem',
    text: '2 de dano em você. Some',
    effect: { selfDamage: 2, exhaust: true },
  },
];

export const STARTER_CARD_IDS = [
  'malho-quente',
  'malho-quente',
  'malho-quente',
  'malho-quente',
  'placa-escoria',
  'placa-escoria',
  'placa-escoria',
  'placa-escoria',
  'sopro-fole',
  'brasa-viva',
];

export const REWARD_POOL = [
  'faisca',
  'pinca-quente',
  'lingote',
  'sucata',
  'rebite',
  'fole-extra',
  'temperar',
  'brasa-viva',
  'sopro-fole',
];

export const SHOP_POOL = REWARD_POOL;

export const ENEMIES: EnemyDef[] = [
  {
    id: 'fera-ferrugem',
    name: 'Fera de ferrugem',
    maxHp: 28,
    patterns: [
      { kind: 'ATTACK', value: 8 },
      { kind: 'ATTACK', value: 6 },
    ],
  },
  {
    id: 'aranha-vidro',
    name: 'Aranha de vidro',
    maxHp: 22,
    patterns: [
      { kind: 'ATTACK', value: 9 },
      { kind: 'DEFEND', value: 6 },
    ],
  },
  {
    id: 'padre-forno',
    name: 'Padre do forno',
    maxHp: 36,
    patterns: [
      { kind: 'ATTACK', value: 7 },
      { kind: 'DEFEND', value: 8 },
      { kind: 'HEAVY', value: 12 },
    ],
  },
  {
    id: 'fornalha-fria',
    name: 'Fornalha Fria',
    maxHp: 70,
    patterns: [
      { kind: 'ATTACK', value: 10 },
      { kind: 'DEFEND', value: 8 },
      { kind: 'HEAVY', value: 16 },
    ],
  },
];

export function cardById(id: string): CardDef {
  const card = CARDS.find((item) => item.id === id);
  if (!card) {
    throw new Error(`Carta desconhecida: ${id}`);
  }
  return card;
}

export function enemyById(id: string): EnemyDef {
  const enemy = ENEMIES.find((item) => item.id === id);
  if (!enemy) {
    throw new Error(`Inimigo desconhecido: ${id}`);
  }
  return enemy;
}
