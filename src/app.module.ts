import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { ParticipantModule } from './participant/participant.module';
import { CollectionModule } from './collection/collection.module';

@Module({
  imports: [GameModule, ParticipantModule, CollectionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
