import { AccessControlConditions, ExecuteJsProps, JsonExecutionRequest, JsonStoreSigningRequest, RejectedNodePromises, SendNodeCommand, SignedData, SignWithECDSA, SuccessNodePromises, SupportedJsonRequests} from '@litprotocol-dev/constants';
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
            // Not returning but res is correct
            const res = await litNodeClient.getHashedAccessControlConditions(params);
            console.log("res");
            console.log(res);
            return res;
        },
    },
    {
        id: 'getNodePromises',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            await litNodeClient.connect();
            return litNodeClient.getNodePromises(() => litNodeClient.getJWTParams());
        }
    },
    {
        id: 'handleNodePromises',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            await litNodeClient.connect();
            const nodePromises = litNodeClient.getNodePromises(() => litNodeClient.getJWTParams());
            return litNodeClient.handleNodePromises(nodePromises);
        }
    },
    {
        id: 'throwNodeError',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const res: RejectedNodePromises = {
                success: false,
                error: {
                    errorCode: 'not_authorized',
                },
            }
            try {
                litNodeClient.throwNodeError(res);
            } catch (e) {
                return e;
            }
        }
    },
    {
        id: 'throwNodeError',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const res: RejectedNodePromises = {
                success: false,
                error: {},
            }
            try {
                litNodeClient.throwNodeError(res);
            } catch (e) {
                return e;
            }
        }
    },
    // {
    //     id: 'getSignatures',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         await litNodeClient.connect();
    //         const nodePromises = litNodeClient.getNodePromises(() => litNodeClient.getJWTParams());
    //         const res = await litNodeClient.handleNodePromises(nodePromises);
    //         console.log(res);

    //         // -- case: promises rejected
    //         if (res.success === false) {
    //             litNodeClient.throwNodeError(res as RejectedNodePromises);
    //             return;
    //         }

    //         // -- case: promises success
    //         const responseData = (res as SuccessNodePromises).values;
    //         console.log(responseData);
    //         // log('responseData', JSON.stringify(responseData, null, 2));

    //         // ========== Extract shares from response data ==========
    //         // -- 1. combine signed data as a list, and get the signatures from it
    //         const signedDataList = responseData.map(
    //           (r: any) => (r as SignedData).signedData
    //         );
    //         console.log("signedDataList");
    //         console.log(signedDataList);
    //         const signatures = litNodeClient.getSignatures(signedDataList);
    //         console.log("signatures");
    //         console.log(signatures);
    //         return signatures;
    //     }
    // },
    {
        id: 'parseResponses',
        action: ACTION.CALL,
        // module: new LitJsSdk.LitNodeClient({ litNetwork: "serrano" }).parseResponses("Hello World!"),
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            // Error
            const res = litNodeClient.parseResponses("Hello World!");
            console.log(res);
            return res;
        }
    },
    // {
    //     id: 'signECDSA',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         const { iat, exp } = litNodeClient.getJWTParams();
    //         const params: SignWithECDSA = {
    //             message: "www.google.com",
    //             chain: globalThis.CASE.chain,
    //             iat,
    //             exp,
    //         }
    //         const res = await litNodeClient.signECDSA("www.google.com", params);
    //         console.log(res);
    //         return res;
    //     },
    // },
    // {
    //     id: 'sendCommandToNode',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         await litNodeClient.connect();
    //         const data: JsonExecutionRequest = {
    //             authSig: globalThis.CASE.authSig,
    //             jsParams: {},
    //             code: "console.log('Hello World!')",
    //         }
    //         const params: SendNodeCommand = {url: 'https://serrano.litgateway.com:7370/web/execute', data};
    //         const res = await litNodeClient.sendCommandToNode(params);
    //         console.log(res);
    //         return res;   
    //     }
    // },
    // {
    //     id: 'getJsExecutionShares',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         // const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         const litNodeClient = new LitJsSdk.LitNodeClient();
    //         await litNodeClient.connect();
    //         const litActionCode = `
    //         (async () => {
    //             console.log("Hello World!");
    //         })();
    //         `;
    //         const params: JsonExecutionRequest = {
    //             authSig: globalThis.CASE.authSig,
    //             jsParams: {},
    //             // code: 'console.log("Hello World!")',
    //             code: litActionCode,
    //             // code: "LitActions.setResponse({response: JSON.stringify({hello: 'world'})})",
    //             // ipfsId: "QmRwN9GKHvCn4Vk7biqtr6adjXMs7PzzYPCzNCRjPFiDjm",
    //         }
    //         const res = await litNodeClient.getJsExecutionShares('https://serrano.litgateway.com:7379', params);
    //         // const res = await litNodeClient.getJsExecutionShares('http://localhost:7470', params);
    //         console.log(res);
    //         return res;   
    //     }
    // },
    {
        id: 'executeJs',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            await litNodeClient.connect();
            const data: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                code: "console.log('Hello World!')",
                debug: true,
            }
            const res = litNodeClient.executeJs(data);
            console.log(res);
            return res;
        }
    }
];
