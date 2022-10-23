import { AccessControlConditions } from '@litprotocol-dev/constants';
import * as LitJsSdk from '@litprotocol-dev/core-browser';
import { ACTION } from '../enum';

export const CASE_006_ENCRYPT_AND_ZIP_METADATA = [
    {
        id: 'CASE 006 - Encrypt and zip with metadata',
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
        id: 'encryptFileAndZipWithMetadata',
        module: async () => {
            
            const file = new File(["Hello, world!"], "hello.txt", {
                type: "text/plain",
            });

            const { zipBlob } = await LitJsSdk.encryptFileAndZipWithMetadata({
                file,
                accessControlConditions: globalThis.CASE.accs,
                authSig: globalThis.CASE.authSig,
                chain: globalThis.CASE.chain,
                litNodeClient,
                readme: "this is a test",
              });

            console.log('zipBlob:', zipBlob);

            const base64 = await LitJsSdk.blobToBase64String(zipBlob);
            console.log('zipBlob(string):', base64);

            globalThis.CASE.zipBlobBase64 = base64;

            return globalThis.CASE.zipBlobBase64;
        },
        action: ACTION.CALL,
    },
    {
        id: 'decryptZipFileWithMetadata',
        action: ACTION.CALL,
        module: async () => {

            const file = LitJsSdk.base64StringToBlob(globalThis.CASE.zipBlobBase64);

            const { decryptedFile } = await LitJsSdk.decryptZipFileWithMetadata({
                authSig: globalThis.CASE.authSig,
                litNodeClient: globalThis.litNodeClient,
                file: file,
              });

              console.log("decryptedFile:", decryptedFile);
            
        },
    },
];
