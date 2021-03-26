import { IsInt } from 'class-validator';

class GameStartDto {
  @IsInt()
  playerId: number;

  @IsInt()
  dealerId: number;
}

export { GameStartDto };
