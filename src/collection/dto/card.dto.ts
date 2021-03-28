import { IsEnum, IsInt, Min, Max } from 'class-validator';

export enum CardType {
  FACECARD = 'FACECARD',
  SPOT = 'SPOT',
  ACE = 'ACE',
}

export class CardDto {
  @IsInt()
  collectionId: number;

  @IsEnum(CardType)
  type: CardType;

  @IsInt()
  @Min(1)
  @Max(11)
  value: number;
}
