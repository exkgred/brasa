import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
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
} from '../../../domain/game/engine';
import type { RunState, ScoreEntry } from '../../../domain/game/types';
import {
  BusinessRuleError,
  NotFoundError,
} from '../../../domain/errors/domain-error';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';
import {
  RUN_REPOSITORY,
  type RunRepository,
} from '../../../domain/repositories/run.repository';

async function persistOutcome(
  runs: RunRepository,
  users: UserRepository,
  previous: RunState | null,
  next: RunState,
): Promise<void> {
  await runs.save(next);
  const finished = next.phase === 'WON' || next.phase === 'LOST';
  const wasOpen = previous?.phase !== 'WON' && previous?.phase !== 'LOST';
  if (!finished || !wasOpen) return;
  const user = await users.findById(next.userId);
  await runs.addScore({
    id: randomUUID(),
    userId: next.userId,
    playerName: user?.name ?? 'Foleiro',
    score: next.score,
    floors: next.map.filter((node) => node.cleared).length,
    won: next.phase === 'WON',
    createdAt: new Date().toISOString(),
  });
}

function wrapEngine<T>(fn: () => T): T {
  try {
    return fn();
  } catch (error) {
    throw new BusinessRuleError(
      error instanceof Error ? error.message : 'Jogada inválida',
    );
  }
}

@Injectable()
export class StartRunUseCase {
  constructor(@Inject(RUN_REPOSITORY) private readonly runs: RunRepository) {}

  async execute(input: { userId: string; seed?: number }): Promise<RunState> {
    const existing = await this.runs.findActiveByUser(input.userId);
    if (existing && existing.phase !== 'WON' && existing.phase !== 'LOST') {
      return existing;
    }
    const run = startRun({
      id: randomUUID(),
      userId: input.userId,
      seed: input.seed,
    });
    await this.runs.save(run);
    return run;
  }
}

@Injectable()
export class GetCurrentRunUseCase {
  constructor(@Inject(RUN_REPOSITORY) private readonly runs: RunRepository) {}

  async execute(input: { userId: string }): Promise<RunState> {
    const run = await this.runs.findActiveByUser(input.userId);
    if (!run) throw new NotFoundError('Run');
    return run;
  }
}

@Injectable()
export class MutateRunUseCase {
  constructor(
    @Inject(RUN_REPOSITORY) private readonly runs: RunRepository,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(
    userId: string,
    mutate: (run: RunState) => RunState,
  ): Promise<RunState> {
    const current = await this.runs.findActiveByUser(userId);
    if (!current) throw new NotFoundError('Run');
    const next = wrapEngine(() => mutate(current));
    await persistOutcome(this.runs, this.users, current, next);
    return next;
  }
}

@Injectable()
export class EnterNodeUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string }) {
    return this.mutateRun.execute(input.userId, enterNode);
  }
}

@Injectable()
export class PlayCardUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string; instanceId: string }) {
    return this.mutateRun.execute(input.userId, (run) =>
      playCard(run, input.instanceId),
    );
  }
}

@Injectable()
export class EndTurnUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string }) {
    return this.mutateRun.execute(input.userId, endTurn);
  }
}

@Injectable()
export class PickRewardUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string; cardId: string }) {
    return this.mutateRun.execute(input.userId, (run) =>
      pickReward(run, input.cardId),
    );
  }
}

@Injectable()
export class SkipRewardUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string }) {
    return this.mutateRun.execute(input.userId, skipReward);
  }
}

@Injectable()
export class BuyShopUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string; cardId: string }) {
    return this.mutateRun.execute(input.userId, (run) =>
      buyShop(run, input.cardId),
    );
  }
}

@Injectable()
export class LeaveShopUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string }) {
    return this.mutateRun.execute(input.userId, leaveShop);
  }
}

@Injectable()
export class RestUseCase {
  constructor(private readonly mutateRun: MutateRunUseCase) {}
  execute(input: { userId: string }) {
    return this.mutateRun.execute(input.userId, rest);
  }
}

@Injectable()
export class ListScoresUseCase {
  constructor(@Inject(RUN_REPOSITORY) private readonly runs: RunRepository) {}

  execute(): Promise<ScoreEntry[]> {
    return this.runs.listScores(10);
  }
}
