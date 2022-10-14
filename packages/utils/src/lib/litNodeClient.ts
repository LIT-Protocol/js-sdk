import { RejectedNodePromises, ExecuteJsProps, JsonExecutionRequest, LitNodeClientConfig, LIT_ERROR, LIT_NETWORKS, NodePromiseResponse, SendNodeCommand, SuccessNodePromises, version, SignedData, SigShare, SigShares, SIGTYPE, DecryptedData, NodeResponse, NodeLog, ExecuteJsResponse } from "@litprotocol-dev/constants";
import { uint8arrayFromString, uint8arrayToString } from "./browser/Browser";
import { combineBlsDecryptionShares, combineBlsShares, combineEcdsaShares } from "./browser/crypto";
import { convertLitActionsParams, getStorageItem, log, mostCommonString, throwError } from "./utils";

/** ---------- Local Types ---------- */
export abstract class ILitNodeClient {

    // -- properties
    config!: LitNodeClientConfig;
    connectedNodes!: SetConstructor | Set<any>;
    serverKeys!: object;
    ready!: boolean;
    subnetPubKey!: string | null;
    networkPubKey!: string | null;
    networkPubKeySet!: string | null;

    // -- constructor
    constructor(customConfig: LitNodeClientConfig){}

    // -- local methods
    overrideConfigsFromLocalStorage = () => {}
    setCustomBootstrapUrls = () => {}
    getLitActionRequestBody = (params: ExecuteJsProps) => {}
    getNodePromises = (func: Function) => {}

    // -- handlers
    handleNodePromises = (nodePromises: Array<Promise<any>>) => {}

    // --- shares resolvers
    getSignatures = (signedData: Array<SignedData>) => {}
    
    // -- business logic methods
    executeJs = async (params: ExecuteJsProps) : Promise<any> => {}
    getSignedChainDataToken = async () => {}
    getSignedToken = async () => {}
    saveSigningCondition = async () => {}
    getEncryptionKey = async () => {}
    saveEncryptionKey = async () => {}
    signWithEcdsa = async () => {}
    validate_and_sign_ecdsa = async () => {}
    storeSigningConditionWithNode = async () => {}
    storeEncryptionConditionWithNode = async () => {}
    getChainDataSigningShare = async () => {}
    getSigningShare = async () => {}
    getDecryptionShare = async () => {}
    getJsExecutionShares = async (url: string, params : JsonExecutionRequest) => {}
    handshakeWithSgx = async () => {}
    sendCommandToNode = async (params: SendNodeCommand) : Promise<any> => {}
    
    throwNodeError = (res: RejectedNodePromises) => {}
    signECDSA = async () => {}
    sign_condition_ecdsa = async () => {}
    connect = () => {}
}

/** ---------- Local Constants ---------- */
export const defaultConfig : LitNodeClientConfig= {
    alertWhenUnauthorized: true,
    minNodeCount: 6,
    debug: true,
    bootstrapUrls: [
        "https://node2.litgateway.com:7370",
        "https://node2.litgateway.com:7371",
        "https://node2.litgateway.com:7372",
        "https://node2.litgateway.com:7373",
        "https://node2.litgateway.com:7374",
        "https://node2.litgateway.com:7375",
        "https://node2.litgateway.com:7376",
        "https://node2.litgateway.com:7377",
        "https://node2.litgateway.com:7378",
        "https://node2.litgateway.com:7379",
    ],
    litNetwork: "jalapeno",
}

/** ---------- Local Helpers ---------- */

const override = (original: any, custom: any) => {
    return { ...original, ...custom};
}

const browserOnly = (callback: Function) => {
    if ( typeof window !== "undefined" && window && window.localStorage ){
        callback();
    }
}

/** ---------- Main Export Class ---------- */

export default class LitNodeClient implements ILitNodeClient{

    config: LitNodeClientConfig;
    connectedNodes: SetConstructor | Set<any> | any;
    serverKeys: object;
    ready: boolean;
    subnetPubKey: string | null;
    networkPubKey: string | null;
    networkPubKeySet: string | null;

    // ========== Constructor ==========
    constructor(customConfig: LitNodeClientConfig){
        
        // -- initialize default config
        this.config = defaultConfig

        // -- if config params are specified, replace it
        if ( customConfig ){
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
    overrideConfigsFromLocalStorage = () : void => {
        browserOnly(() => {

            const storageKey = "LitNodeClientConfig";
            const storageConfigOrError = getStorageItem(storageKey);

            // -- validate
            if( storageConfigOrError.type === 'ERROR'){
                console.log("Error accessing local storage");
                return;
            }

            // -- execute
            const storageConfig = JSON.parse(storageConfigOrError.result);
            this.config = override(this.config, storageConfig);

        });
    }

    /**
     * 
     * Set bootstrapUrls to match the network litNetwork unless it's set to custom
     * 
     * @returns { void }
     * 
     */
    setCustomBootstrapUrls = () : void => {

        // -- validate
        if( this.config.litNetwork === 'custom') return;

        // -- execute
        const hasNetwork : boolean = this.config.litNetwork in LIT_NETWORKS;
        
        if ( ! hasNetwork) {

            // network not found, report error
            throwError({
                message:
                    "the litNetwork specified in the LitNodeClient config not found in LIT_NETWORKS",
                error: LIT_ERROR.LIT_NODE_CLIENT_BAD_CONFIG_ERROR,
            });
            return;
        }
        
        this.config.bootstrapUrls = LIT_NETWORKS[this.config.litNetwork];
    }

    /**
     * 
     * Get the request body of the lit action
     * 
     * @param { ExecuteJsProps } params
     * 
     * @returns { JsonExecutionRequest }
     * 
     */
    getLitActionRequestBody = (params: ExecuteJsProps) : JsonExecutionRequest => {

        const reqBody : JsonExecutionRequest = { 
            authSig: params.authSig, 
            jsParams: convertLitActionsParams(params.jsParams),
        };

        if( params.code ){
            const _uint8Array = uint8arrayFromString(params.code, "utf8");
            const encodedJs = uint8arrayToString(_uint8Array, "base64");

            reqBody.code = encodedJs;
        }

        if ( params.ipfsId ){
            reqBody.ipfsId = params.ipfsId;
        }

        return reqBody;
    }


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
    getNodePromises = (callback: Function) : Array<Promise<any>> => {

        const nodePromises = [];

        for (const url of this.connectedNodes) {
            nodePromises.push(callback(url));
        }

        return nodePromises;
    }

    /**
     * Handle node promises
     * 
     * @param { Array<Promise<any>> } nodePromises
     * 
     * @returns { Promise<SuccessNodePromises | RejectedNodePromises> } 
     * 
     */
    handleNodePromises = async (nodePromises: Array<Promise<any>>) : Promise<SuccessNodePromises | RejectedNodePromises> => {
        
        // -- prepare
        const responses = await Promise.allSettled(nodePromises);

        log("responses", responses);

        // -- get fulfilled responses
        const successes : Array<NodePromiseResponse> = responses.filter((r) => r.status === "fulfilled");

        // -- case: success (when success responses are more than minNodeCount)
        if (successes.length >= this.config.minNodeCount) {

            const successPromises : SuccessNodePromises = {
                success: true,
                values: successes.map((r) => r.value),
              };

            return successPromises
        }
    
        // -- case: if we're here, then we did not succeed.  time to handle and report errors.
        
        // -- get "rejected" responses
        const rejected = responses.filter((r) => r.status === "rejected");

        const mostCommonError = JSON.parse(
          mostCommonString(rejected.map((r: NodePromiseResponse) => JSON.stringify(r.reason)))
        );

        log(`most common error: ${JSON.stringify(mostCommonError)}`);

        const rejectedPromises : RejectedNodePromises = {
            success: false,
            error: mostCommonError,
        };

        return rejectedPromises;

    }
    
    /**
     * 
     * Throw node error
     * 
     * @param { RejectedNodePromises } res
     * 
     * @returns { void }
     * 
     */
    throwNodeError = (res: RejectedNodePromises) : void => {

        if (res.error && res.error.errorCode) {
            if (
                res.error.errorCode === "not_authorized" &&
                this.config.alertWhenUnauthorized
            ) {
                alert("You are not authorized to access to this content");
            }

            throwError({ ...res.error, name: "NodeError" });
        } else {
            throwError({
                message: `There was an error getting the signing shares from the nodes`,
                error: LIT_ERROR.UNKNOWN_ERROR,
            });
        }
    }
    
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
    getSignatures = (signedData: Array<any>):  any =>{

        // -- prepare
        let signatures : any;

        // TOOD: get keys of signedData
        const keys = Object.keys(signedData[0]);

        // -- execute
        keys.forEach((key) => {

            const shares = signedData.map((r: any) => r[key]);

            shares.sort((a, b) => a.shareIndex - b.shareIndex);

            const sigShares : SigShares = shares.map((s) => ({
                sigType: s.sigType,
                shareHex: s.signatureShare,
                shareIndex: s.shareIndex,
                localX: s.localX,
                localY: s.localY,
                publicKey: s.publicKey,
                dataSigned: s.dataSigned,
            }));

            console.log("sigShares", sigShares);

            const sigType = mostCommonString(sigShares.map((s) => s.sigType));

            // -- validate if this.networkPubKeySet is null
            if (this.networkPubKeySet === null) {
                throwError({
                    message: "networkPubKeySet cannot be null",
                    error: LIT_ERROR.PARAM_NULL_ERROR,
                });
                return;
            }

            // -- validate if signature type is BLS or ECDSA
            if (sigType !== "BLS" && sigType !== "ECDSA") {
                throwError({
                    message: "signature type is not BLS or ECDSA",
                    error: LIT_ERROR.UNKNOWN_SIGNATURE_TYPE,
                });
                return;
            }

            let signature : any;

            if (sigType === SIGTYPE.BLS) {
                signature = combineBlsShares(sigShares, this.networkPubKeySet);
            } else if (sigType === SIGTYPE.ECDSA) {
                signature = combineEcdsaShares(sigShares);
            }

            signatures[key] = {
                ...signature,
                publicKey: mostCommonString(sigShares.map((s) => s.publicKey)),
                dataSigned: mostCommonString(sigShares.map((s) => s.dataSigned)),
            };
        });

        return signatures;
    }

    /**
     * 
     * Get the decryptions from the decrypted data list
     * 
     * @param { Array<any> } decryptedData
     * 
     * @returns { Array<any> } 
     * 
     */
    getDecryptions = (decryptedData: Array<any>) : Array< any>=> {

        let decryptions : any;

        Object.keys(decryptedData[0]).forEach((key) => {

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
            const ciphertext = mostCommonString(decShares.map((s) => s.ciphertext));

            // -- validate if this.networkPubKeySet is null
            if (this.networkPubKeySet === null) {
                throwError({
                    message: "networkPubKeySet cannot be null",
                    error: LIT_ERROR.PARAM_NULL_ERROR,
                });
                return;
            }


            let decrypted;
            if (algorithmType === "BLS") {
                decrypted = combineBlsDecryptionShares(
                    decShares,
                    this.networkPubKeySet,
                    ciphertext
                );
            } else {
                throwError({
                    message: "Unknown decryption algorithm type",
                    name: "UnknownDecryptionAlgorithmTypeError",
                    errorCode: "unknown_decryption_algorithm_type",
                });
            }
    
            decryptions[key] = {
                decrypted: uint8arrayToString(decrypted, "base16"),
                publicKey: mostCommonString(decShares.map((s) => s.publicKey)),
                ciphertext: mostCommonString(decShares.map((s) => s.ciphertext)),
            };
        });

        return decryptions;

    }

    /**
     * 
     * Parse the response string to JSON
     * 
     * @param { string } responseString
     * 
     * @returns { any } JSON object
     * 
     */
    parseResponses = (responseString: string) : any => {

        let response : any;

        try {
            response = JSON.parse(responseString);
        } catch (e) {
            log(
                "Error parsing response as json.  Swallowing and returning as string.",
                responseString
            );
        }

        return response;
    }



    // ========== API Calls to Nodes ==========
    
    /**
     * 
     * Send a command to nodes
     * 
     * @param { SendNodeCommand } 
     * 
     * @returns { Promise<Response> }
     * 
     */
    sendCommandToNode = async ({ url, data } : SendNodeCommand) : Promise<Response> => {
        
        log(`sendCommandToNode with url ${url} and data`, data);

        const req : RequestInit = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "lit-js-sdk-version": version,
            },
            body: JSON.stringify(data),
        };
        
        return fetch(url, req).then(async (response) => {
            const isJson = response.headers
            .get("content-type")
            ?.includes("application/json");

            const data = isJson ? await response.json() : null;

            if (!response.ok) {
                // get error message from body or default to response status
                const error = data || response.status;
                return Promise.reject(error);
            }

            return data;
        });
    }

    /**
     * 
     * Get JS Execution Shares from Nodes
     * 
     * @param { JsonExecutionRequest } params
     *  
     * @returns 
     */
    getJsExecutionShares = async (url: string, params : JsonExecutionRequest) : Promise<any> => {

        const { code, ipfsId, authSig, jsParams } = params;

        log("getJsExecutionShares");

        const urlWithPath = `${url}/web/execute`;

        const data : JsonExecutionRequest = {
            code,
            ipfsId,
            authSig,
            jsParams,
        };

        return await this.sendCommandToNode({ url: urlWithPath, data });
    }
    
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
        params : ExecuteJsProps
    ) : Promise<ExecuteJsResponse | undefined> => {

        // ========== Prepare Params ==========
        const { code, ipfsId, authSig, jsParams, debug } = params;

        // ========== Validate Params ==========
        // -- validate: If it's NOT ready
        if ( ! this.ready ) {

            const message = "LitNodeClient is not ready.  Please call await litNodeClient.connect() first.";
            
            throwError({ message, error: LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR });
        }

        // -- validate: either 'code' or 'ipfsId' must exists
        if( ! code && ! ipfsId ){

            const message = "You must pass either code or ipfsId";
            
            throwError({ message, error: LIT_ERROR.PARAMS_MISSING_ERROR });
        }
        
        // -- validate: 'code' and 'ipfsId' can't exists at the same time
        if( code && ipfsId ){
            const message = "You cannot have both 'code' and 'ipfs' at the same time";
            
            throwError({ message, error: LIT_ERROR.INVALID_PARAM });
        }

        // ========== Prepare Variables ==========
        // -- prepare request body
        const reqBody : JsonExecutionRequest = this.getLitActionRequestBody(params);

        // ========== Get Node Promises ==========
        // -- fetch shares from nodes
        const nodePromises = this.getNodePromises( (url: string) => {
            return this.getJsExecutionShares(url, {
                ...reqBody
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
        log("responseData", JSON.stringify(responseData, null, 2));
        
        // ========== Extract shares from response data ==========
        // -- 1. combine signed data as a list, and get the signatures from it
        const signedDataList : [] = responseData.map((r: SignedData) => r.signedData);
        const signatures = this.getSignatures(signedDataList);
        
        // -- 2. combine decrypted data a list, and get the decryptions from it
        const decryptedDataList : [] = responseData.map((r: DecryptedData) => r.decryptedData);
        const decryptions = this.getDecryptions(decryptedDataList);

        // -- 3. combine responses as a string, and get parse it as JSON
        let response : string = mostCommonString(responseData.map((r: NodeResponse) => r.response));
        
        response = this.parseResponses(response);

        // -- 4. combine logs 
        const mostCommonLogs : string = mostCommonString(responseData.map((r: NodeLog) => r.logs));

        // ========== Result ==========
        let returnVal : ExecuteJsResponse = {
            signatures,
            decryptions,
            response,
            logs: mostCommonLogs,
        };

        // -- case: debug mode
        if (debug) {

            const allNodeResponses = responseData.map((r: NodeResponse) => r.response);
            const allNodeLogs = responseData.map((r: NodeLog) => r.logs);

            returnVal.debug = {
                allNodeResponses,
                allNodeLogs,
                rawNodeHTTPResponses: responseData,
            };
        }

        return returnVal;

    }
}