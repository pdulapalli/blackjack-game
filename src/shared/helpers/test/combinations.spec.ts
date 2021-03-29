import { makeCombinations } from '../combinations';

describe('Combinations', () => {
  describe('makeCombinations', () => {
    it('should create a combination from 4 items with 2 possible values', async () => {
      const result = Array.from(makeCombinations([1, 11], 4));
      expect(result).toContainEqual([1, 1, 1, 1]);
      expect(result).toContainEqual([1, 1, 1, 11]);
      expect(result).toContainEqual([1, 1, 11, 11]);
      expect(result).toContainEqual([1, 11, 11, 11]);
      expect(result).toContainEqual([11, 11, 11, 11]);
    });
  });
});
