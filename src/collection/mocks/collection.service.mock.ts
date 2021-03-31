import {
  fakeCollection_1,
  fakeCards,
  fakeCollections,
} from './collection.mock';
import { Injectable } from '@nestjs/common';
import { Card, Collection } from '@prisma/client';
import { CollectionIdDto } from '../../shared/dto/collection.dto';

@Injectable()
export class CollectionServiceMock {
  async retrieveCollection({
    collectionId,
  }: CollectionIdDto): Promise<Collection> {
    return fakeCollections.find((c) => `${c.id}` === collectionId);
  }

  async getCardsForCollection(
    collectionInfo: CollectionIdDto,
  ): Promise<Card[]> {
    return fakeCards.filter(
      (c) => `${c.collectionId}` === collectionInfo.collectionId,
    );
  }

  async createDeck(): Promise<Collection> {
    return fakeCollection_1;
  }
}
