import { LitContracts } from './contracts-sdk';

try{
  jest.setTimeout(60000);
}catch(e){
  // you probably running in Bun
}

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
        '0xA5d8d25A4eDf2e6392F8435b82354929Ffd45407'
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
