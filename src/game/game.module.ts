import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { GameService } from './game.service';
import { ParticipantModule } from '../participant/participant.module';
import { CollectionModule } from '../collection/collection.module'

@Module({
  imports: [PrismaModule, ParticipantModule, CollectionModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
