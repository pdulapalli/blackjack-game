import { Participant } from '.prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParticipantCreateDto, ParticipantIdDto } from './dto/participant.dto';

@Injectable()
export class ParticipantService {
  constructor(private prisma: PrismaService) {}

  async retrieveAllParticipants(): Promise<Participant[]> {
    return this.prisma.participant.findMany();
  }

  async retrieveParticipant({
    participantId,
  }: ParticipantIdDto): Promise<Participant> {
    return this.prisma.participant.findUnique({
      where: {
        id: Number.parseInt(participantId, 10),
      },
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
            type: 'HAND',
          },
        },
      },
    });
  }

  async updateScores(
    playerId: number,
    dealerId: number,
    playerScore: number,
    dealerScore: number,
  ): Promise<Participant[]> {
    const [playerUpdate, dealerUpdate] = await Promise.all([
      this.prisma.participant.update({
        where: {
          id: playerId,
        },
        data: {
          score: playerScore,
        },
      }),
      this.prisma.participant.update({
        where: {
          id: dealerId,
        },
        data: {
          score: dealerScore,
        },
      }),
    ]);

    return [playerUpdate, dealerUpdate];
  }
}
