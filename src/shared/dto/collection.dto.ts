import { IsEnum, IsNumberString } from 'class-validator';

export enum CollectionType {
  DECK = 'DECK',
  HAND = 'HAND',
}

export class CollectionDto {
  @IsNumberString()
  collectionId: string;

  @IsEnum(CollectionType)
  type: CollectionType;
}

export class CollectionIdDto {
  @IsNumberString()
  collectionId: string;
}

export class CollectionInfoDto {
  @IsEnum(CollectionType)
  type: CollectionType;
}
