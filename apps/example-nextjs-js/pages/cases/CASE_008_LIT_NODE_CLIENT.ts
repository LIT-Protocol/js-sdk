import { AccessControlConditions, ExecuteJsProps, JsonStoreSigningRequest, SupportedJsonRequests} from '@litprotocol-dev/constants';
import * as LitJsSdk from '@litprotocol-dev/core-browser';
import { ACTION } from '../enum';


export const CASE_008_LIT_NODE_CLIENT = [
    {
        id: 'CASE 008 - Lit node client',
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
                authSig,
                chain,
                accs,
                hashedResourceId: '****** NOT YET FILLED ******',
            };

            return globalThis.CASE;
        },
    },
    {
        id: 'getLitActionRequestBody',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                debug: false
            };
            return litNodeClient.getLitActionRequestBody(params);
        },
    },
    {
        id: 'getLitActionRequestBody',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                debug: false
            };
            params.code = "console.log('Hello World!')";
            return litNodeClient.getLitActionRequestBody(params);
        },
    },
    {
        id: 'getLitActionRequestBody',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                debug: false
            };
            params.ipfsId = "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm";
            return litNodeClient.getLitActionRequestBody(params);
        },
    },
    {
        id: 'getJWTParams',
        action: ACTION.CALL,
        module: new LitJsSdk.LitNodeClient({ litNetwork: "serrano" }).getJWTParams(),
    },
    {
        id: 'getFormattedAccessControlConditions',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const { iat, exp } = litNodeClient.getJWTParams();
            const params: SupportedJsonRequests = {
                accessControlConditions: globalThis.CASE.accs,
                chain: globalThis.CASE.chain,
                authSig: globalThis.CASE.authSig,
                iat,
                exp,
            }
            return litNodeClient.getFormattedAccessControlConditions(params);
        },
    },
    {
        id: 'getHashedAccessControlConditions',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            // const sessionSigs = await LitJsSdk.getSessionSigs({
            //   chain: globalThis.CASE.chain,
            //   litNodeClient,
            //   resources: [
            //     `litSigningCondition://${globalThis.CASE.hashedResourceId}`,
            //   ],
            // });
            // console.log(sessionSigs);
            const params: JsonStoreSigningRequest = {
                accessControlConditions: globalThis.CASE.accs,
                chain: globalThis.CASE.chain,
                authSig: globalThis.CASE.authSig,
                // sessionSigs,
                permanant: 0,
            }
            const res = await litNodeClient.getHashedAccessControlConditions(params);
            console.log("res");
            console.log(res);
            return res;
        },
    }
];
