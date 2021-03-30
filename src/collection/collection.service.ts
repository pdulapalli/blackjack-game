import { Injectable } from '@nestjs/common';
import Chance = require('chance');
import { Card, Collection } from '@prisma/client';
import { makeCombinations } from '../shared/helpers/combinations';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionIdDto, CollectionType } from '../shared/dto/collection.dto';
import { CardDto, CardType } from './dto/card.dto';
import Constants from '../shared/constants';

@Injectable()
export class CollectionService {
  ACE_VALUES: number[];
  chance: any;

  constructor(private prisma: PrismaService) {
    this.ACE_VALUES = [1, 11];
    this.chance = new Chance();
  }

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

  async createCards(cards: CardDto[]): Promise<number> {
    const { count } = await this.prisma.card.createMany({
      data: cards,
    });

    return count;
  }

  // Enumerate what cards are needed to assemble a standard deck
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

    const shuffledCards = this.chance.shuffle(cardsForDeck);
    return shuffledCards;
  }

  // Assumes deck is already shuffled
  async drawCards(
    deckId: number,
    handId: number,
    quantity: number,
  ): Promise<Card[]> {
    const cardsToTake = await this.prisma.card.findMany({
      where: {
        collectionId: deckId,
      },
      skip: 0,
      take: quantity,
    });

    // Transfer cards from deck to hand
    await this.prisma.card.updateMany({
      data: {
        collectionId: handId,
      },
      where: {
        OR: cardsToTake.map((cr) => ({
          id: cr.id,
        })),
      },
    });

    return this.prisma.card.findMany({
      where: {
        OR: cardsToTake.map((cr) => ({
          id: cr.id,
        })),
      },
    });
  }

  async transferHandToDeck(handId: number, deckId: number): Promise<Card[]> {
    const cardsToReturn = await this.prisma.card.findMany({
      where: {
        collectionId: handId,
      },
      skip: 0,
    });

    await this.prisma.card.updateMany({
      data: {
        collectionId: deckId,
      },
      where: {
        OR: cardsToReturn.map((cr) => ({
          id: cr.id,
        })),
      },
    });

    return this.prisma.card.findMany({
      where: {
        OR: cardsToReturn.map((cr) => ({
          id: cr.id,
        })),
      },
    });
  }

  async calculateHandScore(cardsInHand: Card[]): Promise<number> {
    const nonAceCards = cardsInHand.filter((c) => c.type !== 'ACE');
    const aces = cardsInHand.filter((c) => c.type === 'ACE');

    let score = 0;
    for (let i = 0; i < nonAceCards.length; i += 1) {
      const currentCard = nonAceCards[i];
      switch (currentCard.type) {
        case 'FACECARD':
        case 'SPOT':
          score += currentCard.value;
          break;
        default:
          break;
      }
    }

    return this.calculateScoreWithAces(score, aces.length);
  }

  // Enumerate possible combinations of Ace values and determine appropriate
  // score
  calculateScoreWithAces(nonAceScore: number, numAces: number): number {
    if (numAces === 0) {
      return nonAceScore;
    }

    const distanceToBlackjack = Constants.BLACKJACK_THRESHOLD - nonAceScore;

    // Can end up with Blackjack if have exactly number of aces to make up the
    // difference at min value.
    if (distanceToBlackjack === numAces) {
      return Constants.BLACKJACK_THRESHOLD;
    }

    // If there are more aces to account for compared to the remaining space
    // to make a Blackjack, then simply return add the aces at their minimal
    // value for simplicity.
    if (distanceToBlackjack < numAces) {
      return nonAceScore + numAces;
    }

    // There could be several ways for the aces to add up to reach or approach
    // Blackjack. Take the highest possible combination without exceeding
    // the Blackjack threshold.
    const possibleCombos = makeCombinations(this.ACE_VALUES, numAces);
    const possibleScoreAdditions = possibleCombos.map((combo) =>
      combo.reduce((sum, current) => sum + current),
    );

    let maxAceScore = 0;
    for (let i = 0; i < possibleScoreAdditions.length; i += 1) {
      const currPossibleScore = possibleScoreAdditions[i];
      if (
        currPossibleScore <= distanceToBlackjack &&
        currPossibleScore > maxAceScore
      ) {
        maxAceScore = currPossibleScore;
      }
    }

    return nonAceScore + maxAceScore;
  }
}
