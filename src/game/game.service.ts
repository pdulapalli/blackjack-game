import { Game, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GameStartDto } from './dto/game.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async retrieveGame(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
  ): Promise<Game> {
    return this.prisma.game.findUnique({
      where: gameWhereUniqueInput,
    });
  }

  async createGame(createInfo: GameStartDto): Promise<Game> {
    return this.prisma.game.create({
      data: {
        currentTurn: 'PLAYER',
        winner: 'PENDING',
        dealer: {
          connect: {
            id: createInfo.dealerId,
          },
        },
        player: {
          connect: {
            id: createInfo.playerId,
          },
        },
      },
    });
  }
}
