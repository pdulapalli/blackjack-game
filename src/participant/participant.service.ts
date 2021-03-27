import { Participant, Prisma } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParticipantCreateDto } from './dto/participant.dto';

@Injectable()
export class ParticipantService {
  constructor(private prisma: PrismaService) {}

  async retrieveAllParticipants(): Promise<Participant[]> {
    return this.prisma.participant.findMany();
  }

  async retrieveParticipant(
    participantWhereUniqueInput: Prisma.ParticipantWhereUniqueInput,
  ): Promise<Participant> {
    return this.prisma.participant.findUnique({
      where: participantWhereUniqueInput,
    });
  }

  async createParticipant(
    createInfo: ParticipantCreateDto,
  ): Promise<Participant> {
    return this.prisma.participant.create({
      data: {
        name: createInfo.name,
        role: createInfo.role,
        hand: {
          create: {
            // id: null,
          },
        },
      },
    });
  }
}
