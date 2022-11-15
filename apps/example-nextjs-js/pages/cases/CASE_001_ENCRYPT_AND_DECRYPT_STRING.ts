import { AccessControlConditions } from '@lit-protocol/constants';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { ACTION } from '../enum';

export const CASE_001_ENCRYPT_AND_DECRYPT_STRING = [
  {
    id: 'CASE 001 - Encrypt then decrypt string',
    action: ACTION.SET,
    module: async () => {
      const chain = 'ethereum';

      const authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain,
      });

      const accs = [
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
      };

      return globalThis.CASE;
    },
  },
  {
    id: 'connect',
    action: ACTION.CALL,
    module: new LitJsSdk.LitNodeClient().connect,
  },
  {
    id: 'checkAndSignAuthMessage',
    module: LitJsSdk.checkAndSignAuthMessage,
    action: ACTION.CALL,
    params: [{ chain: 'ethereum' }],
  },
  {
    id: 'humanizeAccessControlConditions',
    action: ACTION.CALL,
    module: async () => {
      console.log(globalThis.CASE.accs);

      const humanized = await LitJsSdk.humanizeAccessControlConditions({
        accessControlConditions: globalThis.CASE.accs,
      });
      return humanized;
    },
  },
  {
    id: 'encryptString',
    module: async () => {
      const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
        'Hello World!'
      );

      console.log('encryptedString:', encryptedString);
      const base64 = await LitJsSdk.blobToBase64String(encryptedString);
      console.log('encryptedString(string):', base64);

      globalThis.CASE.encryptedString = base64;
      globalThis.CASE.symmetricKey = symmetricKey;

      return {
        encryptedString: base64,
        symmetricKey,
      };
    },
    action: ACTION.CALL,
  },
  {
    id: 'saveEncryptionKey',
    action: ACTION.CALL,
    module: async () => {
      const { encryptedString, symmetricKey } = globalThis.CASE;

      console.warn('symmetricKey:', symmetricKey);

      globalThis.CASE.encryptedSymmetricKey =
        await litNodeClient.saveEncryptionKey({
          accessControlConditions: globalThis.CASE.accs,
          symmetricKey,
          authSig: globalThis.CASE.authSig,
          chain: globalThis.CASE.chain,
        });

      console.log(
        'globalThis.encryptedSymmetricKey:',
        globalThis.encryptedSymmetricKey
      );

      return {
        encryptedSymmetricKey: globalThis.CASE.encryptedSymmetricKey,
      };
    },
  },
  {
    id: 'uint8arrayToString',
    action: ACTION.CALL,
    module: async () => {
      globalThis.CASE.toDecrypt = LitJsSdk.uint8arrayToString(
        globalThis.CASE.encryptedSymmetricKey,
        'base16'
      );

      return globalThis.CASE.toDecrypt;
    },
  },
  {
    id: 'getEncryptionKey',
    action: ACTION.CALL,
    module: async () => {
      const toDecrypt = globalThis.CASE.toDecrypt;

      console.log('toDecrypt', toDecrypt);

      globalThis.CASE.retrievedSymmKey = await litNodeClient.getEncryptionKey({
        accessControlConditions: globalThis.CASE.accs,
        toDecrypt,
        chain: globalThis.CASE.chain,
        authSig: globalThis.CASE.authSig,
      });

      console.log('retrievedSymmKey', globalThis.CASE.retrievedSymmKey);

      return {
        retrievedSymmKey: globalThis.CASE.retrievedSymmKey,
      };
    },
  },
  {
    id: 'base64StringToBlob',
    action: ACTION.CALL,
    module: async () => {
      const { encryptedString, retrievedSymmKey } = globalThis.CASE;

      const blob = LitJsSdk.base64StringToBlob(encryptedString);

    //   return `Type of "LitJsSdk.base64StringToBlob(encryptedString)" is ${LitJsSdk.getVarType(
    //     blob
    //   )}`;
    },
  },
  {
    id: 'decryptString',
    module: async () => {
      const { encryptedString, retrievedSymmKey } = globalThis.CASE;

      const decryptedString = await LitJsSdk.decryptString(
        LitJsSdk.base64StringToBlob(encryptedString),
        retrievedSymmKey
      );

      console.log('decryptedString:', decryptedString);

      return decryptedString;
    },
    action: ACTION.CALL,
  },
];
