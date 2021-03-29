import { Injectable } from '@nestjs/common';
import { Card, Collection } from '@prisma/client';
import { makeCombinations } from '../shared/helpers/combinations';
import { getRandomInt } from '../shared/helpers/random';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionIdDto, CollectionType } from '../shared/dto/collection.dto';
import { CardDto, CardType } from './dto/card.dto';

@Injectable()
export class CollectionService {
  BLACKJACK_THRESHOLD: number;
  ACE_VALUES: number[];

  constructor(private prisma: PrismaService) {
    this.BLACKJACK_THRESHOLD = 21;
    this.ACE_VALUES = [1, 11];
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

  async drawCards(
    deckId: number,
    handId: number,
    quantity: number,
  ): Promise<Card[]> {
    const cardsDrawn = [];

    // Find out how many cards are left in the deck
    let numCardsAvailable = await this.prisma.card.count({
      where: {
        collectionId: deckId,
      },
    });

    for (let i = 0; i < quantity; i += 1) {
      // Randomly pick a card
      const randOffset = getRandomInt(0, numCardsAvailable);
      const cardRes = await this.prisma.card.findMany({
        where: {
          collectionId: deckId,
        },
        skip: randOffset,
        take: 1,
      });

      // Transfer card from deck to hand
      await this.prisma.card.update({
        data: {
          collectionId: handId,
        },
        where: {
          id: cardRes[0].id,
        },
      });

      cardsDrawn.push(cardRes);
      numCardsAvailable -= 1;
    }

    return cardsDrawn;
  }

  async calculateHandScore(handId: number): Promise<number> {
    const cardsInHand = await this.prisma.card.findMany({
      where: {
        collectionId: handId,
      },
    });

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

    const distanceToBlackjack = this.BLACKJACK_THRESHOLD - nonAceScore;

    // Can end up with Blackjack if have exactly number of aces to make up the
    // difference at min value.
    if (distanceToBlackjack === numAces) {
      return this.BLACKJACK_THRESHOLD;
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
