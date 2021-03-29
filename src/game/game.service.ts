import { Game, Move } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionService } from '../collection/collection.service';
import { ParticipantService } from '../participant/participant.service';
import {
  GameIdDto,
  GameStartDto,
  GameWinDto,
  OutcomeState,
} from './dto/game.dto';
import { MoveDto } from './dto/move.dto';
import Constants from '../shared/constants';
import { IdDto } from '../shared/dto/id.dto';

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
    let gameState = await this.createGame(createInfo);

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

    const [playerHandCards, dealerHandCards] = await Promise.all([
      this.collectionService.getCardsForCollection({
        collectionId: `${player.handId}`,
      }),
      this.collectionService.getCardsForCollection({
        collectionId: `${dealer.handId}`,
      }),
    ]);

    // Determine and set initial scores
    const [playerScore, dealerScore] = await Promise.all([
      this.collectionService.calculateHandScore(playerHandCards),
      this.collectionService.calculateHandScore(dealerHandCards),
    ]);

    await Promise.all([
      this.participantService.updateScore(player.id, playerScore),
      this.participantService.updateScore(dealer.id, dealerScore),
    ]);

    if (playerScore === Constants.BLACKJACK_THRESHOLD) {
      gameState = await this.setGameWinner({
        gameId: gameState.id,
        outcome: OutcomeState.PLAYER_WIN,
      });
    }

    return gameState;
  }

  async setGameWinner({ gameId, outcome }: GameWinDto): Promise<Game> {
    return this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        outcome,
      },
    });
  }

  async getMoves({ gameId }: GameIdDto): Promise<Move[]> {
    return this.prisma.move.findMany({
      where: {
        gameId: Number.parseInt(gameId, 10),
      },
    });
  }

  async makeMove({ gameId, participantId, action }: MoveDto): Promise<Move> {
    return this.prisma.move.create({
      data: {
        gameId,
        participantId,
        action,
      },
    });
  }
}
