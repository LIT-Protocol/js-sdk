import { SIGTYPE } from '@lit-protocol/constants';
import { AuthSig, CustomNetwork, FormattedMultipleAccs, HandshakeWithNode, KV, LitNodeClientConfig, MultipleAccessControlConditions, NodeCommandServerKeysResponse, RejectedNodePromises, SendNodeCommand, SessionSig, SessionSigsMap, SuccessNodePromises, SupportedJsonRequests } from '@lit-protocol/types';
export declare class LitCore {
    config: LitNodeClientConfig;
    connectedNodes: SetConstructor | Set<any> | any;
    serverKeys: KV | any;
    ready: boolean;
    subnetPubKey: string | null;
    networkPubKey: string | null;
    networkPubKeySet: string | null;
    hdRootPubkeys: string[] | null;
    latestBlockhash: string | null;
    lastBlockHashRetrieved: number | null;
    networkSyncInterval: any | null;
    constructor(args: any[LitNodeClientConfig | CustomNetwork | any]);
    getLogsForRequestId: (id: string) => string[];
    /**
     * Asynchronously updates the configuration settings for the LitNodeClient.
     * This function fetches the minimum node count and bootstrap URLs for the
     * specified Lit network. It validates these values and updates the client's
     * configuration accordingly.
     *
     * @throws Will throw an error if the minimum node count is invalid or if
     *         the bootstrap URLs array is empty.
     * @returns {Promise<void>} A promise that resolves when the configuration is updated.
     */
    setNewConfig: () => Promise<void>;
    /**
     * Sets up a listener to detect state changes (new epochs) in the staking contract.
     * When a new epoch is detected, it triggers the `setNewConfig` function to update
     * the client's configuration based on the new state of the network. This ensures
     * that the client's configuration is always in sync with the current state of the
     * staking contract.
     *
     * @returns {Promise<void>} A promise that resolves when the listener is successfully set up.
     */
    listenForNewEpoch: () => Promise<void>;
    /**
     *
     * Set bootstrapUrls to match the network litNetwork unless it's set to custom
     *
     * @returns { void }
     *
     */
    setCustomBootstrapUrls: () => void;
    /**
     *
     * Connect to the LIT nodes
     *
     * @returns { Promise } A promise that resolves when the nodes are connected.
     *
     */
    connect: () => Promise<any>;
    /**
     *
     * @returns {Promise<any>}
     */
    _runHandshakeWithBootstrapUrls: () => Promise<any>;
    /**
     *
     * Get a random request ID
     *
     * @returns { string }
     *
     */
    getRequestId(): string;
    /**
     *
     * Get a random hex string for use as an attestation challenge
     *
     * @returns { string }
     */
    getRandomHexString(size: number): string;
    /**
     *
     * Handshake with Node
     *
     * @param { HandshakeWithNode } params
     *
     * @returns { Promise<NodeCommandServerKeysResponse> }
     *
     */
    handshakeWithNode: (params: HandshakeWithNode, requestId: string) => Promise<NodeCommandServerKeysResponse>;
    /**
     *
     * Send a command to nodes
     *
     * @param { SendNodeCommand }
     *
     * @returns { Promise<any> }
     *
     */
    sendCommandToNode: ({ url, data, requestId, }: SendNodeCommand) => Promise<any>;
    /**
     *
     * Get and gather node promises
     *
     * @param { any } callback
     *
     * @returns { Array<Promise<any>> }
     *
     */
    getNodePromises: (callback: Function) => Array<Promise<any>>;
    /**
     *
     * Get either auth sig or session auth sig
     *
     */
    getSessionOrAuthSig: ({ authSig, sessionSigs, url, mustHave, }: {
        authSig?: AuthSig | undefined;
        sessionSigs?: SessionSigsMap | undefined;
        url: string;
        mustHave?: boolean | undefined;
    }) => AuthSig | SessionSig;
    validateAccessControlConditionsSchema: (params: MultipleAccessControlConditions) => Promise<boolean>;
    /**
     *
     * Get hash of access control conditions
     *
     * @param { MultipleAccessControlConditions } params
     *
     * @returns { Promise<ArrayBuffer | undefined> }
     *
     */
    getHashedAccessControlConditions: (params: MultipleAccessControlConditions) => Promise<ArrayBuffer | undefined>;
    /**
     * Handle node promises
     *
     * @param { Array<Promise<any>> } nodePromises
     *
     * @returns { Promise<SuccessNodePromises<T> | RejectedNodePromises> }
     *
     */
    handleNodePromises: <T>(nodePromises: Promise<T>[], requestId: string, minNodeCount: number) => Promise<SuccessNodePromises<T> | RejectedNodePromises>;
    /**
     *
     * Throw node error
     *
     * @param { RejectedNodePromises } res
     *
     * @returns { void }
     *
     */
    _throwNodeError: (res: RejectedNodePromises, requestId: string) => void;
    /**
     *
     * Get different formats of access control conditions, eg. evm, sol, unified etc.
     *
     * @param { SupportedJsonRequests } params
     *
     * @returns { FormattedMultipleAccs }
     *
     */
    getFormattedAccessControlConditions: (params: SupportedJsonRequests) => FormattedMultipleAccs;
    /**
     * Calculates an HD public key from a given {@link keyId} the curve type or signature type will assumed to be k256 unless given
     * @param keyId
     * @param sigType
     * @returns {string} public key
     */
    computeHDPubKey: (keyId: string, sigType?: SIGTYPE) => string;
    /**
     * Calculates a Key Id for claiming a pkp based on a user identifier and an app identifier.
     * The key Identifier is an Auth Method Id which scopes the key uniquely to a specific application context.
     * These identifiers are specific to each auth method and will derive the public key protion of a pkp which will be persited
     * when a key is claimed.
     * | Auth Method | User ID | App ID |
     * |:------------|:--------|:-------|
     * | Google OAuth | token `sub` | token `aud` |
     * | Discord OAuth | user id | client app identifier |
     * | Stytch OTP |token `sub` | token `aud`|
     * | Lit Actions | user defined | ipfs cid |
     * *Note* Lit Action claiming uses a different schema than oter auth methods
     * isForActionContext should be set for true if using claiming through actions
     * @param userId {string} user identifier for the Key Identifier
     * @param appId {string} app identifier for the Key Identifier
     * @returns {String} public key of pkp when claimed
     */
    computeHDKeyId(userId: string, appId: string, isForActionContext?: boolean): string;
}
