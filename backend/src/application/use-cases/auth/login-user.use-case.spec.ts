import { UnauthorizedError } from '../../../domain/errors/domain-error';
import {
  fakeHasher,
  fakeTokens,
  memoryRefresh,
  memoryUsers,
  player,
} from '../__tests__/memory';
import { LoginUserUseCase } from './login-user.use-case';
import { GetMeUseCase } from './get-me.use-case';
import { LogoutUserUseCase } from './logout-user.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { NotFoundError } from '../../../domain/errors/domain-error';

describe('auth use cases', () => {
  it('login válido → tokens', async () => {
    const useCase = new LoginUserUseCase(
      memoryUsers([player()]),
      memoryRefresh(),
      fakeHasher(),
      fakeTokens(),
    );
    const result = await useCase.execute({
      email: 'player@brasa.dev',
      password: 'password123',
    });
    expect(result.user.email).toBe('player@brasa.dev');
    expect(result.tokens.accessToken).toContain('access:');
  });

  it('email inexistente → 401', async () => {
    const useCase = new LoginUserUseCase(
      memoryUsers(),
      memoryRefresh(),
      fakeHasher(),
      fakeTokens(),
    );
    await expect(
      useCase.execute({ email: 'x@y.z', password: 'password123' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('senha errada → 401', async () => {
    const useCase = new LoginUserUseCase(
      memoryUsers([player()]),
      memoryRefresh(),
      fakeHasher(),
      fakeTokens(),
    );
    await expect(
      useCase.execute({ email: 'player@brasa.dev', password: 'nope' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('me inexistente → 404', async () => {
    const useCase = new GetMeUseCase(memoryUsers());
    await expect(useCase.execute({ userId: 'x' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('me existente → usuário público', async () => {
    const useCase = new GetMeUseCase(memoryUsers([player()]));
    const me = await useCase.execute({ userId: 'user-1' });
    expect(me.email).toBe('player@brasa.dev');
  });

  it('logout revoga refresh', async () => {
    const refresh = memoryRefresh();
    const tokens = fakeTokens();
    await refresh.create({
      userId: 'user-1',
      tokenHash: tokens.hashToken('refresh:user-1'),
      expiresAt: new Date(Date.now() + 10000),
    });
    const useCase = new LogoutUserUseCase(refresh, tokens);
    await useCase.execute({ refreshToken: 'refresh:user-1' });
    expect(refresh.tokens[0].revoked).toBe(true);
  });

  it('logout por userId revoga todos', async () => {
    const refresh = memoryRefresh();
    await refresh.create({
      userId: 'user-1',
      tokenHash: 'h:a',
      expiresAt: new Date(Date.now() + 10000),
    });
    const useCase = new LogoutUserUseCase(refresh, fakeTokens());
    await useCase.execute({ userId: 'user-1' });
    expect(refresh.tokens[0].revoked).toBe(true);
  });

  it('refresh válido → novo par', async () => {
    const refresh = memoryRefresh();
    const tokens = fakeTokens();
    await refresh.create({
      userId: 'user-1',
      tokenHash: tokens.hashToken('refresh:user-1'),
      expiresAt: new Date(Date.now() + 10000),
    });
    const useCase = new RefreshTokenUseCase(
      memoryUsers([player()]),
      refresh,
      tokens,
    );
    const pair = await useCase.execute({ refreshToken: 'refresh:user-1' });
    expect(pair.accessToken).toContain('access:');
  });

  it('refresh inválido → 401', async () => {
    const tokens = fakeTokens();
    const broken: typeof tokens = {
      ...tokens,
      verifyRefresh: async () => {
        throw new Error('bad');
      },
    };
    const useCase = new RefreshTokenUseCase(
      memoryUsers(),
      memoryRefresh(),
      broken,
    );
    await expect(useCase.execute({ refreshToken: 'x' })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('refresh com usuário apagado → 401', async () => {
    const refresh = memoryRefresh();
    const tokens = fakeTokens();
    await refresh.create({
      userId: 'ghost',
      tokenHash: tokens.hashToken('refresh:ghost'),
      expiresAt: new Date(Date.now() + 10000),
    });
    const useCase = new RefreshTokenUseCase(memoryUsers(), refresh, tokens);
    await expect(
      useCase.execute({ refreshToken: 'refresh:ghost' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('logout sem token não quebra', async () => {
    const useCase = new LogoutUserUseCase(memoryRefresh(), fakeTokens());
    await expect(useCase.execute({})).resolves.toBeUndefined();
  });

  it('refresh sem registro → 401', async () => {
    const useCase = new RefreshTokenUseCase(
      memoryUsers([player()]),
      memoryRefresh(),
      fakeTokens(),
    );
    await expect(
      useCase.execute({ refreshToken: 'refresh:user-1' }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});
