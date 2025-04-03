/**
 * Converts an ArrayLike object to a regular array.
 *
 * Context: the nodes will only accept a normal array type as a paramater due to serizalization issues with Uint8Array type. this loop below is to normalize the message to a basic array.
 *
 * @param toSign - The ArrayLike object to be converted.
 * @returns The converted array.´
 */
export const normalizeArray = (toSign: ArrayLike<number>) => {
  const arr = [];
  // Casting ArrayLike to Uint8Array for better compatibility and avoiding Node-specific types
  const uint8Array = new Uint8Array(toSign);
  for (let i = 0; i < uint8Array.length; i++) {
    arr.push(uint8Array[i]);
  }
  return arr;
};
