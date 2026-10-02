import type {
  PublicUser,
  User,
  UserRole,
} from '../../../domain/entities/user.entity';
import type { RunState, ScoreEntry } from '../../../domain/game/types';
import type { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import type { RunRepository } from '../../../domain/repositories/run.repository';
import type { UserRepository } from '../../../domain/repositories/user.repository';
import type {
  AccessTokenPayload,
  PasswordHasher,
  TokenService,
} from '../../interfaces/auth.interfaces';

export function memoryUsers(seed: User[] = []): UserRepository {
  const users = [...seed];
  return {
    async findByEmail(email) {
      return users.find((user) => user.email === email) ?? null;
    },
    async findById(id) {
      return users.find((user) => user.id === id) ?? null;
    },
    async create(data) {
      const user: User = {
        ...data,
        id: `u-${users.length + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
      return user;
    },
    toPublic(user): PublicUser {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },
  };
}

export function memoryRefresh(): RefreshTokenRepository & {
  tokens: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revoked?: boolean;
  }[];
} {
  const tokens: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revoked?: boolean;
  }[] = [];
  return {
    tokens,
    async create(data) {
      tokens.push({ id: `rt-${tokens.length + 1}`, ...data });
    },
    async findValidByHash(tokenHash) {
      const row = tokens.find(
        (item) =>
          item.tokenHash === tokenHash &&
          !item.revoked &&
          item.expiresAt.getTime() > Date.now(),
      );
      return row
        ? { id: row.id, userId: row.userId, expiresAt: row.expiresAt }
        : null;
    },
    async revoke(id) {
      const row = tokens.find((item) => item.id === id);
      if (row) row.revoked = true;
    },
    async revokeAllForUser(userId) {
      tokens
        .filter((item) => item.userId === userId)
        .forEach((item) => {
          item.revoked = true;
        });
    },
  };
}

export function memoryRuns(): RunRepository & {
  runs: RunState[];
  scores: ScoreEntry[];
} {
  const runs: RunState[] = [];
  const scores: ScoreEntry[] = [];
  return {
    runs,
    scores,
    async findActiveByUser(userId) {
      return [...runs].reverse().find((run) => run.userId === userId) ?? null;
    },
    async save(run) {
      const index = runs.findIndex((item) => item.id === run.id);
      if (index >= 0) runs[index] = run;
      else runs.push(run);
    },
    async listScores(limit) {
      return [...scores].sort((a, b) => b.score - a.score).slice(0, limit);
    },
    async addScore(entry) {
      scores.push(entry);
    },
  };
}

export function fakeHasher(): PasswordHasher {
  return {
    hash: async (plain) => `hash:${plain}`,
    compare: async (plain, hash) => hash === `hash:${plain}`,
  };
}

export function fakeTokens(): TokenService {
  return {
    signAccess: async (payload: AccessTokenPayload) => `access:${payload.sub}`,
    signRefresh: async (payload) => `refresh:${payload.sub}`,
    verifyAccess: async (token) => {
      const sub = token.replace('access:', '');
      return { sub, email: 'a@b.c', name: 'A', role: 'PLAYER' as UserRole };
    },
    verifyRefresh: async (token) => ({ sub: token.replace('refresh:', '') }),
    hashToken: (token) => `h:${token}`,
  };
}

export function player(): User {
  return {
    id: 'user-1',
    name: 'Foleiro',
    email: 'player@brasa.dev',
    passwordHash: 'hash:password123',
    role: 'PLAYER',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
