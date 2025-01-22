/**
 * @example
 * const obj = ['a', 'b', 'c']
 * ObjectMapFromArray(obj) // { a: 'a', b: 'b', c: 'c' }
 */
export const ObjectMapFromArray = <T extends readonly string[]>(arr: T) => {
  return arr.reduce(
    (acc, scope) => ({ ...acc, [scope]: scope }),
    {} as { [K in T[number]]: K }
  );
};
