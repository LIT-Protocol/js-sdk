import { CosmosBundledSDK } from './cosmos-bundled-sdk';
const {
  encodeSecp256k1Signature,
  rawSecp256k1PubkeyToRawAddress,
  Secp256k1,
  sha256,
  ExtendedSecp256k1Signature,
  toBech32,
  fromHex,
  makeSignBytes,
} = CosmosBundledSDK;

describe('CosmosBundledSDK', () => {
  it('should create an instance', () => {
    expect(encodeSecp256k1Signature).toBe(1);
  });
});
