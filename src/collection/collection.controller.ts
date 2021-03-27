import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Collection as CollectionModel } from '@prisma/client';
import { CollectionService } from './collection.service';
import {
  CollectionIdDto,
  CollectionInfoDto,
} from '../shared/dto/collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionSvc: CollectionService) {}

  @Get(':collectionId')
  getCollection(@Param() params: CollectionIdDto): Promise<CollectionModel> {
    return this.collectionSvc.retrieveCollection(params);
  }

  @Post()
  createCollection(@Body() body: CollectionInfoDto): Promise<CollectionModel> {
    return this.collectionSvc.createCollection(body);
  }
}
