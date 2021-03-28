import { Controller, Get, Param, Post } from '@nestjs/common';
import {
  Collection as CollectionModel,
  Card as CardModel,
} from '@prisma/client';
import { CollectionService } from './collection.service';
import { CollectionIdDto } from '../shared/dto/collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionSvc: CollectionService) {}

  @Get(':collectionId')
  getCollection(@Param() params: CollectionIdDto): Promise<CollectionModel> {
    return this.collectionSvc.retrieveCollection(params);
  }

  @Get('contents/:collectionId')
  listCardsForCollection(
    @Param() params: CollectionIdDto,
  ): Promise<CardModel[]> {
    return this.collectionSvc.getCardsForCollection(params);
  }

  @Post('deck')
  createDeck(): Promise<CollectionModel> {
    return this.collectionSvc.createDeck();
  }
}
