import { Participant } from '.prisma/client';
import { Role } from '../dto/participant.dto';

const fakeParticipant_1: Participant = {
  id: 1,
  name: 'Aardvark',
  handId: 1,
  role: Role.PLAYER,
  money: 0.0,
};

const fakeParticipant_2: Participant = {
  id: 2,
  name: 'Beetle',
  handId: 2,
  role: Role.DEALER,
  money: 100.0,
};

const fakeParticipant_3: any = {
  id: 3,
  handId: 3,
};

export const availableParticipants = {
  fakeParticipant_1,
  fakeParticipant_2,
  fakeParticipant_3,
};

export const fakeParticipants: Participant[] = [
  fakeParticipant_1,
  fakeParticipant_2,
];
