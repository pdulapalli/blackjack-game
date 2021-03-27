import { Module } from '@nestjs/common';
import { CardsController } from './cards.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CardsService } from './cards.service';

@Module({
  imports: [PrismaModule],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
