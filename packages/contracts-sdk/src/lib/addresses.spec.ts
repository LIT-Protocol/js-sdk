import { LitContracts } from './contracts-sdk';

jest.setTimeout(60000);

/**
 * If this fails, it's likely because the network has been updated and all the PKP NFTs have been removed
 * so that you will need to mint a new one from the Lit Explorer.
 */
describe('addresses', () => {
  it('should get all addresses by token id and pub key', async () => {
    const litContracts = new LitContracts();

    await litContracts.connect();

    const addresses =
      await litContracts.pkpNftContractUtil.read.getTokensInfoByAddress(
        '0x18f987d15a973776f6a60652b838688a1833fe95'
      );

    expect(addresses[0].btcAddress).toEqual(
      '1QCu2Q9uF81QCsLWig9ayyu47NHwRebbzS'
    );
    expect(addresses[0].ethAddress).toEqual(
      '0xf26Bdd71BACf9D99F5739B4b1a2733E209248170'
    );
    expect(addresses[0].cosmosAddress).toEqual(
      'cosmos1azq40ccjh0z9rvl72lgctg303al33xu7c9kxvh'
    );
  });
});
