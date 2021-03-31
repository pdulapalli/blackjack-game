import { ActionType } from '.prisma/client';
import { Game, Move, OutcomeState, Role } from '@prisma/client';

export const fakeGame_1: Game = {
  id: 1,
  currentTurn: Role.PLAYER,
  outcome: OutcomeState.PENDING,
  bet: 0,
  deckId: 1,
  playerId: 1,
  dealerId: 2,
};

export const fakeGame_3: any = {
  id: 3,
  currentTurn: Role.DEALER,
  outcome: OutcomeState.PENDING,
};

export const fakeMovesGame_1 = [
  {
    id: 1,
    action: ActionType.HIT,
    participantId: 1,
    gameId: 1,
  },
  {
    id: 2,
    action: ActionType.STAY,
    participantId: 1,
    gameId: 1,
  },
];

export const fakeMovesGame_2 = [
  {
    id: 3,
    action: ActionType.HIT,
    participantId: 1,
    gameId: 2,
  },
];

export const fakeMoves: Move[] = [...fakeMovesGame_1, ...fakeMovesGame_2];

export const availableMoves = {
  fakeMovesGame_1,
  fakeMovesGame_2,
};

export const availableGames = {
  fakeGame_1,
  fakeGame_3,
};

export const fakeGames: Game[] = [fakeGame_1];
