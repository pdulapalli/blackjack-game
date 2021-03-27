import { Game, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/shared/dto/id.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GameStartDto } from './dto/game.dto';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async retrieveGame({ id }: IdDto): Promise<Game> {
    return this.prisma.game.findUnique({
      where: {
        id: Number.parseInt(id, 10),
      },
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
