import type { RunState, ScoreEntry } from '../game/types';

export const RUN_REPOSITORY = Symbol('RUN_REPOSITORY');

export interface RunRepository {
  findActiveByUser(userId: string): Promise<RunState | null>;
  save(run: RunState): Promise<void>;
  listScores(limit: number): Promise<ScoreEntry[]>;
  addScore(entry: ScoreEntry): Promise<void>;
}
