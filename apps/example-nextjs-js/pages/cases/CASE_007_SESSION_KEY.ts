import {
  AccessControlConditions,
  JsonSigningResourceId,
  LIT_NETWORKS,
} from '@litprotocol-dev/constants';
import * as LitJsSdk from '@litprotocol-dev/core-browser';
import { ACTION } from '../enum';

export const CASE_007_SESSION_KEY = [
  {
    id: 'CASE 007 - Session Key (Serrano Net)',
    action: ACTION.SET,
    module: async () => {
      const chain = 'ethereum';

      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain,
      });

      const accs: AccessControlConditions = [
        {
          contractAddress: '',
          standardContractType: '',
          chain,
          method: 'eth_getBalance',
          parameters: [':userAddress', 'latest'],
          returnValueTest: {
            comparator: '>=',
            value: '0',
          },
        },
      ];

      globalThis.CASE = {
        chain,
        authSig,
        accs,
        encryptedSymmetricKey: '****** NOT YET FILLED ******',
        hashedResourceId: '****** NOT YET FILLED ******',
      };

      return globalThis.CASE;
    },
  },
  {
    id: 'connect',
    action: ACTION.CALL,
    module: new LitJsSdk.LitNodeClient({
      litNetwork: 'serrano',
    }).connect,
  },
  {
    id: 'hashResourceIdForSigning',
    action: ACTION.CALL,
    module: async () => {
      let randomPath: string =
        '/' +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      globalThis.CASE.resourceId = {
        baseUrl: 'my-dynamic-content-server.com',
        path: randomPath,
        orgId: '',
        role: '',
        extraData: '',
      };

      globalThis.CASE.hashedResourceId =
        await LitJsSdk.hashResourceIdForSigning(globalThis.CASE.resourceId);

      return globalThis.CASE.hashedResourceId;
    },
  },
  {
    id: 'getSessionSigs',
    action: ACTION.CALL,
    module: async () => {
      globalThis.CASE.sessionSigs = await LitJsSdk.getSessionSigs({
        chain: globalThis.CASE.chain,
        litNodeClient: window.litNodeClient,
        resources: [
          `litSigningCondition://${globalThis.CASE.hashedResourceId}`,
        ],
      });

      return globalThis.CASE.sessionSigs;
    },
  },
  {
    id: 'saveSigningCondition',
    action: ACTION.CALL,
    module: async () => {
      const signing = await litNodeClient.saveSigningCondition({
        accessControlConditions: globalThis.CASE.accs,
        sessionSigs: globalThis.CASE.sessionSigs,
        resourceId: globalThis.CASE.resourceId,
        chain: 'litSessionSign',
      });

      return signing;
    },
  },
  {
    id: 'getSignedToken',
    action: ACTION.CALL,
    module: async () => {
        
      let jwt = await litNodeClient.getSignedToken({
        accessControlConditions: globalThis.CASE.accs,
        sessionSigs: globalThis.CASE.sessionSigs,
        resourceId: globalThis.CASE.resourceId,
      });

      return jwt;
    },
  },
];
