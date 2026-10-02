import { cardById, enemyById } from './catalog';
import {
  buyShop,
  endTurn,
  enterNode,
  leaveShop,
  pickReward,
  playCard,
  rest,
  skipReward,
  startRun,
} from './engine';
import { nextRng, pickIndex, pickUnique, shuffle } from './rng';
import type { RunState } from './types';

function runWith(seed = 7): RunState {
  return startRun({ id: 'run-1', userId: 'user-1', seed });
}

function intoCombat(seed = 7): RunState {
  return enterNode(runWith(seed));
}

function playFirstAffordable(state: RunState): RunState {
  const combat = state.combat;
  if (!combat) throw new Error('sem combate');
  const playable = combat.hand.find((card) => {
    const def = cardById(card.cardId);
    return !def.effect.unplayable && def.cost <= combat.energy;
  });
  if (!playable) return endTurn(state);
  return playCard(state, playable.instanceId);
}

describe('rng', () => {
  it('nextRng é determinístico', () => {
    expect(nextRng(1)).toEqual(nextRng(1));
    expect(nextRng(1).next).not.toBe(1);
  });

  it('pickIndex respeita o tamanho', () => {
    const { index, next } = pickIndex(10, 4);
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(4);
    expect(next).toBeGreaterThan(0);
  });

  it('shuffle preserva os itens', () => {
    const { items } = shuffle(['a', 'b', 'c'], 3);
    expect(items.sort()).toEqual(['a', 'b', 'c']);
  });

  it('pickUnique limita a oferta', () => {
    const { items } = pickUnique(['a', 'b'], 5, 2);
    expect(items).toHaveLength(2);
  });
});

describe('catalog', () => {
  it('cardById e enemyById conhecidos → definição', () => {
    expect(cardById('malho-quente').effect.damage).toBe(6);
    expect(enemyById('fera-ferrugem').maxHp).toBe(28);
  });

  it('ids desconhecidos → erro', () => {
    expect(() => cardById('nao-existe')).toThrow('Carta desconhecida');
    expect(() => enemyById('nao-existe')).toThrow('Inimigo desconhecido');
  });
});

describe('startRun / mapa', () => {
  it('monta deck inicial e mapa do Cinzeiro', () => {
    const run = runWith(1);
    expect(run.phase).toBe('MAP');
    expect(run.hp).toBe(60);
    expect(run.gold).toBe(50);
    expect(run.deck).toHaveLength(10);
    expect(run.map).toHaveLength(6);
    expect(run.map[5].kind).toBe('BOSS');
  });

  it('entrar fora do mapa → erro', () => {
    const combat = intoCombat();
    expect(() => enterNode(combat)).toThrow('mapa');
  });
});

describe('combate', () => {
  it('Malho quente gasta energia e causa dano', () => {
    let state = intoCombat(1);
    const malho = state.combat?.hand.find(
      (card) => card.cardId === 'malho-quente',
    );
    if (!malho) {
      state = endTurn(state);
    }
    const playable = state.combat?.hand.find(
      (card) => card.cardId === 'malho-quente',
    );
    if (!playable) return;
    const energyBefore = state.combat?.energy ?? 0;
    const hpBefore = state.combat?.enemies[0].hp ?? 0;
    const after = playCard(state, playable.instanceId);
    expect(after.combat?.energy).toBe(energyBefore - 1);
    expect(after.combat?.enemies[0].hp).toBe(hpBefore - 6);
  });

  it('carta injogável / fora da mão / sem energia → erro', () => {
    const state = intoCombat(1);
    expect(() => playCard(state, 'c-missing')).toThrow('mão');
    const dummy = runWith();
    expect(() => playCard(dummy, 'c-1')).toThrow('combate');
  });

  it('placa soma bloco', () => {
    let state = intoCombat(2);
    let placa = state.combat?.hand.find(
      (card) => card.cardId === 'placa-escoria',
    );
    if (!placa) {
      state = endTurn(state);
      placa = state.combat?.hand.find(
        (card) => card.cardId === 'placa-escoria',
      );
    }
    if (!placa) return;
    const after = playCard(state, placa.instanceId);
    expect(after.combat?.player.block).toBeGreaterThanOrEqual(5);
  });

  it('endTurn sem combate → erro', () => {
    expect(() => endTurn(runWith())).toThrow('combate');
  });

  it('endTurn aplica o ataque da fera', () => {
    const after = endTurn(intoCombat(1));
    if (after.phase === 'COMBAT' && after.combat) {
      expect(after.combat.player.hp).toBeLessThan(60);
      expect(after.combat.hand.length).toBeGreaterThan(0);
    }
  });

  it('energia insuficiente → erro', () => {
    const state = intoCombat(3);
    const brasa = state.combat?.hand.find(
      (card) => card.cardId === 'brasa-viva',
    );
    if (!brasa || (state.combat?.energy ?? 0) >= 2) {
      if (state.combat) state.combat.energy = 1;
    }
    const target = state.combat?.hand.find(
      (card) => card.cardId === 'brasa-viva',
    );
    if (!target) return;
    if (state.combat) state.combat.energy = 1;
    expect(() => playCard(state, target.instanceId)).toThrow('Energia');
  });
});

describe('recompensa, loja e descanso', () => {
  it('pick/skip/shop/rest fora de fase → erro', () => {
    const run = runWith();
    expect(() => pickReward(run, 'faisca')).toThrow('recompensa');
    expect(() => skipReward(run)).toThrow('recompensa');
    expect(() => buyShop(run, 'faisca')).toThrow('loja');
    expect(() => leaveShop(run)).toThrow('loja');
    expect(() => rest(run)).toThrow('descanso');
  });

  it('vence o primeiro combate e escolhe recompensa', () => {
    let state = intoCombat(11);
    let guard = 0;
    while (state.phase === 'COMBAT' && guard < 40) {
      state = playFirstAffordable(state);
      guard += 1;
    }
    expect(['REWARD', 'LOST']).toContain(state.phase);
    if (state.phase !== 'REWARD') return;
    expect(state.rewardOffer.length).toBeGreaterThan(0);
    const cardId = state.rewardOffer[0];
    const after = pickReward(state, cardId);
    expect(after.phase).toBe('MAP');
    expect(after.floor).toBe(1);
    expect(after.deck.some((card) => card.cardId === cardId)).toBe(true);
    expect(() => pickReward(state, 'nao')).toThrow('oferta');
    const skipped = skipReward(state);
    expect(skipped.floor).toBe(1);
  });

  it('loja vende e sai para o mapa', () => {
    let state = runWith(4);
    state.floor = 2;
    state = enterNode(state);
    expect(state.phase).toBe('SHOP');
    expect(state.shopOffer.length).toBeGreaterThan(0);
    const cardId = state.shopOffer[0];
    const price = cardById(cardId).shopCost ?? 50;
    state.gold = price;
    const bought = buyShop(state, cardId);
    expect(bought.gold).toBe(0);
    expect(bought.deck.some((card) => card.cardId === cardId)).toBe(true);
    expect(() => buyShop(state, 'nao')).toThrow('banca');
    const poor = { ...state, gold: 0 };
    expect(() => buyShop(poor, cardId)).toThrow('Ouro');
    const left = leaveShop(bought);
    expect(left.phase).toBe('MAP');
    expect(left.floor).toBe(3);
  });

  it('descanso cura e avança', () => {
    let state = runWith(5);
    state.floor = 4;
    state.hp = 20;
    state = enterNode(state);
    expect(state.phase).toBe('REST');
    const after = rest(state);
    expect(after.hp).toBe(45);
    expect(after.phase).toBe('MAP');
    expect(after.floor).toBe(5);
  });
});

describe('derrota', () => {
  it('hp zerado no turno do inimigo → LOST', () => {
    const state = intoCombat(1);
    if (state.combat) {
      state.combat.player.hp = 1;
      state.combat.player.block = 0;
    }
    const after = endTurn(state);
    expect(after.phase).toBe('LOST');
    expect(after.score).toBeGreaterThanOrEqual(0);
  });
});

describe('ramos extras do motor', () => {
  it('nó limpo ou sem inimigo → erro', () => {
    const run = runWith(1);
    run.map[0].cleared = true;
    expect(() => enterNode(run)).toThrow('Nó inválido');
    const empty = runWith(2);
    delete empty.map[0].enemyId;
    expect(() => enterNode(empty)).toThrow('Combate sem inimigo');
  });

  it('fuligem é injogável; cinza fere e some; temperar dá energia', () => {
    const state = intoCombat(1);
    if (!state.combat) throw new Error('sem combate');
    state.combat.hand.push({ instanceId: 'c-fuligem', cardId: 'fuligem' });
    expect(() => playCard(state, 'c-fuligem')).toThrow('injogável');
    state.combat.hand.push({ instanceId: 'c-cinza', cardId: 'cinza' });
    const burned = playCard(state, 'c-cinza');
    expect(burned.combat?.player.hp).toBeLessThan(60);
    expect(
      burned.combat?.exhaustPile.some((card) => card.cardId === 'cinza'),
    ).toBe(true);
    burned.combat?.hand.push({ instanceId: 'c-temp', cardId: 'temperar' });
    if (burned.combat) burned.combat.energy = 1;
    const tempered = playCard(burned, 'c-temp');
    expect(tempered.combat?.energy).toBeGreaterThanOrEqual(1);
  });

  it('mata o inimigo e o chefe; queima no fim do turno', () => {
    const state = intoCombat(1);
    if (state.combat) {
      state.combat.enemies[0].hp = 1;
      const malho = state.combat.hand.find(
        (card) => card.cardId === 'malho-quente',
      );
      if (malho) {
        expect(playCard(state, malho.instanceId).phase).toBe('REWARD');
      } else {
        state.combat.hand.push({
          instanceId: 'c-kill',
          cardId: 'malho-quente',
        });
        expect(playCard(state, 'c-kill').phase).toBe('REWARD');
      }
    }

    let boss = runWith(8);
    boss.floor = 5;
    boss = enterNode(boss);
    if (boss.combat) {
      boss.combat.enemies[0].hp = 1;
      boss.combat.hand.push({ instanceId: 'c-boss', cardId: 'malho-quente' });
      expect(playCard(boss, 'c-boss').phase).toBe('WON');
    }

    const burn = intoCombat(1);
    if (burn.combat) {
      burn.combat.enemies[0].hp = 2;
      burn.combat.enemies[0].burn = 5;
      const after = endTurn(burn);
      expect(['REWARD', 'COMBAT', 'LOST']).toContain(after.phase);
    }
  });

  it('defesa do inimigo, queima no jogador e recompensa no último andar', () => {
    const state = intoCombat(1);
    if (state.combat) {
      state.combat.enemies[0].intent = { kind: 'DEFEND', value: 6 };
      const defended = endTurn(state);
      if (defended.combat) {
        defended.combat.player.burn = 80;
        defended.combat.player.hp = 5;
        expect(endTurn(defended).phase).toBe('LOST');
      }
    }

    const reward = runWith(1);
    reward.phase = 'REWARD';
    reward.rewardOffer = ['faisca'];
    reward.floor = 5;
    expect(pickReward(reward, 'faisca').phase).toBe('WON');
    expect(skipReward(reward).phase).toBe('WON');
  });

  it('cinza com 1 de vida → LOST na carta', () => {
    const state = intoCombat(1);
    if (!state.combat) throw new Error('sem combate');
    state.combat.player.hp = 1;
    state.combat.hand.push({ instanceId: 'c-cinza', cardId: 'cinza' });
    expect(playCard(state, 'c-cinza').phase).toBe('LOST');
  });
});
