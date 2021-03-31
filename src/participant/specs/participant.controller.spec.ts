import { Test } from '@nestjs/testing';
import { ParticipantController } from '../participant.controller';
import { ParticipantService } from '../participant.service';
import { ParticipantServiceMock } from '../mocks/participant.service.mock';
import {
  fakeParticipants,
  availableParticipants,
} from '../mocks/participant.mock';
import { Role } from '../dto/participant.dto';

describe('ParticipantController', () => {
  let participantController: ParticipantController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ParticipantController],
      providers: [ParticipantService],
    })
      .overrideProvider(ParticipantService)
      .useClass(ParticipantServiceMock)
      .compile();

    participantController = moduleRef.get<ParticipantController>(
      ParticipantController,
    );
  });

  describe('listAllParticipants', () => {
    it('should return an array of participants', async () => {
      const result = await participantController.listAllParticipants();
      expect(result).toBe(fakeParticipants);
    });
  });

  describe('getParticipant', () => {
    it('should return a participant', async () => {
      const expectedParticipantId = 1;
      const expected =
        availableParticipants[`fakeParticipant_${expectedParticipantId}`];
      const result = await participantController.getParticipant({
        participantId: `${expectedParticipantId}`,
      });

      expect(result).toBe(expected);
    });
  });

  describe('createParticipant', () => {
    it('should create a participant', async () => {
      const createOpts = {
        name: 'Nemo',
        role: Role.PLAYER,
        money: 200,
      };

      const result = await participantController.createParticipant({
        name: 'Nemo',
        role: Role.PLAYER,
        money: 200,
      });

      expect(result).toMatchObject(createOpts);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('handId');
    });
  });
});
