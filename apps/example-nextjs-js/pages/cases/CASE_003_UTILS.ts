import { AccessControlConditions, LIT_ERROR, RejectedNodePromises } from '@lit-protocol/constants';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { ACTION } from '../enum';

export const CASE_003_UTILS = [
    {
        id: 'CASE 003 - UTILS',
        action: ACTION.SET,
        module: (async () => {
            globalThis.CASE.blob = '***** to be filled in later *****';
        }),
    },
    {
        id: 'base64StringToBlob',
        action: ACTION.CALL,
        module: (async () => {
            globalThis.CASE.blob = LitJsSdk.base64StringToBlob('jPH0ljJ0_Npl0PJZ9IZSpzuZKIoRTu8zolleUNhfiXE');
            return `${globalThis.CASE.blob}`;
        }),
    },
    {
        id: 'blobToBase64String',
        action: ACTION.CALL,
        module: (async () => {
            const base64 = await LitJsSdk.blobToBase64String(globalThis.CASE.blob);
            return `${base64}`;
        }),
    },
    {
        id: 'getVarType',
        action: ACTION.CALL,
        module: (async () => {
            return {
                str: LitJsSdk.getVarType('hello'),
                num: LitJsSdk.getVarType(123),
                obj: LitJsSdk.getVarType({ hello: 'world' }),
                arr: LitJsSdk.getVarType([1, 2, 3]),
                bool: LitJsSdk.getVarType(true),
                undef: LitJsSdk.getVarType(undefined),
                nul: LitJsSdk.getVarType(null),
                sym: LitJsSdk.getVarType(Symbol('hello')),
                func: LitJsSdk.getVarType(() => {}),
                date: LitJsSdk.getVarType(new Date()),
                err: LitJsSdk.getVarType(new Error('hello')),
                map: LitJsSdk.getVarType(new Map()),
                set: LitJsSdk.getVarType(new Set()),
                weakmap: LitJsSdk.getVarType(new WeakMap()),
                weakset: LitJsSdk.getVarType(new WeakSet()),
                blob: LitJsSdk.getVarType(new Blob()),
                file: LitJsSdk.getVarType(new File([], 'hello.txt')),
                arraybuffer: LitJsSdk.getVarType(new ArrayBuffer(8)),
                dataview: LitJsSdk.getVarType(new DataView(new ArrayBuffer(8))),
                int8array: LitJsSdk.getVarType(new Int8Array()),
                uint8array: LitJsSdk.getVarType(new Uint8Array()),
                uint8clampedarray: LitJsSdk.getVarType(new Uint8ClampedArray()),
                int16array: LitJsSdk.getVarType(new Int16Array()),
                uint16array: LitJsSdk.getVarType(new Uint16Array()),
                int32array: LitJsSdk.getVarType(new Int32Array()),
                uint32array: LitJsSdk.getVarType(new Uint32Array()),
            };
        }),
    },
    {
        id: 'throwNodeError',
        action: ACTION.CALL,
        module: (async () => {

            const res : RejectedNodePromises = {
                success: false,
                error: 'This is a node error',
            }

            let result: any;

            try{
                result = litNodeClient.throwNodeError(res)
            }catch(e){
                result = e;
            }

            
            return result;
        }),
    },
    {
        id: 'uint8arrayFromString',
        action: ACTION.CALL,
        module: (async () => {
            
            const unit8Array = LitJsSdk.uint8arrayFromString('hello world');

            return unit8Array;
        }),
    },
    {
        id: 'humanizeAccessControlConditions',
        action: ACTION.CALL,
        module: (async () => {
            
            const humanized = LitJsSdk.humanizeAccessControlConditions({
                evmContractConditions: [
                    {
                      contractAddress: "0xb71a679cfff330591d556c4b9f21c7739ca9590c",
                      functionName: "members",
                      functionParams: [":userAddress"],
                      functionAbi: {
                        constant: true,
                        inputs: [
                          {
                            name: "",
                            type: "address",
                          },
                        ],
                        name: "members",
                        outputs: [
                          {
                            name: "delegateKey",
                            type: "address",
                          },
                          {
                            name: "shares",
                            type: "uint256",
                          },
                          {
                            name: "loot",
                            type: "uint256",
                          },
                          {
                            name: "exists",
                            type: "bool",
                          },
                          {
                            name: "highestIndexYesVote",
                            type: "uint256",
                          },
                          {
                            name: "jailed",
                            type: "uint256",
                          },
                        ],
                        payable: false,
                        stateMutability: "view",
                        type: "function",
                      },
                      chain: "xdai",
                      returnValueTest: {
                        key: "shares",
                        comparator: ">=",
                        value: "1",
                      },
                    },
                  ]
            });

            return humanized;
        }),
    },
    {
        id: 'humanizeAccessControlConditions',
        action: ACTION.CALL,
        module: (async () => {
            
            const humanized = LitJsSdk.humanizeAccessControlConditions({
                solRpcConditions: [
                    {
                      method: "getBalance",
                      params: [":userAddress"],
                      pdaParams: [],
                      pdaInterface: { 
                        offset: 0, fields: {} 
                    },
                      pdaKey: "",
                      chain: "solana",
                      returnValueTest: {
                        key: "",
                        comparator: ">=",
                        value: "100000000", // equals 0.1 SOL
                      },
                    },
                  ]
            });

            return humanized;
        }),
    },
    {
        id: 'humanizeAccessControlConditions',
        action: ACTION.CALL,
        module: (async () => {
            
            const humanized = LitJsSdk.humanizeAccessControlConditions({
                unifiedAccessControlConditions: [
                    {
                      conditionType: "cosmos",
                      path: "/cosmos/bank/v1beta1/balances/:userAddress",
                      chain: 'polygon',
                      returnValueTest: {
                        key: "$.balances[0].amount",
                        comparator: ">=",
                        value: "1000000", // equals 1 ATOM
                      },
                    },
                  ]
            });

            return humanized;
        }),
    },

];
