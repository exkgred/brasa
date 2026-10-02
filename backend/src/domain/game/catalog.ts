import type { CardDef, ClassDef, ClassId, EnemyDef } from './types';

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
  {
    id: 'lasca',
    name: 'Lasca',
    type: 'golpe',
    cost: 1,
    sigil: 'faisca',
    text: '3 de dano. Compre 1',
    effect: { damage: 3, draw: 1 },
    shopCost: 45,
  },
  {
    id: 'bigorna-leve',
    name: 'Bigorna leve',
    type: 'golpe',
    cost: 0,
    sigil: 'lingote',
    text: '4 de dano',
    effect: { damage: 4 },
    shopCost: 40,
  },
  {
    id: 'muralha',
    name: 'Muralha',
    type: 'guarda',
    cost: 2,
    sigil: 'placa',
    text: '12 de bloco',
    effect: { block: 12 },
    shopCost: 55,
  },
  {
    id: 'couraca',
    name: 'Couraça',
    type: 'guarda',
    cost: 1,
    sigil: 'rebite',
    text: '5 de bloco. Compre 1',
    effect: { block: 5, draw: 1 },
    shopCost: 50,
  },
  {
    id: 'lastro',
    name: 'Lastro',
    type: 'guarda',
    cost: 1,
    sigil: 'sucata',
    text: '3 de bloco. +1 mana',
    effect: { block: 3, energyGain: 1 },
    shopCost: 50,
  },
  {
    id: 'caldeira',
    name: 'Caldeira',
    type: 'golpe',
    cost: 1,
    sigil: 'brasa',
    text: '6 de dano. Você perde 1',
    effect: { damage: 6, selfDamage: 1 },
    shopCost: 45,
  },
  {
    id: 'equilibrio',
    name: 'Equilíbrio',
    type: 'fluxo',
    cost: 1,
    sigil: 'fole',
    text: '3 de dano. 3 de bloco',
    effect: { damage: 3, block: 3 },
    shopCost: 50,
    classIds: ['foleiro'],
  },
  {
    id: 'impacto',
    name: 'Impacto',
    type: 'golpe',
    cost: 1,
    sigil: 'malho',
    text: '11 de dano. Some',
    effect: { damage: 11, exhaust: true },
    shopCost: 60,
    classIds: ['malhador'],
  },
  {
    id: 'furia-malho',
    name: 'Fúria do malho',
    type: 'golpe',
    cost: 1,
    sigil: 'pinca',
    text: '8 de dano. Você perde 2',
    effect: { damage: 8, selfDamage: 2 },
    shopCost: 50,
    classIds: ['malhador'],
  },
  {
    id: 'rajada',
    name: 'Rajada',
    type: 'golpe',
    cost: 2,
    sigil: 'faisca',
    text: '9 de dano',
    effect: { damage: 9 },
    shopCost: 55,
    classIds: ['malhador'],
  },
  {
    id: 'escudo-vivo',
    name: 'Escudo vivo',
    type: 'guarda',
    cost: 1,
    sigil: 'placa',
    text: '10 de bloco',
    effect: { block: 10 },
    shopCost: 55,
    classIds: ['guarda-fogo'],
  },
  {
    id: 'retaliar',
    name: 'Retaliar',
    type: 'guarda',
    cost: 1,
    sigil: 'rebite',
    text: '4 de bloco. 4 de dano',
    effect: { block: 4, damage: 4 },
    shopCost: 50,
    classIds: ['guarda-fogo'],
  },
  {
    id: 'couraca-grossa',
    name: 'Couraça grossa',
    type: 'guarda',
    cost: 2,
    sigil: 'placa',
    text: '8 de bloco. Compre 1',
    effect: { block: 8, draw: 1 },
    shopCost: 55,
    classIds: ['guarda-fogo'],
  },
  {
    id: 'brasa-larga',
    name: 'Brasa larga',
    type: 'golpe',
    cost: 1,
    sigil: 'brasa',
    text: '2 de dano. Queima 3',
    effect: { damage: 2, burn: 3 },
    shopCost: 55,
    classIds: ['temperador'],
  },
  {
    id: 'sopro-negro',
    name: 'Sopro negro',
    type: 'fluxo',
    cost: 1,
    sigil: 'fole',
    text: 'Compre 2. Queima 1',
    effect: { draw: 2, burn: 1 },
    shopCost: 55,
    classIds: ['temperador'],
  },
  {
    id: 'fornalha',
    name: 'Fornalha',
    type: 'fluxo',
    cost: 2,
    sigil: 'brasa',
    text: 'Queima 4. Some',
    effect: { burn: 4, exhaust: true },
    shopCost: 60,
    classIds: ['temperador'],
  },
  {
    id: 'ferrugem',
    name: 'Ferrugem',
    type: 'escoria',
    cost: 0,
    sigil: 'fuligem',
    text: 'Injogável. Só ocupa espaço',
    effect: { unplayable: true },
  },
];

export const STARTER_CARD_IDS = [
  'malho-quente',
  'malho-quente',
  'placa-escoria',
  'placa-escoria',
  'sopro-fole',
  'sopro-fole',
  'brasa-viva',
  'faisca',
  'sucata',
  'lasca',
];

export const MIN_DECK = 10;
export const MAX_DECK = 14;
export const MAX_COPIES = 2;

export const CLASSES: ClassDef[] = [
  {
    id: 'foleiro',
    name: 'Foleiro',
    title: 'Equilíbrio',
    blurb: 'Um pouco de tudo. Vida média, golpes e placas.',
    maxHp: 60,
    energy: 3,
    starter: STARTER_CARD_IDS,
  },
  {
    id: 'malhador',
    name: 'Malhador',
    title: 'Agressão',
    blurb: 'Menos vida, mais dano. Termina o combate rápido.',
    maxHp: 50,
    energy: 3,
    starter: [
      'malho-quente',
      'malho-quente',
      'faisca',
      'faisca',
      'furia-malho',
      'impacto',
      'bigorna-leve',
      'placa-escoria',
      'sopro-fole',
      'caldeira',
    ],
  },
  {
    id: 'guarda-fogo',
    name: 'Guarda-fogo',
    title: 'Couraça',
    blurb: 'Mais vida e bloco. Aguenta o golpe e devolve.',
    maxHp: 74,
    energy: 3,
    starter: [
      'placa-escoria',
      'placa-escoria',
      'escudo-vivo',
      'retaliar',
      'sucata',
      'sucata',
      'malho-quente',
      'malho-quente',
      'couraca',
      'muralha',
    ],
  },
  {
    id: 'temperador',
    name: 'Temperador',
    title: 'Queima',
    blurb: '4 de mana. Aplica queima e compra cartas.',
    maxHp: 52,
    energy: 4,
    starter: [
      'brasa-viva',
      'brasa-larga',
      'sopro-negro',
      'sopro-fole',
      'faisca',
      'faisca',
      'placa-escoria',
      'placa-escoria',
      'temperar',
      'fornalha',
    ],
  },
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
  'lasca',
  'bigorna-leve',
  'muralha',
  'couraca',
  'lastro',
  'caldeira',
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
    id: 'fera-espinhos',
    name: 'Fera de espinhos',
    maxHp: 32,
    patterns: [
      { kind: 'ATTACK', value: 9 },
      { kind: 'HEAVY', value: 12 },
    ],
  },
  {
    id: 'aranha-caldeira',
    name: 'Aranha-caldeira',
    maxHp: 26,
    patterns: [
      { kind: 'ATTACK', value: 8 },
      { kind: 'DEFEND', value: 7 },
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

export function classById(id: string): ClassDef {
  const cls = CLASSES.find((item) => item.id === id);
  if (!cls) {
    throw new Error(`Classe desconhecida: ${id}`);
  }
  return cls;
}

export function isBuildable(card: CardDef): boolean {
  return !card.effect.unplayable;
}

export function cardAllowedForClass(card: CardDef, classId: ClassId): boolean {
  if (!isBuildable(card)) return false;
  return !card.classIds || card.classIds.includes(classId);
}

export function classPool(classId: ClassId): string[] {
  return CARDS.filter((card) => cardAllowedForClass(card, classId)).map(
    (card) => card.id,
  );
}

export function offerPoolFor(classId: ClassId | null): string[] {
  const allowed = new Set(classPool(classId ?? 'foleiro'));
  return REWARD_POOL.filter((id) => allowed.has(id));
}

export function validateDeck(classId: ClassId, cardIds: string[]): void {
  if (cardIds.length < MIN_DECK) {
    throw new Error(`O baralho precisa de pelo menos ${MIN_DECK} cartas`);
  }
  if (cardIds.length > MAX_DECK) {
    throw new Error(`O baralho cabe no máximo ${MAX_DECK} cartas`);
  }
  const allowed = new Set(classPool(classId));
  const copies = new Map<string, number>();
  for (const cardId of cardIds) {
    if (!allowed.has(cardId)) {
      throw new Error('Carta fora da classe');
    }
    const next = (copies.get(cardId) ?? 0) + 1;
    if (next > MAX_COPIES) {
      throw new Error(`No máximo ${MAX_COPIES} cópias da mesma carta`);
    }
    copies.set(cardId, next);
  }
}
