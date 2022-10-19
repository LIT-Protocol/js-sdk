import {
    RejectedNodePromises,
    ExecuteJsProps,
    JsonExecutionRequest,
    LitNodeClientConfig,
    LIT_ERROR,
    LIT_NETWORKS,
    NodePromiseResponse,
    SendNodeCommand,
    SuccessNodePromises,
    version,
    SignedData,
    SIGTYPE,
    DecryptedData,
    NodeResponse,
    NodeLog,
    ExecuteJsResponse,
    SignedChainDataToken,
    JsonSignChainDataRequest,
    NodeCommandResponse,
    JsonSigningRetrieveRequest,
    FormattedMultipleAccs,
    NodeShare,
    JsonStoreSigningRequest,
    JsonSigningStoreRequest,
    JsonEncryptionRetrieveRequest,
    JsonSaveEncryptionKeyRequest,
    SignWithECDSA,
    ValidateAndSignECDSA,
    SingConditionECDSA,
    HandshakeWithSgx,
    KV,
    NodeCommandServerKeysResponse,
    JsonHandshakeResponse,
    SigShare,
} from '@litprotocol-dev/constants';

import { initWasmBlsSdk, wasmBlsSdkHelpers } from '@litprotocol-dev/core';
import { uint8arrayFromString, uint8arrayToString } from './browser/Browser';
import {
    canonicalAccessControlConditionFormatter,
    canonicalEVMContractConditionFormatter,
    canonicalResourceIdFormatter,
    canonicalSolRpcConditionFormatter,
    canonicalUnifiedAccessControlConditionFormatter,
    combineBlsDecryptionShares,
    combineBlsShares,
    combineEcdsaShares,
    hashAccessControlConditions,
    hashEVMContractConditions,
    hashResourceId,
    hashSolRpcConditions,
    hashUnifiedAccessControlConditions,
} from '@litprotocol-dev/utils';

import {
    convertLitActionsParams,
    getStorageItem,
    log,
    mostCommonString,
    safeParams,
    throwError,
} from './utils';

import * as wasmECDSA from '@litprotocol-dev/core';

import { SupportedJsonRequests } from '@litprotocol-dev/constants';

/** ---------- Local Constants ---------- */
export const defaultConfig: LitNodeClientConfig = {
    alertWhenUnauthorized: true,
    minNodeCount: 6,
    debug: true,
    bootstrapUrls: [
        'https://node2.litgateway.com:7370',
        'https://node2.litgateway.com:7371',
        'https://node2.litgateway.com:7372',
        'https://node2.litgateway.com:7373',
        'https://node2.litgateway.com:7374',
        'https://node2.litgateway.com:7375',
        'https://node2.litgateway.com:7376',
        'https://node2.litgateway.com:7377',
        'https://node2.litgateway.com:7378',
        'https://node2.litgateway.com:7379',
    ],
    litNetwork: 'jalapeno',
};

/** ---------- Local Helpers ---------- */

const override = (original: any, custom: any) => {
    return { ...original, ...custom };
};

const browserOnly = (callback: Function) => {
    if (typeof window !== 'undefined' && window && window.localStorage) {
        callback();
    }
};

/** ---------- Main Export Class ---------- */
export default class LitNodeClient {
    config: LitNodeClientConfig;
    connectedNodes: SetConstructor | Set<any> | any;
    serverKeys: KV | any;
    ready: boolean;
    subnetPubKey: string | null;
    networkPubKey: string | null;
    networkPubKeySet: string | null;

    // ========== Constructor ==========
    constructor(customConfig: LitNodeClientConfig) {
        // -- initialize default config
        this.config = defaultConfig;

        // -- if config params are specified, replace it
        if (customConfig) {
            this.config = override(this.config, customConfig);
        }

        // -- init default properties
        this.connectedNodes = new Set();
        this.serverKeys = {};
        this.ready = false;
        this.subnetPubKey = null;
        this.networkPubKey = null;
        this.networkPubKeySet = null;

        // -- override configs
        this.overrideConfigsFromLocalStorage();

        // -- set bootstrapUrls to match the network litNetwork unless it's set to custom
        this.setCustomBootstrapUrls();

        // -- set global variables
        globalThis.litConfig = this.config;
    }

    // ========== Scoped Class Helpers ==========

    /**
     *
     * (Browser Only) Get the config from browser local storage and override default config
     *
     * @returns { void }
     *
     */
    overrideConfigsFromLocalStorage = (): void => {
        browserOnly(() => {
            const storageKey = 'LitNodeClientConfig';
            const storageConfigOrError = getStorageItem(storageKey);

            // -- validate
            if (storageConfigOrError.type === 'ERROR') {
                console.log('Error accessing local storage');
                return;
            }

            // -- execute
            const storageConfig = JSON.parse(storageConfigOrError.result);
            this.config = override(this.config, storageConfig);
        });
    };

    /**
     *
     * Set bootstrapUrls to match the network litNetwork unless it's set to custom
     *
     * @returns { void }
     *
     */
    setCustomBootstrapUrls = (): void => {
        // -- validate
        if (this.config.litNetwork === 'custom') return;

        // -- execute
        const hasNetwork: boolean = this.config.litNetwork in LIT_NETWORKS;

        if (!hasNetwork) {
            // network not found, report error
            throwError({
                message:
                    'the litNetwork specified in the LitNodeClient config not found in LIT_NETWORKS',
                error: LIT_ERROR.LIT_NODE_CLIENT_BAD_CONFIG_ERROR,
            });
            return;
        }

        this.config.bootstrapUrls = LIT_NETWORKS[this.config.litNetwork];
    };

    /**
     *
     * Get the request body of the lit action
     *
     * @param { ExecuteJsProps } params
     *
     * @returns { JsonExecutionRequest }
     *
     */
    getLitActionRequestBody = (
        params: ExecuteJsProps
    ): JsonExecutionRequest => {
        const reqBody: JsonExecutionRequest = {
            authSig: params.authSig,
            jsParams: convertLitActionsParams(params.jsParams),
        };

        if (params.code) {
            const _uint8Array = uint8arrayFromString(params.code, 'utf8');
            const encodedJs = uint8arrayToString(_uint8Array, 'base64');

            reqBody.code = encodedJs;
        }

        if (params.ipfsId) {
            reqBody.ipfsId = params.ipfsId;
        }

        return reqBody;
    };

    /**
     *
     * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
     *
     */
    getJWTParams = () => {
        const now = Date.now();
        const iat = Math.floor(now / 1000);
        const exp = iat + 12 * 60 * 60; // 12 hours in seconds

        return { iat, exp };
    };

    /**
     *
     * Combine Shares from network public key set and signature shares
     *
     * @param { string } networkPubKeySet
     * @param { any } signatureShares
     *
     * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
     *
     */
    combineSharesAndGetJWT = (
        networkPubKeySet: string,
        signatureShares: Array<NodeShare>
    ): string => {
        // ========== Shares Validations ==========
        // -- sanity check
        if (
            !signatureShares.every(
                (val, i, arr) => val.unsignedJwt === arr[0].unsignedJwt
            )
        ) {
            const msg =
                'Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things';
            log(msg);
        }

        // ========== Sorting ==========
        // -- sort the sig shares by share index.  this is important when combining the shares.
        signatureShares.sort((a: any, b: any) => a.shareIndex - b.shareIndex);

        // ========== Combine Shares ==========
        const pkSetAsBytes: Uint8Array = uint8arrayFromString(
            networkPubKeySet,
            'base16'
        );
        log('pkSetAsBytes', pkSetAsBytes);

        const sigShares = signatureShares.map((s: any) => ({
            shareHex: s.signatureShare,
            shareIndex: s.shareIndex,
        }));

        const signature = wasmBlsSdkHelpers.combine_signatures(
            pkSetAsBytes,
            sigShares
        );

        log('raw sig', signature);
        log('signature is ', uint8arrayToString(signature, 'base16'));

        const unsignedJwt = mostCommonString(
            signatureShares.map((s: any) => s.unsignedJwt)
        );

        // ========== Result ==========
        // convert the sig to base64 and append to the jwt
        const finalJwt: string = `${unsignedJwt}.${uint8arrayToString(
            signature,
            'base64url'
        )}`;

        return finalJwt;
    };

    /**
     *
     * Get different formats of access control conditions, eg. evm, sol, unified etc.
     *
     * @param { SupportedJsonRequests } params
     *
     * @returns { FormattedMultipleAccs }
     *
     */
    getFormattedAccessControlConditions = (
        params: SupportedJsonRequests
    ): FormattedMultipleAccs => {
        // -- prepare params
        const {
            accessControlConditions,
            evmContractConditions,
            solRpcConditions,
            unifiedAccessControlConditions,
        } = params;

        // -- execute
        let formattedAccessControlConditions;
        let formattedEVMContractConditions;
        let formattedSolRpcConditions;
        let formattedUnifiedAccessControlConditions;
        let error = false;

        if (accessControlConditions) {
            formattedAccessControlConditions = accessControlConditions.map(
                (c) => canonicalAccessControlConditionFormatter(c)
            );
            log(
                'formattedAccessControlConditions',
                JSON.stringify(formattedAccessControlConditions)
            );
        } else if (evmContractConditions) {
            formattedEVMContractConditions = evmContractConditions.map((c) =>
                canonicalEVMContractConditionFormatter(c)
            );
            log(
                'formattedEVMContractConditions',
                JSON.stringify(formattedEVMContractConditions)
            );
        } else if (solRpcConditions) {
            formattedSolRpcConditions = solRpcConditions.map((c) =>
                canonicalSolRpcConditionFormatter(c)
            );
            log(
                'formattedSolRpcConditions',
                JSON.stringify(formattedSolRpcConditions)
            );
        } else if (unifiedAccessControlConditions) {
            formattedUnifiedAccessControlConditions =
                unifiedAccessControlConditions.map((c) =>
                    canonicalUnifiedAccessControlConditionFormatter(c)
                );
            log(
                'formattedUnifiedAccessControlConditions',
                JSON.stringify(formattedUnifiedAccessControlConditions)
            );
        } else {
            error = true;
        }

        return {
            error,
            formattedAccessControlConditions,
            formattedEVMContractConditions,
            formattedSolRpcConditions,
            formattedUnifiedAccessControlConditions,
        };
    };

    /**
     *
     * Get hash of access control conditions
     *
     * @param { JsonStoreSigningRequest } params
     *
     * @returns { Promise<ArrayBuffer | undefined> }
     *
     */
    getHashedAccessControlConditions = async (
        params: JsonStoreSigningRequest
    ): Promise<ArrayBuffer | undefined> => {
        let hashOfConditions: ArrayBuffer;

        // ========== Prepare Params ==========
        const {
            accessControlConditions,
            evmContractConditions,
            solRpcConditions,
            unifiedAccessControlConditions,
        } = params;

        // ========== Hash ==========
        if (accessControlConditions) {
            hashOfConditions = await hashAccessControlConditions(
                accessControlConditions
            );
        } else if (evmContractConditions) {
            hashOfConditions = await hashEVMContractConditions(
                evmContractConditions
            );
        } else if (solRpcConditions) {
            hashOfConditions = await hashSolRpcConditions(solRpcConditions);
        } else if (unifiedAccessControlConditions) {
            hashOfConditions = await hashUnifiedAccessControlConditions(
                unifiedAccessControlConditions
            );
        } else {
            return;
        }

        // ========== Result ==========
        return hashOfConditions;
    };

    // ========== Promise Handlers ==========

    /**
     *
     * Get and gather node promises
     *
     * @param { any } callback
     *
     * @returns { Array<Promise<any>> }
     *
     */
    getNodePromises = (callback: Function): Array<Promise<any>> => {
        const nodePromises = [];

        for (const url of this.connectedNodes) {
            nodePromises.push(callback(url));
        }

        return nodePromises;
    };

    /**
     * Handle node promises
     *
     * @param { Array<Promise<any>> } nodePromises
     *
     * @returns { Promise<SuccessNodePromises | RejectedNodePromises> }
     *
     */
    handleNodePromises = async (
        nodePromises: Array<Promise<any>>
    ): Promise<SuccessNodePromises | RejectedNodePromises> => {
        // -- prepare
        const responses = await Promise.allSettled(nodePromises);

        log('responses', responses);

        // -- get fulfilled responses
        const successes: Array<NodePromiseResponse> = responses.filter(
            (r) => r.status === 'fulfilled'
        );

        // -- case: success (when success responses are more than minNodeCount)
        if (successes.length >= this.config.minNodeCount) {
            const successPromises: SuccessNodePromises = {
                success: true,
                values: successes.map((r) => r.value),
            };

            return successPromises;
        }

        // -- case: if we're here, then we did not succeed.  time to handle and report errors.

        // -- get "rejected" responses
        const rejected = responses.filter((r) => r.status === 'rejected');

        const mostCommonError = JSON.parse(
            mostCommonString(
                rejected.map((r: NodePromiseResponse) =>
                    JSON.stringify(r.reason)
                )
            )
        );

        log(`most common error: ${JSON.stringify(mostCommonError)}`);

        const rejectedPromises: RejectedNodePromises = {
            success: false,
            error: mostCommonError,
        };

        return rejectedPromises;
    };

    /**
     *
     * Throw node error
     *
     * @param { RejectedNodePromises } res
     *
     * @returns { void }
     *
     */
    throwNodeError = (res: RejectedNodePromises): void => {
        if (res.error && res.error.errorCode) {
            if (
                res.error.errorCode === 'not_authorized' &&
                this.config.alertWhenUnauthorized
            ) {
                log(
                    '[Alert originally] You are not authorized to access to this content'
                );
            }

            throwError({ ...res.error, name: 'NodeError' });
        } else {
            throwError({
                message: `There was an error getting the signing shares from the nodes`,
                error: LIT_ERROR.UNKNOWN_ERROR,
            });
        }
    };

    // ========== Shares Resolvers ==========

    /**
     *
     * Get signatures from signed data
     *
     * @param { Array<any> } signedData
     *
     * @returns { any }
     *
     */
    getSignatures = (signedData: Array<any>): any => {
        // -- prepare
        let signatures: any;

        // TOOD: get keys of signedData
        const keys = Object.keys(signedData[0]);

        // -- execute
        keys.forEach((key) => {
            const shares = signedData.map((r: any) => r[key]);

            shares.sort((a, b) => a.shareIndex - b.shareIndex);

            const sigShares: Array<SigShare> = shares.map((s) => ({
                sigType: s.sigType,
                shareHex: s.signatureShare,
                shareIndex: s.shareIndex,
                localX: s.localX,
                localY: s.localY,
                publicKey: s.publicKey,
                dataSigned: s.dataSigned,
            }));

            console.log('sigShares', sigShares);

            const sigType = mostCommonString(sigShares.map((s) => s.sigType));

            // -- validate if this.networkPubKeySet is null
            if (this.networkPubKeySet === null) {
                throwError({
                    message: 'networkPubKeySet cannot be null',
                    error: LIT_ERROR.PARAM_NULL_ERROR,
                });
                return;
            }

            // -- validate if signature type is BLS or ECDSA
            if (sigType !== 'BLS' && sigType !== 'ECDSA') {
                throwError({
                    message: 'signature type is not BLS or ECDSA',
                    error: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE,
                });
                return;
            }

            let signature: any;

            if (sigType === SIGTYPE.BLS) {
                signature = combineBlsShares(sigShares, this.networkPubKeySet);
            } else if (sigType === SIGTYPE.ECDSA) {
                signature = combineEcdsaShares(sigShares);
            }

            signatures[key] = {
                ...signature,
                publicKey: mostCommonString(sigShares.map((s) => s.publicKey)),
                dataSigned: mostCommonString(
                    sigShares.map((s) => s.dataSigned)
                ),
            };
        });

        return signatures;
    };

    /**
     *
     * Get the decryptions from the decrypted data list
     *
     * @param { Array<any> } decryptedData
     *
     * @returns { Promise<Array<any> }
     *
     */
    getDecryptions = async (decryptedData: Array<any>): Promise<Array<any>> => {
        // -- prepare BLS SDK
        const wasmBlsSdk: any = await initWasmBlsSdk();

        // -- prepare params
        let decryptions: any;

        Object.keys(decryptedData[0]).forEach(async (key: any) => {
            // -- prepare
            const shares = decryptedData.map((r) => r[key]);

            const decShares = shares.map((s) => ({
                algorithmType: s.algorithmType,
                decryptionShare: s.decryptionShare,
                shareIndex: s.shareIndex,
                publicKey: s.publicKey,
                ciphertext: s.ciphertext,
            }));

            const algorithmType = mostCommonString(
                decShares.map((s) => s.algorithmType)
            );
            const ciphertext = mostCommonString(
                decShares.map((s) => s.ciphertext)
            );

            // -- validate if this.networkPubKeySet is null
            if (this.networkPubKeySet === null) {
                throwError({
                    message: 'networkPubKeySet cannot be null',
                    error: LIT_ERROR.PARAM_NULL_ERROR,
                });
                return;
            }

            let decrypted;
            if (algorithmType === 'BLS') {
                decrypted = await combineBlsDecryptionShares(
                    decShares,
                    this.networkPubKeySet,
                    ciphertext,
                    { wasmBlsSdk }
                );
            } else {
                throwError({
                    message: 'Unknown decryption algorithm type',
                    error: LIT_ERROR.UNKNOWN_DECRYPTION_ALGORITHM_TYPE_ERROR,
                });
            }

            decryptions[key] = {
                decrypted: uint8arrayToString(decrypted, 'base16'),
                publicKey: mostCommonString(decShares.map((s) => s.publicKey)),
                ciphertext: mostCommonString(
                    decShares.map((s) => s.ciphertext)
                ),
            };
        });

        return decryptions;
    };

    /**
     *
     * Parse the response string to JSON
     *
     * @param { string } responseString
     *
     * @returns { any } JSON object
     *
     */
    parseResponses = (responseString: string): any => {
        let response: any;

        try {
            response = JSON.parse(responseString);
        } catch (e) {
            log(
                'Error parsing response as json.  Swallowing and returning as string.',
                responseString
            );
        }

        return response;
    };

    /**
     *
     * Get Signature
     *
     * @param { Array<any> } shareData from all node promises
     *
     * @returns { string } signature
     *
     */
    getSignature = async (shareData: Array<any>): Promise<any> => {
        // R_x & R_y values can come from any node (they will be different per node), and will generate a valid signature
        const R_x = shareData[0].local_x;
        const R_y = shareData[0].local_y;

        // the public key can come from any node - it obviously will be identical from each node
        const public_key = shareData[0].public_key;
        const valid_shares = shareData.map((s) => s.signature_share);
        const shares = JSON.stringify(valid_shares);

        await wasmECDSA.initWasmEcdsaSdk(); // init WASM
        const signature = wasmECDSA.combine_signature(R_x, R_y, shares);
        console.log('raw ecdsa sig', signature);

        return signature;
    };

    // ========== API Calls to Nodes ==========

    /**
     *
     * Send a command to nodes
     *
     * @param { SendNodeCommand }
     *
     * @returns { Promise<any> }
     *
     */
    sendCommandToNode = async ({
        url,
        data,
    }: SendNodeCommand): Promise<any> => {
        log(`sendCommandToNode with url ${url} and data`, data);

        const req: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'lit-js-sdk-version': version,
            },
            body: JSON.stringify(data),
        };

        return fetch(url, req).then(async (response) => {
            const isJson = response.headers
                .get('content-type')
                ?.includes('application/json');

            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                // get error message from body or default to response status
                const error = data || response.status;
                return Promise.reject(error);
            }

            return data;
        });
    };

    /**
     *
     * Get JS Execution Shares from Nodes
     *
     * @param { JsonExecutionRequest } params
     *
     * @returns { Promise<any> }
     */
    getJsExecutionShares = async (
        url: string,
        params: JsonExecutionRequest
    ): Promise<NodeCommandResponse> => {
        const { code, ipfsId, authSig, jsParams } = params;

        log('getJsExecutionShares');

        const urlWithPath = `${url}/web/execute`;

        const data: JsonExecutionRequest = {
            code,
            ipfsId,
            authSig,
            jsParams,
        };

        return await this.sendCommandToNode({ url: urlWithPath, data });
    };

    /**
     *
     * Get Chain Data Signing Shares
     *
     * @param { string } url
     * @param { JsonSignChainDataRequest } params
     *
     * @returns { Promise<any> }
     *
     */
    getChainDataSigningShare = async (
        url: string,
        params: JsonSignChainDataRequest
    ): Promise<NodeCommandResponse> => {
        const { callRequests, chain, iat, exp } = params;

        log('getChainDataSigningShare');

        const urlWithPath = `${url}/web/signing/sign_chain_data`;

        const data: JsonSignChainDataRequest = {
            callRequests,
            chain,
            iat,
            exp,
        };

        return await this.sendCommandToNode({ url: urlWithPath, data });
    };

    /**
     *
     * Get Signing Shares from Nodes
     *
     * @param { string } url
     * @param { JsonSigningRetrieveRequest } params
     *
     * @returns { Promise<any>}
     *
     */
    getSigningShare = async (
        url: string,
        params: JsonSigningRetrieveRequest
    ): Promise<NodeCommandResponse> => {
        log('getSigningShare');
        const urlWithPath = `${url}/web/signing/retrieve`;

        return await this.sendCommandToNode({
            url: urlWithPath,
            data: params,
        });
    };

    /**
     *
     * Ger Decryption Shares from Nodes
     *
     * @param { string } url
     * @param { JsonEncryptionRetrieveRequest } params
     *
     * @returns { Promise<any> }
     *
     */
    getDecryptionShare = async (
        url: string,
        params: JsonEncryptionRetrieveRequest
    ): Promise<NodeCommandResponse> => {
        log('getDecryptionShare');
        const urlWithPath = `${url}/web/encryption/retrieve`;

        return await this.sendCommandToNode({
            url: urlWithPath,
            data: params,
        });
    };

    /**
     *
     * Store signing conditions to nodes
     *
     * @param { string } url
     * @param { JsonSigningStoreRequest } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    storeSigningConditionWithNode = async (
        url: string,
        params: JsonSigningStoreRequest
    ): Promise<NodeCommandResponse> => {
        log('storeSigningConditionWithNode');

        const urlWithPath = `${url}/web/signing/store`;

        return await this.sendCommandToNode({
            url: urlWithPath,
            data: {
                key: params.key,
                val: params.val,
                authSig: params.authSig,
                chain: params.chain,
                permanant: params.permanent,
            },
        });
    };

    /**
     *
     * Store encryption conditions to nodes
     *
     * @param { string } urk
     * @param { JsonEncryptionStoreRequest } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    storeEncryptionConditionWithNode = async (
        url: string,
        params: JsonSigningStoreRequest
    ): Promise<NodeCommandResponse> => {
        log('storeEncryptionConditionWithNode');
        const urlWithPath = `${url}/web/encryption/store`;
        const data = {
            key: params.key,
            val: params.val,
            authSig: params.authSig,
            chain: params.chain,
            permanant: params.permanent,
        };

        return await this.sendCommandToNode({ url: urlWithPath, data });
    };

    /**
     *
     * Sign wit ECDSA
     *
     * @param { string } url
     * @param { SignWithECDSA } params
     *
     * @returns { Promise}
     *
     */
    signECDSA = async (
        url: string,
        params: SignWithECDSA
    ): Promise<NodeCommandResponse> => {
        console.log('sign_message_ecdsa');

        const urlWithPath = `${url}/web/signing/sign_message_ecdsa`;

        return await this.sendCommandToNode({
            url: urlWithPath,
            data: params,
        });
    };

    /**
     *
     * Sign Condition ECDSA
     *
     * @param { string } url
     * @param { SignConditionECDSA } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    sign_condition_ecdsa = async (
        url: string,
        params: SingConditionECDSA
    ): Promise<NodeCommandResponse> => {
        log('sign_condition_ecdsa');
        const urlWithPath = `${url}/web/signing/sign_condition_ecdsa`;

        const data = {
            access_control_conditions: params.accessControlConditions,
            evmContractConditions: params.evmContractConditions,
            solRpcConditions: params.solRpcConditions,
            auth_sig: params.auth_sig,
            chain: params.chain,
            iat: params.iat,
            exp: params.exp,
        };

        return await this.sendCommandToNode({
            url: urlWithPath,
            data,
        });
    };

    /**
     *
     * Handshake with SGX
     *
     * @param { HandshakeWithSgx } params
     *
     * @returns { Promise<NodeCommandServerKeysResponse> }
     *
     */
    handshakeWithSgx = async (
        params: HandshakeWithSgx
    ): Promise<NodeCommandServerKeysResponse> => {
        // -- get properties from params
        const { url } = params;

        // -- create url with path
        const urlWithPath = `${url}/web/handshake`;

        log(`handshakeWithSgx ${urlWithPath}`);

        const data = {
            clientPublicKey: 'test',
        };

        return await this.sendCommandToNode({
            url: urlWithPath,
            data,
        });
    };

    // ========== Scoped Business Logics ==========

    /**
     *
     * Execute JS on the nodes and combine and return any resulting signatures
     *
     * @param { ExecuteJsRequest } params
     *
     * @returns { ExecuteJsResponse }
     *
     */
    executeJs = async (
        params: ExecuteJsProps
    ): Promise<ExecuteJsResponse | undefined> => {
        // ========== Prepare Params ==========
        const { code, ipfsId, authSig, jsParams, debug } = params;

        // ========== Validate Params ==========
        // -- validate: If it's NOT ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';

            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // -- validate: either 'code' or 'ipfsId' must exists
        if (!code && !ipfsId) {
            const message = 'You must pass either code or ipfsId';

            throwError({ message, error: LIT_ERROR.PARAMS_MISSING_ERROR });
        }

        // -- validate: 'code' and 'ipfsId' can't exists at the same time
        if (code && ipfsId) {
            const message =
                "You cannot have both 'code' and 'ipfs' at the same time";

            throwError({ message, error: LIT_ERROR.INVALID_PARAM });
        }

        // ========== Prepare Variables ==========
        // -- prepare request body
        const reqBody: JsonExecutionRequest =
            this.getLitActionRequestBody(params);

        // ========== Get Node Promises ==========
        // -- fetch shares from nodes
        const nodePromises = this.getNodePromises((url: string) => {
            return this.getJsExecutionShares(url, {
                ...reqBody,
            });
        });

        // -- resolve promises
        const res = await this.handleNodePromises(nodePromises);

        // -- case: promises rejected
        if (res.success === false) {
            this.throwNodeError(res as RejectedNodePromises);
            return;
        }

        // -- case: promises success (TODO: check the keys of "values")
        const responseData = (res as SuccessNodePromises).values;
        log('responseData', JSON.stringify(responseData, null, 2));

        // ========== Extract shares from response data ==========
        // -- 1. combine signed data as a list, and get the signatures from it
        const signedDataList = responseData.map(
            (r) => (r as SignedData).signedData
        );
        const signatures = this.getSignatures(signedDataList);

        // -- 2. combine decrypted data a list, and get the decryptions from it
        const decryptedDataList: any[] = responseData.map(
            (r: DecryptedData) => r.decryptedData
        );
        const decryptions = await this.getDecryptions(decryptedDataList);

        // -- 3. combine responses as a string, and get parse it as JSON
        let response: string = mostCommonString(
            responseData.map((r: NodeResponse) => r.response)
        );

        response = this.parseResponses(response);

        // -- 4. combine logs
        const mostCommonLogs: string = mostCommonString(
            responseData.map((r: NodeLog) => r.logs)
        );

        // ========== Result ==========
        let returnVal: ExecuteJsResponse = {
            signatures,
            decryptions,
            response,
            logs: mostCommonLogs,
        };

        // -- case: debug mode
        if (debug) {
            const allNodeResponses = responseData.map(
                (r: NodeResponse) => r.response
            );
            const allNodeLogs = responseData.map((r: NodeLog) => r.logs);

            returnVal.debug = {
                allNodeResponses,
                allNodeLogs,
                rawNodeHTTPResponses: responseData,
            };
        }

        return returnVal;
    };

    /**
     *
     * Request a signed JWT of any solidity function call from the LIT network.  There are no prerequisites for this function.  You should use this function if you need to transmit information across chains, or from a blockchain to a centralized DB or server.  The signature of the returned JWT verifies that the response is genuine.
     *
     * @param { SignedChainDataToken } params
     *
     * @returns { Promise<string | undefined>}
     */
    getSignedChainDataToken = async (
        params: SignedChainDataToken
    ): Promise<string | undefined> => {
        // ========== Prepare Params ==========
        const { callRequests, chain } = params;

        // ========== Pre-Validations ==========
        // -- validate if it's ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // -- validate if this.networkPubKeySet is null
        if (this.networkPubKeySet === null) {
            throwError({
                message: 'networkPubKeySet cannot be null',
                error: LIT_ERROR.PARAM_NULL_ERROR,
            });
            return;
        }

        // ========== Prepare ==========
        // we need to send jwt params iat (issued at) and exp (expiration)
        // because the nodes may have different wall clock times
        // the nodes will verify that these params are withing a grace period
        const { iat, exp } = this.getJWTParams();

        // ========== Get Node Promises ==========
        // -- fetch shares from nodes
        const nodePromises = this.getNodePromises((url: string) => {
            return this.getChainDataSigningShare(url, {
                callRequests,
                chain,
                iat,
                exp,
            });
        });

        // -- resolve promises
        const signatureShares = await Promise.all(nodePromises);
        log('signatureShares', signatureShares);

        // -- total of good shares
        const goodShares = signatureShares.filter(
            (d) => d.signatureShare !== ''
        );

        // ========== Shares Validations ==========
        // -- validate if we have enough good shares
        if (goodShares.length < this.config.minNodeCount) {
            log(
                `majority of shares are bad. goodShares is ${JSON.stringify(
                    goodShares
                )}`
            );

            if (this.config.alertWhenUnauthorized) {
                alert(
                    'You are not authorized to receive a signature to grant access to this content'
                );
            }

            throwError({
                message: `You are not authorized to recieve a signature on this item`,
                error: LIT_ERROR.UNAUTHROZIED_EXCEPTION,
            });
        }

        // ========== Result ==========
        const finalJwt: string = this.combineSharesAndGetJWT(
            this.networkPubKeySet,
            signatureShares
        );

        return finalJwt;
    };

    /**
     *
     * Request a signed JWT from the LIT network. Before calling this function, you must either create or know of a resource id and access control conditions for the item you wish to gain authorization for. You can create an access control condition using the saveSigningCondition function.
     *
     * @param { JsonSigningRetrieveRequest } params
     *
     * @returns { Promise<string> } final JWT
     *
     */
    getSignedToken = async (
        params: JsonSigningRetrieveRequest
    ): Promise<string | undefined> => {
        // ========== Prepare Params ==========
        const {
            // accessControlConditions,
            // evmContractConditions,
            // solRpcConditions,
            // unifiedAccessControlConditions,
            chain,
            authSig,
            resourceId,
        } = params;

        // ========== Pre-Validations ==========
        // -- validate if it's ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // -- validate if this.networkPubKeySet is null
        if (this.networkPubKeySet === null) {
            throwError({
                message: 'networkPubKeySet cannot be null',
                error: LIT_ERROR.PARAM_NULL_ERROR,
            });
            return;
        }

        // ========== Prepare ==========
        // we need to send jwt params iat (issued at) and exp (expiration)
        // because the nodes may have different wall clock times
        // the nodes will verify that these params are withing a grace period
        const { iat, exp } = this.getJWTParams();

        // ========== Formatting Access Control Conditions =========
        const {
            error,
            formattedAccessControlConditions,
            formattedEVMContractConditions,
            formattedSolRpcConditions,
            formattedUnifiedAccessControlConditions,
        }: FormattedMultipleAccs =
            this.getFormattedAccessControlConditions(params);

        if (error) {
            throwError({
                message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
            });
            return;
        }

        if (!resourceId) {
            throwError({
                message: `You must provide a resourceId`,
                error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
            });
            return;
        }

        const formattedResourceId = canonicalResourceIdFormatter(resourceId);

        // ========== Get Node Promises ==========
        const nodePromises = this.getNodePromises((url: string) => {
            return this.getSigningShare(url, {
                accessControlConditions: formattedAccessControlConditions,
                evmContractConditions: formattedEVMContractConditions,
                solRpcConditions: formattedSolRpcConditions,
                unifiedAccessControlConditions:
                    formattedUnifiedAccessControlConditions,
                chain,
                authSig,
                resourceId: formattedResourceId,
                iat,
                exp,
            });
        });

        // -- resolve promises
        const res = await this.handleNodePromises(nodePromises);

        // -- case: promises rejected
        if (res.success === false) {
            this.throwNodeError(res as RejectedNodePromises);
            return;
        }

        const signatureShares: Array<NodeShare> = (res as SuccessNodePromises)
            .values;

        log('signatureShares', signatureShares);

        // ========== Result ==========
        const finalJwt: string = this.combineSharesAndGetJWT(
            this.networkPubKeySet,
            signatureShares
        );

        return finalJwt;
    };

    /**
     *
     * Associated access control conditions with a resource on the web.  After calling this function, users may use the getSignedToken function to request a signed JWT from the LIT network.  This JWT proves that the user meets the access control conditions, and is authorized to access the resource you specified in the resourceId parameter of the saveSigningCondition function.
     *
     * @param { JsonStoreSigningRequest } params
     *
     * @returns { Promise<boolean | undefined }
     *
     */
    saveSigningCondition = async (
        params: JsonStoreSigningRequest
    ): Promise<boolean | undefined> => {
        // -- validate if it's ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // this is to fix my spelling mistake that we must now maintain forever lol
        if (typeof params.permanant !== 'undefined') {
            params.permanent = params.permanant;
        }

        // ========== Prepare Params ==========
        const {
            // accessControlConditions,
            // evmContractConditions,
            // solRpcConditions,
            // unifiedAccessControlConditions,
            chain,
            authSig,
            resourceId,
            // permanant,
            permanent,
        } = params;

        // ----- validate params -----
        // validate if resourceId is null
        if (!resourceId) {
            throwError({
                message: 'resourceId cannot be null',
                error: LIT_ERROR.PARAM_NULL_ERROR,
            });
            return;
        }

        // ========== Hashing Resource ID & Conditions ==========
        // hash the resource id
        const hashOfResourceId = await hashResourceId(resourceId);

        const hashOfResourceIdStr = uint8arrayToString(
            new Uint8Array(hashOfResourceId),
            'base16'
        );

        let hashOfConditions: ArrayBuffer | undefined =
            await this.getHashedAccessControlConditions(params);

        if (!hashOfConditions) {
            throwError({
                message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
            });
            return;
        }

        const hashOfConditionsStr = uint8arrayToString(
            new Uint8Array(hashOfConditions),
            'base16'
        );

        // ========== Get Node Promises ==========
        const nodePromises = this.getNodePromises((url: string) => {
            return this.storeSigningConditionWithNode(url, {
                key: hashOfResourceIdStr,
                val: hashOfConditionsStr,
                authSig,
                chain,
                permanent: permanent ? 1 : 0,
            });
        });

        // -- resolve promises
        const res = await this.handleNodePromises(nodePromises);

        // -- case: promises rejected
        if (res.success === false) {
            this.throwNodeError(res as RejectedNodePromises);
            return;
        }

        return true;
    };

    /**
     *
     * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
     *
     */
    getEncryptionKey = async (
        params: JsonEncryptionRetrieveRequest
    ): Promise<Uint8Array | undefined> => {
        // -- prepare BLS SDK
        const wasmBlsSdk: any = await initWasmBlsSdk();

        // -- validate if it's ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // -- validate if this.networkPubKeySet is null
        if (!this.networkPubKeySet) {
            const message = 'networkPubKeySet cannot be null';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
            return;
        }

        // ========== Prepare Params ==========
        const { chain, authSig, resourceId, toDecrypt } = params;

        // ========== Validate Params ==========
        const paramsIsSafe = safeParams({
            functionName: 'getEncryptionKey',
            params: [params],
        });

        if (!paramsIsSafe) return;

        // ========== Formatting Access Control Conditions =========
        const {
            error,
            formattedAccessControlConditions,
            formattedEVMContractConditions,
            formattedSolRpcConditions,
            formattedUnifiedAccessControlConditions,
        }: FormattedMultipleAccs =
            this.getFormattedAccessControlConditions(params);

        if (error) {
            throwError({
                message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
            });
            return;
        }

        // ========== Node Promises ==========
        const nodePromises = this.getNodePromises((url: string) => {
            return this.getDecryptionShare(url, {
                accessControlConditions: formattedAccessControlConditions,
                evmContractConditions: formattedEVMContractConditions,
                solRpcConditions: formattedSolRpcConditions,
                unifiedAccessControlConditions:
                    formattedUnifiedAccessControlConditions,
                toDecrypt,
                authSig,
                chain,
            });
        });

        // -- resolve promises
        const res = await this.handleNodePromises(nodePromises);

        // -- case: promises rejected
        if (res.success === false) {
            this.throwNodeError(res as RejectedNodePromises);
            return;
        }

        const decryptionShares: Array<NodeShare> = (res as SuccessNodePromises)
            .values;

        log('decryptionShares', decryptionShares);

        // ========== Combine Shares ==========
        const decrypted = combineBlsDecryptionShares(
            decryptionShares,
            this.networkPubKeySet,
            toDecrypt,
            { wasmBlsSdk }
        );

        return decrypted;
    };

    /**
     *
     * Securely save the association between access control conditions and something that you wish to decrypt
     *
     * @param { JsonSaveEncryptionKeyRequest } params
     *
     * @returns { Promise<Uint8Array | undefined }
     *
     */
    saveEncryptionKey = async (
        params: JsonSaveEncryptionKeyRequest
    ): Promise<Uint8Array | undefined> => {
        // ========= Prepare Params ==========
        const {
            encryptedSymmetricKey,
            symmetricKey,
            authSig,
            chain,
            permanent,
        } = params;

        // ========== Validate Params ==========
        // -- validate if it's ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // -- validate if this.subnetPubKey is null
        if (!this.subnetPubKey) {
            const message = 'subnetPubKey cannot be null';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
            return;
        }

        const paramsIsSafe = safeParams({
            functionName: 'saveEncryptionKey',
            params: [params],
        });

        if (!paramsIsSafe) return;

        // ========== Encryption ==========
        // -- encrypt with network pubkey
        let encryptedKey;

        if (encryptedSymmetricKey) {
            encryptedKey = encryptedSymmetricKey;
        } else {
            encryptedKey = wasmBlsSdkHelpers.encrypt(
                uint8arrayFromString(this.subnetPubKey, 'base16'),
                symmetricKey
            );
            log(
                'symmetric key encrypted with LIT network key: ',
                uint8arrayToString(encryptedKey, 'base16')
            );
        }

        // ========== Hashing ==========
        // -- hash the encrypted pubkey
        const hashOfKey = await crypto.subtle.digest('SHA-256', encryptedKey);
        const hashOfKeyStr = uint8arrayToString(
            new Uint8Array(hashOfKey),
            'base16'
        );

        // hash the access control conditions
        let hashOfConditions: ArrayBuffer | undefined =
            await this.getHashedAccessControlConditions(params);

        if (!hashOfConditions) {
            throwError({
                message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
            });
            return;
        }

        const hashOfConditionsStr = uint8arrayToString(
            new Uint8Array(hashOfConditions),
            'base16'
        );

        // ========== Node Promises ==========
        const nodePromises = this.getNodePromises((url: string) => {
            return this.storeEncryptionConditionWithNode(url, {
                key: hashOfKeyStr,
                val: hashOfConditionsStr,
                authSig,
                chain,
                permanent: permanent ? 1 : 0,
            });
        });

        // -- resolve promises
        const res = await this.handleNodePromises(nodePromises);

        // -- case: promises rejected
        if (res.success === false) {
            this.throwNodeError(res as RejectedNodePromises);
            return;
        }

        return encryptedKey;
    };

    /**
     *
     * Signs a message with Lit threshold ECDSA algorithms.
     *
     * @param { SignWithECDSA } params
     *
     * @returns { Promise<string> }
     *
     */
    signWithEcdsa = async (params: SignWithECDSA): Promise<string> => {
        // ========== Prepare Params ==========
        const { message, chain } = params;

        // ----- Node Promises -----
        const nodePromises = this.getNodePromises((url: string) => {
            return this.signECDSA(url, {
                message,
                chain,
                iat: 0,
                exp: 0,
            });
        });

        // ----- Resolve Promises -----
        try {
            const shareData = await Promise.all(nodePromises);

            const signature = this.getSignature(shareData);

            // ----- Result -----
            return signature;
        } catch (e) {
            console.log('Error - signed_ecdsa_messages ');
            const signed_ecdsa_message = nodePromises[0];

            // ----- Result -----
            return signed_ecdsa_message;
        }
    };

    /**
     *
     * Validates a condition, and then signs the condition if the validation returns true.
     * Before calling this function, you must know the on chain conditions that you wish to validate.
     *
     * @param { ValidateAndSignECDSA } params
     *
     * @returns { Promise<string> }
     */
    validate_and_sign_ecdsa = async (
        params: ValidateAndSignECDSA
    ): Promise<string | undefined> => {
        // ========== Validate Params ==========
        // -- validate if it's ready
        if (!this.ready) {
            const message =
                'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            throwError({
                message,
                error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR,
            });
        }

        // ========== Prepare Params ==========
        const { accessControlConditions, chain, auth_sig } = params;

        // ========== Prepare JWT Params ==========
        // we need to send jwt params iat (issued at) and exp (expiration)
        // because the nodes may have different wall clock times
        // the nodes will verify that these params are withing a grace period
        const { iat, exp } = this.getJWTParams();

        // -- validate
        if (!accessControlConditions) {
            throwError({
                message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions`,
                error: LIT_ERROR.INVALID_ARGUMENT_EXCEPTION,
            });
            return;
        }

        // -- formatted access control conditions
        let formattedAccessControlConditions: any;

        formattedAccessControlConditions = accessControlConditions.map((c) =>
            canonicalAccessControlConditionFormatter(c)
        );
        log(
            'formattedAccessControlConditions',
            JSON.stringify(formattedAccessControlConditions)
        );

        // ========== Node Promises ==========
        const nodePromises = this.getNodePromises((url: string) => {
            return this.sign_condition_ecdsa(url, {
                accessControlConditions: formattedAccessControlConditions,
                evmContractConditions: undefined,
                solRpcConditions: undefined,
                auth_sig,
                chain,
                iat,
                exp,
            });
        });

        // ----- Resolve Promises -----
        try {
            const shareData = await Promise.all(nodePromises);

            if (shareData[0].result == 'failure') return 'Condition Failed';

            const signature = this.getSignature(shareData);

            return signature;
        } catch (e) {
            console.log('Error - signed_ecdsa_messages - ', e);
            const signed_ecdsa_message = nodePromises[0];
            return signed_ecdsa_message;
        }
    };

    /**
     *
     * Connect to the LIT nodes
     *
     * @returns { Promise } A promise that resolves when the nodes are connected.
     *
     */
    connect = (): Promise<any> => {
        // -- handshake with each node
        for (const url of this.config.bootstrapUrls) {
            this.handshakeWithSgx({ url }).then((resp) => {
                this.connectedNodes.add(url);

                let keys: JsonHandshakeResponse = {
                    serverPubKey: resp.serverPublicKey,
                    subnetPubKey: resp.subnetPublicKey,
                    networkPubKey: resp.networkPublicKey,
                    networkPubKeySet: resp.networkPublicKeySet,
                };

                this.serverKeys[url] = keys;
            });
        }

        // -- get promise
        const promise = new Promise((resolve) => {
            const interval = setInterval(() => {
                if (
                    Object.keys(this.serverKeys).length >=
                    this.config.minNodeCount
                ) {
                    clearInterval(interval);

                    // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key
                    this.subnetPubKey = mostCommonString(
                        Object.values(this.serverKeys).map(
                            (keysFromSingleNode: any) =>
                                keysFromSingleNode.subnetPubKey
                        )
                    );
                    this.networkPubKey = mostCommonString(
                        Object.values(this.serverKeys).map(
                            (keysFromSingleNode: any) =>
                                keysFromSingleNode.networkPubKey
                        )
                    );
                    this.networkPubKeySet = mostCommonString(
                        Object.values(this.serverKeys).map(
                            (keysFromSingleNode: any) =>
                                keysFromSingleNode.networkPubKeySet
                        )
                    );
                    this.ready = true;

                    log('lit is ready');
                    if (typeof document !== 'undefined') {
                        document.dispatchEvent(new Event('lit-ready'));
                    }

                    // @ts-ignore: Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?ts(2794)
                    resolve();
                }
            }, 500);
        });

        return promise;
    };
}
