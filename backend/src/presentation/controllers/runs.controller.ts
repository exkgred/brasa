import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AccessTokenPayload } from '../../application/interfaces/auth.interfaces';
import {
  BuyShopUseCase,
  ChooseClassUseCase,
  ConfirmDeckUseCase,
  EndTurnUseCase,
  EnterNodeUseCase,
  GetCurrentRunUseCase,
  LeaveShopUseCase,
  ListScoresUseCase,
  PickRewardUseCase,
  PlayCardUseCase,
  RestUseCase,
  SkipRewardUseCase,
  StartRunUseCase,
} from '../../application/use-cases/runs/run.use-cases';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import {
  CardIdDto,
  ChooseClassDto,
  ConfirmDeckDto,
  PlayCardDto,
} from '../dto/brasa.dto';

@ApiTags('Runs')
@ApiBearerAuth()
@Controller()
export class RunsController {
  constructor(
    private readonly startRun: StartRunUseCase,
    private readonly getCurrent: GetCurrentRunUseCase,
    private readonly chooseClass: ChooseClassUseCase,
    private readonly confirmDeck: ConfirmDeckUseCase,
    private readonly enterNode: EnterNodeUseCase,
    private readonly playCard: PlayCardUseCase,
    private readonly endTurn: EndTurnUseCase,
    private readonly pickReward: PickRewardUseCase,
    private readonly skipReward: SkipRewardUseCase,
    private readonly buyShop: BuyShopUseCase,
    private readonly leaveShop: LeaveShopUseCase,
    private readonly rest: RestUseCase,
    private readonly listScores: ListScoresUseCase,
  ) {}

  @Post('runs')
  @HttpCode(200)
  @ApiOperation({ summary: 'Começar ou retomar a run' })
  start(@CurrentUser() user: AccessTokenPayload) {
    return this.startRun.execute({ userId: user.sub });
  }

  @Get('runs/current')
  current(@CurrentUser() user: AccessTokenPayload) {
    return this.getCurrent.execute({ userId: user.sub });
  }

  @Post('runs/current/class')
  @HttpCode(200)
  @ApiOperation({ summary: 'Escolher classe e receber o baralho inicial' })
  pickClass(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ChooseClassDto,
  ) {
    return this.chooseClass.execute({ userId: user.sub, classId: dto.classId });
  }

  @Post('runs/current/deck')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirmar o baralho e abrir o mapa' })
  buildDeck(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: ConfirmDeckDto,
  ) {
    return this.confirmDeck.execute({ userId: user.sub, cardIds: dto.cardIds });
  }

  @Post('runs/current/enter')
  @HttpCode(200)
  enter(@CurrentUser() user: AccessTokenPayload) {
    return this.enterNode.execute({ userId: user.sub });
  }

  @Post('runs/current/play')
  @HttpCode(200)
  play(@CurrentUser() user: AccessTokenPayload, @Body() dto: PlayCardDto) {
    return this.playCard.execute({
      userId: user.sub,
      instanceId: dto.instanceId,
    });
  }

  @Post('runs/current/end-turn')
  @HttpCode(200)
  finishTurn(@CurrentUser() user: AccessTokenPayload) {
    return this.endTurn.execute({ userId: user.sub });
  }

  @Post('runs/current/reward')
  @HttpCode(200)
  reward(@CurrentUser() user: AccessTokenPayload, @Body() dto: CardIdDto) {
    return this.pickReward.execute({ userId: user.sub, cardId: dto.cardId });
  }

  @Post('runs/current/skip-reward')
  @HttpCode(200)
  skip(@CurrentUser() user: AccessTokenPayload) {
    return this.skipReward.execute({ userId: user.sub });
  }

  @Post('runs/current/shop')
  @HttpCode(200)
  shop(@CurrentUser() user: AccessTokenPayload, @Body() dto: CardIdDto) {
    return this.buyShop.execute({ userId: user.sub, cardId: dto.cardId });
  }

  @Post('runs/current/leave-shop')
  @HttpCode(200)
  leave(@CurrentUser() user: AccessTokenPayload) {
    return this.leaveShop.execute({ userId: user.sub });
  }

  @Post('runs/current/rest')
  @HttpCode(200)
  camp(@CurrentUser() user: AccessTokenPayload) {
    return this.rest.execute({ userId: user.sub });
  }

  @Public()
  @Get('scores')
  @ApiOperation({ summary: 'Ranking das runs' })
  scores() {
    return this.listScores.execute();
  }
}
