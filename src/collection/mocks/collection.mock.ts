import { CardType, Collection, CollectionType } from '.prisma/client';
import { Card } from '@prisma/client';

export const fakeCollection_1: Collection = {
  id: 1,
  type: CollectionType.DECK,
};

export const fakeCardsCollection_1 = [
  {
    id: 1,
    collectionId: 1,
    type: CardType.SPOT,
    value: 1,
  },
  {
    id: 2,
    collectionId: 1,
    type: CardType.SPOT,
    value: 2,
  },
];

export const fakeCardsCollection_2 = [
  {
    id: 3,
    collectionId: 2,
    type: CardType.FACECARD,
    value: 2,
  },
];

export const fakeCards: Card[] = [
  ...fakeCardsCollection_1,
  ...fakeCardsCollection_2,
];

export const availableCards = {
  fakeCardsCollection_1,
  fakeCardsCollection_2,
};

export const availableCollections = {
  fakeCollection_1,
};

export const fakeCollections: Collection[] = [fakeCollection_1];
