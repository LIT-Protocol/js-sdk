import { areStringArraysDifferent } from './areStringArraysDifferent';

describe('areStringArraysDifferent', () => {
  it('should return false for two empty arrays', () => {
    expect(areStringArraysDifferent([], [])).toBe(false);
  });

  it('should return false for two arrays with the same elements in the same order', () => {
    expect(areStringArraysDifferent(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(false);
  });

  it('should return false for two arrays with the same elements in a different order', () => {
    expect(areStringArraysDifferent(['a', 'b', 'c'], ['c', 'a', 'b'])).toBe(false);
  });

  it('should return true for arrays with different lengths (first shorter)', () => {
    expect(areStringArraysDifferent(['a', 'b'], ['a', 'b', 'c'])).toBe(true);
  });

  it('should return true for arrays with different lengths (first longer)', () => {
    expect(areStringArraysDifferent(['a', 'b', 'c'], ['a', 'b'])).toBe(true);
  });

  it('should return true for arrays with the same length but different elements', () => {
    expect(areStringArraysDifferent(['a', 'b', 'c'], ['a', 'b', 'd'])).toBe(true);
  });

  it('should return true for one empty array and one non-empty array', () => {
    expect(areStringArraysDifferent([], ['a', 'b', 'c'])).toBe(true);
    expect(areStringArraysDifferent(['a', 'b', 'c'], [])).toBe(true);
  });

  it('should return false for arrays with duplicate elements that are otherwise the same', () => {
    expect(areStringArraysDifferent(['a', 'a', 'b', 'c'], ['c', 'a', 'b', 'a'])).toBe(false);
  });

  it('should return true for arrays with duplicate elements that make them different', () => {
    expect(areStringArraysDifferent(['a', 'a', 'b', 'c'], ['a', 'b', 'b', 'c'])).toBe(true);
  });

  it('should return true if one array has an element the other doesn\'t, even if same length', () => {
    expect(areStringArraysDifferent(['a', 'b', 'c'], ['a', 'b', 'x'])).toBe(true);
  });

  it('should return false for identical arrays with numbers as strings', () => {
    expect(areStringArraysDifferent(['1', '2', '3'], ['1', '2', '3'])).toBe(false);
  });

  it('should return true for arrays with numbers as strings where one element differs', () => {
    expect(areStringArraysDifferent(['1', '2', '3'], ['1', '2', '4'])).toBe(true);
  });
});
