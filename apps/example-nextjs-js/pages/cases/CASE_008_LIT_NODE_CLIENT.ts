import { AccessControlConditions, ExecuteJsProps, HandshakeWithSgx, JsonEncryptionRetrieveRequest, JsonExecutionRequest, JsonSigningRetrieveRequest, JsonSigningStoreRequest, JsonStoreSigningRequest, RejectedNodePromises, SendNodeCommand, SignedData, SignWithECDSA, SingConditionECDSA, SuccessNodePromises, SupportedJsonRequests, ValidateAndSignECDSA} from '@litprotocol-dev/constants';
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
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            // Error
            const res = litNodeClient.parseResponses("");
            console.log(res);
            return res;
        }
    },
    {
        id: 'sendCommandToNode',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            await litNodeClient.connect();
            const params: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                code: "console.log('Hi Wind!')",
                debug: true,
            };
            const data: JsonExecutionRequest = litNodeClient.getLitActionRequestBody(params);
            const reqBody: SendNodeCommand = {url: 'https://serrano.litgateway.com:7371/web/execute', data};
            const res = await litNodeClient.sendCommandToNode(reqBody);
            console.log(res);
            return res;   
        }
    },
    {
        id: 'getJsExecutionShares',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const litActionCode = `
                const go = () => {
                    LitActions.setResponse({response: JSON.stringify({hello: 'planet'})});
                };
                go();
            `;
            const params: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                code: litActionCode,
                debug: true,
            };
            const reqBody: JsonExecutionRequest = litNodeClient.getLitActionRequestBody(params);
            const res = await litNodeClient.getJsExecutionShares('https://serrano.litgateway.com:7371', reqBody);
            console.log(res);
            return res;
        }
    },
    {
        id: 'executeJs',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            await litNodeClient.connect();
            const data: ExecuteJsProps = {
                authSig: globalThis.CASE.authSig,
                jsParams: {},
                code: "LitActions.setResponse({response: JSON.stringify({hello: 'world'})})",
                debug: true,
            }
            const res = litNodeClient.executeJs(data);
            console.log(res);
            return res;
        }
    },
    {
        id: 'handshakeWithSgx',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: HandshakeWithSgx = { url: "https://serrano.litgateway.com:7371" };
            const res = await litNodeClient.handshakeWithSgx(params);
            console.log(res);
            return res;
        }
    },
    {
        id: 'getSigningShare',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const { iat, exp } = litNodeClient.getJWTParams();
            const params: JsonSigningRetrieveRequest = {
                iat,
                exp,
            };
            // Error: bad input
            const url = 'https://serrano.litgateway.com:7371';
            const res = await litNodeClient.getSigningShare(url, params);
            return res;
        },
    },
    // {
    //     id: 'getDecryptionShare',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         const params: JsonEncryptionRetrieveRequest = {
    //             accessControlConditions: globalThis.CASE.accs,
    //             chain: globalThis.CASE.chain,
    //             authSig: globalThis.CASE.authSig,
    //             toDecrypt: ''
    //         };
    //         const url = 'https://serrano.litgateway.com:7371';
    //         const res = await litNodeClient.getDecryptionShare(url, params);
    //         return res;
    //     },
    // },
    //
    // Below functions gives errors, added to IGNORED_FUNCTIONS.ts
    // {
    //     id: 'signECDSA',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         await litNodeClient.connect();
    //         const { iat, exp } = litNodeClient.getJWTParams();
    //         const params: SignWithECDSA = {
    //             message: 'msg',
    //             chain: globalThis.CASE.chain,
    //             iat,
    //             exp,
    //         }
    //         const res = await litNodeClient.signECDSA('https://serrano.litgateway.com:7370', params);
    //         console.log(res);
    //         return res;
    //     },
    // },
    // {
    //     id: 'sign_condition_ecdsa',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         // await litNodeClient.connect();
    //         const { iat, exp } = litNodeClient.getJWTParams();
    //         const params: SingConditionECDSA = {
    //             accessControlConditions: globalThis.CASE.accs,
    //             auth_sig: globalThis.CASE.authSig,
    //             chain: globalThis.CASE.chain,
    //             iat,
    //             exp,
    //             evmContractConditions: undefined,
    //             solRpcConditions: undefined
    //         }
    //         console.log("1");
    //         // Returns empty object after quite a while (~30 secs)
    //         const res = await litNodeClient.sign_condition_ecdsa('https://serrano.litgateway.com:7370', params);
    //         console.log("2");
    //         console.log(res);
    //         return res;
    //     },
    // },
    // {
    //     id: 'validate_and_sign_ecdsa',
    //     action: ACTION.CALL,
    //     module: async () => {
    //         const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    //         await litNodeClient.connect();
    //         const params: ValidateAndSignECDSA = {
    //             accessControlConditions: globalThis.CASE.accs,
    //             chain: globalThis.CASE.chain,
    //             auth_sig: globalThis.CASE.authSig,
    //         };
    //         // Error: 500
    //         const res = await litNodeClient.validate_and_sign_ecdsa(params);
    //         console.log(res);
    //         return res;
    //     },
    // },
    {
        id: 'connect',
        action: ACTION.CALL,
        module: async () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            return await litNodeClient.connect();
        }
    }
];
