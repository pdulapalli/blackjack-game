import { Module } from '@nestjs/common';
import { ParticipantController } from './participant.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ParticipantService } from './participant.service';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipantController],
  providers: [ParticipantService],
})
export class ParticipantModule {}
