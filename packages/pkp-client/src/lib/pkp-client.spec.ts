/**
 * To test this file, you can run:
 * yarn nx run pkp-client:test --testFile=pkp-client.spec.ts
 */

import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPClient } from './pkp-client';

import * as LITCONFIG from 'lit.config.json';
import { PKPCosmosWalletProp, PKPEthersWalletProp } from '@lit-protocol/types';
import { WalletFactory } from './wallet-factory';
import { PKPBase } from '@lit-protocol/pkp-base';

describe('WalletFactory', () => {
  it('should create an Ethereum wallet', () => {
    const ethProp: PKPEthersWalletProp = {
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.MUMBAI_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
    };
    const ethWallet = WalletFactory.createWallet('eth', ethProp);

    expect(ethWallet).toBeInstanceOf(PKPEthersWallet);
  });

  it('should create a Cosmos wallet', () => {
    const cosmosProp: PKPCosmosWalletProp = {
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.MUMBAI_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
      addressPrefix: 'cosmos',
    };
    const cosmosWallet = WalletFactory.createWallet('cosmos', cosmosProp);

    expect(cosmosWallet).toBeInstanceOf(PKPCosmosWallet);
  });

  it('should throw an error for unsupported BTC wallet', () => {
    const btcProp: any = {
      /* Bitcoin properties */
    };
    expect(() => WalletFactory.createWallet('btc', btcProp)).toThrowError(
      'BTC wallet is not supported yet'
    );
  });

  it('should throw an error for unsupported chain', () => {
    const unsupportedProp: any = {
      /* Unsupported properties */
    };
    expect(() =>
      WalletFactory.createWallet('unsupportedChain', unsupportedProp)
    ).toThrowError('Unsupported chain: unsupportedChain');
  });
});

describe('pkpClient', () => {
  let pkpClient: PKPClient;

  it('should be defined', () => {
    expect(PKPClient).toBeDefined();
  });

  it('should instantiate a pkp client', async () => {
    pkpClient = new PKPClient({
      controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
      pkpPubKey: LITCONFIG.PKP_PUBKEY,
      rpcs: {
        eth: LITCONFIG.MUMBAI_RPC,
        cosmos: LITCONFIG.COSMOS_RPC,
      },
      cosmosAddressPrefix: 'cosmos',
    });

    expect(pkpClient).toBeDefined();
  });

  describe('init', () => {
    it('should return the overall readiness status and an array of the initialization status for each wallet', async () => {
      const initResult = await pkpClient.init();

      expect(initResult).toHaveProperty('ready');
      expect(typeof initResult.ready === 'boolean').toBeTruthy();

      expect(initResult).toHaveProperty('res');
      expect(Array.isArray(initResult.res)).toBeTruthy();

      initResult.res.forEach((status) => {
        expect(status).toHaveProperty('chain');
        expect(typeof status.chain === 'string').toBeTruthy();

        expect(status).toHaveProperty('success');
        expect(typeof status.success === 'boolean').toBeTruthy();
      });
    });

    it('should be ready after init', async () => {
      const initResult = await pkpClient.init();

      expect(initResult.ready).toBe(true);
    });

    it('should handle wallet init failures and return the correct readiness status and details', async () => {
      jest.spyOn(PKPBase.prototype, 'init').mockImplementation(async () => {
        throw new Error('Wallet initialization failed');
      });

      const initResult = await pkpClient.init();

      expect(initResult.ready).toBe(false);

      initResult.res.forEach((status) => {
        expect(status.success).toBe(false);
      });
    });

    it('should handle partial wallet init failures and return the correct readiness status and details', async () => {
      const mockInit = jest.spyOn(PKPBase.prototype, 'init');

      // Fail the first wallet's initialization
      mockInit.mockImplementationOnce(async () => {
        throw new Error('Wallet initialization failed');
      });

      // Succeed the second wallet's initialization
      mockInit.mockImplementationOnce(async () => {});

      const initResult = await pkpClient.init();

      expect(initResult.ready).toBe(false);

      expect(initResult.res[0].chain).toBeDefined();
      expect(initResult.res[0].success).toBe(false);

      expect(initResult.res[1].chain).toBeDefined();
      expect(initResult.res[1].success).toBe(true);
    });
  });

  it('should get supported chains', async () => {
    const supportedChains = pkpClient.getSupportedChains();
    expect(supportedChains).toEqual(['eth', 'cosmos']);
  });

  it('should fail to getWallet if chain is not supported', async () => {
    expect(() => pkpClient.getWallet('btc')).toThrow('Unsupported chain: btc');
  });

  describe('eth wallet', () => {
    it('should get eth address using getWallet("eth")', async () => {
      const etherWallet = pkpClient.getWallet<PKPEthersWallet>('eth');

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

    it('should be able to handle requests', async () => {
      await pkpClient.init();

      const etherWallet = pkpClient.getEthWallet();

      const signedTx = await etherWallet.handleRequest({
        method: 'eth_signTransaction',
        params: [
          {
            from: LITCONFIG.PKP_ADDRESS,
            to: LITCONFIG.PKP_ADDRESS,
          },
        ],
      });

      expect(signedTx).toBeDefined();
    });

    // TODO: add more tests for typed signing, just copy from the ethers wallet tests
  });

  describe('cosmos wallet', () => {
    it('should get cosmos wallet using getWallet("cosmos")', async () => {
      const cosmosWallet = pkpClient.getWallet<PKPCosmosWallet>('cosmos');

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

  describe('btc wallet', () => {
    it('should fail to get btc wallet', async () => {
      expect(() => pkpClient.getWallet('btc')).toThrow(
        'Unsupported chain: btc'
      );
    });
  });
});
