import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { ParticipantModule } from './participant/participant.module';
import { CollectionModule } from './collection/collection.module';
import { CardsModule } from './cards/cards.module';

@Module({
  imports: [GameModule, ParticipantModule, CollectionModule, CardsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
