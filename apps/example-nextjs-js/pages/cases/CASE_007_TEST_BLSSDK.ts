import * as LitJsSdk from '@lit-protocol/core-browser';
import { ACTION } from '../enum';
import * as blsSdk from '@lit-protocol/bls-sdk';

export const CASE_007_TEST_BLSSDK = [
  {
    id: 'CASE_007 - BLS SDK Object keys',
    action: ACTION.SET,
    module: async () => {

      globalThis.CASE.chain = 'ethereum';

      globalThis.CASE.authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: globalThis.CASE.chain,
      });

      globalThis.CASE.accs = [
        {
          contractAddress: '',
          standardContractType: '',
          chain: globalThis.CASE.chain,
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ];

      return globalThis.CASE;
    },
  },
  {
    id: 'blsSdk',
    action: ACTION.CALL,
    module: async () => {
      return Object.keys(blsSdk);
    }
  }
];
