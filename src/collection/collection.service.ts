import { Injectable } from '@nestjs/common';
import { Collection } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CollectionIdDto,
  CollectionInfoDto,
} from '../shared/dto/collection.dto';

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

  async createCollection(
    collectionInfo: CollectionInfoDto,
  ): Promise<Collection> {
    return this.prisma.collection.create({
      data: {
        type: collectionInfo.type,
      },
    });
  }
}
