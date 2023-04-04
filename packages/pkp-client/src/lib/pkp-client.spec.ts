/**
 * To test this file, you can run:
 * yarn nx run pkp-client:test --testFile=pkp-client.spec.ts
 */

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

  it('should get supported chains', async () => {
    const supportedChains = pkpClient.getSupportedChains();
    expect(supportedChains).toEqual(['eth', 'cosmos']);
  });

  it('should fail to getWallet if chain is not supported', async () => {
    expect(() => pkpClient.getWallet('btc')).toThrow('Unsupported chain: btc');
  });

  describe('cosmos', () => {
    it('should get cosmos wallet using getWallet("cosmos")', async () => {
      const cosmosWallet = pkpClient.getWallet('cosmos') as PKPCosmosWallet;

      const cosmosAddress = await cosmosWallet.getAccounts();

      expect(cosmosAddress[0].address).toEqual(
        'cosmos134y3t6v0cfftzk4zhtzynqyyzj7dwwcz9chs0q'
      );
    });

    it('should get cosmos wallet using getCosmosWallet()', async () => {
      const cosmosWallet = pkpClient.getCosmosWallet();

      const cosmosAddress = await cosmosWallet.getAccounts();

      expect(cosmosAddress[0].address).toEqual(
        'cosmos134y3t6v0cfftzk4zhtzynqyyzj7dwwcz9chs0q'
      );
    });
  });

  describe('eth', () => {
    it('should get eth address using getWallet("eth")', async () => {
      const etherWallet = pkpClient.getWallet('eth') as PKPEthersWallet;

      const etherAddress = await etherWallet.getAddress();

      expect(etherAddress).toEqual(
        '0xf675E8Cdc5DbE5f78a47D23A3b1CCD07b986f17f'
      );
    });

    it('should get eth address using getEthWallet()', async () => {
      const etherWallet = pkpClient.getEthWallet();

      const etherAddress = await etherWallet.getAddress();

      expect(etherAddress).toEqual(
        '0xf675E8Cdc5DbE5f78a47D23A3b1CCD07b986f17f'
      );
    });
  });
});
