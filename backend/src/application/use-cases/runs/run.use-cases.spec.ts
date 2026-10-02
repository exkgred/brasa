import { cardById, classById } from '../../../domain/game/catalog';
import { startRun } from '../../../domain/game/engine';
import {
  BusinessRuleError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import { memoryRuns, memoryUsers, player } from '../__tests__/memory';
import {
  BuyShopUseCase,
  ChooseClassUseCase,
  ConfirmDeckUseCase,
  EndTurnUseCase,
  EnterNodeUseCase,
  GetCurrentRunUseCase,
  LeaveShopUseCase,
  ListScoresUseCase,
  MutateRunUseCase,
  PickRewardUseCase,
  PlayCardUseCase,
  RestUseCase,
  SkipRewardUseCase,
  StartRunUseCase,
} from './run.use-cases';

describe('run use cases', () => {
  it('start cria run e get devolve a atual', async () => {
    const runs = memoryRuns();
    const started = await new StartRunUseCase(runs).execute({
      userId: 'user-1',
      seed: 1,
    });
    expect(started.phase).toBe('CLASS');
    const current = await new GetCurrentRunUseCase(runs).execute({
      userId: 'user-1',
    });
    expect(current.id).toBe(started.id);
    const again = await new StartRunUseCase(runs).execute({ userId: 'user-1' });
    expect(again.id).toBe(started.id);
  });

  it('get sem run → 404', async () => {
    await expect(
      new GetCurrentRunUseCase(memoryRuns()).execute({ userId: 'x' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('enter + play + endTurn + erros de fase', async () => {
    const runs = memoryRuns();
    const users = memoryUsers([player()]);
    const mutate = new MutateRunUseCase(runs, users);
    await new StartRunUseCase(runs).execute({ userId: 'user-1', seed: 1 });
    await new ChooseClassUseCase(mutate).execute({
      userId: 'user-1',
      classId: 'foleiro',
    });
    await new ConfirmDeckUseCase(mutate).execute({
      userId: 'user-1',
      cardIds: classById('foleiro').starter,
    });
    const combat = await new EnterNodeUseCase(mutate).execute({
      userId: 'user-1',
    });
    expect(combat.phase).toBe('COMBAT');
    const card = combat.combat?.hand[0];
    if (card) {
      const def = cardById(card.cardId);
      if (!def.effect.unplayable && def.cost <= (combat.combat?.energy ?? 0)) {
        const after = await new PlayCardUseCase(mutate).execute({
          userId: 'user-1',
          instanceId: card.instanceId,
        });
        expect(
          after.combat || after.phase === 'REWARD' || after.phase === 'LOST',
        ).toBeTruthy();
      }
    }
    const latest = await new GetCurrentRunUseCase(runs).execute({
      userId: 'user-1',
    });
    if (latest.phase === 'COMBAT') {
      await new EndTurnUseCase(mutate).execute({ userId: 'user-1' });
    }
    await expect(
      new PlayCardUseCase(mutate).execute({
        userId: 'missing',
        instanceId: 'c',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('recompensa, loja, descanso e ranking', async () => {
    const runs = memoryRuns();
    const users = memoryUsers([player()]);
    const mutate = new MutateRunUseCase(runs, users);
    const reward = startRun({ id: 'r1', userId: 'user-1', seed: 1 });
    reward.phase = 'REWARD';
    reward.rewardOffer = ['faisca', 'sucata'];
    await runs.save(reward);
    const picked = await new PickRewardUseCase(mutate).execute({
      userId: 'user-1',
      cardId: 'faisca',
    });
    expect(picked.phase).toBe('MAP');

    const shop = startRun({ id: 'r2', userId: 'user-1', seed: 1 });
    shop.phase = 'SHOP';
    shop.shopOffer = ['rebite'];
    shop.gold = 50;
    shop.floor = 2;
    await runs.save(shop);
    await new BuyShopUseCase(mutate).execute({
      userId: 'user-1',
      cardId: 'rebite',
    });
    const left = await new LeaveShopUseCase(mutate).execute({
      userId: 'user-1',
    });
    expect(left.phase).toBe('MAP');

    const camp = startRun({ id: 'r3', userId: 'user-1', seed: 1 });
    camp.phase = 'REST';
    camp.floor = 4;
    camp.hp = 10;
    await runs.save(camp);
    const rested = await new RestUseCase(mutate).execute({ userId: 'user-1' });
    expect(rested.hp).toBe(35);

    const skipBase = startRun({ id: 'r4', userId: 'user-1', seed: 1 });
    skipBase.phase = 'REWARD';
    skipBase.rewardOffer = ['lingote'];
    await runs.save(skipBase);
    const skipped = await new SkipRewardUseCase(mutate).execute({
      userId: 'user-1',
    });
    expect(skipped.rewardOffer).toHaveLength(0);

    const dead = startRun({ id: 'r5', userId: 'user-1', seed: 1 });
    dead.phase = 'COMBAT';
    dead.combat = {
      player: { id: 'p', name: 'Foleiro', hp: 1, maxHp: 60, block: 0, burn: 0 },
      enemies: [
        {
          id: 'fera-ferrugem',
          name: 'Fera',
          hp: 10,
          maxHp: 28,
          block: 0,
          burn: 0,
          intent: { kind: 'ATTACK', value: 8 },
        },
      ],
      energy: 3,
      maxEnergy: 3,
      hand: [],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      turn: 1,
      log: [],
    };
    await runs.save(dead);
    const lost = await new EndTurnUseCase(mutate).execute({ userId: 'user-1' });
    expect(lost.phase).toBe('LOST');
    const scores = await new ListScoresUseCase(runs).execute();
    expect(scores[0].won).toBe(false);

    await expect(
      new BuyShopUseCase(mutate).execute({
        userId: 'user-1',
        cardId: 'rebite',
      }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it('score sem usuário usa nome Foleiro', async () => {
    const runs = memoryRuns();
    const mutate = new MutateRunUseCase(runs, memoryUsers());
    const dead = startRun({ id: 'ghost', userId: 'nobody', seed: 1 });
    dead.phase = 'COMBAT';
    dead.combat = {
      player: { id: 'p', name: 'Foleiro', hp: 1, maxHp: 60, block: 0, burn: 0 },
      enemies: [
        {
          id: 'fera-ferrugem',
          name: 'Fera',
          hp: 10,
          maxHp: 28,
          block: 0,
          burn: 0,
          intent: { kind: 'ATTACK', value: 8 },
        },
      ],
      energy: 3,
      maxEnergy: 3,
      hand: [],
      drawPile: [],
      discardPile: [],
      exhaustPile: [],
      turn: 1,
      log: [],
    };
    await runs.save(dead);
    await new EndTurnUseCase(mutate).execute({ userId: 'nobody' });
    expect(runs.scores[0].playerName).toBe('Foleiro');
  });

  it('start depois de WON cria outra run', async () => {
    const runs = memoryRuns();
    const won = startRun({ id: 'old', userId: 'user-1', seed: 1 });
    won.phase = 'WON';
    await runs.save(won);
    const next = await new StartRunUseCase(runs).execute({
      userId: 'user-1',
      seed: 2,
    });
    expect(next.id).not.toBe('old');
    expect(next.phase).toBe('CLASS');
  });
});
