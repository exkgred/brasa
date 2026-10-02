import {
  BOSS_GOLD,
  COMBAT_GOLD,
  DRAW_PER_TURN,
  PLAYER_MAX_HP,
  REST_HEAL,
  STARTING_GOLD,
  cardById,
  classById,
  enemyById,
  offerPoolFor,
  validateDeck,
} from './catalog';
import { pickUnique, shuffle } from './rng';
import type {
  CardInstance,
  ClassId,
  CombatState,
  Combatant,
  MapNode,
  RunState,
} from './types';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function nextId(run: RunState, prefix: string): string {
  run.seq += 1;
  return `${prefix}-${run.seq}`;
}

function instantiate(run: RunState, cardId: string): CardInstance {
  return { instanceId: nextId(run, 'c'), cardId };
}

function livingEnemies(combat: CombatState): Combatant[] {
  return combat.enemies.filter((enemy) => enemy.hp > 0);
}

function firstLiving(combat: CombatState): Combatant | undefined {
  return livingEnemies(combat)[0];
}

function hit(target: Combatant, amount: number): number {
  const blocked = Math.min(target.block, amount);
  target.block -= blocked;
  const hpLoss = amount - blocked;
  target.hp = Math.max(0, target.hp - hpLoss);
  return hpLoss;
}

function computeScore(run: RunState): number {
  const cleared = run.map.filter((node) => node.cleared).length;
  const victory = run.phase === 'WON' ? 500 : 0;
  return cleared * 100 + run.gold + run.hp + victory;
}

function buildMap(): MapNode[] {
  return [
    {
      id: 'n-0',
      index: 0,
      kind: 'COMBAT',
      enemyId: 'fera-ferrugem',
      cleared: false,
    },
    {
      id: 'n-1',
      index: 1,
      kind: 'COMBAT',
      enemyId: 'aranha-vidro',
      cleared: false,
    },
    { id: 'n-2', index: 2, kind: 'SHOP', cleared: false },
    {
      id: 'n-3',
      index: 3,
      kind: 'COMBAT',
      enemyId: 'padre-forno',
      cleared: false,
    },
    { id: 'n-4', index: 4, kind: 'REST', cleared: false },
    {
      id: 'n-5',
      index: 5,
      kind: 'BOSS',
      enemyId: 'fornalha-fria',
      cleared: false,
    },
  ];
}

function setEnemyIntent(enemy: Combatant, turn: number, enemyId: string): void {
  const def = enemyById(enemyId);
  const pattern = def.patterns[turn % def.patterns.length];
  enemy.intent = { kind: pattern.kind, value: pattern.value };
}

function drawCards(run: RunState, combat: CombatState, count: number): void {
  for (let i = 0; i < count; i += 1) {
    if (combat.hand.length >= 10) break;
    if (combat.drawPile.length === 0) {
      if (combat.discardPile.length === 0) break;
      const shuffled = shuffle(combat.discardPile, run.rng);
      run.rng = shuffled.next;
      combat.drawPile = shuffled.items;
      combat.discardPile = [];
    }
    const card = combat.drawPile.pop();
    if (card) combat.hand.push(card);
  }
}

function startPlayerTurn(run: RunState, combat: CombatState): void {
  combat.player.block = 0;
  if (combat.player.burn > 0) {
    hit(combat.player, combat.player.burn);
    combat.log.push(`A queima come ${combat.player.burn} da sua vida`);
    combat.player.burn -= 1;
  }
  combat.energy = combat.maxEnergy;
  drawCards(run, combat, DRAW_PER_TURN);
}

function openCombat(run: RunState, enemyId: string): void {
  const def = enemyById(enemyId);
  const enemy: Combatant = {
    id: enemyId,
    name: def.name,
    hp: def.maxHp,
    maxHp: def.maxHp,
    block: 0,
    burn: 0,
  };
  setEnemyIntent(enemy, 0, enemyId);
  const cls = classById(run.classId ?? 'foleiro');
  const shuffled = shuffle(clone(run.deck), run.rng);
  run.rng = shuffled.next;
  const combat: CombatState = {
    player: {
      id: cls.id,
      name: cls.name,
      hp: run.hp,
      maxHp: run.maxHp,
      block: 0,
      burn: 0,
    },
    enemies: [enemy],
    energy: cls.energy,
    maxEnergy: cls.energy,
    hand: [],
    drawPile: shuffled.items,
    discardPile: [],
    exhaustPile: [],
    turn: 1,
    log: [`${def.name} emerge da fuligem`],
  };
  startPlayerTurn(run, combat);
  run.combat = combat;
  run.phase = 'COMBAT';
}

function finishCombat(run: RunState, boss: boolean): void {
  if (!run.combat) return;
  run.hp = run.combat.player.hp;
  run.gold += boss ? BOSS_GOLD : COMBAT_GOLD;
  const node = run.map[run.floor];
  node.cleared = true;
  run.combat = null;
  if (boss) {
    run.phase = 'WON';
    run.score = computeScore(run);
    return;
  }
  const picked = pickUnique(offerPoolFor(run.classId), 3, run.rng);
  run.rng = picked.next;
  run.rewardOffer = picked.items;
  run.phase = 'REWARD';
  run.score = computeScore(run);
}

function loseRun(run: RunState): void {
  if (run.combat) {
    run.hp = 0;
    run.combat.player.hp = 0;
  }
  run.phase = 'LOST';
  run.score = computeScore(run);
}

export function startRun(input: {
  id: string;
  userId: string;
  seed?: number;
}): RunState {
  const seed = input.seed ?? 1;
  const run: RunState = {
    id: input.id,
    userId: input.userId,
    seed,
    rng: seed >>> 0,
    seq: 0,
    phase: 'CLASS',
    classId: null,
    draft: [],
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    gold: STARTING_GOLD,
    floor: 0,
    map: buildMap(),
    deck: [],
    combat: null,
    shopOffer: [],
    rewardOffer: [],
    score: 0,
  };
  run.score = computeScore(run);
  return run;
}

export function chooseClass(run: RunState, classId: string): RunState {
  const next = clone(run);
  if (next.phase !== 'CLASS' && next.phase !== 'DECK') {
    throw new Error('Só é possível escolher classe na preparação');
  }
  const cls = classById(classId);
  next.classId = cls.id;
  next.maxHp = cls.maxHp;
  next.hp = cls.maxHp;
  next.draft = [...cls.starter];
  next.deck = [];
  next.phase = 'DECK';
  next.score = computeScore(next);
  return next;
}

export function confirmDeck(run: RunState, cardIds: string[]): RunState {
  const next = clone(run);
  if (next.phase !== 'DECK') {
    throw new Error('Monte o baralho antes de descer');
  }
  if (!next.classId) {
    throw new Error('Escolha uma classe primeiro');
  }
  validateDeck(next.classId, cardIds);
  next.draft = [...cardIds];
  next.deck = cardIds.map((cardId) => instantiate(next, cardId));
  next.phase = 'MAP';
  next.score = computeScore(next);
  return next;
}

export function preparedRun(input: {
  id: string;
  userId: string;
  seed?: number;
  classId?: ClassId;
}): RunState {
  const cls = classById(input.classId ?? 'foleiro');
  return confirmDeck(chooseClass(startRun(input), cls.id), [...cls.starter]);
}

export function enterNode(run: RunState): RunState {
  const next = clone(run);
  if (next.phase !== 'MAP') {
    throw new Error('Só é possível entrar num nó a partir do mapa');
  }
  if (!next.classId || next.deck.length === 0) {
    throw new Error('Monte o baralho antes de descer');
  }
  const node = next.map[next.floor];
  if (!node || node.cleared) {
    throw new Error('Nó inválido');
  }
  if (node.kind === 'COMBAT' || node.kind === 'BOSS') {
    if (!node.enemyId) throw new Error('Combate sem inimigo');
    openCombat(next, node.enemyId);
    return next;
  }
  if (node.kind === 'SHOP') {
    const picked = pickUnique(offerPoolFor(next.classId), 3, next.rng);
    next.rng = picked.next;
    next.shopOffer = picked.items;
    next.phase = 'SHOP';
    return next;
  }
  next.phase = 'REST';
  return next;
}

export function playCard(run: RunState, instanceId: string): RunState {
  const next = clone(run);
  const combat = next.combat;
  if (next.phase !== 'COMBAT' || !combat) {
    throw new Error('Não há combate em andamento');
  }
  const index = combat.hand.findIndex((card) => card.instanceId === instanceId);
  if (index < 0) {
    throw new Error('Carta não está na mão');
  }
  const instance = combat.hand[index];
  const def = cardById(instance.cardId);
  if (def.effect.unplayable) {
    throw new Error(`${def.name} é injogável`);
  }
  if (combat.energy < def.cost) {
    throw new Error('Energia insuficiente');
  }
  combat.energy -= def.cost;
  combat.hand.splice(index, 1);

  if (def.effect.block) {
    combat.player.block += def.effect.block;
    combat.log.push(`${def.name}: +${def.effect.block} de bloco`);
  }
  if (def.effect.energyGain) {
    combat.energy += def.effect.energyGain;
    combat.log.push(`${def.name}: +${def.effect.energyGain} de energia`);
  }
  if (def.effect.selfDamage) {
    hit(combat.player, def.effect.selfDamage);
    combat.log.push(`${def.name} queima você em ${def.effect.selfDamage}`);
  }
  const enemy = firstLiving(combat);
  if (enemy && def.effect.damage) {
    const lost = hit(enemy, def.effect.damage);
    combat.log.push(`${def.name} acerta ${enemy.name} em ${lost}`);
  }
  if (enemy && def.effect.burn) {
    enemy.burn += def.effect.burn;
    combat.log.push(`${enemy.name} ganha queima ${def.effect.burn}`);
  }
  if (def.effect.draw) {
    drawCards(next, combat, def.effect.draw);
  }

  if (def.effect.exhaust) {
    combat.exhaustPile.push(instance);
  } else {
    combat.discardPile.push(instance);
  }

  if (combat.player.hp <= 0) {
    loseRun(next);
    return next;
  }
  if (livingEnemies(combat).length === 0) {
    const node = next.map[next.floor];
    finishCombat(next, node.kind === 'BOSS');
  }
  return next;
}

export function endTurn(run: RunState): RunState {
  const next = clone(run);
  const combat = next.combat;
  if (next.phase !== 'COMBAT' || !combat) {
    throw new Error('Não há combate em andamento');
  }

  combat.discardPile.push(...combat.hand);
  combat.hand = [];

  for (const enemy of livingEnemies(combat)) {
    if (enemy.burn > 0) {
      hit(enemy, enemy.burn);
      combat.log.push(`Queima come ${enemy.burn} de ${enemy.name}`);
      enemy.burn -= 1;
    }
    if (enemy.hp <= 0) continue;

    enemy.block = 0;
    const intent = enemy.intent;
    if (intent?.kind === 'DEFEND') {
      enemy.block += intent.value;
      combat.log.push(`${enemy.name} ergue ${intent.value} de sucata`);
    } else if (intent) {
      const lost = hit(combat.player, intent.value);
      combat.log.push(`${enemy.name} acerta você em ${lost}`);
    }
    setEnemyIntent(enemy, combat.turn, enemy.id);
  }

  if (livingEnemies(combat).length === 0) {
    const node = next.map[next.floor];
    finishCombat(next, node.kind === 'BOSS');
    return next;
  }
  if (combat.player.hp <= 0) {
    loseRun(next);
    return next;
  }

  combat.turn += 1;
  startPlayerTurn(next, combat);
  if (combat.player.hp <= 0) {
    loseRun(next);
  }
  return next;
}

export function pickReward(run: RunState, cardId: string): RunState {
  const next = clone(run);
  if (next.phase !== 'REWARD') {
    throw new Error('Não há recompensa aberta');
  }
  if (!next.rewardOffer.includes(cardId)) {
    throw new Error('Carta fora da oferta');
  }
  next.deck.push(instantiate(next, cardId));
  next.rewardOffer = [];
  next.floor += 1;
  next.phase = next.floor >= next.map.length ? 'WON' : 'MAP';
  next.score = computeScore(next);
  return next;
}

export function skipReward(run: RunState): RunState {
  const next = clone(run);
  if (next.phase !== 'REWARD') {
    throw new Error('Não há recompensa aberta');
  }
  next.rewardOffer = [];
  next.floor += 1;
  next.phase = next.floor >= next.map.length ? 'WON' : 'MAP';
  next.score = computeScore(next);
  return next;
}

export function buyShop(run: RunState, cardId: string): RunState {
  const next = clone(run);
  if (next.phase !== 'SHOP') {
    throw new Error('A loja está fechada');
  }
  if (!next.shopOffer.includes(cardId)) {
    throw new Error('Carta fora da banca');
  }
  const def = cardById(cardId);
  const price = def.shopCost ?? 50;
  if (next.gold < price) {
    throw new Error('Ouro insuficiente');
  }
  next.gold -= price;
  next.deck.push(instantiate(next, cardId));
  next.shopOffer = next.shopOffer.filter((id) => id !== cardId);
  next.score = computeScore(next);
  return next;
}

export function leaveShop(run: RunState): RunState {
  const next = clone(run);
  if (next.phase !== 'SHOP') {
    throw new Error('A loja está fechada');
  }
  const node = next.map[next.floor];
  node.cleared = true;
  next.shopOffer = [];
  next.floor += 1;
  next.phase = 'MAP';
  next.score = computeScore(next);
  return next;
}

export function rest(run: RunState): RunState {
  const next = clone(run);
  if (next.phase !== 'REST') {
    throw new Error('Não é um ponto de descanso');
  }
  next.hp = Math.min(next.maxHp, next.hp + REST_HEAL);
  const node = next.map[next.floor];
  node.cleared = true;
  next.floor += 1;
  next.phase = 'MAP';
  next.score = computeScore(next);
  return next;
}
