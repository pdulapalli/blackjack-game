import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Game as GameModel } from '@prisma/client';
import { GameService } from './game.service';
import { IdDto } from '../shared/dto/id.dto';
import { GameStartDto } from './dto/game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameSvc: GameService) {}

  @Get(':id')
  retrieveGame(@Param() params: IdDto): Promise<GameModel> {
    return this.gameSvc.retrieveGame({
      id: Number.parseInt(params.id, 10),
    });
  }

  @Post()
  startGame(@Body() data: GameStartDto): Promise<GameModel> {
    return this.gameSvc.createGame(data);
  }
}
