import { availableGames, fakeGames, fakeMoves } from './game.mock';
import { Injectable } from '@nestjs/common';
import { Game, Move } from '@prisma/client';
import { IdDto } from 'src/shared/dto/id.dto';
import { GameStartDto, GameIdDto } from '../dto/game.dto';
import { MoveDto } from '../dto/move.dto';

@Injectable()
export class GameServiceMock {
  async retrieveGame({ id }: IdDto): Promise<Game> {
    return fakeGames.find((g) => `${g.id}` === id);
  }

  async startGame(createInfo: GameStartDto): Promise<Game> {
    return {
      ...createInfo,
      ...availableGames.fakeGame_3,
    };
  }

  async deleteGame({ id }: IdDto): Promise<Game | null> {
    const found = fakeGames.find((g) => `${g.id}` === id);
    if (!found) {
      return null;
    }

    return found;
  }

  async getMoves({ gameId }: GameIdDto): Promise<Move[]> {
    return fakeMoves.filter((m) => `${m.gameId}` === gameId);
  }

  async makeMove(moveInfo: MoveDto): Promise<Game> {
    return fakeGames.find((g) => g.id === moveInfo.gameId);
  }
}
