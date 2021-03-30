import { Game, Move, Participant } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionService } from '../collection/collection.service';
import { ParticipantService } from '../participant/participant.service';
import {
  GameCurrentTurnDto,
  GameIdDto,
  GameStartDto,
  GameWinDto,
  OutcomeState,
  Turn,
} from './dto/game.dto';
import { ActionType, MoveDto } from './dto/move.dto';
import Constants from '../shared/constants';
import { IdDto } from '../shared/dto/id.dto';
import { Role } from '@prisma/client';

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

  async deleteGame({ id }: IdDto): Promise<Game> {
    return this.prisma.game.delete({
      where: {
        id: Number.parseInt(id, 10),
      },
    });
  }

  async createGame(createInfo: GameStartDto): Promise<Game> {
    return this.prisma.game.create({
      data: {
        currentTurn: Role.PLAYER,
        outcome: OutcomeState.PENDING,
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
    await this.collectionService.drawCards(
      createInfo.deckId,
      player.handId,
      Constants.INITIAL_CARD_DRAW_QTY,
    );
    await this.collectionService.drawCards(
      createInfo.deckId,
      dealer.handId,
      Constants.INITIAL_CARD_DRAW_QTY,
    );

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
      gameState = await this.setGameOutcome({
        gameId: gameState.id,
        outcome: OutcomeState.PLAYER_WIN,
      });
    }

    return gameState;
  }

  async setGameOutcome({ gameId, outcome }: GameWinDto): Promise<Game> {
    return this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        outcome,
      },
    });
  }

  async setGameTurn({
    gameId,
    currentTurn,
  }: GameCurrentTurnDto): Promise<Game> {
    return this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        currentTurn,
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

  async createMove({ gameId, participantId, action }: MoveDto): Promise<Move> {
    return this.prisma.move.create({
      data: {
        action,
        participant: {
          connect: {
            id: participantId,
          },
        },
        game: {
          connect: {
            id: gameId,
          },
        },
      },
    });
  }

  async calculateAndUpdateScore(participant: Participant): Promise<number> {
    const handContents = await this.collectionService.getCardsForCollection({
      collectionId: `${participant.handId}`,
    });

    const score = await this.collectionService.calculateHandScore(handContents);
    await this.participantService.updateScore(participant.id, score);

    return score;
  }

  calculateGameOutcome(participant: Participant, score: number): OutcomeState {
    if (score !== Constants.BLACKJACK_THRESHOLD) {
      return OutcomeState.PENDING;
    }

    let outcome: OutcomeState;
    switch (participant.role) {
      case Role.PLAYER:
        outcome = OutcomeState.PLAYER_WIN;
        break;
      case Role.DEALER:
        outcome = OutcomeState.DEALER_WIN;
        break;
      default:
        break;
    }

    return outcome;
  }

  async processHit(game: Game, participant: Participant): Promise<Game> {
    await this.collectionService.drawCards(
      game.deckId,
      participant.handId,
      Constants.HIT_CARD_DRAW_QTY,
    );

    const score = await this.calculateAndUpdateScore(participant);
    const outcome = this.calculateGameOutcome(participant, score);

    return this.setGameOutcome({
      gameId: game.id,
      outcome,
    });
  }

  async processStay(game: Game, participant: Participant): Promise<Game> {
    let gameState: Game;

    const score = await this.calculateAndUpdateScore(participant);

    switch (participant.role) {
      case Role.DEALER:
        {
          const outcome = this.calculateGameOutcome(participant, score);
          gameState = await this.setGameOutcome({
            gameId: game.id,
            outcome,
          });
        }
        break;
      case Role.PLAYER:
        gameState = await this.setGameTurn({
          gameId: game.id,
          currentTurn: Turn.DEALER,
        });
        break;
      default:
        break;
    }

    return gameState;
  }

  checkActionValid(
    participantRole: Role,
    action: ActionType,
    currentScore: number,
  ): boolean {
    const aboveStayThreshold = currentScore >= Constants.DEALER_STAY_THRESHOLD;

    if (participantRole == Role.PLAYER) {
      return true;
    }

    if (aboveStayThreshold && action === ActionType.STAY) {
      return false;
    }

    if (!aboveStayThreshold && action === ActionType.HIT) {
      return false;
    }

    return true;
  }

  async makeMove(moveInfo: MoveDto): Promise<Game> {
    const game = await this.retrieveGame({ id: `${moveInfo.gameId}` });
    const participant = await this.participantService.retrieveParticipant({
      participantId: `${moveInfo.participantId}`,
    });

    const isValidMove = this.checkActionValid(
      participant.role,
      moveInfo.action,
      participant.score,
    );

    if (!isValidMove) {
      throw new Error(
        'Invalid action. Participant must choose a different move.',
      );
    }

    const move = await this.createMove(moveInfo);

    let gameState: Game;
    switch (move.action) {
      case ActionType.HIT:
        gameState = await this.processHit(game, participant);
        break;
      case ActionType.STAY:
        gameState = await this.processStay(game, participant);
        break;
      default:
        break;
    }

    return gameState;
  }
}
