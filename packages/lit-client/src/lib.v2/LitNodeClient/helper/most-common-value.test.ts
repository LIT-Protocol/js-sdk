import { mostCommonValue } from './most-common-value';

describe('mostCommonValue', () => {
  it('should get the most common string in an array', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 8];

    const mostOccured = mostCommonValue(arr);

    expect(mostOccured).toBe(8);
  });

  it('should get the last element of the array if every element only appears once', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

    const mostOccured = mostCommonValue(arr);

    expect(mostOccured).toBe(0);
  });
});
