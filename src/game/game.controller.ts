import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Game as GameModel, Move as MoveModel } from '@prisma/client';
import { GameService } from './game.service';
import { IdDto } from '../shared/dto/id.dto';
import { GameIdDto, GameStartDto } from './dto/game.dto';
import { MoveDto } from './dto/move.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameSvc: GameService) {}

  @Get(':id')
  retrieveGame(@Param() params: IdDto): Promise<GameModel> {
    return this.gameSvc.retrieveGame(params);
  }

  @Get('moves/:gameId')
  getMovesForGame(@Param() params: GameIdDto): Promise<MoveModel[]> {
    return this.gameSvc.getMoves(params);
  }

  @Post('move')
  makeMove(@Body() data: MoveDto): Promise<MoveModel> {
    return this.gameSvc.makeMove(data);
  }

  @Post()
  startGame(@Body() data: GameStartDto): Promise<GameModel> {
    return this.gameSvc.startGame(data);
  }
}
