import { LitContracts } from './contracts-sdk';

jest.setTimeout(60000);

describe('addresses', () => {
  it('should get all addresses by token id and pub key', async () => {
    const litContracts = new LitContracts();

    await litContracts.connect();

    const addresses =
      await litContracts.pkpNftContractUtil.read.getTokensInfoByAddress(
        '0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1'
      );

    expect(addresses[0].btcAddress).toEqual(
      '1AKxaxe5d1ANRV5h2nvTKzSPQTPftXXDqD'
    );
    expect(addresses[0].ethAddress).toEqual(
      '0x9C92d8d8A007289cf906A7945Fcf91c07f4680CB'
    );
    expect(addresses[0].cosmosAddress).toEqual(
      'cosmos1rldaen0j5mde2v526sg8qeq4vgmj6k3ju2eq3y'
    );
  });
});
