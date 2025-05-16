/**
 * Create a random hex string for use as an attestation challenge
 * @returns { string }
 */
export const createRandomHexString = (size: number): string => {
  return [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join('');
};
