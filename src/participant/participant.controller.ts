import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Participant as ParticipantModel } from '@prisma/client';
import { ParticipantCreateDto, ParticipantIdDto } from './dto/participant.dto';
import { ParticipantService } from './participant.service';

@Controller('participant')
export class ParticipantController {
  constructor(private readonly participantSvc: ParticipantService) {}

  @Get('list')
  listAllParticipants(): Promise<ParticipantModel[]> {
    return this.participantSvc.retrieveAllParticipants();
  }

  @Get(':participantId')
  getParticipant(@Param() params: ParticipantIdDto): Promise<ParticipantModel> {
    return this.participantSvc.retrieveParticipant(params);
  }

  @Post()
  createParticipant(
    @Body() data: ParticipantCreateDto,
  ): Promise<ParticipantModel> {
    return this.participantSvc.createParticipant(data);
  }
}
