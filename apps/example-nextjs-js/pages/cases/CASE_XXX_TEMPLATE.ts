import * as LitJsSdk from '@lit-protocol/core-browser';
import { ACTION } from '../enum';

export const CASE_XXX_TEMPLATE = [
  {
    id: 'CASE_XXX_TEMPLATE',
    action: ACTION.SET,
    module: async () => {

      globalThis.CASE = {};

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
    id: '',
    action: ACTION.CALL,
    module: async () => {}
  }
];
