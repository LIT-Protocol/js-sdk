"use strict";
var _LitNodeClientNodeJs_authCallbackAndUpdateStorageItem, _LitNodeClientNodeJs_decryptWithSignatureShares, _LitNodeClientNodeJs_getIdentityParamForEncryption, _LitNodeClientNodeJs_isSuccessNodePromises;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LitNodeClientNodeJs = void 0;
const tslib_1 = require("tslib");
const access_control_conditions_1 = require("@lit-protocol/access-control-conditions");
const constants_1 = require("@lit-protocol/constants");
const crypto_1 = require("@lit-protocol/crypto");
const encryption_1 = require("@lit-protocol/encryption");
const misc_1 = require("@lit-protocol/misc");
const uint8arrays_1 = require("@lit-protocol/uint8arrays");
const transactions_1 = require("@ethersproject/transactions");
const utils_1 = require("ethers/lib/utils");
const core_1 = require("@lit-protocol/core");
const auth_helpers_1 = require("@lit-protocol/auth-helpers");
const misc_browser_1 = require("@lit-protocol/misc-browser");
const nacl_1 = require("@lit-protocol/nacl");
const ethers_1 = require("ethers");
const siwe = require("siwe");
/** ---------- Main Export Class ---------- */
class LitNodeClientNodeJs extends core_1.LitCore {
    // ========== Constructor ==========
    constructor(args) {
        super(args);
        // ========== Rate Limit NFT ==========
        // TODO: Add support for browser feature/lit-2321-js-sdk-add-browser-support-for-createCapacityDelegationAuthSig
        this.createCapacityDelegationAuthSig = async (params) => {
            let { dAppOwnerWallet, capacityTokenId, delegateeAddresses, uses, domain, expiration, statement, } = params;
            // -- if delegateeAddresses is not provided, set it to an empty array
            if (!delegateeAddresses) {
                delegateeAddresses = [];
            }
            // -- This is the owner address who holds the Capacity Credits NFT token and wants to delegate its
            // usage to a list of delegatee addresses
            const dAppOwnerWalletAddress = ethers_1.ethers.utils.getAddress(await dAppOwnerWallet.getAddress());
            // -- default configuration for siwe message unless there are arguments
            const _domain = domain ?? 'example.com';
            const _expiration = expiration ?? new Date(Date.now() + 1000 * 60 * 7).toISOString();
            const _statement = '' ?? statement;
            // -- default configuration for recap object capability
            const _uses = uses ?? '1';
            // -- if it's not ready yet, then connect
            if (!this.ready) {
                await this.connect();
            }
            // -- validate
            if (!dAppOwnerWallet) {
                throw new Error('dAppOwnerWallet must exist');
            }
            // -- validate dAppOwnerWallet is an ethers wallet
            // if (!(dAppOwnerWallet instanceof ethers.Wallet || ethers.Signer)) {
            //   throw new Error('dAppOwnerWallet must be an ethers wallet');
            // }
            // -- Strip the 0x prefix from each element in the addresses array if it exists
            if (delegateeAddresses && delegateeAddresses.length > 0) {
                delegateeAddresses = delegateeAddresses.map((address) => address.startsWith('0x') ? address.slice(2) : address);
            }
            // -- create LitRLIResource
            // Note: we have other resources such as LitAccessControlConditionResource, LitPKPResource and LitActionResource)
            // lit-ratelimitincrease://{tokenId}
            const litResource = new auth_helpers_1.LitRLIResource(capacityTokenId ?? '*');
            const recapObject = await this.generateSessionCapabilityObjectWithWildcards([litResource]);
            const capabilities = {
                ...(capacityTokenId ? { nft_id: [capacityTokenId] } : {}),
                delegate_to: delegateeAddresses,
                uses: _uses.toString(),
            };
            recapObject.addCapabilityForResource(litResource, auth_helpers_1.LitAbility.RateLimitIncreaseAuth, capabilities);
            // make sure that the resource is added to the recapObject
            const verified = recapObject.verifyCapabilitiesForResource(litResource, auth_helpers_1.LitAbility.RateLimitIncreaseAuth);
            // -- validate
            if (!verified) {
                throw new Error('Failed to verify capabilities for resource');
            }
            let nonce = this.getLatestBlockhash();
            // -- get auth sig
            let siweMessage = new siwe.SiweMessage({
                domain: _domain,
                address: dAppOwnerWalletAddress,
                statement: _statement,
                uri: constants_1.SIWE_DELEGATION_URI,
                version: '1',
                chainId: 1,
                nonce: nonce?.toString(),
                expirationTime: _expiration,
            });
            siweMessage = recapObject.addToSiweMessage(siweMessage);
            let messageToSign = siweMessage.prepareMessage();
            let signature = await dAppOwnerWallet.signMessage(messageToSign);
            // replacing 0x to match the tested working authSig from node
            signature = signature.replace('0x', '');
            const authSig = {
                sig: signature,
                derivedVia: 'web3.eth.personal.sign',
                signedMessage: messageToSign,
                address: dAppOwnerWalletAddress.replace('0x', '').toLowerCase(),
                algo: null, // This is added to match the tested working authSig from node
            };
            return { litResource, capacityDelegationAuthSig: authSig };
        };
        // ========== Scoped Class Helpers ==========
        /**
         *
         * Get the request body of the lit action
         *
         * @param { ExecuteJsProps } params
         *
         * @returns { JsonExecutionRequest }
         *
         */
        this.getLitActionRequestBody = (params) => {
            const reqBody = {
                ...(params.authSig && { authSig: params.authSig }),
                ...(params.sessionSigs && { sessionSigs: params.sessionSigs }),
                ...(params.authMethods && { authMethods: params.authMethods }),
                jsParams: (0, misc_1.convertLitActionsParams)(params.jsParams),
                // singleNode: params.singleNode ?? false,
                targetNodeRange: params.targetNodeRange ?? 0,
            };
            if (params.code) {
                const _uint8Array = (0, uint8arrays_1.uint8arrayFromString)(params.code, 'utf8');
                const encodedJs = (0, uint8arrays_1.uint8arrayToString)(_uint8Array, 'base64');
                reqBody.code = encodedJs;
            }
            if (params.ipfsId) {
                reqBody.ipfsId = params.ipfsId;
            }
            if (params.authMethods && params.authMethods.length > 0) {
                reqBody.authMethods = params.authMethods;
            }
            return reqBody;
        };
        /**
         *
         * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
         *
         */
        this.getJWTParams = () => {
            const now = Date.now();
            const iat = Math.floor(now / 1000);
            const exp = iat + 12 * 60 * 60; // 12 hours in seconds
            return { iat, exp };
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
        this.parseResponses = (responseString) => {
            let response;
            try {
                response = JSON.parse(responseString);
            }
            catch (e) {
                (0, misc_1.log)('Error parsing response as json.  Swallowing and returning as string.', responseString);
            }
            return response;
        };
        // ==================== SESSIONS ====================
        /**
         * Try to get the session key in the local storage,
         * if not, generates one.
         * @return { SessionKeyPair } session key pair
         */
        this.getSessionKey = () => {
            const storageKey = constants_1.LOCAL_STORAGE_KEYS.SESSION_KEY;
            const storedSessionKeyOrError = (0, misc_browser_1.getStorageItem)(storageKey);
            if (storedSessionKeyOrError.type === "ERROR" /* EITHER_TYPE.ERROR */ ||
                !storedSessionKeyOrError.result ||
                storedSessionKeyOrError.result === '') {
                console.warn(`Storage key "${storageKey}" is missing. Not a problem. Contiune...`);
                // Generate new one
                const newSessionKey = (0, crypto_1.generateSessionKeyPair)();
                // (TRY) to set to local storage
                try {
                    localStorage.setItem(storageKey, JSON.stringify(newSessionKey));
                }
                catch (e) {
                    console.warn(`Localstorage not available. Not a problem. Contiune...`);
                }
                return newSessionKey;
            }
            else {
                return JSON.parse(storedSessionKeyOrError.result);
            }
        };
        // backward compatibility
        this.getExpiration = () => {
            return LitNodeClientNodeJs.getExpiration();
        };
        /**
         * returns the latest block hash.
         * will call refresh if the block hash is expired
         * @returns {Promise<string>} latest block hash from `handhsake` with the lit network.
         */
        this.getLatestBlockhash = () => {
            if (!this.ready) {
                (0, misc_1.logError)('Client not connected, remember to call connect');
                (0, misc_1.throwError)({
                    message: 'Client not connected',
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.code,
                });
            }
            // we are confident in this value being non null so we return
            return this.latestBlockhash;
        };
        /**
         *
         * Get the signature from local storage, if not, generates one
         *
         */
        this.getWalletSig = async ({ authNeededCallback, chain, sessionCapabilityObject, switchChain, expiration, sessionKeyUri, nonce, }) => {
            let walletSig;
            const storageKey = constants_1.LOCAL_STORAGE_KEYS.WALLET_SIGNATURE;
            const storedWalletSigOrError = (0, misc_browser_1.getStorageItem)(storageKey);
            // browser: 2 > 2.1 > 3
            // nodejs: 1. > 1.1
            // -- (TRY) to get it in the local storage
            // -- IF NOT: Generates one
            (0, misc_1.log)(`getWalletSig - flow starts
        storageKey: ${storageKey}
        storedWalletSigOrError: ${JSON.stringify(storedWalletSigOrError)}
    `);
            if (storedWalletSigOrError.type === "ERROR" /* EITHER_TYPE.ERROR */ ||
                !storedWalletSigOrError.result ||
                storedWalletSigOrError.result == '') {
                (0, misc_1.log)('getWalletSig - flow 1');
                console.warn(`Storage key "${storageKey}" is missing. Not a problem. Continue...`);
                if (authNeededCallback) {
                    (0, misc_1.log)('getWalletSig - flow 1.1');
                    const body = {
                        chain,
                        statement: sessionCapabilityObject?.statement,
                        resources: sessionCapabilityObject
                            ? [sessionCapabilityObject.encodeAsSiweResource()]
                            : undefined,
                        ...(switchChain && { switchChain }),
                        expiration,
                        uri: sessionKeyUri,
                        nonce,
                    };
                    (0, misc_1.log)('callback body:', body);
                    walletSig = await authNeededCallback(body);
                }
                else {
                    (0, misc_1.log)('getWalletSig - flow 1.2');
                    if (!this.defaultAuthCallback) {
                        (0, misc_1.log)('getWalletSig - flow 1.2.1');
                        return (0, misc_1.throwError)({
                            message: 'No default auth callback provided',
                            errorKind: constants_1.LIT_ERROR.PARAMS_MISSING_ERROR.kind,
                            errorCode: constants_1.LIT_ERROR.PARAMS_MISSING_ERROR.name,
                        });
                    }
                    (0, misc_1.log)('getWalletSig - flow 1.2.2');
                    walletSig = await this.defaultAuthCallback({
                        chain,
                        statement: sessionCapabilityObject.statement,
                        resources: sessionCapabilityObject
                            ? [sessionCapabilityObject.encodeAsSiweResource()]
                            : undefined,
                        switchChain,
                        expiration,
                        uri: sessionKeyUri,
                        nonce,
                    });
                }
                (0, misc_1.log)('getWalletSig - flow 1.3');
                // (TRY) to set walletSig to local storage
                const storeNewWalletSigOrError = (0, misc_browser_1.setStorageItem)(storageKey, JSON.stringify(walletSig));
                if (storeNewWalletSigOrError.type === 'ERROR') {
                    (0, misc_1.log)('getWalletSig - flow 1.4');
                    console.warn(`Unable to store walletSig in local storage. Not a problem. Continue...`);
                }
            }
            else {
                (0, misc_1.log)('getWalletSig - flow 2');
                try {
                    walletSig = JSON.parse(storedWalletSigOrError.result);
                    (0, misc_1.log)('getWalletSig - flow 2.1');
                }
                catch (e) {
                    console.warn('Error parsing walletSig', e);
                    (0, misc_1.log)('getWalletSig - flow 2.2');
                }
            }
            (0, misc_1.log)('getWalletSig - flow 3');
            return walletSig;
        };
        _LitNodeClientNodeJs_authCallbackAndUpdateStorageItem.set(this, async ({ authCallbackParams, authCallback, }) => {
            let authSig;
            if (authCallback) {
                authSig = await authCallback(authCallbackParams);
            }
            else {
                if (!this.defaultAuthCallback) {
                    return (0, misc_1.throwError)({
                        message: 'No default auth callback provided',
                        errorKind: constants_1.LIT_ERROR.PARAMS_MISSING_ERROR.kind,
                        errorCode: constants_1.LIT_ERROR.PARAMS_MISSING_ERROR.name,
                    });
                }
                authSig = await this.defaultAuthCallback(authCallbackParams);
            }
            // (TRY) to set walletSig to local storage
            const storeNewWalletSigOrError = (0, misc_browser_1.setStorageItem)(constants_1.LOCAL_STORAGE_KEYS.WALLET_SIGNATURE, JSON.stringify(authSig));
            if (storeNewWalletSigOrError.type === "SUCCESS" /* EITHER_TYPE.SUCCESS */) {
                return authSig;
            }
            // Setting local storage failed, try to remove the item key.
            console.warn(`Unable to store walletSig in local storage. Not a problem. Continuing to remove item key...`);
            const removeWalletSigOrError = (0, misc_browser_1.removeStorageItem)(constants_1.LOCAL_STORAGE_KEYS.WALLET_SIGNATURE);
            if (removeWalletSigOrError.type === "ERROR" /* EITHER_TYPE.ERROR */) {
                console.warn(`Unable to remove walletSig in local storage. Not a problem. Continuing...`);
            }
            return authSig;
        });
        /**
         *
         * Check if a session key needs to be resigned. These are the scenarios where a session key needs to be resigned:
         * 1. The authSig.sig does not verify successfully against the authSig.signedMessage
         * 2. The authSig.signedMessage.uri does not match the sessionKeyUri
         * 3. The authSig.signedMessage does not contain at least one session capability object
         *
         */
        this.checkNeedToResignSessionKey = async ({ authSig, sessionKeyUri, resourceAbilityRequests, }) => {
            const authSigSiweMessage = new siwe.SiweMessage(authSig.signedMessage);
            try {
                await authSigSiweMessage.validate(authSig.sig);
            }
            catch (e) {
                console.debug('Need retry because verify failed', e);
                return true;
            }
            // make sure the sig is for the correct session key
            if (authSigSiweMessage.uri !== sessionKeyUri) {
                console.debug('Need retry because uri does not match');
                return true;
            }
            // make sure the authSig contains at least one resource.
            if (!authSigSiweMessage.resources ||
                authSigSiweMessage.resources.length === 0) {
                console.debug('Need retry because empty resources');
                return true;
            }
            // make sure the authSig contains session capabilities that can be parsed.
            // TODO: we currently only support the first resource being a session capability object.
            const authSigSessionCapabilityObject = (0, auth_helpers_1.decode)(authSigSiweMessage.resources[0]);
            // make sure the authSig session capability object describes capabilities that are equal or greater than
            // the abilities requested against the resources in the resource ability requests.
            for (const resourceAbilityRequest of resourceAbilityRequests) {
                if (!authSigSessionCapabilityObject.verifyCapabilitiesForResource(resourceAbilityRequest.resource, resourceAbilityRequest.ability)) {
                    console.debug('Need retry because capabilities do not match', {
                        authSigSessionCapabilityObject,
                        resourceAbilityRequest,
                    });
                    return true;
                }
            }
            return false;
        };
        // ==================== API Calls to Nodes ====================
        /**
         *
         * Get JS Execution Shares from Nodes
         *
         * @param { JsonExecutionRequest } params
         *
         * @returns { Promise<any> }
         */
        this.getJsExecutionShares = async (url, params, requestId) => {
            const { code, ipfsId, authSig, jsParams, authMethods } = params;
            (0, misc_1.logWithRequestId)(requestId, 'getJsExecutionShares');
            // -- execute
            const urlWithPath = `${url}/web/execute`;
            if (!authSig) {
                throw new Error('authSig or sessionSig is required');
            }
            let data = {
                authSig,
                code,
                ipfsId,
                jsParams,
                authMethods,
            };
            let res = await this.sendCommandToNode({
                url: urlWithPath,
                data,
                requestId,
            });
            (0, misc_1.logWithRequestId)(requestId, `response node with url: ${url} from endpoint ${urlWithPath}`, res);
            return res;
        };
        this.getPkpSignExecutionShares = async (url, params, requestId) => {
            (0, misc_1.logWithRequestId)(requestId, 'getPkpSigningShares');
            const urlWithPath = `${url}/web/pkp/sign`;
            if (!params.authSig) {
                throw new Error('authSig is required');
            }
            return await this.sendCommandToNode({
                url: urlWithPath,
                data: params,
                requestId,
            });
        };
        this.getClaimKeyExecutionShares = async (url, params, requestId) => {
            (0, misc_1.logWithRequestId)(requestId, 'getPkpSigningShares');
            const urlWithPath = `${url}/web/pkp/claim`;
            if (!params.authMethod) {
                throw new Error('authMethod is required');
            }
            return await this.sendCommandToNode({
                url: urlWithPath,
                data: params,
                requestId,
            });
        };
        /**
         * Get Signing Shares for Token containing Access Control Condition
         *
         * @param { string } url
         * @param { SigningAccessControlConditionRequest } params
         *
         * @returns { Promise<NodeCommandResponse> }
         *
         */
        this.getSigningShareForToken = async (url, params, requestId) => {
            (0, misc_1.logWithRequestId)(requestId, 'getSigningShareForToken');
            const urlWithPath = `${url}/web/signing/access_control_condition`;
            return this.sendCommandToNode({
                url: urlWithPath,
                data: params,
                requestId,
            });
        };
        /**
         *
         * Get signature shares for decryption.
         *
         * @param url
         * @param params
         * @param requestId
         * @returns
         */
        this.getSigningShareForDecryption = async (url, params, requestId) => {
            (0, misc_1.log)('getSigningShareForDecryption');
            const urlWithPath = `${url}/web/encryption/sign`;
            return await this.sendCommandToNode({
                url: urlWithPath,
                data: params,
                requestId,
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
        this.signConditionEcdsa = async (url, params, requestId) => {
            const wrapper = async (id) => {
                (0, misc_1.log)('signConditionEcdsa');
                const urlWithPath = `${url}/web/signing/signConditionEcdsa`;
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
                    requestId: id,
                });
            };
            let res = await (0, misc_1.executeWithRetry)(wrapper, (_error, _requestid, isFinal) => {
                if (!isFinal) {
                    (0, misc_1.logError)('An error occured. attempting to retry: ');
                }
            }, this.config.retryTolerance);
            return res;
        };
        /**
         *
         * Combine Shares from network public key set and signature shares
         *
         * @param { NodeBlsSigningShare } signatureShares
         *
         * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
         *
         */
        this.combineSharesAndGetJWT = (signatureShares, requestId = '') => {
            // ========== Shares Validations ==========
            // -- sanity check
            if (!signatureShares.every((val, i, arr) => val.unsignedJwt === arr[0].unsignedJwt)) {
                const msg = 'Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things';
                (0, misc_1.logErrorWithRequestId)(requestId, msg);
            }
            // ========== Sorting ==========
            // -- sort the sig shares by share index.  this is important when combining the shares.
            signatureShares.sort((a, b) => a.shareIndex - b.shareIndex);
            // ========== Combine Shares ==========
            const signature = (0, crypto_1.combineSignatureShares)(signatureShares.map((s) => s.signatureShare));
            (0, misc_1.logWithRequestId)(requestId, 'signature is', signature);
            const unsignedJwt = (0, misc_1.mostCommonString)(signatureShares.map((s) => s.unsignedJwt));
            // ========== Result ==========
            // convert the sig to base64 and append to the jwt
            const finalJwt = `${unsignedJwt}.${(0, uint8arrays_1.uint8arrayToString)((0, uint8arrays_1.uint8arrayFromString)(signature, 'base16'), 'base64urlpad')}`;
            return finalJwt;
        };
        _LitNodeClientNodeJs_decryptWithSignatureShares.set(this, (networkPubKey, identityParam, ciphertext, signatureShares) => {
            const sigShares = signatureShares.map((s) => s.signatureShare);
            return (0, crypto_1.verifyAndDecryptWithSignatureShares)(networkPubKey, identityParam, ciphertext, sigShares);
        });
        // ========== Promise Handlers ==========
        this.getIpfsId = async ({ dataToHash, authSig, debug = false, }) => {
            const laRes = await this.executeJs({
                authSig,
                ipfsId: constants_1.LIT_ACTION_IPFS_HASH,
                authMethods: [],
                jsParams: {
                    dataToHash,
                },
                debug,
            }).catch((e) => {
                (0, misc_1.logError)('Error getting IPFS ID', e);
                throw e;
            });
            const data = JSON.parse(laRes.response).res;
            if (!data.success) {
                (0, misc_1.logError)('Error getting IPFS ID', data.data);
            }
            return data.data;
        };
        /**
         * Run lit action on a single deterministicly selected node. It's important that the nodes use the same deterministic selection algorithm.
         *
         * Lit Action: dataToHash -> IPFS CID
         * QmUjX8MW6StQ7NKNdaS6g4RMkvN5hcgtKmEi8Mca6oX4t3
         *
         * @param { ExecuteJsProps } params
         *
         * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
         *
         */
        this.runOnTargetedNodes = async (params) => {
            const { code, authMethods, authSig, jsParams, debug, sessionSigs, targetNodeRange, } = params;
            (0, misc_1.log)('running runOnTargetedNodes:', targetNodeRange);
            if (!targetNodeRange) {
                return (0, misc_1.throwError)({
                    message: 'targetNodeRange is required',
                    errorKind: constants_1.LIT_ERROR.INVALID_PARAM_TYPE.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_PARAM_TYPE.name,
                });
            }
            // determine which node to run on
            let ipfsId = await this.getIpfsId({
                dataToHash: code,
                authSig: authSig,
                debug,
            });
            // select targetNodeRange number of random index of the bootstrapUrls.length
            const randomSelectedNodeIndexes = [];
            let nodeCounter = 0;
            while (randomSelectedNodeIndexes.length < targetNodeRange) {
                const str = `${nodeCounter}:${ipfsId.toString()}`;
                const cidBuffer = Buffer.from(str);
                const hash = (0, utils_1.sha256)(cidBuffer);
                const hashAsNumber = ethers_1.BigNumber.from(hash);
                const nodeIndex = hashAsNumber
                    .mod(this.config.bootstrapUrls.length)
                    .toNumber();
                (0, misc_1.log)('nodeIndex:', nodeIndex);
                // must be unique & less than bootstrapUrls.length
                if (!randomSelectedNodeIndexes.includes(nodeIndex) &&
                    nodeIndex < this.config.bootstrapUrls.length) {
                    randomSelectedNodeIndexes.push(nodeIndex);
                }
                nodeCounter++;
            }
            (0, misc_1.log)('Final Selected Indexes:', randomSelectedNodeIndexes);
            const wrapper = async (id) => {
                const nodePromises = [];
                for (let i = 0; i < randomSelectedNodeIndexes.length; i++) {
                    // should we mix in the jsParams?  to do this, we need a canonical way to serialize the jsParams object that will be identical in rust.
                    // const jsParams = params.jsParams || {};
                    // const jsParamsString = JSON.stringify(jsParams);
                    const nodeIndex = randomSelectedNodeIndexes[i];
                    // FIXME: we are using this.config.bootstrapUrls to pick the selected node, but we
                    // should be using something like the list of nodes from the staking contract
                    // because the staking nodes can change, and the rust code will use the same list
                    const url = this.config.bootstrapUrls[nodeIndex];
                    (0, misc_1.log)(`running on node ${nodeIndex} at ${url}`);
                    const reqBody = this.getLitActionRequestBody(params);
                    // -- choose the right signature
                    const sigToPassToNode = this.getSessionOrAuthSig({
                        authSig,
                        sessionSigs,
                        url,
                    });
                    reqBody.authSig = sigToPassToNode;
                    // this return { url: string, data: JsonRequest }
                    const singleNodePromise = this.getJsExecutionShares(url, reqBody, id);
                    nodePromises.push(singleNodePromise);
                }
                const handledPromise = (await this.handleNodePromises(nodePromises, id, targetNodeRange));
                // -- handle response
                return handledPromise;
            };
            return (0, misc_1.executeWithRetry)(wrapper, (_error, _requestId, isFinal) => {
                if (!isFinal) {
                    (0, misc_1.logError)('error has occured, attempting to retry');
                }
            }, this.config.retryTolerance);
        };
        // ========== Shares Resolvers ==========
        this._getFlattenShare = (share) => {
            // flatten the signature object so that the properties of the signature are top level
            const flattenObj = Object.entries(share).map(([key, item]) => {
                if (item === null || item === undefined) {
                    return null;
                }
                const typedItem = item;
                const requiredShareProps = [
                    'sigType',
                    'dataSigned',
                    'signatureShare',
                    'shareIndex',
                    'bigR',
                    'publicKey',
                ];
                const requiredSessionSigsShareProps = [
                    ...requiredShareProps,
                    'siweMessage',
                ];
                const requiredSignatureShareProps = [
                    ...requiredShareProps,
                    'sigName',
                ];
                const hasProps = (props) => {
                    return [...props].every((prop) => typedItem[prop] !== undefined &&
                        typedItem[prop] !== null);
                };
                if (hasProps(requiredSessionSigsShareProps) ||
                    hasProps(requiredSignatureShareProps)) {
                    const bigR = typedItem.bigR ?? typedItem.bigr;
                    typedItem.signatureShare = typedItem.signatureShare.replaceAll('"', '');
                    typedItem.bigR = bigR?.replaceAll('"', '');
                    typedItem.publicKey = typedItem.publicKey.replaceAll('"', '');
                    typedItem.dataSigned = typedItem.dataSigned.replaceAll('"', '');
                    return typedItem;
                }
                return null;
            });
            // removed all null values and should only have one item
            const flattenShare = flattenObj.filter((item) => item !== null)[0];
            if (flattenShare === null || flattenShare === undefined) {
                return share;
            }
            return flattenShare;
        };
        /**
         *
         * Get signatures from signed data
         *
         * @param { Array<any> } signedData
         *
         * @returns { any }
         *
         */
        this.getSessionSignatures = (signedData) => {
            // -- prepare
            let signatures = {};
            // TOOD: get keys of signedData
            const keys = Object.keys(signedData[0]);
            // removeExtraBackslashesAndQuotes
            const sanitise = (str) => {
                // Check if str is a string and remove extra backslashes
                if (typeof str === 'string') {
                    // Remove backslashes
                    let newStr = str.replace(/\\+/g, '');
                    // Remove leading and trailing double quotes
                    newStr = newStr.replace(/^"|"$/g, '');
                    return newStr;
                }
                return str;
            };
            // -- execute
            keys.forEach((key) => {
                (0, misc_1.log)('key:', key);
                const shares = signedData.map((r) => r[key]);
                (0, misc_1.log)('shares:', shares);
                shares.sort((a, b) => a.shareIndex - b.shareIndex);
                const sigShares = shares.map((s, index) => {
                    (0, misc_1.log)('Original Share Struct:', s);
                    const share = this._getFlattenShare(s);
                    (0, misc_1.log)('share:', share);
                    if (!share) {
                        throw new Error('share is null or undefined');
                    }
                    if (!share.bigr) {
                        throw new Error(`bigR is missing in share ${index}. share ${JSON.stringify(share)}`);
                    }
                    const sanitisedBigR = sanitise(share.bigr);
                    const sanitisedSigShare = sanitise(share.publicKey);
                    (0, misc_1.log)('sanitisedBigR:', sanitisedBigR);
                    (0, misc_1.log)('sanitisedSigShare:', sanitisedSigShare);
                    return {
                        sigType: share.sigType,
                        signatureShare: sanitise(share.signatureShare),
                        shareIndex: share.shareIndex,
                        bigR: sanitise(share.bigr),
                        publicKey: share.publicKey,
                        dataSigned: share.dataSigned,
                        siweMessage: share.siweMessage,
                    };
                });
                (0, misc_1.log)('getSessionSignatures - sigShares', sigShares);
                const sigType = (0, misc_1.mostCommonString)(sigShares.map((s) => s.sigType));
                // -- validate if this.networkPubKeySet is null
                if (this.networkPubKeySet === null) {
                    (0, misc_1.throwError)({
                        message: 'networkPubKeySet cannot be null',
                        errorKind: constants_1.LIT_ERROR.PARAM_NULL_ERROR.kind,
                        errorCode: constants_1.LIT_ERROR.PARAM_NULL_ERROR.name,
                    });
                    return;
                }
                // -- validate if signature type is ECDSA
                if (sigType !== constants_1.SIGTYPE.EcdsaCaitSith &&
                    sigType !== constants_1.SIGTYPE.EcdsaK256 &&
                    sigType !== constants_1.SIGTYPE.EcdsaCAITSITHP256) {
                    (0, misc_1.throwError)({
                        message: `signature type is ${sigType} which is invalid`,
                        errorKind: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
                        errorCode: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
                    });
                    return;
                }
                const signature = (0, crypto_1.combineEcdsaShares)(sigShares);
                if (!signature.r) {
                    (0, misc_1.throwError)({
                        message: 'siganture could not be combined',
                        errorKind: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.kind,
                        errorCode: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.name,
                    });
                }
                const encodedSig = (0, utils_1.joinSignature)({
                    r: '0x' + signature.r,
                    s: '0x' + signature.s,
                    v: signature.recid,
                });
                signatures[key] = {
                    ...signature,
                    signature: encodedSig,
                    publicKey: (0, misc_1.mostCommonString)(sigShares.map((s) => s.publicKey)),
                    dataSigned: (0, misc_1.mostCommonString)(sigShares.map((s) => s.dataSigned)),
                    siweMessage: (0, misc_1.mostCommonString)(sigShares.map((s) => s.siweMessage)),
                };
            });
            return signatures;
        };
        /**
         *
         * Get signatures from signed data
         *
         * @param { Array<any> } signedData
         *
         * @returns { any }
         *
         */
        this.getSignatures = (signedData, requestId = '') => {
            const initialKeys = [...new Set(signedData.flatMap((i) => Object.keys(i)))];
            // processing signature shares for failed or invalid contents.  mutates the signedData object.
            for (const signatureResponse of signedData) {
                for (const sigName of Object.keys(signatureResponse)) {
                    const requiredFields = ['signatureShare'];
                    for (const field of requiredFields) {
                        if (!signatureResponse[sigName][field]) {
                            (0, misc_1.logWithRequestId)(requestId, `invalid field ${field} in signature share: ${sigName}, continuing with share processing`);
                            // destructive operation on the object to remove invalid shares inline, without a new collection.
                            delete signatureResponse[sigName];
                        }
                        else {
                            let share = this._getFlattenShare(signatureResponse[sigName]);
                            share = {
                                sigType: share.sigType,
                                signatureShare: share.signatureShare,
                                shareIndex: share.shareIndex,
                                bigR: share.bigR,
                                publicKey: share.publicKey,
                                dataSigned: share.dataSigned,
                                sigName: share.sigName ? share.sigName : 'sig',
                            };
                            signatureResponse[sigName] = share;
                        }
                    }
                }
            }
            const validatedSignedData = signedData;
            // -- prepare
            const signatures = {};
            // get all signature shares names from all node responses.
            // use a set to filter duplicates and copy into an array
            const allKeys = [
                ...new Set(validatedSignedData.flatMap((i) => Object.keys(i))),
            ];
            if (allKeys.length !== initialKeys.length) {
                (0, misc_1.throwError)({
                    message: 'total number of valid signatures does not match requested',
                    errorKind: constants_1.LIT_ERROR.NO_VALID_SHARES.kind,
                    errorCode: constants_1.LIT_ERROR.NO_VALID_SHARES.code,
                });
            }
            // -- combine
            for (var i = 0; i < allKeys.length; i++) {
                // here we use a map filter implementation to find common shares in each node response.
                // we then filter out undefined object from the key access.
                // currently we are unable to know the total signature count requested by the user.
                // but this allows for incomplete sets of signature shares to be aggregated
                // and then checked against threshold
                const shares = validatedSignedData
                    .map((r) => r[allKeys[i]])
                    .filter((r) => r !== undefined);
                shares.sort((a, b) => a.shareIndex - b.shareIndex);
                let sigName = shares[0].sigName;
                (0, misc_1.logWithRequestId)(requestId, `starting signature combine for sig name: ${sigName}`, shares);
                (0, misc_1.logWithRequestId)(requestId, `number of shares for ${sigName}:`, signedData.length);
                (0, misc_1.logWithRequestId)(requestId, `validated length for signature: ${sigName}`, shares.length);
                (0, misc_1.logWithRequestId)(requestId, 'minimum required shares for threshold:', this.config.minNodeCount);
                if (shares.length < this.config.minNodeCount) {
                    (0, misc_1.logErrorWithRequestId)(requestId, `not enough nodes to get the signatures.  Expected ${this.config.minNodeCount}, got ${shares.length}`);
                    (0, misc_1.throwError)({
                        message: `The total number of valid signatures shares ${shares.length} does not meet the threshold of ${this.config.minNodeCount}`,
                        errorKind: constants_1.LIT_ERROR.NO_VALID_SHARES.kind,
                        errorCode: constants_1.LIT_ERROR.NO_VALID_SHARES.code,
                        requestId,
                    });
                }
                const sigType = (0, misc_1.mostCommonString)(shares.map((s) => s.sigType));
                // -- validate if this.networkPubKeySet is null
                if (this.networkPubKeySet === null) {
                    (0, misc_1.throwError)({
                        message: 'networkPubKeySet cannot be null',
                        errorKind: constants_1.LIT_ERROR.PARAM_NULL_ERROR.kind,
                        errorCode: constants_1.LIT_ERROR.PARAM_NULL_ERROR.name,
                    });
                    return;
                }
                // -- validate if signature type is ECDSA
                if (sigType !== constants_1.SIGTYPE.EcdsaCaitSith &&
                    sigType !== constants_1.SIGTYPE.EcdsaK256 &&
                    sigType !== constants_1.SIGTYPE.EcdsaCAITSITHP256) {
                    (0, misc_1.throwError)({
                        message: `signature type is ${sigType} which is invalid`,
                        errorKind: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.kind,
                        errorCode: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_TYPE.name,
                    });
                    return;
                }
                const signature = (0, crypto_1.combineEcdsaShares)(shares);
                if (!signature.r) {
                    (0, misc_1.throwError)({
                        message: 'siganture could not be combined',
                        errorKind: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.kind,
                        errorCode: constants_1.LIT_ERROR.UNKNOWN_SIGNATURE_ERROR.name,
                    });
                }
                const encodedSig = (0, utils_1.joinSignature)({
                    r: '0x' + signature.r,
                    s: '0x' + signature.s,
                    v: signature.recid,
                });
                signatures[allKeys[i]] = {
                    ...signature,
                    signature: encodedSig,
                    publicKey: (0, misc_1.mostCommonString)(shares.map((s) => s.publicKey)),
                    dataSigned: (0, misc_1.mostCommonString)(shares.map((s) => s.dataSigned)),
                };
            }
            return signatures;
        };
        /**
         *
         * Get a single signature
         *
         * @param { Array<any> } shareData from all node promises
         *
         * @returns { string } signature
         *
         */
        this.getSignature = async (shareData, requestId) => {
            // R_x & R_y values can come from any node (they will be different per node), and will generate a valid signature
            const R_x = shareData[0].local_x;
            const R_y = shareData[0].local_y;
            const valid_shares = shareData.map((s) => s.signature_share);
            const shares = JSON.stringify(valid_shares);
            await wasmECDSA.initWasmEcdsaSdk(); // init WASM
            const signature = wasmECDSA.combine_signature(R_x, R_y, shares);
            (0, misc_1.logWithRequestId)(requestId, 'raw ecdsa sig', signature);
            return signature;
        };
        /**
         *
         * Execute JS on the nodes and combine and return any resulting signatures
         *
         * @param { ExecuteJsRequest } params
         *
         * @returns { ExecuteJsResponse }
         *
         */
        this.executeJs = async (params) => {
            // ========== Prepare Params ==========
            const { authMethods, code, ipfsId, authSig, jsParams, debug, sessionSigs, targetNodeRange, } = params;
            // ========== Validate Params ==========
            // -- validate: If it's NOT ready
            if (!this.ready) {
                const message = '1 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
                (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            const paramsIsSafe = (0, encryption_1.safeParams)({
                functionName: 'executeJs',
                params: params,
            });
            if (!paramsIsSafe) {
                return (0, misc_1.throwError)({
                    message: 'executeJs params are not valid',
                    errorKind: constants_1.LIT_ERROR.INVALID_PARAM_TYPE.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_PARAM_TYPE.name,
                });
            }
            // Call the normalizeParams function to normalize the parameters
            params = LitNodeClientNodeJs.normalizeParams(params);
            let res;
            let requestId = '';
            // -- only run on a single node
            if (targetNodeRange) {
                res = await this.runOnTargetedNodes(params);
            }
            else {
                // ========== Prepare Variables ==========
                // -- prepare request body
                const reqBody = this.getLitActionRequestBody(params);
                // ========== Get Node Promises ==========
                // -- fetch shares from nodes
                let wrapper = async (requestId) => {
                    const nodePromises = this.getNodePromises((url) => {
                        // -- choose the right signature
                        const sigToPassToNode = this.getSessionOrAuthSig({
                            authSig,
                            sessionSigs,
                            url,
                        });
                        reqBody.authSig = sigToPassToNode;
                        const shares = this.getJsExecutionShares(url, reqBody, requestId);
                        return shares;
                    });
                    // -- resolve promises
                    res = await this.handleNodePromises(nodePromises, requestId, this.connectedNodes.size);
                    return res;
                };
                res = await (0, misc_1.executeWithRetry)(wrapper, (error, requestId, isFinal) => {
                    (0, misc_1.logError)('an error occured, attempting to retry operation');
                }, this.config.retryTolerance);
                requestId = res.requestId;
            }
            // -- case: promises rejected
            if (res.success === false) {
                this._throwNodeError(res, requestId);
            }
            // -- case: promises success (TODO: check the keys of "values")
            const responseData = res.values;
            (0, misc_1.logWithRequestId)(requestId, 'executeJs responseData from node : ', JSON.stringify(responseData, null, 2));
            // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
            // we must also check for claim responses as a user may have submitted for a claim and signatures must be aggregated before returning
            if (responseData[0].success &&
                Object.keys(responseData[0].signedData).length <= 0 &&
                Object.keys(responseData[0].claimData).length <= 0) {
                return responseData[0];
            }
            // -- in the case where we are not signing anything on Lit action and using it as purely serverless function
            if (Object.keys(responseData[0].signedData).length <= 0 &&
                Object.keys(responseData[0].claimData).length <= 0) {
                return {
                    claims: {},
                    signatures: null,
                    decryptions: [],
                    response: responseData[0].response,
                    logs: responseData[0].logs,
                };
            }
            // ========== Extract shares from response data ==========
            // -- 1. combine signed data as a list, and get the signatures from it
            const signedDataList = responseData.map((r) => {
                const { signedData } = r;
                for (const key of Object.keys(signedData)) {
                    for (const subkey of Object.keys(signedData[key])) {
                        //@ts-ignore
                        if (typeof signedData[key][subkey] === 'string') {
                            //@ts-ignore
                            signedData[key][subkey] = signedData[key][subkey].replaceAll('"', '');
                        }
                    }
                }
                return signedData;
            });
            (0, misc_1.logWithRequestId)(requestId, 'signatures shares to combine: ', signedDataList);
            const signatures = this.getSignatures(signedDataList, requestId);
            // -- 2. combine responses as a string, and get parse it as JSON
            let response = (0, misc_1.mostCommonString)(responseData.map((r) => r.response));
            response = this.parseResponses(response);
            // -- 3. combine logs
            const mostCommonLogs = (0, misc_1.mostCommonString)(responseData.map((r) => r.logs));
            // -- 4. combine claims
            const claimsList = responseData
                .map((r) => {
                const { claimData } = r;
                if (claimData) {
                    for (const key of Object.keys(claimData)) {
                        for (const subkey of Object.keys(claimData[key])) {
                            if (typeof claimData[key][subkey] == 'string') {
                                claimData[key][subkey] = claimData[key][subkey].replaceAll('"', '');
                            }
                        }
                    }
                    return claimData;
                }
                return null;
            })
                .filter((item) => item !== null);
            // logWithRequestId(requestId, 'claimList:', claimsList);
            let claims = undefined;
            if (claimsList.length > 0) {
                claims = LitNodeClientNodeJs.getClaims(claimsList);
            }
            // ========== Result ==========
            const returnVal = {
                claims,
                signatures,
                decryptions: [],
                response,
                logs: mostCommonLogs,
            };
            (0, misc_1.log)('returnVal:', returnVal);
            // -- case: debug mode
            if (debug) {
                const allNodeResponses = responseData.map((r) => r.response);
                const allNodeLogs = responseData.map((r) => r.logs);
                returnVal.debug = {
                    allNodeResponses,
                    allNodeLogs,
                    rawNodeHTTPResponses: responseData,
                };
            }
            return returnVal;
        };
        this.pkpSign = async (params) => {
            let { authSig, sessionSigs, toSign, pubKey, authMethods } = params;
            pubKey = (0, misc_1.hexPrefixed)(pubKey);
            // -- validate required params
            ['toSign', 'pubKey'].forEach((key) => {
                if (!params[key]) {
                    (0, misc_1.throwError)({
                        message: `"${key}" cannot be undefined, empty, or null. Please provide a valid value.`,
                        errorKind: constants_1.LIT_ERROR.PARAM_NULL_ERROR.kind,
                        errorCode: constants_1.LIT_ERROR.PARAM_NULL_ERROR.name,
                    });
                }
            });
            // -- validate present of accepted auth methods
            if (!authSig && !sessionSigs && (!authMethods || authMethods.length <= 0)) {
                (0, misc_1.throwError)({
                    message: `Either authSig, sessionSigs, or authMethods (length > 0) must be present.`,
                    errorKind: constants_1.LIT_ERROR.PARAM_NULL_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.PARAM_NULL_ERROR.name,
                });
            }
            // the nodes will only accept a normal array type as a paramater due to serizalization issues with Uint8Array type.
            // this loop below is to normalize the message to a basic array.
            const arr = [];
            for (let i = 0; i < toSign.length; i++) {
                arr.push(toSign[i]);
            }
            toSign = arr;
            const wrapper = async (id) => {
                const nodePromises = this.getNodePromises((url) => {
                    // -- choose the right signature
                    const sigToPassToNode = this.getSessionOrAuthSig({
                        authSig,
                        sessionSigs,
                        url,
                        mustHave: false,
                    });
                    (0, misc_1.logWithRequestId)(id, 'sigToPassToNode:', sigToPassToNode);
                    const reqBody = {
                        toSign,
                        pubkey: pubKey,
                        ...(sigToPassToNode &&
                            sigToPassToNode !== undefined && { authSig: sigToPassToNode }),
                        authMethods,
                    };
                    (0, misc_1.logWithRequestId)(id, 'reqBody:', reqBody);
                    return this.getPkpSignExecutionShares(url, reqBody, id);
                });
                const res = await this.handleNodePromises(nodePromises, id, this.connectedNodes.size // ECDSA requires responses from all nodes, but only shares from minNodeCount.
                );
                return res;
            };
            const res = await (0, misc_1.executeWithRetry)(wrapper, (error, requestId, isFinal) => {
                if (!isFinal) {
                    (0, misc_1.logError)('errror occured, retrying operation');
                }
            }, this.config.retryTolerance);
            const requestId = res.requestId;
            // -- case: promises rejected
            if (!res.success) {
                this._throwNodeError(res, requestId);
            }
            // -- case: promises success (TODO: check the keys of "values")
            const responseData = res.values;
            (0, misc_1.logWithRequestId)(requestId, 'responseData', JSON.stringify(responseData, null, 2));
            // ========== Extract shares from response data ==========
            // -- 1. combine signed data as a list, and get the signatures from it
            const signedDataList = responseData.map((r) => {
                // add the signed data to the signature share
                delete r.signatureShare.result;
                // nodes do not camel case the response from /web/pkp/sign.
                const snakeToCamel = (s) => s.replace(/(_\w)/g, (k) => k[1].toUpperCase());
                //@ts-ignore
                const convertShare = (share) => {
                    const keys = Object.keys(share);
                    let convertedShare = {};
                    for (const key of keys) {
                        convertedShare = Object.defineProperty(convertedShare, snakeToCamel(key), Object.getOwnPropertyDescriptor(share, key));
                    }
                    return convertedShare;
                };
                const convertedShare = convertShare(r.signatureShare);
                const keys = Object.keys(convertedShare);
                for (const key of keys) {
                    //@ts-ignore
                    if (typeof convertedShare[key] === 'string') {
                        //@ts-ignore
                        convertedShare[key] = convertedShare[key]
                            .replace('"', '')
                            .replace('"', '');
                    }
                }
                //@ts-ignore
                convertedShare.dataSigned = convertedShare.digest;
                return {
                    signature: convertedShare,
                };
            });
            const signatures = this.getSignatures(signedDataList, requestId);
            (0, misc_1.logWithRequestId)(requestId, `signature combination`, signatures);
            return signatures.signature; // only a single signature is ever present, so we just return it.
        };
        /**
         *
         * Request a signed JWT from the LIT network. Before calling this function, you must know the access control conditions for the item you wish to gain authorization for.
         *
         * @param { GetSignedTokenRequest } params
         *
         * @returns { Promise<string> } final JWT
         *
         */
        this.getSignedToken = async (params) => {
            // ========== Prepare Params ==========
            const { chain, authSig, sessionSigs } = params;
            // ========== Validation ==========
            // -- validate if it's ready
            if (!this.ready) {
                const message = '3 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
                (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            // -- validate if this.networkPubKeySet is null
            if (this.networkPubKeySet === null) {
                return (0, misc_1.throwError)({
                    message: 'networkPubKeySet cannot be null',
                    errorKind: constants_1.LIT_ERROR.PARAM_NULL_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.PARAM_NULL_ERROR.name,
                });
            }
            const paramsIsSafe = (0, encryption_1.safeParams)({
                functionName: 'getSignedToken',
                params,
            });
            if (!paramsIsSafe) {
                return (0, misc_1.throwError)({
                    message: `Parameter validation failed.`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            // ========== Prepare ==========
            // we need to send jwt params iat (issued at) and exp (expiration)
            // because the nodes may have different wall clock times
            // the nodes will verify that these params are withing a grace period
            const { iat, exp } = this.getJWTParams();
            // ========== Formatting Access Control Conditions =========
            const { error, formattedAccessControlConditions, formattedEVMContractConditions, formattedSolRpcConditions, formattedUnifiedAccessControlConditions, } = this.getFormattedAccessControlConditions(params);
            if (error) {
                return (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            // ========== Get Node Promises ==========
            const wrapper = async (id) => {
                const nodePromises = this.getNodePromises((url) => {
                    // -- if session key is available, use it
                    const authSigToSend = sessionSigs ? sessionSigs[url] : authSig;
                    return this.getSigningShareForToken(url, {
                        accessControlConditions: formattedAccessControlConditions,
                        evmContractConditions: formattedEVMContractConditions,
                        solRpcConditions: formattedSolRpcConditions,
                        unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
                        chain,
                        authSig: authSigToSend,
                        iat,
                        exp,
                    }, id);
                });
                // -- resolve promises
                const res = await this.handleNodePromises(nodePromises, id, this.config.minNodeCount);
                return res;
            };
            const res = await (0, misc_1.executeWithRetry)(wrapper, (error, requestId, isFinal) => {
                if (!isFinal) {
                    (0, misc_1.logError)('an error occured, attempting to retry ');
                }
            }, this.config.retryTolerance);
            const requestId = res.requestId;
            // -- case: promises rejected
            if (res.success === false) {
                this._throwNodeError(res, requestId);
            }
            const signatureShares = res.values;
            (0, misc_1.log)('signatureShares', signatureShares);
            // ========== Result ==========
            const finalJwt = this.combineSharesAndGetJWT(signatureShares, requestId);
            return finalJwt;
        };
        /**
         *
         * Encrypt data using the LIT network public key.
         *
         */
        this.encrypt = async (params) => {
            // ========== Validate Params ==========
            // -- validate if it's ready
            if (!this.ready) {
                const message = '6 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
                (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            // -- validate if this.subnetPubKey is null
            if (!this.subnetPubKey) {
                const message = 'subnetPubKey cannot be null';
                return (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            const paramsIsSafe = (0, encryption_1.safeParams)({
                functionName: 'encrypt',
                params,
            });
            if (!paramsIsSafe) {
                return (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            // ========== Validate Access Control Conditions Schema ==========
            await this.validateAccessControlConditionsSchema(params);
            // ========== Hashing Access Control Conditions =========
            // hash the access control conditions
            const hashOfConditions = await this.getHashedAccessControlConditions(params);
            if (!hashOfConditions) {
                return (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            const hashOfConditionsStr = (0, uint8arrays_1.uint8arrayToString)(new Uint8Array(hashOfConditions), 'base16');
            // ========== Hashing Private Data ==========
            // hash the private data
            const hashOfPrivateData = await crypto.subtle.digest('SHA-256', params.dataToEncrypt);
            const hashOfPrivateDataStr = (0, uint8arrays_1.uint8arrayToString)(new Uint8Array(hashOfPrivateData), 'base16');
            // ========== Assemble identity parameter ==========
            const identityParam = tslib_1.__classPrivateFieldGet(this, _LitNodeClientNodeJs_getIdentityParamForEncryption, "f").call(this, hashOfConditionsStr, hashOfPrivateDataStr);
            // ========== Encrypt ==========
            const ciphertext = (0, crypto_1.encrypt)(this.subnetPubKey, params.dataToEncrypt, (0, uint8arrays_1.uint8arrayFromString)(identityParam, 'utf8'));
            return { ciphertext, dataToEncryptHash: hashOfPrivateDataStr };
        };
        /**
         *
         * Decrypt ciphertext with the LIT network.
         *
         */
        this.decrypt = async (params) => {
            const { authSig, sessionSigs, chain, ciphertext, dataToEncryptHash } = params;
            // ========== Validate Params ==========
            // -- validate if it's ready
            if (!this.ready) {
                const message = '6 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
                (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            // -- validate if this.subnetPubKey is null
            if (!this.subnetPubKey) {
                const message = 'subnetPubKey cannot be null';
                return (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            const paramsIsSafe = (0, encryption_1.safeParams)({
                functionName: 'decrypt',
                params,
            });
            if (!paramsIsSafe) {
                return (0, misc_1.throwError)({
                    message: `Parameter validation failed.`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            // ========== Hashing Access Control Conditions =========
            // hash the access control conditions
            let hashOfConditions = await this.getHashedAccessControlConditions(params);
            if (!hashOfConditions) {
                return (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            const hashOfConditionsStr = (0, uint8arrays_1.uint8arrayToString)(new Uint8Array(hashOfConditions), 'base16');
            // ========== Formatting Access Control Conditions =========
            const { error, formattedAccessControlConditions, formattedEVMContractConditions, formattedSolRpcConditions, formattedUnifiedAccessControlConditions, } = this.getFormattedAccessControlConditions(params);
            if (error) {
                (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            // ========== Assemble identity parameter ==========
            const identityParam = tslib_1.__classPrivateFieldGet(this, _LitNodeClientNodeJs_getIdentityParamForEncryption, "f").call(this, hashOfConditionsStr, dataToEncryptHash);
            (0, misc_1.log)('identityParam', identityParam);
            // ========== Get Network Signature ==========
            const wrapper = async (id) => {
                const nodePromises = this.getNodePromises((url) => {
                    // -- if session key is available, use it
                    let authSigToSend = sessionSigs ? sessionSigs[url] : authSig;
                    return this.getSigningShareForDecryption(url, {
                        accessControlConditions: formattedAccessControlConditions,
                        evmContractConditions: formattedEVMContractConditions,
                        solRpcConditions: formattedSolRpcConditions,
                        unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
                        dataToEncryptHash,
                        chain,
                        authSig: authSigToSend,
                    }, id);
                });
                // -- resolve promises
                const res = await this.handleNodePromises(nodePromises, id, this.config.minNodeCount);
                return res;
            };
            const res = await (0, misc_1.executeWithRetry)(wrapper, (_error, _requestId, _isFinal) => {
                (0, misc_1.logError)('an error occured attempting to retry');
            }, this.config.retryTolerance);
            const requestId = res.requestId;
            // -- case: promises rejected
            if (res.success === false) {
                this._throwNodeError(res, requestId);
            }
            const signatureShares = res.values;
            (0, misc_1.logWithRequestId)(requestId, 'signatureShares', signatureShares);
            // ========== Result ==========
            const decryptedData = tslib_1.__classPrivateFieldGet(this, _LitNodeClientNodeJs_decryptWithSignatureShares, "f").call(this, this.subnetPubKey, (0, uint8arrays_1.uint8arrayFromString)(identityParam, 'utf8'), ciphertext, signatureShares);
            return { decryptedData };
        };
        this.getLitResourceForEncryption = async (params) => {
            // ========== Hashing Access Control Conditions =========
            // hash the access control conditions
            let hashOfConditions = await this.getHashedAccessControlConditions(params);
            if (!hashOfConditions) {
                return (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            const hashOfConditionsStr = (0, uint8arrays_1.uint8arrayToString)(new Uint8Array(hashOfConditions), 'base16');
            // ========== Hashing Private Data ==========
            // hash the private data
            const hashOfPrivateData = await crypto.subtle.digest('SHA-256', params.dataToEncrypt);
            const hashOfPrivateDataStr = (0, uint8arrays_1.uint8arrayToString)(new Uint8Array(hashOfPrivateData), 'base16');
            return new auth_helpers_1.LitAccessControlConditionResource(`${hashOfConditionsStr}/${hashOfPrivateDataStr}`);
        };
        _LitNodeClientNodeJs_getIdentityParamForEncryption.set(this, (hashOfConditionsStr, hashOfPrivateDataStr) => {
            return new auth_helpers_1.LitAccessControlConditionResource(`${hashOfConditionsStr}/${hashOfPrivateDataStr}`).getResourceKey();
        });
        /**
         *
         * Validates a condition, and then signs the condition if the validation returns true.
         * Before calling this function, you must know the on chain conditions that you wish to validate.
         *
         * @param { ValidateAndSignECDSA } params
         *
         * @returns { Promise<string> }
         */
        this.validateAndSignEcdsa = async (params) => {
            // ========== Validate Params ==========
            // -- validate if it's ready
            if (!this.ready) {
                const message = '7 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
                (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
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
                return (0, misc_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions`,
                    errorKind: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ARGUMENT_EXCEPTION.name,
                });
            }
            // -- formatted access control conditions
            let formattedAccessControlConditions;
            formattedAccessControlConditions = accessControlConditions.map((c) => (0, access_control_conditions_1.canonicalAccessControlConditionFormatter)(c));
            (0, misc_1.log)('formattedAccessControlConditions', JSON.stringify(formattedAccessControlConditions));
            // ========== Node Promises ==========
            const wrapper = async (id) => {
                const nodePromises = this.getNodePromises((url) => {
                    return this.signConditionEcdsa(url, {
                        accessControlConditions: formattedAccessControlConditions,
                        evmContractConditions: undefined,
                        solRpcConditions: undefined,
                        auth_sig,
                        chain,
                        iat,
                        exp,
                    }, id);
                });
                // ----- Resolve Promises -----
                const responses = await this.handleNodePromises(nodePromises, id, this.connectedNodes.size);
                return responses;
            };
            let res = await (0, misc_1.executeWithRetry)(wrapper, (_error, _requestId, isFinal) => {
                if (!isFinal) {
                    (0, misc_1.logError)('an error has occured, attempting to retry ');
                }
            }, this.config.retryTolerance);
            const requestId = res.requestId;
            // return the first value as this will be the signature data
            try {
                if (res.success === false) {
                    return 'Condition Failed';
                }
                const shareData = res.values;
                const signature = this.getSignature(shareData, requestId);
                return signature;
            }
            catch (e) {
                (0, misc_1.logErrorWithRequestId)(requestId, 'Error - signed_ecdsa_messages - ', e);
                const signed_ecdsa_message = res;
                // have to cast to any to keep with above `string` return value
                // this will be returned as `RejectedNodePromise`
                return signed_ecdsa_message;
            }
        };
        /** ============================== SESSION ============================== */
        /**
         * Sign a session public key using a PKP, which generates an authSig.
         * @returns {Object} An object containing the resulting signature.
         */
        this.signSessionKey = async (params) => {
            // ========== Validate Params ==========
            // -- validate: If it's NOT ready
            if (!this.ready) {
                const message = '8 LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
                (0, misc_1.throwError)({
                    message,
                    errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
                });
            }
            // -- construct SIWE message that will be signed by node to generate an authSig.
            const _expiration = params.expiration ||
                new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            // Try to get it from local storage, if not generates one~
            const sessionKey = params.sessionKey ?? this.getSessionKey();
            const sessionKeyUri = constants_1.LIT_SESSION_KEY_URI + sessionKey.publicKey;
            // Compute the address from the public key if it's provided. Otherwise, the node will compute it.
            const pkpEthAddress = (function () {
                if (params.pkpPublicKey)
                    return (0, transactions_1.computeAddress)(params.pkpPublicKey);
                // This will be populated by the node, using dummy value for now.
                return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
            })();
            let siwe_statement = 'Lit Protocol PKP session signature';
            if (!!params.statement) {
                siwe_statement += ' ' + params.statement;
            }
            let siweMessage;
            if (params?.resourceAbilityRequests) {
                const resources = params.resourceAbilityRequests.map((r) => r.resource);
                const recapObject = await this.generateSessionCapabilityObjectWithWildcards(resources);
                params.resourceAbilityRequests.forEach((r) => {
                    recapObject.addCapabilityForResource(r.resource, r.ability);
                    const verified = recapObject.verifyCapabilitiesForResource(r.resource, r.ability);
                    if (!verified) {
                        throw new Error('Failed to verify capabilities for resource');
                    }
                });
                // regular siwe
                siweMessage = new siwe.SiweMessage({
                    domain: params?.domain || globalThis.location?.host || 'litprotocol.com',
                    address: pkpEthAddress,
                    statement: siwe_statement,
                    uri: sessionKeyUri,
                    version: '1',
                    chainId: params.chainId ?? 1,
                    expirationTime: _expiration,
                    resources: params.resources,
                    nonce: this.latestBlockhash,
                });
                siweMessage = recapObject.addToSiweMessage(siweMessage);
            }
            else {
                // lit-siwe (NOT regular siwe)
                siweMessage = new siwe.SiweMessage({
                    domain: params?.domain || globalThis.location?.host || 'litprotocol.com',
                    address: pkpEthAddress,
                    statement: siwe_statement,
                    uri: sessionKeyUri,
                    version: '1',
                    chainId: params.chainId ?? 1,
                    expirationTime: _expiration,
                    resources: params.resources,
                    nonce: this.latestBlockhash,
                });
            }
            const siweMessageStr = siweMessage.prepareMessage();
            // ========== Get Node Promises ==========
            // -- fetch shares from nodes
            const body = {
                sessionKey: sessionKeyUri,
                authMethods: params.authMethods,
                pkpPublicKey: params.pkpPublicKey,
                ...(params?.authSig && { authSig: params.authSig }),
                // authSig: params.authSig,
                siweMessage: siweMessageStr,
            };
            const wrapper = async (id) => {
                (0, misc_1.logWithRequestId)(id, 'signSessionKey body', body);
                const nodePromises = this.getNodePromises((url) => {
                    return this.getSignSessionKeyShares(url, {
                        body,
                    }, id);
                });
                // -- resolve promises
                let res;
                try {
                    res = await this.handleNodePromises(nodePromises, id, this.connectedNodes.size);
                    (0, misc_1.log)('signSessionKey node promises:', res);
                }
                catch (e) {
                    throw new Error(`Error when handling node promises: ${e}`);
                }
                return res;
            };
            const res = await (0, misc_1.executeWithRetry)(wrapper, (_error, _requestId, isFinal) => {
                if (!isFinal) {
                    (0, misc_1.logError)('an error occured, attempting to retry ');
                }
            }, this.config.retryTolerance);
            const requestId = res.requestId;
            (0, misc_1.logWithRequestId)(requestId, 'handleNodePromises res:', res);
            // -- case: promises rejected
            if (!tslib_1.__classPrivateFieldGet(this, _LitNodeClientNodeJs_isSuccessNodePromises, "f").call(this, res)) {
                this._throwNodeError(res, requestId);
                return {};
            }
            const responseData = res.values;
            (0, misc_1.logWithRequestId)(requestId, 'responseData', JSON.stringify(responseData, null, 2));
            // ========== Extract shares from response data ==========
            // -- 1. combine signed data as a list, and get the signatures from it
            const signedDataList = responseData.map((r) => r.signedData);
            (0, misc_1.logWithRequestId)(requestId, 'signedDataList', signedDataList);
            // -- checking if we have enough shares
            const validatedSignedDataList = signedDataList
                .map((signedData) => {
                const sessionSig = signedData['sessionSig'];
                // each of this field cannot be empty
                const requiredFields = [
                    'sigType',
                    'dataSigned',
                    'signatureShare',
                    'bigr',
                    'publicKey',
                    'sigName',
                    'siweMessage',
                ];
                // check if all required fields are present
                for (const field of requiredFields) {
                    if (!sessionSig[field] || sessionSig[field] === '') {
                        (0, misc_1.log)(`Invalid signed data. ${field} is missing. Not a problem, we only need ${this.config.minNodeCount} nodes to sign the session key.`);
                        return null;
                    }
                }
                return signedData;
            })
                .filter((item) => item !== null);
            (0, misc_1.logWithRequestId)(requestId, 'requested length:', signedDataList.length);
            (0, misc_1.logWithRequestId)(requestId, 'validated length:', validatedSignedDataList.length);
            (0, misc_1.logWithRequestId)(requestId, 'minimum required length:', this.config.minNodeCount);
            if (validatedSignedDataList.length < this.config.minNodeCount) {
                throw new Error(`not enough nodes signed the session key.  Expected ${this.config.minNodeCount}, got ${validatedSignedDataList.length}`);
            }
            const signatures = this.getSessionSignatures(validatedSignedDataList);
            const { sessionSig } = signatures;
            return {
                authSig: {
                    sig: sessionSig.signature,
                    derivedVia: 'web3.eth.personal.sign via Lit PKP',
                    signedMessage: sessionSig.siweMessage,
                    address: (0, transactions_1.computeAddress)('0x' + sessionSig.publicKey),
                },
                pkpPublicKey: sessionSig.publicKey,
            };
        };
        _LitNodeClientNodeJs_isSuccessNodePromises.set(this, (res) => {
            return res.success === true;
        });
        this.getSignSessionKeyShares = async (url, params, requestId) => {
            (0, misc_1.log)('getSignSessionKeyShares');
            const urlWithPath = `${url}/web/sign_session_key`;
            return await this.sendCommandToNode({
                url: urlWithPath,
                data: params.body,
                requestId,
            });
        };
        this.generateAuthMethodForWebAuthn = (params) => ({
            authMethodType: constants_1.AUTH_METHOD_TYPE_IDS.WEBAUTHN,
            accessToken: JSON.stringify(params),
        });
        this.generateAuthMethodForDiscord = (access_token) => ({
            authMethodType: constants_1.AUTH_METHOD_TYPE_IDS.DISCORD,
            accessToken: access_token,
        });
        this.generateAuthMethodForGoogle = (access_token) => ({
            authMethodType: constants_1.AUTH_METHOD_TYPE_IDS.GOOGLE,
            accessToken: access_token,
        });
        this.generateAuthMethodForGoogleJWT = (access_token) => ({
            authMethodType: constants_1.AUTH_METHOD_TYPE_IDS.GOOGLE_JWT,
            accessToken: access_token,
        });
        /**
         * Get session signatures for a set of resources
         *
         * High level, how this works:
         * 1. Generate or retrieve session key
         * 2. Generate or retrieve the wallet signature of the session key
         * 3. Sign the specific resources with the session key
         *
         * Note: When generating session signatures for different PKPs or auth methods,
         * be sure to call disconnectWeb3 to clear auth signatures stored in local storage
         *
         * @param { GetSessionSigsProps } params
         */
        this.getSessionSigs = async (params) => {
            // -- prepare
            // Try to get it from local storage, if not generates one~
            const sessionKey = params.sessionKey ?? this.getSessionKey();
            const sessionKeyUri = this.getSessionKeyUri(sessionKey.publicKey);
            // First get or generate the session capability object for the specified resources.
            const sessionCapabilityObject = params.sessionCapabilityObject
                ? params.sessionCapabilityObject
                : await this.generateSessionCapabilityObjectWithWildcards(params.resourceAbilityRequests.map((r) => r.resource));
            const expiration = params.expiration || LitNodeClientNodeJs.getExpiration();
            if (!this.latestBlockhash) {
                (0, misc_1.throwError)({
                    message: 'Eth Blockhash is undefined.',
                    errorKind: constants_1.LIT_ERROR.INVALID_ETH_BLOCKHASH.kind,
                    errorCode: constants_1.LIT_ERROR.INVALID_ETH_BLOCKHASH.name,
                });
            }
            const nonce = this.latestBlockhash;
            // -- (TRY) to get the wallet signature
            let authSig = await this.getWalletSig({
                authNeededCallback: params.authNeededCallback,
                chain: params.chain,
                sessionCapabilityObject,
                switchChain: params.switchChain,
                expiration: expiration,
                sessionKeyUri: sessionKeyUri,
                nonce,
            });
            const needToResignSessionKey = await this.checkNeedToResignSessionKey({
                authSig,
                sessionKeyUri,
                resourceAbilityRequests: params.resourceAbilityRequests,
            });
            // console.log('XXX needToResignSessionKey:', needToResignSessionKey);
            // -- (CHECK) if we need to resign the session key
            if (needToResignSessionKey) {
                (0, misc_1.log)('need to re-sign session key.  Signing...');
                authSig = await tslib_1.__classPrivateFieldGet(this, _LitNodeClientNodeJs_authCallbackAndUpdateStorageItem, "f").call(this, {
                    authCallback: params.authNeededCallback,
                    authCallbackParams: {
                        chain: params.chain,
                        statement: sessionCapabilityObject.statement,
                        resources: [sessionCapabilityObject.encodeAsSiweResource()],
                        switchChain: params.switchChain,
                        expiration,
                        uri: sessionKeyUri,
                        nonce,
                        resourceAbilityRequests: params.resourceAbilityRequests,
                    },
                });
            }
            if (authSig.address === '' ||
                authSig.derivedVia === '' ||
                authSig.sig === '' ||
                authSig.signedMessage === '') {
                (0, misc_1.throwError)({
                    message: 'No wallet signature found',
                    errorKind: constants_1.LIT_ERROR.WALLET_SIGNATURE_NOT_FOUND_ERROR.kind,
                    errorCode: constants_1.LIT_ERROR.WALLET_SIGNATURE_NOT_FOUND_ERROR.name,
                });
                // @ts-ignore - we throw an error above, so below should never be reached
                return;
            }
            // ===== AFTER we have Valid Signed Session Key =====
            // - Let's sign the resources with the session key
            // - 5 minutes is the default expiration for a session signature
            // - Because we can generate a new session sig every time the user wants to access a resource without prompting them to sign with their wallet
            const sessionExpiration = new Date(Date.now() + 1000 * 60 * 5);
            const capabilities = params.capacityDelegationAuthSig
                ? [params.capacityDelegationAuthSig, authSig]
                : [authSig];
            // const capabilities = params.capacityDelegationAuthSig ? [authSig, params.capacityDelegationAuthSig] : [authSig];
            // console.log('capabilities:', capabilities);
            const signingTemplate = {
                sessionKey: sessionKey.publicKey,
                resourceAbilityRequests: params.resourceAbilityRequests,
                capabilities,
                issuedAt: new Date().toISOString(),
                expiration: sessionExpiration.toISOString(),
            };
            const signatures = {};
            this.connectedNodes.forEach((nodeAddress) => {
                const toSign = {
                    ...signingTemplate,
                    nodeAddress,
                };
                const signedMessage = JSON.stringify(toSign);
                // sanitise signedMessage, replace //n with /n
                // signedMessage = signedMessage.replaceAll(/\/\/n/g, '/n');
                // console.log('XX signedMessage:', signedMessage);
                const uint8arrayKey = (0, uint8arrays_1.uint8arrayFromString)(sessionKey.secretKey, 'base16');
                const uint8arrayMessage = (0, uint8arrays_1.uint8arrayFromString)(signedMessage, 'utf8');
                const signature = nacl_1.nacl.sign.detached(uint8arrayMessage, uint8arrayKey);
                // log("signature", signature);
                signatures[nodeAddress] = {
                    sig: (0, uint8arrays_1.uint8arrayToString)(signature, 'base16'),
                    derivedVia: 'litSessionSignViaNacl',
                    signedMessage: signedMessage,
                    address: sessionKey.publicKey,
                    algo: 'ed25519',
                };
            });
            (0, misc_1.log)('signatures:', signatures);
            return signatures;
        };
        /**
         *
         * Get Session Key URI eg. lit:session:0x1234
         *
         * @param publicKey is the public key of the session key
         * @returns { string } the session key uri
         */
        this.getSessionKeyUri = (publicKey) => {
            return constants_1.LIT_SESSION_KEY_URI + publicKey;
        };
        // -- initialize default auth callback
        this.defaultAuthCallback = args?.defaultAuthCallback;
    }
    /**
     * Check if a given object is of type SessionKeyPair.
     *
     * @param obj - The object to check.
     * @returns True if the object is of type SessionKeyPair.
     */
    isSessionKeyPair(obj) {
        return (typeof obj === 'object' &&
            'publicKey' in obj &&
            'secretKey' in obj &&
            typeof obj.publicKey === 'string' &&
            typeof obj.secretKey === 'string');
    }
    /**
     * Generates wildcard capability for each of the LIT resources
     * specified.
     * @param litResources is an array of LIT resources
     * @param addAllCapabilities is a boolean that specifies whether to add all capabilities for each resource
     */
    static async generateSessionCapabilityObjectWithWildcards(litResources, addAllCapabilities, rateLimitAuthSig) {
        const sessionCapabilityObject = new auth_helpers_1.RecapSessionCapabilityObject({}, []);
        // disable for now
        const _addAllCapabilities = addAllCapabilities ?? false;
        if (_addAllCapabilities) {
            for (const litResource of litResources) {
                sessionCapabilityObject.addAllCapabilitiesForResource(litResource);
            }
        }
        if (rateLimitAuthSig) {
            throw new Error('Not implemented yet.');
            // await sessionCapabilityObject.addRateLimitAuthSig(rateLimitAuthSig);
        }
        return sessionCapabilityObject;
    }
    // backward compatibility
    async generateSessionCapabilityObjectWithWildcards(litResources
    // rateLimitAuthSig?: AuthSig
    ) {
        // if (rateLimitAuthSig) {
        //   return await LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards(
        //     litResources,
        //     rateLimitAuthSig
        //   );
        // }
        return await LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards(litResources);
    }
    // ========== Scoped Business Logics ==========
    // Normalize the data to a basic array
    static normalizeParams(params) {
        if (!params.jsParams) {
            params.jsParams = {};
            return params;
        }
        for (const key of Object.keys(params.jsParams)) {
            if (Array.isArray(params.jsParams[key]) ||
                ArrayBuffer.isView(params.jsParams[key])) {
                const arr = [];
                for (let i = 0; i < params.jsParams[key].length; i++) {
                    arr.push(params.jsParams[key][i]);
                }
                params.jsParams[key] = arr;
            }
        }
        return params;
    }
    /**
     * Authenticates an Auth Method for claiming a Programmable Key Pair (PKP).
     * A {@link MintCallback} can be defined for custom on chain interactions
     * by default the callback will forward to a relay server for minting on chain.
     * @param {ClaimKeyRequest} params an Auth Method and {@link MintCallback}
     * @returns {Promise<ClaimKeyResponse>}
     */
    async claimKeyId(params) {
        if (!this.ready) {
            const message = 'LitNodeClient is not ready.  Please call await litNodeClient.connect() first.';
            (0, misc_1.throwError)({
                message,
                errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
            });
        }
        if (params.authMethod.authMethodType == constants_1.AuthMethodType.WebAuthn) {
            (0, misc_1.throwError)({
                message: 'Unsupported auth method type. Webauthn, and Lit Actions are not supported for claiming',
                errorKind: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.kind,
                errorCode: constants_1.LIT_ERROR.LIT_NODE_CLIENT_NOT_READY_ERROR.name,
            });
        }
        let requestId;
        const wrapper = async (id) => {
            const nodePromises = await this.getNodePromises((url) => {
                const nodeRequestParams = {
                    authMethod: params.authMethod,
                };
                return this.getClaimKeyExecutionShares(url, nodeRequestParams, id);
            });
            const responseData = await this.handleNodePromises(nodePromises, id, this.connectedNodes.size);
            return responseData;
        };
        let responseData = await (0, misc_1.executeWithRetry)(wrapper, (_error, _requestId, isFinal) => {
            if (!isFinal) {
                (0, misc_1.logError)('an error occured, attempting to retry');
            }
        }, this.config.retryTolerance);
        requestId = responseData.requestId;
        if (responseData.success === true) {
            const nodeSignatures = responseData.values.map((r) => {
                const sig = ethers_1.ethers.utils.splitSignature(`0x${r.signature}`);
                return {
                    r: sig.r,
                    s: sig.s,
                    v: sig.v,
                };
            });
            (0, misc_1.logWithRequestId)(requestId, `responseData: ${JSON.stringify(responseData, null, 2)}`);
            const derivedKeyId = responseData.values[0]
                .derivedKeyId;
            const pubkey = this.computeHDPubKey(derivedKeyId);
            (0, misc_1.logWithRequestId)(requestId, `pubkey ${pubkey} derived from key id ${derivedKeyId}`);
            const relayParams = params;
            let mintTx = '';
            if (params.mintCallback && 'signer' in params) {
                mintTx = await params.mintCallback({
                    derivedKeyId,
                    authMethodType: params.authMethod.authMethodType,
                    signatures: nodeSignatures,
                    pubkey,
                    signer: params.signer,
                    ...relayParams,
                }, this.config.litNetwork);
            }
            else {
                mintTx = await (0, misc_1.defaultMintClaimCallback)({
                    derivedKeyId,
                    authMethodType: params.authMethod.authMethodType,
                    signatures: nodeSignatures,
                    pubkey,
                    ...relayParams,
                }, this.config.litNetwork);
            }
            return {
                signatures: nodeSignatures,
                claimedKeyId: derivedKeyId,
                pubkey,
                mintTx,
            };
        }
        else {
            return (0, misc_1.throwError)({
                message: `Claim request has failed. Request trace id: lit_${requestId} `,
                errorKind: constants_1.LIT_ERROR.UNKNOWN_ERROR.kind,
                errorCode: constants_1.LIT_ERROR.UNKNOWN_ERROR.code,
            });
        }
    }
}
exports.LitNodeClientNodeJs = LitNodeClientNodeJs;
_LitNodeClientNodeJs_authCallbackAndUpdateStorageItem = new WeakMap(), _LitNodeClientNodeJs_decryptWithSignatureShares = new WeakMap(), _LitNodeClientNodeJs_getIdentityParamForEncryption = new WeakMap(), _LitNodeClientNodeJs_isSuccessNodePromises = new WeakMap();
// ========== STATIC METHODS ==========
LitNodeClientNodeJs.getClaims = (claims) => {
    const keys = Object.keys(claims[0]);
    const signatures = {};
    const claimRes = {};
    for (let i = 0; i < keys.length; i++) {
        const claimSet = claims.map((c) => c[keys[i]]);
        signatures[keys[i]] = [];
        claimSet.map((c) => {
            let sig = ethers_1.ethers.utils.splitSignature(`0x${c.signature}`);
            let convertedSig = {
                r: sig.r,
                s: sig.s,
                v: sig.v,
            };
            signatures[keys[i]].push(convertedSig);
        });
        claimRes[keys[i]] = {
            signatures: signatures[keys[i]],
            derivedKeyId: claimSet[0].derivedKeyId,
        };
    }
    return claimRes;
};
/**
 *
 * Get expiration for session
 *
 */
LitNodeClientNodeJs.getExpiration = () => {
    return new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
};
//# sourceMappingURL=lit-node-client-nodejs.js.map