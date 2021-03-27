import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { ParticipantModule } from './participant/participant.module';
@Module({
  imports: [GameModule, ParticipantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
