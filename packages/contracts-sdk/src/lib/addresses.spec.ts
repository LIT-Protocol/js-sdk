import { LitContracts } from './contracts-sdk';

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
  });
});
