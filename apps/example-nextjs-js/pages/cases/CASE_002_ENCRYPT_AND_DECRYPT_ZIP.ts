import { AccessControlConditions } from '@litprotocol-dev/constants';
import * as LitJsSdk from '@litprotocol-dev/core-browser';
import { ACTION } from '../enum';

export const CASE_002_ENCRYPT_AND_DECRYPT_ZIP = [
    {
        id: 'CASE 002 - Zip and encrypt string then decrypt zip',
        action: ACTION.SET,
        module: (async () => {
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
            };

            return globalThis.CASE;
        }),
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
        id: 'zipAndEncryptString',
        module: async () => {
            const { encryptedZip, symmetricKey } =
                await LitJsSdk.zipAndEncryptString('CASE 2: FOOL ME ONCE, SHAME ON YOU. FOOL ME TWICE, SHAME ON ME.');

            console.log('encryptedZip:', encryptedZip);
            const base64 = await LitJsSdk.blobToBase64String(encryptedZip);
            console.log('encryptedZip(string):', base64);

            globalThis.CASE.encryptedZip = base64;
            globalThis.CASE.symmetricKey = symmetricKey;

            return {
                encryptedZip: base64,
                symmetricKey,
            };
        },
        action: ACTION.CALL,
    },
    {
        id: 'saveEncryptionKey',
        action: ACTION.CALL,
        module: async () => {
            const { encryptedString, symmetricKey } =
                globalThis.CASE;

            console.warn('symmetricKey:', symmetricKey);

            globalThis.CASE.encryptedSymmetricKey =
                await litNodeClient.saveEncryptionKey({
                    accessControlConditions:
                        globalThis.CASE.accs,
                    symmetricKey,
                    authSig: globalThis.CASE.authSig,
                    chain: globalThis.CASE.chain,
                });

            console.log(
                'globalThis.encryptedSymmetricKey:',
                globalThis.encryptedSymmetricKey
            );

            return {
                encryptedSymmetricKey:
                    globalThis.CASE.encryptedSymmetricKey,
            };
        },
    },
    {
        id: 'getEncryptionKey',
        action: ACTION.CALL,
        module: async () => {
            const toDecrypt = LitJsSdk.uint8arrayToString(
                globalThis.CASE.encryptedSymmetricKey,
                'base16'
            );

            console.log('toDecrypt', toDecrypt);

            globalThis.CASE.retrievedSymmKey =
                await litNodeClient.getEncryptionKey({
                    accessControlConditions:
                        globalThis.CASE.accs,
                    toDecrypt,
                    chain: globalThis.CASE.chain,
                    authSig: globalThis.CASE.authSig,
                });

            console.log(
                'retrievedSymmKey',
                globalThis.CASE.retrievedSymmKey
            );

            return {
                retrievedSymmKey:
                    globalThis.CASE.retrievedSymmKey,
            };
        },
    },
    {
        id: 'decryptZip',
        module: async () => {
            const { encryptedZip, retrievedSymmKey } =
                globalThis.CASE;

            const blob = LitJsSdk.base64StringToBlob(encryptedZip);

            console.log("Blob:", blob);
   
            const decryptedFiles = await LitJsSdk.decryptZip(
                blob,
                retrievedSymmKey
            );

            console.log("decryptedFiles:", decryptedFiles);

            const decryptedString = await decryptedFiles["string.txt"].async(
                "text"
            );

            console.log('decryptedString:', decryptedString);

            return decryptedString;
        },
        action: ACTION.CALL,
    }
];
