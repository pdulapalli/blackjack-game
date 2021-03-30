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

  async deleteGame({ id }: IdDto): Promise<void> {
    const game = await this.retrieveGame({ id });
    if (!game) {
      return;
    }

    const [player, dealer] = await Promise.all([
      this.participantService.retrieveParticipant({
        participantId: `${game.playerId}`,
      }),
      this.participantService.retrieveParticipant({
        participantId: `${game.dealerId}`,
      }),
    ]);

    await this.cleanupGame(player, dealer, game);

    await this.prisma.game.delete({
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

  async calculateGameOutcome(
    currentParticipantId: number,
    currentGameId: number,
  ): Promise<OutcomeState> {
    const currentParticipant = await this.participantService.retrieveParticipant(
      {
        participantId: `${currentParticipantId}`,
      },
    );

    const currentGame = await this.retrieveGame({
      id: `${currentGameId}`,
    });

    let outcome: OutcomeState;

    switch (currentParticipant.role) {
      case Role.PLAYER:
        {
          if (currentParticipant.score === Constants.BLACKJACK_THRESHOLD) {
            outcome = OutcomeState.PLAYER_WIN;
          } else if (currentParticipant.score > Constants.BLACKJACK_THRESHOLD) {
            // Player bust
            outcome = OutcomeState.DEALER_WIN;
          } else {
            outcome = OutcomeState.PENDING;
          }
        }
        break;
      case Role.DEALER:
        {
          const {
            score: playerScore,
          } = await this.participantService.retrieveParticipant({
            participantId: `${currentGame.playerId}`,
          });

          if (currentParticipant.score === Constants.BLACKJACK_THRESHOLD) {
            outcome = OutcomeState.DEALER_WIN;
          } else if (currentParticipant.score > Constants.BLACKJACK_THRESHOLD) {
            // Dealer bust
            outcome = OutcomeState.PLAYER_WIN;
          } else if (currentParticipant.score > playerScore) {
            outcome = OutcomeState.DEALER_WIN;
          } else {
            outcome = OutcomeState.PLAYER_WIN;
          }
        }
        break;
      default:
        break;
    }

    return outcome;
  }

  async processHit(gameId: number, participant: Participant): Promise<Game> {
    const game = await this.retrieveGame({
      id: `${gameId}`,
    });

    await this.collectionService.drawCards(
      game.deckId,
      participant.handId,
      Constants.HIT_CARD_DRAW_QTY,
    );

    await this.calculateAndUpdateScore(participant);
    const outcome = await this.calculateGameOutcome(participant.id, gameId);

    return this.setGameOutcome({
      gameId: game.id,
      outcome,
    });
  }

  async processStay(gameId: number, participant: Participant): Promise<Game> {
    let gameState: Game;

    await this.calculateAndUpdateScore(participant);

    switch (participant.role) {
      case Role.DEALER:
        {
          const outcome = await this.calculateGameOutcome(
            participant.id,
            gameId,
          );

          gameState = await this.setGameOutcome({
            gameId: gameId,
            outcome,
          });
        }
        break;
      case Role.PLAYER:
        gameState = await this.setGameTurn({
          gameId: gameId,
          currentTurn: Turn.DEALER,
        });
        break;
      default:
        break;
    }

    return gameState;
  }

  checkActionValid(
    currentTurn: Role,
    participantRole: Role,
    action: ActionType,
    currentScore: number,
  ): boolean {
    if (currentTurn !== participantRole) {
      return false;
    }

    if (participantRole === Role.PLAYER) {
      return true;
    }

    const aboveStayThreshold = currentScore >= Constants.DEALER_STAY_THRESHOLD;

    if (aboveStayThreshold && action === ActionType.HIT) {
      return false;
    }

    if (!aboveStayThreshold && action === ActionType.STAY) {
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
      game.currentTurn,
      participant.role,
      moveInfo.action,
      participant.score,
    );

    if (!isValidMove) {
      throw new Error('Attempted to perform invalid move.');
    }

    const move = await this.createMove(moveInfo);

    let gameState: Game;
    switch (move.action) {
      case ActionType.HIT:
        gameState = await this.processHit(game.id, participant);
        break;
      case ActionType.STAY:
        gameState = await this.processStay(game.id, participant);
        break;
      default:
        break;
    }

    await this.handleGameResult(game.id);

    return gameState;
  }

  async cleanupGame(
    player: Participant,
    dealer: Participant,
    game: Game,
  ): Promise<void> {
    // Return hands to deck
    await this.collectionService.transferHandToDeck(player.handId, game.deckId);
    await this.collectionService.transferHandToDeck(dealer.handId, game.deckId);

    // Reset scores
    await Promise.all([
      await this.participantService.updateScore(game.playerId, 0),
      await this.participantService.updateScore(game.dealerId, 0),
    ]);
  }

  async handleGameResult(gameId: number): Promise<void> {
    const game = await this.retrieveGame({
      id: `${gameId}`,
    });

    if (game.outcome === OutcomeState.PENDING) {
      return;
    }

    const [player, dealer] = await Promise.all([
      this.participantService.retrieveParticipant({
        participantId: `${game.playerId}`,
      }),
      this.participantService.retrieveParticipant({
        participantId: `${game.dealerId}`,
      }),
    ]);

    await this.cleanupGame(player, dealer, game);

    switch (game.outcome) {
      case OutcomeState.PLAYER_WIN:
        await this.participantService.adjustMoney(game.playerId, game.bet);
        break;
      case OutcomeState.DEALER_WIN:
        await this.participantService.adjustMoney(game.dealerId, game.bet);
        break;
      default:
        break;
    }
  }
}
