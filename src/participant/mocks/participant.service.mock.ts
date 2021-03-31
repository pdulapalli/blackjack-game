import { fakeParticipants, availableParticipants } from './participant.mock';
import { Injectable } from '@nestjs/common';
import { Participant } from '@prisma/client';
import { ParticipantCreateDto, ParticipantIdDto } from '../dto/participant.dto';

@Injectable()
export class ParticipantServiceMock {
  async retrieveAllParticipants(): Promise<Participant[]> {
    return fakeParticipants;
  }

  async retrieveParticipant({
    participantId,
  }: ParticipantIdDto): Promise<Participant> {
    return fakeParticipants.find((p) => `${p.id}` === participantId);
  }

  async createParticipant(
    createInfo: ParticipantCreateDto,
  ): Promise<Participant> {
    return {
      name: createInfo.name,
      role: createInfo.role,
      money: createInfo.money,
      ...availableParticipants.fakeParticipant_3,
    };
  }
}
