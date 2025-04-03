import { derivedAddresses } from './addresses';

const COMPRESSED_PUBLIC_KEY =
  '02e5896d70c1bc4b4844458748fe0f936c7919d7968341e391fb6d82c258192e64';

describe('adddresses', () => {
  it('should return the derived address from a compressed eth public key', async () => {
    const derivedAddress = await derivedAddresses({
      publicKey: COMPRESSED_PUBLIC_KEY,
    });
    expect(derivedAddress).toEqual({
      publicKey: `0x${COMPRESSED_PUBLIC_KEY}`,
      publicKeyBuffer: Buffer.from(COMPRESSED_PUBLIC_KEY, 'hex'),
      ethAddress: '0x7206cB69380ee83c4Ef13f05713e814F3e4dee0f',
      btcAddress: '1HD3rsQMzn5iJJJMeiZSgzbUkai2UhphbY',
      cosmosAddress: 'cosmos1k8ykgtjwxzvzmwzdpenjp56g9cf77jvhu7p703',
      isNewPKP: false,
    });
  });
});
