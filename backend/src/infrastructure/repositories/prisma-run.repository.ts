import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { RunState, ScoreEntry } from '../../domain/game/types';
import type { RunRepository } from '../../domain/repositories/run.repository';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class PrismaRunRepository implements RunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveByUser(userId: string): Promise<RunState | null> {
    const row = await this.prisma.run.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return row ? (row.state as unknown as RunState) : null;
  }

  async save(run: RunState): Promise<void> {
    await this.prisma.run.upsert({
      where: { id: run.id },
      create: {
        id: run.id,
        userId: run.userId,
        status: run.phase,
        state: run as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: run.phase,
        state: run as unknown as Prisma.InputJsonValue,
      },
    });
  }

  async listScores(limit: number): Promise<ScoreEntry[]> {
    const rows = await this.prisma.score.findMany({
      orderBy: { score: 'desc' },
      take: limit,
    });
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      playerName: row.playerName,
      score: row.score,
      floors: row.floors,
      won: row.won,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async addScore(entry: ScoreEntry): Promise<void> {
    await this.prisma.score.create({
      data: {
        id: entry.id,
        userId: entry.userId,
        playerName: entry.playerName,
        score: entry.score,
        floors: entry.floors,
        won: entry.won,
        createdAt: new Date(entry.createdAt),
      },
    });
  }
}
