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
        money: createInfo.money,
        hand: {
          create: {
            type: 'HAND',
          },
        },
      },
    });
  }

  async updateScore(
    participantId: number,
    scoreVal: number,
  ): Promise<Participant> {
    return this.prisma.participant.update({
      where: {
        id: participantId,
      },
      data: {
        score: scoreVal,
      },
    });
  }

  async retrieveScore(participantId: number): Promise<number> {
    const { score } = await this.prisma.participant.findUnique({
      where: {
        id: participantId,
      },
      select: {
        score: true,
      },
    });

    return score;
  }

  async adjustMoney(
    participantId: number,
    amount: number,
  ): Promise<Participant> {
    return this.prisma.participant.update({
      where: {
        id: participantId,
      },
      data: {
        money: {
          increment: amount,
        },
      },
    });
  }
}
