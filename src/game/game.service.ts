import { Game } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { IdDto } from 'src/shared/dto/id.dto';
import { PrismaService } from '../prisma/prisma.service';
import { GameStartDto } from './dto/game.dto';
import { CollectionService } from '../collection/collection.service';
import { ParticipantService } from '../participant/participant.service';

@Injectable()
export class GameService {
  constructor(
    private prisma: PrismaService,
    private collectionService: CollectionService,
    private participantService: ParticipantService,
  ) {}

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
        bet: createInfo.bet,
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

    // Place bet, and deduct amount from player
    await this.participantService.adjustMoney(player.id, -1 * createInfo.bet);

    // Deal cards
    await this.collectionService.drawCards(createInfo.deckId, player.handId, 2);
    await this.collectionService.drawCards(createInfo.deckId, dealer.handId, 2);

    // Determine and set initial scores
    const [playerScore, dealerScore] = await Promise.all([
      this.collectionService.calculateHandScore(dealer.handId),
      this.collectionService.calculateHandScore(player.handId),
    ]);

    await Promise.all([
      this.participantService.updateScore(player.id, playerScore),
      this.participantService.updateScore(dealer.id, dealerScore),
    ]);

    return gameState;
  }
}
