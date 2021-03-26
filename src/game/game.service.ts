import { Game, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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

  async createGame(data: Prisma.GameCreateInput): Promise<Game> {
    return this.prisma.game.create({
      data,
    });
  }
}
