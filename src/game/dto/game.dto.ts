import { IsEnum, IsInt, IsNumberString } from 'class-validator';

export class GameStartDto {
  @IsInt()
  playerId: number;

  @IsInt()
  dealerId: number;

  @IsInt()
  deckId: number;

  @IsInt()
  bet: number;
}

export class GameIdDto {
  @IsNumberString()
  gameId: string;
}

export enum OutcomeState {
  PLAYER_WIN = 'PLAYER_WIN',
  DEALER_WIN = 'DEALER_WIN',
  PENDING = 'PENDING',
  TIE = 'TIE',
}

export class GameWinDto {
  @IsNumberString()
  gameId: number;

  @IsEnum(OutcomeState)
  outcome: OutcomeState;
}

export enum Turn {
  PLAYER = 'PLAYER',
  DEALER = 'DEALER',
}
export class GameCurrentTurnDto {
  @IsNumberString()
  gameId: number;

  @IsEnum(Turn)
  currentTurn: Turn;
}
