/**
 * This module defines the PKPBase class, which provides a base implementation for wallet functionality
 * that can be shared between Ethers and Cosmos signers. The class is responsible for managing public key
 * compression, initializing and connecting to the LIT node, and running LIT actions based on provided properties.
 * The class also includes debug functions for logging and error handling.
 *
 * The module exports the PKPBase class, as well as the PKPBaseProp type definition used for
 * initializing the class instances.
 */

import {
  ExecuteJsProps,
  PKPBaseProp,
  AuthSig,
  PKPBaseDefaultParams,
  GetSessionSigsProps,
  SessionSigs,
  RPCUrls,
  AuthMethod,
  ExecuteJsResponse,
} from '@lit-protocol/types';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { publicKeyConvert } from 'secp256k1';
import { toString as uint8arrayToString } from 'uint8arrays';
import { executeWithRetry, logError } from '@lit-protocol/misc';

/**
 * Compresses a given public key.
 * @param {string} pubKey - The public key to be compressed.
 * @returns {string} - The compressed public key.
 */
const compressPubKey = (pubKey: string): string => {
  const testBuffer = Buffer.from(pubKey, 'hex');
  if (testBuffer.length === 64) {
    pubKey = '04' + pubKey;
  }

  // const hex = Buffer.from(pubKey, 'hex');
  const uint8array = new Uint8Array(Buffer.from(pubKey, 'hex'));
  const compressedKey = publicKeyConvert(uint8array, true);
  const hex = Buffer.from(compressedKey).toString('hex');

  return hex;
};

/**
 * A base class that can be shared between Ethers and Cosmos signers.
 */
export class PKPBase<T = PKPBaseDefaultParams> {
  rpcs?: RPCUrls;
  controllerAuthSig?: AuthSig;
  controllerAuthMethods?: AuthMethod[];
  controllerSessionSigs?: SessionSigs;
  sessionSigsExpiration?: string;

  uncompressedPubKey!: string;
  uncompressedPubKeyBuffer!: Uint8Array;
  compressedPubKey!: string;
  compressedPubKeyBuffer!: Uint8Array;

  litNodeClient!: LitNodeClient;
  litNodeClientReady: boolean = false;
  litActionCode?: string;
  litActionIPFS?: string;
  litActionJsParams!: T;
  debug: boolean;
  useAction: boolean | undefined;

  // -- debug things
  private PREFIX = '[PKPBase]';
  private orange = '\x1b[33m';
  private reset = '\x1b[0m';
  private red = '\x1b[31m';

  /**
   * Constructor for the PKPBase class.
   * Initializes the instance with the provided properties.
   *
   * @param { PKPBaseProp } prop - The properties for the PKPBase instance.
   */
  constructor(prop: PKPBaseProp) {
    if (prop.pkpPubKey.startsWith('0x')) {
      prop.pkpPubKey = prop.pkpPubKey.slice(2);
    }

    this.setUncompressPubKeyAndBuffer(prop);
    this.setCompressedPubKeyAndBuffer(prop);

    this.rpcs = prop.rpcs;
    this.controllerAuthSig = prop.controllerAuthSig;
    this.controllerAuthMethods = prop.controllerAuthMethods;
    this.controllerSessionSigs = prop.controllerSessionSigs;
    this.sessionSigsExpiration = prop.sessionSigsExpiration;

    this.debug = prop.debug || false;
    this.setLitAction(prop);
    this.setLitActionJsParams(prop.litActionJsParams || {});
    this.litNodeClient = new LitNodeClient({
      litNetwork: prop.litNetwork ?? 'cayenne',
      ...(prop.bootstrapUrls &&
        prop.litNetwork === 'custom' && { bootstrapUrls: prop.bootstrapUrls }),
      ...(prop.bootstrapUrls &&
        prop.litNetwork == 'custom' && { minNodeCount: prop.minNodeCount }),
      debug: this.debug,
      // minNodeCount:
      //   prop.bootstrapUrls && prop.litNetwork == 'custom'
      //     ? prop.minNodeCount
      //     : defaultLitnodeClientConfig.minNodeCount,
    });
  }

  /**
   * Sets the uncompressed public key and its buffer representation.
   *
   * @param { PKPBaseProp } prop - The properties for the PKPBase instance.
   */
  setUncompressPubKeyAndBuffer(prop: PKPBaseProp): void | never {
    try {
      this.uncompressedPubKey = prop.pkpPubKey;
      this.uncompressedPubKeyBuffer = Buffer.from(prop.pkpPubKey, 'hex');
    } catch (e) {
      return this.throwError(
        'Failed to set uncompressed public key and buffer'
      );
    }
  }

  /**
   * Sets the compressed public key and its buffer representation.
   *
   * @param {PKPBaseProp} prop - The properties for the PKPBase instance.
   */
  setCompressedPubKeyAndBuffer(prop: PKPBaseProp): void | never {
    try {
      this.compressedPubKey = compressPubKey(prop.pkpPubKey);
      this.compressedPubKeyBuffer = Buffer.from(this.compressedPubKey, 'hex');
    } catch (e) {
      return this.throwError('Failed to set compressed public key and buffer');
    }
  }

  /**
   * Sets the Lit action to be executed by the LitNode client.
   *
   * @param {PKPBaseProp} prop - An object containing the parameters for the Lit action.
   *
   * @returns {never | void} - If both `litActionCode` and `litActionIPFS` are present, throws an Error. Otherwise, does not return a value.
   */

  setLitAction(prop: PKPBaseProp): never | void {
    this.litActionCode = prop.litActionCode;
    this.litActionIPFS = prop.litActionIPFS;

    if (prop.litActionCode && prop.litActionIPFS) {
      return this.throwError(
        'Both litActionCode and litActionIPFS cannot be present at the same time.'
      );
    }

    if (!prop.litActionCode && !prop.litActionIPFS) {
      this.log(
        'No lit action code or IPFS hash provided. Using default action.'
      );
      this.useAction = false;
    }
  }

  /**
   * A function that sets the value of the litActionJsParams property to the given params object.
   * @template CustomType - A generic type that extends T, where T is the type of the litActionJsParams property.
   * @param { CustomType } params - An object of type CustomType that contains the parameters to be set as litActionJsParams.
   * @returns { void }
   * @memberOf SomeClass
   */
  setLitActionJsParams<CustomType extends T = T>(params: CustomType): void {
    this.litActionJsParams = params;
  }

  /**
   * Creates and sets the session sigs and their expiration.
   *
   * @param {GetSessionSigsProps} sessionParams - The parameters for generating session sigs.
   */
  async createAndSetSessionSigs(
    sessionParams: GetSessionSigsProps
  ): Promise<void | never> {
    try {
      const expiration =
        sessionParams.expiration || this.litNodeClient.getExpiration();
      const sessionSigs = await this.litNodeClient.getSessionSigs(
        sessionParams
      );

      this.controllerSessionSigs = sessionSigs;
      this.sessionSigsExpiration = expiration;
    } catch (e) {
      return this.throwError('Failed to create and set session sigs');
    }
  }

  /**
   * Base method to be overridden by subclasses.
   *
   * @returns {Promise<string>} - Address associated with concrete type of PKPBase
   */
  getAddress(): Promise<string> {
    return Promise.reject(
      new Error('getAddress not implemented. Please use a subclass of PKPBase.')
    );
  }

  /**
   * Initializes the PKPBase instance by connecting to the LIT node.
   */
  async init(): Promise<void | never> {
    try {
      await this.litNodeClient.connect();
      this.litNodeClientReady = true;
      this.log('Connected to Lit Node');
    } catch (e) {
      return this.throwError('Failed to connect to Lit Node');
    }
  }

  /**
   * Runs the specified Lit action with the given parameters.
   *
   * @param {Uint8Array} toSign - The data to be signed by the Lit action.
   * @param {string} sigName - The name of the signature to be returned by the Lit action.
   *
   * @returns {Promise<any>} - A Promise that resolves with the signature returned by the Lit action.
   *
   * @throws {Error} - Throws an error if `pkpPubKey` is not provided, if `controllerAuthSig` or `controllerSessionSigs` is not provided, if `controllerSessionSigs` is not an object, if `executeJsArgs` does not have either `code` or `ipfsId`, or if an error occurs during the execution of the Lit action.
   */

  async runLitAction(toSign: Uint8Array, sigName: string): Promise<any> {
    if (!this.litNodeClientReady) {
      await this.init();
    }

    // If no PKP public key is provided, throw error
    if (!this.uncompressedPubKey) {
      throw new Error('pkpPubKey (aka. uncompressPubKey) is required');
    }

    if (this.controllerAuthSig && this.controllerSessionSigs) {
      throw new Error(
        'controllerAuthSig, controllerSessionSigs are defined, can only use one or the other'
      );
    }

    // If session sigs are provided, they must be an object
    if (
      this.controllerSessionSigs &&
      typeof this.controllerSessionSigs !== 'object'
    ) {
      throw new Error('controllerSessionSigs must be an object');
    }

    const executeJsArgs: ExecuteJsProps = {
      ...(this.litActionCode && { code: this.litActionCode }),
      ...(this.litActionIPFS && { ipfsId: this.litActionIPFS }),
      sessionSigs: this.controllerSessionSigs,
      authSig: this.controllerAuthSig,
      authMethods: this.controllerAuthMethods,
      jsParams: {
        ...{
          toSign,
          publicKey: this.uncompressedPubKey,
          sigName,
        },
        ...{
          ...this.litActionJsParams,
        },
      },
    };

    // check if executeJsArgs has either code or ipfsId
    if (!executeJsArgs.code && !executeJsArgs.ipfsId) {
      return this.throwError('executeJsArgs must have either code or ipfsId');
    }

    this.log('executeJsArgs:', executeJsArgs);

    try {
      const res = await executeWithRetry<ExecuteJsResponse>(
        async (_id: string) =>
          await this.litNodeClient.executeJs(executeJsArgs),
        (error: any, requestId: string, isFinal: boolean) => {
          if (!isFinal) {
            this.log('an error has occured, attempting to retry');
          }
        }
      );

      if ('error' in res) {
        return this.throwError(
          `error while attempting signature operation, request identifier: lit_${res.requestId}`
        );
      }
      const sig = (res as ExecuteJsResponse).signatures[sigName];

      this.log('res:', res);
      this.log('res.signatures[sigName]:', sig);

      // pad sigs with 0 if length is odd
      sig.r = sig.r.length % 2 === 0 ? sig.r : '0' + sig.r;
      sig.s = sig.s.length % 2 === 0 ? sig.s : '0' + sig.s;

      return sig;
    } catch (err) {
      console.log('err:', err);
      throw err;
    }
  }

  async runSign(toSign: Uint8Array): Promise<any> {
    if (!this.litNodeClientReady) {
      await this.init();
    }

    // If no PKP public key is provided, throw error
    if (!this.uncompressedPubKey) {
      throw new Error('pkpPubKey (aka. uncompressPubKey) is required');
    }

    if (this.controllerAuthSig && this.controllerSessionSigs) {
      throw new Error(
        'controllerAuthSig, controllerSessionSigs and controllerAuthMethod are defined, can only use one authorization type'
      );
    }

    try {
      let sig;
      if (this.controllerAuthSig) {
        sig = await this.litNodeClient.pkpSign({
          toSign: toSign,
          pubKey: this.uncompressedPubKey,
          authSig: this.controllerAuthSig as AuthSig,
          authMethods: [],
        });
      } else if (this.controllerSessionSigs) {
        sig = await this.litNodeClient.pkpSign({
          toSign,
          pubKey: this.uncompressedPubKey,
          authMethods: this.controllerAuthMethods ?? [],
          sessionSigs: this.controllerSessionSigs,
        });
      } else if (this.controllerAuthMethods) {
        sig = await this.litNodeClient.pkpSign({
          toSign,
          pubKey: this.uncompressedPubKey,
          authMethods: this.controllerAuthMethods,
        });
      }

      // pad sigs with 0 if length is odd
      sig.r = sig.r.length % 2 === 0 ? sig.r : '0' + sig.r;
      sig.s = sig.s.length % 2 === 0 ? sig.s : '0' + sig.s;

      return sig;
    } catch (e) {
      console.log('err: ', e);
    }
  }

  /**
   * Ensures that the LitNode client is ready for use by waiting for initialization if necessary.
   * If the client is already ready, this function does nothing.
   *
   * @returns {Promise<void>} - A Promise that resolves when the LitNode client is ready for use.
   */
  async ensureLitNodeClientReady(): Promise<void> {
    if (!this.litNodeClientReady) {
      await this.init();
    }
  }

  /**
   * Logs the provided arguments to the console, but only if debugging is enabled.
   *
   * @param {...any[]} args - The values to be logged to the console.
   *
   * @returns {void} - This function does not return a value.
   */

  log(...args: any[]): void {
    if (this.debug) {
      console.log(this.orange + this.PREFIX + this.reset, ...args);
    }
  }

  /**
   * Logs an error message to the console and throws an Error with the same message.
   *
   * @param {string} message - The error message to be logged and thrown.
   *
   * @returns {never} - This function does not return a value since it always throws an Error.
   */

  throwError = (message: string): never => {
    console.error(
      this.orange + this.PREFIX + this.reset,
      this.red + message + this.reset
    );
    throw new Error(message);
  };
}
