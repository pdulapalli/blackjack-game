import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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

  @Get(':gameId/moves')
  getMovesForGame(@Param() params: GameIdDto): Promise<MoveModel[]> {
    return this.gameSvc.getMoves(params);
  }

  @Post('move')
  makeMove(@Body() data: MoveDto): Promise<GameModel> {
    return this.gameSvc.makeMove(data);
  }

  @Delete(':id')
  deleteGame(@Param() params: IdDto): Promise<void> {
    return this.gameSvc.deleteGame(params);
  }

  @Post()
  startGame(@Body() data: GameStartDto): Promise<GameModel> {
    return this.gameSvc.startGame(data);
  }
}
