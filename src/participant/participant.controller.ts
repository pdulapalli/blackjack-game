import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Participant as ParticipantModel } from '@prisma/client';
import { IdDto } from '../shared/dto/id.dto';
import { ParticipantCreateDto } from './dto/participant.dto';
import { ParticipantService } from './participant.service';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantSvc: ParticipantService) {}

  @Get('list')
  listAllParticipants(): Promise<ParticipantModel[]> {
    return this.participantSvc.retrieveAllParticipants();
  }

  @Get(':id')
  getParticipant(@Param() params: IdDto): Promise<ParticipantModel> {
    return this.participantSvc.retrieveParticipant({
      id: Number.parseInt(params.id, 10),
    });
  }

  @Post()
  createPlayer(@Body() data: ParticipantCreateDto): Promise<ParticipantModel> {
    return this.participantSvc.createParticipant(data);
  }
}
