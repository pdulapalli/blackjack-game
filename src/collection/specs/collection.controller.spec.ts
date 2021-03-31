import { Test } from '@nestjs/testing';
import { CollectionController } from '../collection.controller';
import { CollectionService } from '../collection.service';
import { CollectionServiceMock } from '../mocks/collection.service.mock';
import { availableCards, availableCollections } from '../mocks/collection.mock';
import { CollectionType } from '.prisma/client';

describe('CollectionController', () => {
  let collectionController: CollectionController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [CollectionService],
    })
      .overrideProvider(CollectionService)
      .useClass(CollectionServiceMock)
      .compile();

    collectionController = moduleRef.get<CollectionController>(
      CollectionController,
    );
  });

  describe('getCollection', () => {
    it('should return a specified collection', async () => {
      const expectedCollectionId = 1;
      const expected =
        availableCollections[`fakeCollection_${expectedCollectionId}`];
      const result = await collectionController.getCollection({
        collectionId: `${expectedCollectionId}`,
      });

      expect(result).toBe(expected);
    });
  });

  describe('listCardsForCollection', () => {
    it('should return cards in this collection', async () => {
      const targetCollectionId = 1;
      const expected =
        availableCards[`fakeCardsCollection_${targetCollectionId}`];
      const result = await collectionController.listCardsForCollection({
        collectionId: `${targetCollectionId}`,
      });

      for (let i = 0; i < result.length; i += 1) {
        expect(result[i]).toBe(expected[i]);
      }
    });
  });

  describe('createDeck', () => {
    it('should create a deck', async () => {
      const result = await collectionController.createDeck();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type', CollectionType.DECK);
    });
  });
});
