import { IsEnum, IsInt } from 'class-validator';

export enum ActionType {
  HIT = 'HIT',
  STAY = 'STAY',
}
export class MoveDto {
  @IsInt()
  gameId: number;

  @IsInt()
  participantId: number;

  @IsEnum(ActionType)
  action: ActionType;
}
