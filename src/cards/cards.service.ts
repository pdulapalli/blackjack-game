import { Card } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CardDto } from './dto/card.dto';
import {
  CollectionDto,
  CollectionIdDto,
  CollectionType,
} from '../shared/dto/collection.dto';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async getCardsForCollection(collectionInfo: CollectionDto): Promise<Card[]> {
    return this.prisma.card.findMany({
      where: {
        collection: {
          id: Number.parseInt(collectionInfo.collectionId, 10),
          type: collectionInfo.type,
        },
      },
    });
  }

  async getCardsForHand({ collectionId }: CollectionIdDto): Promise<Card[]> {
    return this.getCardsForCollection({
      collectionId,
      type: CollectionType.HAND,
    });
  }

  async getCardsForDeck({ collectionId }: CollectionIdDto): Promise<Card[]> {
    return this.getCardsForCollection({
      collectionId,
      type: CollectionType.DECK,
    });
  }

  async createCard(cardInfo: CardDto): Promise<Card> {
    const card: Prisma.CardCreateInput = {
      type: cardInfo.type,
      value: cardInfo.value,
    };

    if (
      typeof cardInfo.collectionId !== 'undefined' &&
      cardInfo.collectionId !== null
    ) {
      card.collection = {
        connect: {
          id: cardInfo.collectionId,
        },
      };
    }

    return this.prisma.card.create({
      data: card,
    });
  }
}
