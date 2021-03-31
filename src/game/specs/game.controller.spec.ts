import { Test } from '@nestjs/testing';
import { ActionType } from '../dto/move.dto';
import { GameController } from '../game.controller';
import { GameService } from '../game.service';
import { availableGames, availableMoves } from '../mocks/game.mock';
import { GameServiceMock } from '../mocks/game.service.mock';

describe('GameController', () => {
  let gameController: GameController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GameController],
      providers: [GameService],
    })
      .overrideProvider(GameService)
      .useClass(GameServiceMock)
      .compile();

    gameController = moduleRef.get<GameController>(GameController);
  });

  describe('retrieveGame', () => {
    it('should return a specified game', async () => {
      const expectedGameId = 1;
      const expected = availableGames[`fakeGame_${expectedGameId}`];
      const result = await gameController.retrieveGame({
        id: `${expectedGameId}`,
      });

      expect(result).toBe(expected);
    });
  });

  describe('startGame', () => {
    it('should return the game created', async () => {
      const createOpts = {
        playerId: 1,
        dealerId: 2,
        deckId: 1,
        bet: 0,
      };

      const result = await gameController.startGame(createOpts);

      expect(result).toMatchObject(createOpts);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('currentTurn');
      expect(result).toHaveProperty('outcome');
    });
  });

  describe('deleteGame', () => {
    it('should return a specified game when it exists', async () => {
      const expectedGameId = 1;
      const expected = availableGames[`fakeGame_${expectedGameId}`];
      const result = await gameController.deleteGame({
        id: `${expectedGameId}`,
      });

      expect(result).toBe(expected);
    });

    it('should return nothing when the game does not exist', async () => {
      const expectedGameId = 9001;
      const expected = null;
      const result = await gameController.deleteGame({
        id: `${expectedGameId}`,
      });

      expect(result).toBe(expected);
    });
  });

  describe('getMovesForGame', () => {
    it('should return the moves for a specified game', async () => {
      const targetGameId = 1;
      const expected = availableMoves[`fakeMovesGame_${targetGameId}`];
      const result = await gameController.getMovesForGame({
        gameId: `${targetGameId}`,
      });

      for (let i = 0; i < result.length; i += 1) {
        expect(result[i]).toBe(expected[i]);
      }
    });
  });

  describe('makeMove', () => {
    it('should return the game state for the move', async () => {
      const expectedGameId = 2;
      const createOpts = {
        gameId: expectedGameId,
        participantId: 1,
        action: ActionType.HIT,
      };

      const result = await gameController.makeMove(createOpts);
      const expected = availableGames[`fakeGame_${expectedGameId}`];
      expect(result).toBe(expected);
    });
  });
});
