import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GameService } from './game.service';

@Module({
  imports: [PrismaModule],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
