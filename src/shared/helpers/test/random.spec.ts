import { getRandomInt } from '../random'

describe('Random', () => {
  describe('getRandomInt', () => {
    it('should return a random integer between 2 and 5 (exclusive)', () => {
      const res = getRandomInt(2, 5);
      expect([2, 3, 4]).toContain(res);
    });
  });
});
