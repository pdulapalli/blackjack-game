import { Game, Move, Participant } from '.prisma/client';
import { Injectable, Logger } from '@nestjs/common';
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
  private readonly logger: Logger;

  constructor(
    private prisma: PrismaService,
    private collectionService: CollectionService,
    private participantService: ParticipantService,
  ) {
    this.logger = new Logger(GameService.name);
  }

  async retrieveGame({ id }: IdDto): Promise<Game> {
    return this.prisma.game.findUnique({
      where: {
        id: Number.parseInt(id, 10),
      },
    });
  }

  async deleteGame({ id }: IdDto): Promise<Game | null> {
    const game = await this.retrieveGame({ id });
    if (!game) {
      return null;
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

  async updateScore(
    participantId: number,
    scoreVal: number,
    game: Game,
  ): Promise<Game> {
    let fieldToUpdate: string;
    switch (participantId) {
      case game.dealerId:
        fieldToUpdate = 'dealerScore';
        break;
      case game.playerId:
        fieldToUpdate = 'playerScore';
        break;
      default:
        return game;
    }

    const updateData = {};
    updateData[fieldToUpdate] = scoreVal;

    return this.prisma.game.update({
      where: {
        id: game.id,
      },
      data: updateData,
    });
  }

  async startGame(createInfo: GameStartDto): Promise<Game> {
    const [player, dealer] = await Promise.all([
      this.participantService.retrieveParticipant({
        participantId: `${createInfo.playerId}`,
      }),
      this.participantService.retrieveParticipant({
        participantId: `${createInfo.dealerId}`,
      }),
    ]);

    if (player.money < createInfo.bet) {
      throw new Error('Player does not have enough money to bet');
    }

    let gameState = await this.createGame(createInfo);

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
    const playerScore = this.collectionService.calculateHandScore(
      playerHandCards,
    );

    const dealerScore = this.collectionService.calculateHandScore(
      dealerHandCards,
    );

    this.logger.log(
      `Initial starting scores. Player: ${playerScore}. Dealer: ${dealerScore}`,
    );

    await Promise.all([
      this.updateScore(player.id, playerScore, gameState),
      this.updateScore(dealer.id, dealerScore, gameState),
    ]);

    if (playerScore === Constants.BLACKJACK_THRESHOLD) {
      gameState = await this.setGameOutcome({
        gameId: gameState.id,
        outcome: OutcomeState.PLAYER_WIN,
      });
    } else {
      gameState = await this.retrieveGame({
        id: `${gameState.id}`,
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

  async calculateAndUpdateScore(
    participant: Participant,
    game: Game,
  ): Promise<number> {
    const handContents = await this.collectionService.getCardsForCollection({
      collectionId: `${participant.handId}`,
    });

    const score = this.collectionService.calculateHandScore(handContents);
    await this.updateScore(participant.id, score, game);

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
          if (currentGame.playerScore === Constants.BLACKJACK_THRESHOLD) {
            outcome = OutcomeState.PLAYER_WIN;
          } else if (currentGame.playerScore > Constants.BLACKJACK_THRESHOLD) {
            // Player bust
            outcome = OutcomeState.DEALER_WIN;
          } else {
            outcome = OutcomeState.PENDING;
          }
        }
        break;
      case Role.DEALER:
        {
          if (currentGame.dealerScore === Constants.BLACKJACK_THRESHOLD) {
            outcome = OutcomeState.DEALER_WIN;
          } else if (currentGame.dealerScore > Constants.BLACKJACK_THRESHOLD) {
            // Dealer bust
            outcome = OutcomeState.PLAYER_WIN;
          } else if (currentGame.dealerScore > currentGame.playerScore) {
            outcome = OutcomeState.DEALER_WIN;
          } else if (currentGame.dealerScore === currentGame.playerScore) {
            outcome = OutcomeState.TIE;
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

    await this.calculateAndUpdateScore(participant, game);
    const outcome = await this.calculateGameOutcome(participant.id, gameId);

    return this.setGameOutcome({
      gameId: game.id,
      outcome,
    });
  }

  async processStay(gameId: number, participant: Participant): Promise<Game> {
    let gameState: Game;

    const currentGame = await this.retrieveGame({ id: `${gameId}` });
    await this.calculateAndUpdateScore(participant, currentGame);

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

    if (game.outcome !== OutcomeState.PENDING) {
      throw new Error('Cannot move on concluded game');
    }

    let participantScore = 0;
    switch (participant.role) {
      case Role.DEALER:
        participantScore = game.dealerScore;
        break;
      case Role.PLAYER:
        participantScore = game.playerScore;
        break;
      default:
        break;
    }

    const isValidMove = this.checkActionValid(
      game.currentTurn,
      participant.role,
      moveInfo.action,
      participantScore,
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

    const { playerScore, dealerScore } = gameState;

    this.logger.log(
      `Participant ${participant.id} performed action ${move.action}. Player Score: ${playerScore}. Dealer Score: ${dealerScore}`,
    );

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
      await this.updateScore(game.playerId, 0, game),
      await this.updateScore(game.dealerId, 0, game),
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

    const winnings = Constants.WINNINGS_MULTIPLER * game.bet;
    switch (game.outcome) {
      case OutcomeState.PLAYER_WIN:
        await this.participantService.adjustMoney(game.playerId, winnings);
        break;
      case OutcomeState.DEALER_WIN:
        await this.participantService.adjustMoney(game.dealerId, winnings);
        break;
      case OutcomeState.TIE:
        // Refund player
        await this.participantService.adjustMoney(game.playerId, game.bet);
        break;
      default:
        break;
    }
  }
}
