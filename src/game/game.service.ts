import { Card, Game } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/shared/dto/id.dto';
import { getRandomInt } from '../shared/helpers/random';
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

  async startGame(createInfo: GameStartDto): Promise<Game> {
    const gameState = await this.prisma.game.create({
      data: {
        currentTurn: 'PLAYER',
        outcome: 'PENDING',
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
        deck: {
          connect: {
            id: createInfo.deckId,
          },
        },
      },
    });

    const dealer = await this.prisma.participant.findUnique({
      where: {
        id: createInfo.dealerId,
      },
    });

    const player = await this.prisma.participant.findUnique({
      where: {
        id: createInfo.playerId,
      },
    });

    await this.drawCards(createInfo.deckId, dealer.handId, player.handId);

    return gameState;
  }

  async drawCards(
    deckId: number,
    handId: number,
    quantity: number,
  ): Promise<Card[]> {
    const cardsDrawn = [];

    let numCardsAvailable = await this.prisma.card.count({
      where: {
        collectionId: deckId,
      },
    });

    for (let i = 0; i < quantity; i += 1) {
      const randOffset = getRandomInt(0, numCardsAvailable);
      const cardRes = await this.prisma.card.findMany({
        where: {
          collectionId: deckId,
        },
        skip: randOffset,
        take: 1,
      });

      await this.prisma.card.update({
        data: {
          collectionId: handId,
        },
        where: {
          id: cardRes[0].id,
        },
      });

      cardsDrawn.push(cardRes);
      numCardsAvailable -= 1;
    }

    return cardsDrawn;
  }
}
