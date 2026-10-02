import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  PASSWORD_HASHER,
  TOKEN_SERVICE,
} from './application/interfaces/auth.interfaces';
import { GetMeUseCase } from './application/use-cases/auth/get-me.use-case';
import { LoginUserUseCase } from './application/use-cases/auth/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/auth/logout-user.use-case';
import { RefreshTokenUseCase } from './application/use-cases/auth/refresh-token.use-case';
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
} from './application/use-cases/runs/run.use-cases';
import { REFRESH_TOKEN_REPOSITORY } from './domain/repositories/refresh-token.repository';
import { RUN_REPOSITORY } from './domain/repositories/run.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { BcryptPasswordHasher } from './infrastructure/auth/bcrypt-password.hasher';
import { JwtAuthGuard } from './infrastructure/auth/jwt-auth.guard';
import { JwtTokenService } from './infrastructure/auth/jwt-token.service';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { PrismaModule } from './infrastructure/database/prisma.module';
import { PrismaRefreshTokenRepository } from './infrastructure/repositories/prisma-refresh-token.repository';
import { PrismaRunRepository } from './infrastructure/repositories/prisma-run.repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { AuthController } from './presentation/controllers/auth.controller';
import { HealthController } from './presentation/controllers/health.controller';
import { RunsController } from './presentation/controllers/runs.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [HealthController, AuthController, RunsController],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
    { provide: RUN_REPOSITORY, useClass: PrismaRunRepository },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    LoginUserUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,
    GetMeUseCase,
    StartRunUseCase,
    GetCurrentRunUseCase,
    MutateRunUseCase,
    ChooseClassUseCase,
    ConfirmDeckUseCase,
    EnterNodeUseCase,
    PlayCardUseCase,
    EndTurnUseCase,
    PickRewardUseCase,
    SkipRewardUseCase,
    BuyShopUseCase,
    LeaveShopUseCase,
    RestUseCase,
    ListScoresUseCase,
  ],
})
export class AppModule {}
