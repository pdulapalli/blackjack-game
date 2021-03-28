import { Injectable } from '@nestjs/common';
import { Card, Collection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionIdDto, CollectionType } from '../shared/dto/collection.dto';
import { CardDto, CardType } from './dto/card.dto';

@Injectable()
export class CollectionService {
  constructor(private prisma: PrismaService) {}

  async retrieveCollection({
    collectionId,
  }: CollectionIdDto): Promise<Collection> {
    return this.prisma.collection.findUnique({
      where: {
        id: Number.parseInt(collectionId, 10),
      },
    });
  }

  async createDeck(): Promise<Collection> {
    const deck = await this.prisma.collection.create({
      data: {
        type: CollectionType.DECK,
      },
    });

    const cardsToAdd = this.parametrizeCardsForDeck(deck.id);
    await this.createCards(cardsToAdd);
    return deck;
  }

  async getCardsForCollection(
    collectionInfo: CollectionIdDto,
  ): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: {
        collection: {
          id: Number.parseInt(collectionInfo.collectionId, 10),
        },
      },
    });
  }

  async createCards(cards: CardDto[]): Promise<void> {
    for (let i = 0; i < cards.length; i += 1) {
      await this.prisma.card.create({
        data: cards[i],
      });
    }
  }

  parametrizeCardsForDeck(deckId: number): CardDto[] {
    const cardsForDeck: CardDto[] = [];

    for (let i = 0; i < 4; i += 1) {
      cardsForDeck.push({
        collectionId: deckId,
        type: CardType.ACE,
        value: 11,
      });

      for (let j = 2; j <= 10; j += 1) {
        cardsForDeck.push({
          collectionId: deckId,
          type: CardType.SPOT,
          value: j,
        });
      }

      for (let k = 0; k < 3; k += 1) {
        cardsForDeck.push({
          collectionId: deckId,
          type: CardType.FACECARD,
          value: 10,
        });
      }
    }

    return cardsForDeck;
  }
}
