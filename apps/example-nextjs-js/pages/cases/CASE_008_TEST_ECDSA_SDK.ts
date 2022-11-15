import * as LitJsSdk from '@lit-protocol/core-browser';
import { ACTION } from '../enum';
// import * as ecdsaSdk from '@lit-protocol/ecdsa-sdk';

export const CASE_008_TEST_ECDSA_SDK = [
  {
    id: 'CASE_008_TEST_ECDSA_SDK',
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
    id: 'ecdsasdk',
    action: ACTION.CALL,
    module: async () => {
      // return Object.keys(ecdsasdk);
    }
  }
];
