/**
 *
 * Find the element that occurs the most in an array
 *
 * @template T
 * @param { T[] } arr
 * @returns { T } the element that appeared the most
 */
export const mostCommonValue = <T>(arr: T[]): T | undefined => {
  return arr
    .sort(
      (a: T, b: T) =>
        arr.filter((v: T) => v === a).length -
        arr.filter((v: T) => v === b).length
    )
    .pop();
};
