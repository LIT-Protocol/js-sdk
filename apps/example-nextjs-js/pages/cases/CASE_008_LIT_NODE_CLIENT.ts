import { AccessControlConditions, ExecuteJsProps} from '@litprotocol-dev/constants';
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

            globalThis.CASE = {
                authSig,
            };

            return globalThis.CASE;
        },
    },
    {
        id: 'getLitActionRequestBodyWithoutCode',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: ExecuteJsProps = globalThis.CASE;
            params.jsParams = {};
            return litNodeClient.getLitActionRequestBody(params);
        },
    },
    {
        id: 'getLitActionRequestBodyWithCode',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: ExecuteJsProps = globalThis.CASE;
            params.jsParams = {};
            params.code = "console.log('Hello World!')";
            return litNodeClient.getLitActionRequestBody(params);
        },
    },
    {
        id: 'getLitActionRequestBodyWithIPFS',
        action: ACTION.CALL,
        module: () => {
            const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
            const params: ExecuteJsProps = globalThis.CASE;
            params.jsParams = {};
            params.code = " https://ipfs.io/ipfs/Qmb2sJtVLXiNNXnerWB7zjSpAhoM8AxJF2uZsU2iednTtT";
            return litNodeClient.getLitActionRequestBody(params);
        },
    },
    {
        id: 'getJWTParams',
        action: ACTION.CALL,
        module: new LitJsSdk.LitNodeClient({ litNetwork: "serrano" }).getJWTParams(),
    },
];
