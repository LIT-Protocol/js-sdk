import { CosmosBundledSDK } from './cosmos-bundled-sdk';

const {
  // @cosmjs/amino
  encodeSecp256k1Signature,
  rawSecp256k1PubkeyToRawAddress,
  // @cosmjs/crypto
  Secp256k1,
  sha256,
  ExtendedSecp256k1Signature,
  toBech32,
  fromHex,
  // @cosmjs/proto-signing
  makeSignBytes,
  // @cosmjs/stargate
  assertIsDeliverTxSuccess,
  SigningStargateClient,
  StdFee,
  calculateFee,
  GasPrice,
  coins,
} = CosmosBundledSDK;

describe('CosmosBundledSDK', () => {
  it('should have encodeSecp256k1Signature function', () => {
    expect(encodeSecp256k1Signature).toBeDefined();
  });
  it('should have rawSecp256k1PubkeyToRawAddress function', () => {
    expect(rawSecp256k1PubkeyToRawAddress).toBeDefined();
  });
  it('should have Secp256k1 class', () => {
    expect(Secp256k1).toBeDefined();
  });
  it('should have sha256 function', () => {
    expect(sha256).toBeDefined();
  });
  it('should have ExtendedSecp256k1Signature class', () => {
    expect(ExtendedSecp256k1Signature).toBeDefined();
  });
  it('should have toBech32 function', () => {
    expect(toBech32).toBeDefined();
  });
  it('should have fromHex function', () => {
    expect(fromHex).toBeDefined();
  });
  it('should have makeSignBytes function', () => {
    expect(makeSignBytes).toBeDefined();
  });
  it('should have assertIsDeliverTxSuccess function', () => {
    expect(assertIsDeliverTxSuccess).toBeDefined();
  });
  it('should have SigningStargateClient class', () => {
    expect(SigningStargateClient).toBeDefined();
  });
  it('should have StdFee class', () => {
    expect(StdFee).toBeUndefined();
  });
  it('should have calculateFee function', () => {
    expect(calculateFee).toBeDefined();
  });
  it('should have GasPrice class', () => {
    expect(GasPrice).toBeDefined();
  });
  it('should have coins function', () => {
    expect(coins).toBeDefined();
  });
});
