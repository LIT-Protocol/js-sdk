import { AuthCallbackParams, AuthMethod, AuthSig, ClaimKeyResponse, ClaimProcessor, ClaimRequest, CustomNetwork, DecryptRequest, DecryptResponse, EncryptRequest, EncryptResponse, ExecuteJsProps, ExecuteJsResponse, GetSessionSigsProps, GetSignSessionKeySharesProp, GetSignedTokenRequest, GetSigningShareForDecryptionRequest, GetWalletSigProps, JsonExecutionRequest, JsonPkpSignRequest, LitClientSessionManager, LitNodeClientConfig, NodeBlsSigningShare, NodeCommandResponse, RejectedNodePromises, SessionKeyPair, SessionSigsMap, SigShare, SignConditionECDSA, SignSessionKeyProp, SignSessionKeyResponse, Signature, SigningAccessControlConditionRequest, SuccessNodePromises, ValidateAndSignECDSA, WebAuthnAuthenticationVerificationParams } from '@lit-protocol/types';
import { LitCore } from '@lit-protocol/core';
import { ILitResource, ISessionCapabilityObject, LitAccessControlConditionResource, LitResourceAbilityRequest, LitRLIResource } from '@lit-protocol/auth-helpers';
import { ethers } from 'ethers';
interface CapacityCreditsReq {
    dAppOwnerWallet: ethers.Wallet;
    capacityTokenId?: string;
    delegateeAddresses?: string[];
    uses?: string;
    domain?: string;
    expiration?: string;
    statement?: string;
}
interface CapacityCreditsRes {
    litResource: LitRLIResource;
    capacityDelegationAuthSig: AuthSig;
}
/** ---------- Main Export Class ---------- */
export declare class LitNodeClientNodeJs extends LitCore implements LitClientSessionManager {
    #private;
    defaultAuthCallback?: (authSigParams: AuthCallbackParams) => Promise<AuthSig>;
    constructor(args: any[LitNodeClientConfig | CustomNetwork | any]);
    static getClaims: (claims: any[]) => Record<string, {
        signatures: Signature[];
        derivedKeyId: string;
    }>;
    createCapacityDelegationAuthSig: (params: CapacityCreditsReq) => Promise<CapacityCreditsRes>;
    /**
     *
     * Get the request body of the lit action
     *
     * @param { ExecuteJsProps } params
     *
     * @returns { JsonExecutionRequest }
     *
     */
    getLitActionRequestBody: (params: ExecuteJsProps) => JsonExecutionRequest;
    /**
     *
     * we need to send jwt params iat (issued at) and exp (expiration) because the nodes may have different wall clock times, the nodes will verify that these params are withing a grace period
     *
     */
    getJWTParams: () => {
        iat: number;
        exp: number;
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
    parseResponses: (responseString: string) => any;
    /**
     * Try to get the session key in the local storage,
     * if not, generates one.
     * @return { SessionKeyPair } session key pair
     */
    getSessionKey: () => SessionKeyPair;
    /**
     * Check if a given object is of type SessionKeyPair.
     *
     * @param obj - The object to check.
     * @returns True if the object is of type SessionKeyPair.
     */
    isSessionKeyPair(obj: any): obj is SessionKeyPair;
    /**
     * Generates wildcard capability for each of the LIT resources
     * specified.
     * @param litResources is an array of LIT resources
     * @param addAllCapabilities is a boolean that specifies whether to add all capabilities for each resource
     */
    static generateSessionCapabilityObjectWithWildcards(litResources: Array<ILitResource>, addAllCapabilities?: boolean, rateLimitAuthSig?: AuthSig): Promise<ISessionCapabilityObject>;
    generateSessionCapabilityObjectWithWildcards(litResources: Array<ILitResource>): Promise<ISessionCapabilityObject>;
    /**
     *
     * Get expiration for session
     *
     */
    static getExpiration: () => string;
    getExpiration: () => string;
    /**
     * returns the latest block hash.
     * will call refresh if the block hash is expired
     * @returns {Promise<string>} latest block hash from `handhsake` with the lit network.
     */
    getLatestBlockhash: () => string;
    /**
     *
     * Get the signature from local storage, if not, generates one
     *
     */
    getWalletSig: ({ authNeededCallback, chain, sessionCapabilityObject, switchChain, expiration, sessionKeyUri, nonce, }: GetWalletSigProps) => Promise<AuthSig>;
    /**
     *
     * Check if a session key needs to be resigned. These are the scenarios where a session key needs to be resigned:
     * 1. The authSig.sig does not verify successfully against the authSig.signedMessage
     * 2. The authSig.signedMessage.uri does not match the sessionKeyUri
     * 3. The authSig.signedMessage does not contain at least one session capability object
     *
     */
    checkNeedToResignSessionKey: ({ authSig, sessionKeyUri, resourceAbilityRequests, }: {
        authSig: AuthSig;
        sessionKeyUri: any;
        resourceAbilityRequests: Array<LitResourceAbilityRequest>;
    }) => Promise<boolean>;
    /**
     *
     * Get JS Execution Shares from Nodes
     *
     * @param { JsonExecutionRequest } params
     *
     * @returns { Promise<any> }
     */
    getJsExecutionShares: (url: string, params: JsonExecutionRequest, requestId: string) => Promise<NodeCommandResponse>;
    getPkpSignExecutionShares: (url: string, params: any, requestId: string) => Promise<any>;
    getClaimKeyExecutionShares: (url: string, params: any, requestId: string) => Promise<any>;
    /**
     * Get Signing Shares for Token containing Access Control Condition
     *
     * @param { string } url
     * @param { SigningAccessControlConditionRequest } params
     *
     * @returns { Promise<NodeCommandResponse> }
     *
     */
    getSigningShareForToken: (url: string, params: SigningAccessControlConditionRequest, requestId: string) => Promise<NodeCommandResponse>;
    /**
     *
     * Get signature shares for decryption.
     *
     * @param url
     * @param params
     * @param requestId
     * @returns
     */
    getSigningShareForDecryption: (url: string, params: GetSigningShareForDecryptionRequest, requestId: string) => Promise<NodeCommandResponse>;
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
    signConditionEcdsa: (url: string, params: SignConditionECDSA, requestId: string) => Promise<NodeCommandResponse>;
    /**
     *
     * Combine Shares from network public key set and signature shares
     *
     * @param { NodeBlsSigningShare } signatureShares
     *
     * @returns { string } final JWT (convert the sig to base64 and append to the jwt)
     *
     */
    combineSharesAndGetJWT: (signatureShares: Array<NodeBlsSigningShare>, requestId?: string) => string;
    getIpfsId: ({ dataToHash, authSig, debug, }: {
        dataToHash: string;
        authSig: AuthSig;
        debug?: boolean | undefined;
    }) => Promise<any>;
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
    runOnTargetedNodes: (params: ExecuteJsProps) => Promise<SuccessNodePromises<NodeCommandResponse> | RejectedNodePromises>;
    _getFlattenShare: (share: any) => SigShare;
    /**
     *
     * Get signatures from signed data
     *
     * @param { Array<any> } signedData
     *
     * @returns { any }
     *
     */
    getSessionSignatures: (signedData: Array<any>) => any;
    /**
     *
     * Get signatures from signed data
     *
     * @param { Array<any> } signedData
     *
     * @returns { any }
     *
     */
    getSignatures: (signedData: Array<any>, requestId?: string) => any;
    /**
     *
     * Get a single signature
     *
     * @param { Array<any> } shareData from all node promises
     *
     * @returns { string } signature
     *
     */
    getSignature: (shareData: Array<any>, requestId: string) => Promise<any>;
    static normalizeParams(params: ExecuteJsProps): ExecuteJsProps;
    /**
     *
     * Execute JS on the nodes and combine and return any resulting signatures
     *
     * @param { ExecuteJsRequest } params
     *
     * @returns { ExecuteJsResponse }
     *
     */
    executeJs: (params: ExecuteJsProps) => Promise<ExecuteJsResponse>;
    pkpSign: (params: JsonPkpSignRequest) => Promise<any>;
    /**
     *
     * Request a signed JWT from the LIT network. Before calling this function, you must know the access control conditions for the item you wish to gain authorization for.
     *
     * @param { GetSignedTokenRequest } params
     *
     * @returns { Promise<string> } final JWT
     *
     */
    getSignedToken: (params: GetSignedTokenRequest) => Promise<string>;
    /**
     *
     * Encrypt data using the LIT network public key.
     *
     */
    encrypt: (params: EncryptRequest) => Promise<EncryptResponse>;
    /**
     *
     * Decrypt ciphertext with the LIT network.
     *
     */
    decrypt: (params: DecryptRequest) => Promise<DecryptResponse>;
    getLitResourceForEncryption: (params: EncryptRequest) => Promise<LitAccessControlConditionResource>;
    /**
     *
     * Validates a condition, and then signs the condition if the validation returns true.
     * Before calling this function, you must know the on chain conditions that you wish to validate.
     *
     * @param { ValidateAndSignECDSA } params
     *
     * @returns { Promise<string> }
     */
    validateAndSignEcdsa: (params: ValidateAndSignECDSA) => Promise<string>;
    /** ============================== SESSION ============================== */
    /**
     * Sign a session public key using a PKP, which generates an authSig.
     * @returns {Object} An object containing the resulting signature.
     */
    signSessionKey: (params: SignSessionKeyProp) => Promise<SignSessionKeyResponse>;
    getSignSessionKeyShares: (url: string, params: GetSignSessionKeySharesProp, requestId: string) => Promise<any>;
    generateAuthMethodForWebAuthn: (params: WebAuthnAuthenticationVerificationParams) => AuthMethod;
    generateAuthMethodForDiscord: (access_token: string) => AuthMethod;
    generateAuthMethodForGoogle: (access_token: string) => AuthMethod;
    generateAuthMethodForGoogleJWT: (access_token: string) => AuthMethod;
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
    getSessionSigs: (params: GetSessionSigsProps) => Promise<SessionSigsMap>;
    /**
     *
     * Get Session Key URI eg. lit:session:0x1234
     *
     * @param publicKey is the public key of the session key
     * @returns { string } the session key uri
     */
    getSessionKeyUri: (publicKey: string) => string;
    /**
     * Authenticates an Auth Method for claiming a Programmable Key Pair (PKP).
     * A {@link MintCallback} can be defined for custom on chain interactions
     * by default the callback will forward to a relay server for minting on chain.
     * @param {ClaimKeyRequest} params an Auth Method and {@link MintCallback}
     * @returns {Promise<ClaimKeyResponse>}
     */
    claimKeyId(params: ClaimRequest<ClaimProcessor>): Promise<ClaimKeyResponse>;
}
export {};
