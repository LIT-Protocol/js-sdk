/**
 * To test this file, you can run:
 * yarn nx run pkp-client:test --testFile=pkp-client.spec.ts
 */

import { PKPCosmosWallet } from '@lit-protocol/pkp-cosmos';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { PKPClient } from './pkp-client';
import * as LITCONFIG from 'lit.config.json';
import { processTx } from '../../../../tx-handler';
import {
  ETHSignature,
  ETHTxRes,
} from 'packages/pkp-ethers/src/lib/pkp-ethers-types';
import {
  calculateFee,
  coins,
  GasPrice,
  SigningStargateClient,
  StdFee,
} from '@cosmjs/stargate';

jest.setTimeout(120000);

const PKP_PUBKEY = LITCONFIG.PKP_PUBKEY;
const PKP_ETH_ADDRESS = LITCONFIG.PKP_ETH_ADDRESS;

describe('PKPClient', () => {
  const pkpClient = new PKPClient({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: PKP_PUBKEY,
    cosmosAddressPrefix: 'cosmos',
  });

  beforeAll(async () => {
    await pkpClient.connect();
  });

  describe('without rpc', () => {
    describe('eth', () => {
      it('should sign a message', async () => {
        const MESSAGE_TO_SIGN = 'HEY THERE!';

        const signature = processTx(
          expect.getState().currentTestName,
          await pkpClient.getEthWallet().signMessage(MESSAGE_TO_SIGN)
        );

        expect(signature).toBeDefined();
      });

      it('should sign a transaction', async () => {
        const txRes: string = await processTx(
          expect.getState().currentTestName,
          await pkpClient.getEthWallet().signTransaction({
            to: PKP_ETH_ADDRESS,
            value: 0,
            data: '0x',
          })
        );

        expect(txRes).toBeDefined();
      });
    });
  });

  describe('with rpc', () => {
    let pkpClient: PKPClient;
    let initResult: any;

    beforeAll(async () => {
      pkpClient = new PKPClient({
        controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
        pkpPubKey: PKP_PUBKEY,
        rpcs: {
          eth: LITCONFIG.CHRONICLE_RPC,
          cosmos: LITCONFIG.COSMOS_RPC,
        },
        cosmosAddressPrefix: 'cosmos',
      });

      initResult = await pkpClient.connect();
    });

    it('should be defined', () => {
      expect(PKPClient).toBeDefined();
    });

    it('should instantiate a pkp client', async () => {
      expect(pkpClient).toBeDefined();
    });

    describe('init', () => {
      it('should return the overall readiness status and an array of the initialization status for each wallet', async () => {
        expect(initResult).toHaveProperty('ready');
        expect(typeof initResult.ready === 'boolean').toBeTruthy();

        expect(initResult).toHaveProperty('res');
        expect(Array.isArray(initResult.res)).toBeTruthy();

        initResult.res.forEach((status: any) => {
          expect(status).toHaveProperty('chain');
          expect(typeof status.chain === 'string').toBeTruthy();

          expect(status).toHaveProperty('success');
          expect(typeof status.success === 'boolean').toBeTruthy();
        });
      });

      it('should be ready after init', async () => {
        expect(initResult.ready).toBe(true);
      });

      // it('should handle wallet init failures and return the correct readiness status and details', async () => {
      //   jest.spyOn(PKPBase.prototype, 'init').mockImplementation(async () => {
      //     throw new Error('Wallet initialization failed');
      //   });

      //   const initResult = await pkpClient.connect();

      //   expect(initResult.ready).toBe(false);

      //   initResult.res.forEach((status) => {
      //     expect(status.success).toBe(false);
      //   });
      // });

      // it('should handle partial wallet init failures and return the correct readiness status and details', async () => {
      //   const mockInit = jest.spyOn(PKPBase.prototype, 'init');

      //   // Fail the first wallet's initialization
      //   mockInit.mockImplementationOnce(async () => {
      //     throw new Error('Wallet initialization failed');
      //   });

      //   // Succeed the second wallet's initialization
      //   mockInit.mockImplementationOnce(async () => {});

      //   const initResult = await pkpClient.connect();

      //   expect(initResult.ready).toBe(false);

      //   expect(initResult.res[0].chain).toBeDefined();
      //   expect(initResult.res[0].success).toBe(false);

      //   expect(initResult.res[1].chain).toBeDefined();
      //   expect(initResult.res[1].success).toBe(true);
      // });
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

        expect(etherAddress).toEqual(PKP_ETH_ADDRESS);
      });

      it('should get eth address using getEthWallet()', async () => {
        const etherWallet = pkpClient.getEthWallet();

        const etherAddress = await etherWallet.getAddress();

        expect(etherAddress).toEqual(PKP_ETH_ADDRESS);
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

          it('should be able to use updated rpc url to sign a message', async () => {
            const etherWallet = pkpClient.getEthWallet();

            await etherWallet.setRpc(newRpcUrl);

            let signedMessage = await processTx(
              expect.getState().currentTestName,
              await etherWallet.signMessage('Hello world from litentry')
            );

            expect(signedMessage).toBeDefined();
          });
          it('should be able to use updated rpc url to sign a transaction', async () => {
            const newRpcUrl = LITCONFIG.CHRONICLE_RPC;

            const etherWallet = pkpClient.getEthWallet();

            await etherWallet.setRpc(newRpcUrl);

            const signedTx = await processTx(
              expect.getState().currentTestName,
              await etherWallet.handleRequest<ETHSignature>({
                method: 'eth_signTransaction',
                params: [
                  {
                    from: PKP_ETH_ADDRESS,
                    to: PKP_ETH_ADDRESS,
                    data: LITCONFIG.HEX_TEST_MEMO, // "JK-SDK Test"
                  },
                ],
              })
            );
            expect(signedTx).toBeDefined();
          });

          it('should be able to use updated rpc url to sign & send a transaction', async () => {
            const newRpcUrl = LITCONFIG.CHRONICLE_RPC;

            const etherWallet = pkpClient.getEthWallet();

            await etherWallet.setRpc(newRpcUrl);

            // str to hex
            let tx: ETHTxRes = await etherWallet.handleRequest<ETHTxRes>({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: PKP_ETH_ADDRESS,
                  to: PKP_ETH_ADDRESS,
                  data:
                    '0x' +
                    Buffer.from(
                      'should be able to use updated rpc url to sign & send a transaction'
                    ).toString('hex'),
                },
              ],
            });

            tx = await (tx as any).wait();

            expect(tx).toBeDefined();
          });

          // if (LITCONFIG.test.sendRealTxThatCostsMoney) {
          // }
        });
      });

      describe('handle requests', () => {
        it('should be able to eth_signTransaction', async () => {
          const etherWallet = pkpClient.getEthWallet();
          const signedTx = await processTx(
            expect.getState().currentTestName,
            await etherWallet.handleRequest({
              method: 'eth_signTransaction',
              params: [
                {
                  from: PKP_ETH_ADDRESS,
                  to: PKP_ETH_ADDRESS,
                },
              ],
            })
          );

          expect(signedTx).toBeDefined();
        });

        // TODO: add more tests for typed signing, just copy from the ethers wallet tests
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

        it('should be able to sendTokens', async () => {
          const defaultGasPrice = GasPrice.fromString(
            `${LITCONFIG.DEFAULT_GAS}${LITCONFIG.DENOM}`
          );

          const amount = coins(LITCONFIG.AMOUNT, LITCONFIG.DENOM);
          const defaultSendFee: StdFee = calculateFee(80_000, defaultGasPrice);
          const cosmosWallet = pkpClient.getCosmosWallet();

          const [pkpAccount] = await cosmosWallet.getAccounts();

          expect(pkpAccount.address).toBe(LITCONFIG.PKP_COSMOS_ADDRESS);

          if (LITCONFIG.test.sendRealTxThatCostsMoney) {
            const tx = await client.sendTokens(
              pkpAccount.address,
              pkpAccount.address,
              amount,
              defaultSendFee,
              'Transaction'
            );
            expect(tx).toBeDefined();
            expect(tx.transactionHash).toBeDefined();
            // expect(tx.transactionHash.length).toEqual(64);
          }
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
