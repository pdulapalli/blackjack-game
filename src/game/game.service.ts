import { Game } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/shared/dto/id.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GameStartDto } from './dto/game.dto';
import { CollectionService } from '../collection/collection.service';
import { ParticipantService } from '../participant/participant.service';

@Injectable()
export class GameService {
  BLACKJACK_THRESHOLD: number;

  constructor(
    private prisma: PrismaService,
    private collectionService: CollectionService,
    private participantService: ParticipantService,
  ) {
    this.BLACKJACK_THRESHOLD = 21;
  }

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
  }

  async startGame(createInfo: GameStartDto): Promise<Game> {
    const gameState = await this.createGame(createInfo);

    const [player, dealer] = await Promise.all([
      this.participantService.retrieveParticipant({
        participantId: `${createInfo.playerId}`,
      }),
      this.participantService.retrieveParticipant({
        participantId: `${createInfo.dealerId}`,
      }),
    ]);

    await this.collectionService.drawCards(createInfo.deckId, player.handId, 2);
    await this.collectionService.drawCards(createInfo.deckId, dealer.handId, 2);

    const [playerScore, dealerScore] = await Promise.all([
      this.collectionService.calculateHandScore(dealer.handId),
      this.collectionService.calculateHandScore(player.handId),
    ]);

    await this.participantService.updateScores(
      player.id,
      dealer.id,
      playerScore,
      dealerScore,
    );

    return gameState;
  }
}
