/**
 * To test this file, you can run:
 * yarn nx run pkp-client:test --testFile=pkp-client.spec.ts
 */

import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPClient } from './pkp-client';
import * as LITCONFIG from 'lit.config.json';

import {
  calculateFee,
  coins,
  GasPrice,
  SigningStargateClient,
  StdFee,
} from '@cosmjs/stargate';


describe('PKPClient', () => {
  const pkpClient = new PKPClient({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    cosmosAddressPrefix: 'cosmos',
  });

  beforeAll(async () => {
    await pkpClient.connect();
  });

  describe('with rpc', () => {
    let pkpClient: PKPClient;
    let initResult: any;

    beforeAll(async () => {
      pkpClient = new PKPClient({
        controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        pkpPubKey: LITCONFIG.PKP_PUBKEY,
        rpcs: {
          eth: LITCONFIG.CHRONICLE_RPC,
          cosmos: LITCONFIG.COSMOS_RPC,
        },
        cosmosAddressPrefix: 'cosmos',
      });
    });

    it('should be defined', () => {
      expect(PKPClient).toBeDefined();
    });

    it('should instantiate a pkp client', async () => {
      expect(pkpClient).toBeDefined();
    });

    it('should get supported chains', async () => {
      const supportedChains = pkpClient.getSupportedChains();
      expect(supportedChains).toEqual(['eth', 'cosmos']);
    });

    it('should fail to getWallet if chain is not supported', async () => {
      expect(() => pkpClient.getWallet('btc')).toThrow(
        'Unsupported chain: btc'
      );
    });

    describe('[ETH] wallet', () => {
      it('should get eth address using getWallet("eth")', async () => {
        const etherWallet = pkpClient.getWallet<PKPEthersWallet>('eth');

        const etherAddress = await etherWallet.getAddress();

        expect(etherAddress).toEqual(LITCONFIG.PKP_ETH_ADDRESS);
      });

      it('should get eth address using getEthWallet()', async () => {
        const etherWallet = pkpClient.getEthWallet();

        const etherAddress = await etherWallet.getAddress();

        expect(etherAddress).toEqual(LITCONFIG.PKP_ETH_ADDRESS);
      });

      describe('update config', () => {
        describe('update rpc', () => {
          // update the rpc
          const newRpcUrl = LITCONFIG.CHRONICLE_RPC;

          it('should be able to update rpc url', async () => {
            const etherWallet = pkpClient.getEthWallet();

            const oldRpc = etherWallet.getRpc();

            expect(oldRpc).toEqual(LITCONFIG.CHRONICLE_RPC);

            await etherWallet.setRpc(newRpcUrl);

            const newRpc = etherWallet.getRpc();

            expect(newRpc).toEqual(newRpcUrl);
          });
        });
      });
    });

    describe('[COSMOS] wallet', () => {
      it('should get cosmos wallet using getWallet("cosmos")', async () => {
        const cosmosWallet = pkpClient.getWallet<PKPCosmosWallet>('cosmos');

        const cosmosAddress = await cosmosWallet.getAccounts();

        expect(cosmosAddress[0].address).toEqual(LITCONFIG.PKP_COSMOS_ADDRESS);
      });

      it('should get cosmos wallet using getCosmosWallet()', async () => {
        const cosmosWallet = pkpClient.getCosmosWallet();

        const cosmosAddress = await cosmosWallet.getAccounts();

        expect(cosmosAddress[0].address).toEqual(LITCONFIG.PKP_COSMOS_ADDRESS);
      });

      describe('stargate client', () => {
        let client: SigningStargateClient;

        it('should get stargate client', async () => {
          client = await pkpClient.getCosmosWallet().getClient();

          expect(client).toBeDefined();
        });

        it('should get chainId', async () => {
          const chainId = await client.getChainId();

          expect(chainId).toEqual('cosmoshub-4');
        });

        it('should get height', async () => {
          const height = await client.getHeight();

          expect(height).toBeDefined();
          expect(typeof height).toBe('number');
        });

      });

      describe('update config', () => {
        const NEW_RPC = 'rpc.sentry-01.theta-testnet.polypore.xyz:26657';

        it('should be able to update rpc url', async () => {
          const cosmosWallet = pkpClient.getCosmosWallet();

          const oldRpc = cosmosWallet.getRpc();

          expect(oldRpc).toEqual(LITCONFIG.COSMOS_RPC);

          await cosmosWallet.setRpc(NEW_RPC);

          expect(cosmosWallet.getRpc()).toEqual(NEW_RPC);
        });

        describe('stargate client', () => {
          it('should be able to instantiate a new stargate client', async () => {
            const cosmosWallet = pkpClient.getCosmosWallet();

            await cosmosWallet.setRpc(NEW_RPC);

            let client = await cosmosWallet.getClient();

            expect(client).toBeDefined();
          });

          it('should be able to use updated rpc url to get chainId', async () => {
            const cosmosWallet = pkpClient.getCosmosWallet();

            await cosmosWallet.setRpc(NEW_RPC);

            const client = await cosmosWallet.getClient();

            const chainId = await client.getChainId();

            expect(chainId).toEqual('theta-testnet-001');

            // change it back
            await cosmosWallet.setRpc(LITCONFIG.COSMOS_RPC);

            const client2 = await cosmosWallet.getClient();

            const chainId2 = await client2.getChainId();

            expect(chainId2).toEqual('cosmoshub-4');
          });

          it('should be able to use updated rpc url to get height', async () => {
            const cosmosWallet = pkpClient.getCosmosWallet();

            await cosmosWallet.setRpc(NEW_RPC);

            const client = await cosmosWallet.getClient();

            const height = await client.getHeight();

            expect(height).toBeDefined();
            expect(typeof height).toBe('number');
          });
        });
      });
    });

    describe('[BTC] wallet', () => {
      it('should fail to get btc wallet', async () => {
        expect(() => pkpClient.getWallet('btc')).toThrow(
          'Unsupported chain: btc'
        );
      });
    });
  });
});
