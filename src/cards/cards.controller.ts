import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Card as CardModel } from '@prisma/client';
import { CardsService } from './cards.service';
import { CardDto } from './dto/card.dto';
import { CollectionIdDto } from '../shared/dto/collection.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsSvc: CardsService) {}

  @Get('list/hand/:collectionId')
  listCardsForHand(@Param() params: CollectionIdDto): Promise<CardModel[]> {
    return this.cardsSvc.getCardsForHand(params);
  }

  @Get('list/deck/:collectionId')
  listCardsForDeck(@Param() params: CollectionIdDto): Promise<CardModel[]> {
    return this.cardsSvc.getCardsForDeck(params);
  }

  @Post('card')
  createCard(@Body() body: CardDto): Promise<CardModel> {
    return this.cardsSvc.createCard(body);
  }
}
