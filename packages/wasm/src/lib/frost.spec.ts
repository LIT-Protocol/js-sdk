/// <reference types="jest" />

import { LitFrost } from "..";

const THRESHOLD = 3;
const MAX_SIGNERS = 5;

describe('FROST', () => {
  it('should generate key shares', async () => {

    // -- generate keys
    const keygenResult = await LitFrost.generateKeys(
      'K256Sha256',
      THRESHOLD,
      MAX_SIGNERS
    );

    console.log("keygenResult:", keygenResult);
  });
});