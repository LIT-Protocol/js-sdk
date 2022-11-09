import { JsonExecutionRequest } from '@litprotocol-dev/constants';
import * as LitJsSdk from '@litprotocol-dev/core-browser';
import { ACTION } from '../enum';

export const CASE_009_GET_EXECUTION_SHARES = [
  {
    id: 'CASE_009_GET_EXECUTION_SHARES',
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
    id: 'getJsExecutionShares',
    action: ACTION.CALL,
    module: async () => {
      const litNodeClient = new LitJsSdk.LitNodeClient();
      await litNodeClient.connect();

      const litActionCode = `
      (async () => {
        console.log("Hello World!");
      })();
      `;
      const params: any = {
        authSig: globalThis.CASE.authSig,
        jsParams: {},
        code: litActionCode,
      };
      const reqBody: JsonExecutionRequest =
        litNodeClient.getLitActionRequestBody(params);

      const res = await litNodeClient.getJsExecutionShares(
        'https://serrano.litgateway.com:7379',
        reqBody
      );
      console.log(res);
      return res;
    },
  },
];
