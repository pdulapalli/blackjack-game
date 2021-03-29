import { IsInt, IsNumberString } from 'class-validator';

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
