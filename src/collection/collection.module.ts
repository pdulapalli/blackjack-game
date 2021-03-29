import { Module } from '@nestjs/common';
import { CollectionController } from './collection.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CollectionService } from './collection.service';

@Module({
  imports: [PrismaModule],
  controllers: [CollectionController],
  providers: [CollectionService],
  exports: [CollectionService],
})
export class CollectionModule {}
