import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPClient } from './pkp-client';

import * as LITCONFIG from 'lit.config.json';

describe('pkpClient', () => {
  let pkpClient: PKPClient;

  it('should be defined', () => {
    expect(PKPClient).toBeDefined();
  });

  it('init a pkp client', async () => {
    pkpClient = new PKPClient({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpc: LITCONFIG.RPC_ENDPOINT,
      cosmosAddressPrefix: 'cosmos',
    });

    expect(pkpClient).toBeDefined();
  });

  it('should get cosmos address', async () => {
    const cosmosWallet = pkpClient.getWallet('cosmos') as PKPCosmosWallet;

    const cosmosAddress = await cosmosWallet.getAccounts();

    expect(cosmosAddress[0].address).toEqual(
      'cosmos134y3t6v0cfftzk4zhtzynqyyzj7dwwcz9chs0q'
    );
  });

  it('should get eth address', async () => {
    const etherWallet = pkpClient.getWallet('eth') as PKPEthersWallet;

    const etherAddress = await etherWallet.getAddress();

    expect(etherAddress).toEqual('0xf675E8Cdc5DbE5f78a47D23A3b1CCD07b986f17f');
  });
});
