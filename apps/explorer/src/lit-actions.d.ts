declare namespace Lit {
  export namespace Actions {
    /**
     * Check if a given IPFS ID is permitted to sign using a given PKP tokenId
     * @function isPermittedAction
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @param {string} params.ipfsId The IPFS ID of some JS code (a lit action)
     * @returns {Promise<boolean>} A boolean indicating whether the IPFS ID is permitted to sign using the PKP tokenId
     */
    function isPermittedAction({
      tokenId,
      ipfsId,
    }: {
      tokenId: string;
      ipfsId: string;
    }): Promise<boolean>;
    /**
     * Check if a given wallet address is permitted to sign using a given PKP tokenId
     * @function isPermittedAddress
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @param {string} params.address The wallet address to check
     * @returns {Promise<boolean>} A boolean indicating whether the wallet address is permitted to sign using the PKP tokenId
     */
    function isPermittedAddress({
      tokenId,
      address,
    }: {
      tokenId: string;
      address: string;
    }): Promise<boolean>;
    /**
     * Check if a given auth method is permitted to sign using a given PKP tokenId
     * @function isPermittedAuthMethod
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @param {number} params.authMethodType The auth method type.  This is an integer.  This mapping shows the initial set but this set may be expanded over time without updating this contract: https://github.com/LIT-Protocol/LitNodeContracts/blob/main/contracts/PKPPermissions.sol#L25
     * @param {Uint8Array} params.userId The id of the auth method to check expressed as an array of unsigned 8-bit integers (a Uint8Array)
     * @returns {Promise<boolean>} A boolean indicating whether the auth method is permitted to sign using the PKP tokenId
     */
    function isPermittedAuthMethod({
      tokenId,
      authMethodType,
      userId,
    }: {
      tokenId: string;
      authMethodType: number;
      userId: Uint8Array;
    }): Promise<boolean>;
    /**
     * Get the full list of actions that are permitted to sign using a given PKP tokenId
     * @function getPermittedActions
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @returns {Promise<Array<string>>} An array of IPFS IDs of lit actions that are permitted to sign using the PKP tokenId
     */
    function getPermittedActions({
      tokenId,
    }: {
      tokenId: string;
    }): Promise<Array<string>>;
    /**
     * Get the full list of addresses that are permitted to sign using a given PKP tokenId
     * @function getPermittedAddresses
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @returns {Promise<Array<string>>} An array of addresses that are permitted to sign using the PKP tokenId
     */
    function getPermittedAddresses({
      tokenId,
    }: {
      tokenId: string;
    }): Promise<Array<string>>;
    /**
     * Get the full list of auth methods that are permitted to sign using a given PKP tokenId
     * @function getPermittedAuthMethods
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @returns {Promise<Array<Object>>} An array of auth methods that are permitted to sign using the PKP tokenId.  Each auth method is an object with the following properties: auth_method_type, id, and user_pubkey (used for web authn, this is the pubkey of the user's authentication keypair)
     */
    function getPermittedAuthMethods({
      tokenId,
    }: {
      tokenId: string;
    }): Promise<Array<any>>;
    /**
     * Get the permitted auth method scopes for a given PKP tokenId and auth method type + id
     * @function getPermittedAuthMethodScopes
     * @param {Object} params
     * @param {string} params.tokenId The tokenId to check
     * @param {string} params.authMethodType The auth method type to look up
     * @param {Uint8Array} params.userId The id of the auth method to check expressed as an array of unsigned 8-bit integers (a Uint8Array)
     * @param {number} params.maxScopeId The maximum scope id to check.  This is an integer.
     * @returns {Promise<Array<boolean>>} An array of booleans that define if a given scope id is turned on.  The index of the array is the scope id.  For example, if the array is [true, false, true], then scope ids 0 and 2 are turned on, but scope id 1 is turned off.
     */
    function getPermittedAuthMethodScopes({
      tokenId,
      authMethodType,
      userId,
      maxScopeId,
    }: {
      tokenId: string;
      authMethodType: string;
      userId: Uint8Array;
      maxScopeId: number;
    }): Promise<Array<boolean>>;
    /**
     * Converts a PKP public key to a PKP token ID by hashing it with keccak256
     * @function pubkeyToTokenId
     * @param {Object} params
     * @param {string} params.publicKey The public key to convert
     * @returns {Promise<string>} The token ID as a string
     */
    function pubkeyToTokenId({
      publicKey,
    }: {
      publicKey: string;
    }): Promise<string>;
    /**
     * Gets latest nonce for the given address on a supported chain
     * @function getLatestNonce
     * @param {Object} params
     * @param {string} params.address The wallet address for getting the nonce
     * @param {string} params.chain The chain of which the nonce is fetched
     * @returns {Promise<string>} The token ID as a string
     */
    function getLatestNonce({
      address,
      chain,
    }: {
      address: string;
      chain: string;
    }): Promise<string>;
    /**
     * Ask the Lit Node to sign any data using the ECDSA Algorithm with it's private key share.  The resulting signature share will be returned to the Lit JS SDK which will automatically combine the shares and give you the full signature to use.
     * @function signEcdsa
     * @param {Object} params
     * @param {Uint8Array} params.toSign The data to sign.  Should be an array of 8-bit integers.
     * @param {string} params.publicKey The public key of the PKP you wish to sign with
     * @param {string} params.sigName You can put any string here.  This is used to identify the signature in the response by the Lit JS SDK.  This is useful if you are signing multiple messages at once.  When you get the final signature out, it will be in an object with this signature name as the key.
     * @returns {Promise<string>} This function will return the string "success" if it works.  The signature share is returned behind the scenes to the Lit JS SDK which will automatically combine the shares and give you the full signature to use.
     */
    function signEcdsa({
      toSign,
      publicKey,
      sigName,
    }: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
    }): Promise<string>;
    /**
     * @param {Uint8array} toSign the message to sign
     * @param {string} publicKey the public key of the PKP
     * @param {string} sigName the name of the signature
     * @param {string} signingScheme the name of the signing scheme
     *   one of the following
     *   "EcdsaK256Sha256"
     *   "EcdsaP256Sha256"
     *   "EcdsaP384Sha384"
     *   "SchnorrEd25519Sha512"
     *   "SchnorrK256Sha256"
     *   "SchnorrP256Sha256"
     *   "SchnorrP384Sha384"
     *   "SchnorrRistretto25519Sha512"
     *   "SchnorrEd448Shake256"
     *   "SchnorrRedJubjubBlake2b512"
     *   "SchnorrK256Taproot"
     *   "SchnorrRedDecaf377Blake2b512"
     *   "SchnorrkelSubstrate"
     *   "Bls12381G1ProofOfPossession"
     * @returns {Uint8array} The resulting signature share
     */
    function sign({
      toSign,
      publicKey,
      sigName,
      signingScheme,
    }: Uint8array): Uint8array;
    /**
     * Sign data using the Lit Action's own cryptographic identity derived from its IPFS CID.
     * This allows actions to sign as themselves (not as a PKP), enabling autonomous agent behavior,
     * action-to-action authentication, and verifiable computation results.
     *
     * The action's keypair is deterministically derived from: keccak256("lit_action_" + actionIpfsCid)
     * The same action IPFS CID always generates the same keypair across all nodes.
     *
     * @function signAsAction
     * @param {Object} params
     * @param {Uint8Array} params.toSign The message to sign as an array of 8-bit integers
     * @param {string} params.sigName The name to identify this signature in the response
     * @param {string} params.signingScheme The signing algorithm to use. Must be one of:
     *   "EcdsaK256Sha256", "EcdsaP256Sha256", "EcdsaP384Sha384",
     *   "SchnorrEd25519Sha512", "SchnorrK256Sha256", "SchnorrP256Sha256", "SchnorrP384Sha384",
     *   "SchnorrRistretto25519Sha512", "SchnorrEd448Shake256", "SchnorrRedJubjubBlake2b512",
     *   "SchnorrK256Taproot", "SchnorrRedDecaf377Blake2b512", "SchnorrkelSubstrate",
     *   "Bls12381G1ProofOfPossession"
     * @returns {Promise<Uint8Array>} The resulting signature that can be verified using verifyActionSignature
     */
    function signAsAction({
      toSign,
      sigName,
      signingScheme,
    }: {
      toSign: Uint8Array;
      sigName: string;
      signingScheme: string;
    }): Promise<Uint8Array>;
    /**
     * Get the public key for a Lit Action's cryptographic identity.
     * This can be used to verify signatures created by signAsAction, or to get the public key
     * of any action (including actions you didn't create) for verification purposes.
     *
     * The public key is deterministically derived from: keccak256("lit_action_" + actionIpfsCid)
     * and will always be the same for a given action IPFS CID and signing scheme.
     *
     * @function getActionPublicKey
     * @param {Object} params
     * @param {string} params.signingScheme The signing algorithm. Must be one of:
     *   "EcdsaK256Sha256", "EcdsaP256Sha256", "EcdsaP384Sha384",
     *   "SchnorrEd25519Sha512", "SchnorrK256Sha256", "SchnorrP256Sha256", "SchnorrP384Sha384",
     *   "SchnorrRistretto25519Sha512", "SchnorrEd448Shake256", "SchnorrRedJubjubBlake2b512",
     *   "SchnorrK256Taproot", "SchnorrRedDecaf377Blake2b512", "SchnorrkelSubstrate",
     *   "Bls12381G1ProofOfPossession"
     * @param {string} params.actionIpfsCid The IPFS CID of the Lit Action
     * @returns {Promise<Uint8Array>} The public key for the action
     */
    function getActionPublicKey({
      signingScheme,
      actionIpfsCid,
    }: {
      signingScheme: string;
      actionIpfsCid: string;
    }): Promise<Uint8Array>;
    /**
     * Verify that a signature was created by a specific Lit Action using signAsAction.
     * This enables action-to-action authentication, verifiable computation, and building trust chains
     * between actions without requiring PKP ownership.
     *
     * @function verifyActionSignature
     * @param {Object} params
     * @param {string} params.signingScheme The signing algorithm. Must be one of:
     *   "EcdsaK256Sha256", "EcdsaP256Sha256", "EcdsaP384Sha384",
     *   "SchnorrEd25519Sha512", "SchnorrK256Sha256", "SchnorrP256Sha256", "SchnorrP384Sha384",
     *   "SchnorrRistretto25519Sha512", "SchnorrEd448Shake256", "SchnorrRedJubjubBlake2b512",
     *   "SchnorrK256Taproot", "SchnorrRedDecaf377Blake2b512", "SchnorrkelSubstrate",
     *   "Bls12381G1ProofOfPossession"
     * @param {string} params.actionIpfsCid The IPFS CID of the Lit Action that should have created the signature
     * @param {Uint8Array} params.toSign The message that was signed
     * @param {string} params.signOutput The signature output from signAsAction (as a string)
     * @returns {Promise<boolean>} true if the signature was created by the specified action, false otherwise
     */
    function verifyActionSignature({
      signingScheme,
      actionIpfsCid,
      toSign,
      signOutput,
    }: {
      signingScheme: string;
      actionIpfsCid: string;
      toSign: Uint8Array;
      signOutput: string;
    }): Promise<boolean>;
    /**
     * Ask the Lit Node to sign a message using the eth_personalSign algorithm.  The resulting signature share will be returned to the Lit JS SDK which will automatically combine the shares and give you the full signature to use.
     * @function ethPersonalSignMessageEcdsa
     * @param {Object} params
     * @param {string} params.message The message to sign.  Should be a string.
     * @param {string} params.publicKey The public key of the PKP you wish to sign with
     * @param {string} params.sigName You can put any string here.  This is used to identify the signature in the response by the Lit JS SDK.  This is useful if you are signing multiple messages at once.  When you get the final signature out, it will be in an object with this signature name as the key.
     * @returns {Promise<string>} This function will return the string "success" if it works.  The signature share is returned behind the scenes to the Lit JS SDK which will automatically combine the shares and give you the full signature to use.
     */
    function ethPersonalSignMessageEcdsa({
      message,
      publicKey,
      sigName,
    }: {
      message: string;
      publicKey: string;
      sigName: string;
    }): Promise<string>;
    /**
     * Checks a condition using the Lit condition checking engine.  This is the same engine that powers our Access Control product.  You can use this to check any condition that you can express in our condition language.  This is a powerful tool that allows you to build complex conditions that can be checked in a decentralized way.  Visit https://developer.litprotocol.com and click on the "Access Control" section to learn more.
     * @function checkConditions
     * @param {Object} params
     * @param {Array<Object>} params.conditions An array of access control condition objects
     * @param {Object} params.authSig The AuthSig to use for the condition check.  For example, if you were checking for NFT ownership, this AuthSig would be the signature from the NFT owner's wallet.
     * @param {string} params.chain The chain this AuthSig comes from
     * @returns {Promise<boolean>} A boolean indicating whether the condition check passed or failed
     */
    function checkConditions({
      conditions,
      authSig,
      chain,
    }: {
      conditions: Array<any>;
      authSig: any;
      chain: string;
    }): Promise<boolean>;
    /**
     * Set the response returned to the client
     * @function setResponse
     * @param {Object} params
     * @param {string} params.response The response to send to the client.  You can put any string here, like you could use JSON.stringify on a JS object and send it here.
     */
    function setResponse({ response }: { response: string }): any;
    /**
     * Call a child Lit Action
     * @function call
     * @param {Object} params
     * @param {string} params.ipfsId The IPFS ID of the Lit Action to call
     * @param {Object=} params.params Optional parameters to pass to the child Lit Action
     * @returns {Promise<string>} The response from the child Lit Action.  Note that any signatures performed by the child Lit Action will be automatically combined and returned with the parent Lit Action to the Lit JS SDK client.
     */
    function call({
      ipfsId,
      params,
    }: {
      ipfsId: string;
      params?: any | undefined;
    }): Promise<string>;
    /**
     * Call a smart contract
     * @function callContract
     * @param {Object} params
     * @param {string} params.chain The name of the chain to use.  Check out the lit docs "Supported Blockchains" page to find the name.  For example, "ethereum"
     * @param {string} params.txn The RLP Encoded txn, as a hex string
     * @returns {Promise<string>} The response from calling the contract
     */
    function callContract({
      chain,
      txn,
    }: {
      chain: string;
      txn: string;
    }): Promise<string>;
    /**
     * Convert a Uint8Array to a string.  This is a re-export of this function: https://www.npmjs.com/package/uint8arrays#tostringarray-encoding--utf8
     * @function uint8arrayToString
     * @param {Uint8Array} array The Uint8Array to convert
     * @param {string} encoding The encoding to use.  Defaults to "utf8"
     * @returns {string} The string representation of the Uint8Array
     */
    function uint8arrayToString(...args: any[]): string;
    /**
     * Convert a string to a Uint8Array.  This is a re-export of this function: https://www.npmjs.com/package/uint8arrays#fromstringstring-encoding--utf8
     * @function uint8arrayFromString
     * @param {string} string The string to convert
     * @param {string} encoding The encoding to use.  Defaults to "utf8"
     * @returns {Uint8Array} The Uint8Array representation of the string
     */
    function uint8arrayFromString(...args: any[]): Uint8Array;
    /**
     * Decrypt data using AES with a symmetric key
     * @function aesDecrypt
     * @param {Object} params
     * @param {Uint8Array} params.symmetricKey The AES symmetric key
     * @param {Uint8Array} params.ciphertext The ciphertext to decrypt
     * @returns {Promise<string>} The decrypted plaintext
     */
    function aesDecrypt({
      symmetricKey,
      ciphertext,
    }: {
      symmetricKey: Uint8Array;
      ciphertext: Uint8Array;
    }): Promise<string>;
    /**
     * Claim a key through a key identifier, the result of the claim will be added to `claim_id`
     * under the `keyId` given.
     * @param {Object} params
     * @param {string} params.keyId user id of the claim
     */
    function claimKey({ keyId }: { keyId: string }): any;
    /**
     * Broadcast a message to all connected clients and collect their responses
     * @function broadcastAndCollect
     * @param {Object} params
     * @param {string} params.name The name of the broadcast
     * @param {string} params.value The value to broadcast
     * @returns {Promise<string>} The collected responses as a json array
     */
    function broadcastAndCollect({
      name,
      value,
    }: {
      name: string;
      value: string;
    }): Promise<string>;
    /**
     * Decrypt and combine the provided ciphertext
     * @function decryptAndCombine
     * @param {Object} params
     * @param {Array<Object>} params.accessControlConditions The access control conditions
     * @param {string} params.ciphertext The ciphertext to decrypt
     * @param {string} params.dataToEncryptHash The hash of the data to encrypt
     * @param {Object} params.authSig The auth signature
     * @param {string} params.chain The chain
     * @returns {Promise<string>} The decrypted and combined data
     */
    function decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig,
      chain,
    }: {
      accessControlConditions: Array<any>;
      ciphertext: string;
      dataToEncryptHash: string;
      authSig: any;
      chain: string;
    }): Promise<string>;
    /**
     * Decrypt to a single node
     * @function decryptToSingleNode
     * @param {Object} params
     * @param {Array<Object>} params.accessControlConditions The access control conditions
     * @param {string} params.ciphertext The ciphertext to decrypt
     * @param {string} params.dataToEncryptHash The hash of the data to encrypt
     * @param {Object} params.authSig The auth signature
     * @param {string} params.chain The chain
     * @returns {Promise<string>} The decrypted data
     */
    function decryptToSingleNode({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig,
      chain,
    }: {
      accessControlConditions: Array<any>;
      ciphertext: string;
      dataToEncryptHash: string;
      authSig: any;
      chain: string;
    }): Promise<string>;
    /**
     * Sign with ECDSA and automatically combine signature shares from all nodes into a complete signature
     * @function signAndCombineEcdsa
     * @param {Object} params
     * @param {Uint8Array} params.toSign The message to sign
     * @param {string} params.publicKey The public key of the PKP
     * @param {string} params.sigName The name of the signature
     * @returns {Promise<Uint8Array>} The resulting combined signature
     */
    function signAndCombineEcdsa({
      toSign,
      publicKey,
      sigName,
    }: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
    }): Promise<Uint8Array>;
    /**
     * Sign with any signing scheme and automatically combine signature shares from all nodes into a complete signature
     * @function signAndCombine
     * @param {Object} params
     * @param {Uint8Array} params.toSign The message to sign
     * @param {string} params.publicKey The public key of the PKP
     * @param {string} params.sigName The name of the signature
     * @param {string} params.signingScheme The signing scheme. Must be one of:
     *   "EcdsaK256Sha256", "EcdsaP256Sha256", "EcdsaP384Sha384",
     *   "SchnorrEd25519Sha512", "SchnorrK256Sha256", "SchnorrP256Sha256", "SchnorrP384Sha384",
     *   "SchnorrRistretto25519Sha512", "SchnorrEd448Shake256", "SchnorrRedJubjubBlake2b512",
     *   "SchnorrK256Taproot", "SchnorrRedDecaf377Blake2b512", "SchnorrkelSubstrate",
     *   "Bls12381G1ProofOfPossession"
     * @returns {Promise<Uint8Array>} The resulting combined signature
     */
    function signAndCombine({
      toSign,
      publicKey,
      sigName,
      signingScheme,
    }: {
      toSign: Uint8Array;
      publicKey: string;
      sigName: string;
      signingScheme: string;
    }): Promise<Uint8Array>;
    /**
     * Run a function only once across all nodes using leader election
     * @function runOnce
     * @param {Object} params
     * @param {boolean} params.waitForResponse Whether to wait for a response or not - if false, the function will return immediately
     * @param {string} params.name Optional name for this runOnce invocation
     * @param {Function} async_fn The async function to run on the leader node
     * @returns {Promise<string>} The response from the function if waitForResponse is true
     */
    function runOnce(
      {
        waitForResponse,
        name,
      }: {
        waitForResponse: boolean;
        name: string;
      },
      async_fn: Function,
    ): Promise<string>;
    /**
     * Get the RPC URL for a given blockchain
     * @function getRpcUrl
     * @param {Object} params
     * @param {string} params.chain The chain to get the RPC URL for
     * @returns {Promise<string>} The RPC URL for the chain
     */
    function getRpcUrl({ chain }: { chain: string }): Promise<string>;
    /**
     * Encrypt data using BLS encryption with access control conditions
     * @function encrypt
     * @param {Object} params
     * @param {Array<Object>} params.accessControlConditions The access control conditions that must be met to decrypt
     * @param {string} params.to_encrypt The message to encrypt
     * @returns {Promise<{ciphertext: string, dataToEncryptHash: string}>} An object containing the ciphertext and the hash of the data that was encrypted
     */
    function encrypt({
      accessControlConditions,
      to_encrypt,
    }: {
      accessControlConditions: Array<any>;
      to_encrypt: string;
    }): Promise<{
      ciphertext: string;
      dataToEncryptHash: string;
    }>;
  }

  export namespace Auth {
    /**
     * Stack of action IPFS IDs tracking the call hierarchy.
     * When a parent action calls a child action, the child's IPFS ID is pushed onto this stack.
     * @type {Array<string>}
     */
    const actionIpfsIdStack: Array<string>;

    /**
     * The address from the authentication signature.
     * @type {string | null}
     */
    const authSigAddress: string | null;

    /**
     * Array of authentication method contexts.
     * @type {Array<{
     *   userId: string;
     *   appId: string;
     *   authMethodType: number;
     *   lastRetrievedAt: string;
     *   expiration: number;
     *   usedForSignSessionKeyRequest: boolean;
     * }>}
     */
    const authMethodContexts: {
      userId: string;
      appId: string;
      authMethodType: number;
      lastRetrievedAt: string;
      expiration: number;
      usedForSignSessionKeyRequest: boolean;
    }[];

    /**
     * Array of resources from the SIWE message or session signature.
     * @type {Array<string>}
     */
    const resources: Array<string>;

    /**
     * Custom authentication resource string.
     * @type {string | `"\\(true,${string})\\"`}
     */
    const customAuthResource: string | `"\\(true,${string})\\"`;
  }
}

/**
 * Global reference to Lit.Actions namespace for convenience.
 * This is identical to using Lit.Actions.
 */
declare const LitActions: typeof Lit.Actions;

/**
 * Global reference to Lit.Auth namespace for convenience.
 * This is identical to using Lit.Auth.
 */
declare const LitAuth: typeof Lit.Auth;

/**
 * The ethers.js v5 library for interacting with Ethereum and other EVM chains.
 * Includes utilities for wallets, contracts, providers, and cryptographic operations.
 * See https://docs.ethers.io/v5/ for full documentation.
 *
 * For full type definitions, install: npm install --save-dev ethers@5
 * Then import types with: import type { ethers } from 'ethers';
 */
declare const ethers: typeof import("ethers");

/**
 * The jsonwebtoken library for JWT encoding, decoding, and verification.
 * See https://github.com/auth0/node-jsonwebtoken for full documentation.
 */
declare const jwt: {
  decode: (token: string, options?: any) => any;
  verify: (
    token: string,
    secretOrPublicKey: string | Buffer,
    options?: any,
  ) => any;
  sign: (
    payload: string | object | Buffer,
    secretOrPrivateKey: string | Buffer,
    options?: any,
  ) => string;
};
