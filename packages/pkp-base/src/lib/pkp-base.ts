/**
 * This module defines the PKPBase class, which provides a base implementation for wallet functionality
 * that can be shared between Ethers and Cosmos signers. The class is responsible for managing public key
 * compression, initializing and connecting to the LIT node, and running LIT actions based on provided properties.
 * The class also includes debug functions for logging and error handling.
 *
 * The module exports the PKPBase class, as well as the PKPBaseProp type definition used for
 * initializing the class instances.
 */

import { publicKeyConvert } from 'secp256k1';

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { logError } from '@lit-protocol/misc';
import {
  AuthenticationProps,
  JsonExecutionSdkParams,
  PKPBaseProp,
  AuthSig,
  PKPBaseDefaultParams,
  SigResponse,
  RPCUrls,
  AuthMethod,
  SessionSigsMap,
} from '@lit-protocol/types';

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

  // @deprecated
  controllerAuthSig?: AuthSig;
  controllerAuthMethods?: AuthMethod[];
  controllerSessionSigs?: SessionSigsMap;
  authContext?: AuthenticationProps;

  uncompressedPubKey!: string;
  uncompressedPubKeyBuffer!: Uint8Array;
  compressedPubKey!: string;
  compressedPubKeyBuffer!: Uint8Array;

  litNodeClient!: LitNodeClient;
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

  get litNodeClientReady(): boolean {
    return this.litNodeClient.ready;
  }

  /**
   * Constructor for the PKPBase class.
   * Initializes the instance with the provided properties.
   * Marked as private to make class final. When creating an instance use PKPBase.createInstance
   *
   * @param { PKPBaseProp } pkpBaseProp - The properties for the PKPBase instance.
   */
  private constructor(pkpBaseProp: PKPBaseProp) {
    const prop = { ...pkpBaseProp }; // Avoid modifications to the received object

    this.debug = prop.debug || false;

    if (prop.pkpPubKey.startsWith('0x')) {
      prop.pkpPubKey = prop.pkpPubKey.slice(2);
    }

    this.setUncompressedPubKeyAndBuffer(prop);
    this.setCompressedPubKeyAndBuffer(prop);

    this.rpcs = prop.rpcs;
    this.controllerAuthSig = prop.controllerAuthSig;
    this.controllerAuthMethods = prop.controllerAuthMethods;
    this.controllerSessionSigs = prop.controllerSessionSigs;
    this.authContext = prop.authContext;

    this.validateAuthContext();

    this.setLitAction(prop);
    this.setLitActionJsParams(prop.litActionJsParams || {});
    this.litNodeClient = prop.litNodeClient as LitNodeClient;
  }

  /**
   * Creates a new instance of the PKPBase class with the provided properties.
   *
   * @param { PKPBaseProp } pkpBaseProp - The properties for the PKPBase instance.
   *
   * @returns { PKPBase } - A new instance of the PKPBase class.
   * */
  static createInstance(pkpBaseProp: PKPBaseProp): PKPBase {
    return new PKPBase(pkpBaseProp);
  }

  /**
   * Sets the uncompressed public key and its buffer representation.
   *
   * @param { PKPBaseProp } prop - The properties for the PKPBase instance.
   */
  private setUncompressedPubKeyAndBuffer(prop: PKPBaseProp): void | never {
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
  private setCompressedPubKeyAndBuffer(prop: PKPBaseProp): void | never {
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
   * @param {PKPBaseProp} pkpBaseProp - An object containing the parameters for the Lit action.
   *
   * @returns {void} - If both `litActionCode` and `litActionIPFS` are present, throws an Error. Otherwise, does not return a value.
   */

  private setLitAction(pkpBaseProp: PKPBaseProp): void {
    this.litActionCode = pkpBaseProp.litActionCode;
    this.litActionIPFS = pkpBaseProp.litActionIPFS;

    if (pkpBaseProp.litActionCode && pkpBaseProp.litActionIPFS) {
      return this.throwError(
        'Both litActionCode and litActionIPFS cannot be present at the same time.'
      );
    }

    if (!pkpBaseProp.litActionCode && !pkpBaseProp.litActionIPFS) {
      this.log(
        'No lit action code or IPFS hash provided. Using default action.'
      );
      this.useAction = false;
    }
  }

  /**
   * A function that sets the value of the litActionJsParams property to the given params object.
   * @template CustomType - A generic type that extends T, where T is the type of the litActionJsParams property.
   *
   * @param { CustomType } params - An object of type CustomType that contains the parameters to be set as litActionJsParams.
   *
   * @returns { void }
   */
  private setLitActionJsParams<CustomType extends T = T>(
    params: CustomType
  ): void {
    this.litActionJsParams = params;
  }

  /**
   * Initializes the PKPBase instance by connecting to the LIT node.
   */
  async init(): Promise<void> {
    try {
      await this.litNodeClient.connect();
      this.log('Connected to Lit Node');
    } catch (e) {
      return this.throwError('Failed to connect to Lit Node');
    }
  }

  private validateAuthContext() {
    const providedAuthentications = [
      this.controllerAuthSig,
      this.controllerSessionSigs,
      this.authContext,
    ].filter(Boolean).length;

    if (providedAuthentications !== 1) {
      // log which authentications has the user provided
      if (this.controllerAuthSig) {
        logError('controllerAuthSig is provided');
      }

      if (this.controllerSessionSigs) {
        logError('controllerSessionSigs is provided');
      }

      if (this.authContext) {
        logError('authContext is provided');
      }

      this.throwError('Must specify one, and only one, authentication method ');
    }

    // Check if authContext is provided correctly
    if (this.authContext && !this.authContext.getSessionSigsProps) {
      this.throwError('authContext must be an object with getSessionSigsProps');
    }
  }

  private async getSessionSigs(): Promise<SessionSigsMap> {
    const sessionSigs = this.authContext
      ? await this.litNodeClient.getSessionSigs(
          this.authContext.getSessionSigsProps
        )
      : this.controllerSessionSigs;

    if (!sessionSigs) {
      this.throwError('Could not get sessionSigs');
    }

    return sessionSigs!;
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
    // -- validate executeJsArgs
    if (this.litActionCode && this.litActionIPFS) {
      return this.throwError(
        'litActionCode and litActionIPFS cannot exist at the same time'
      );
    }

    await this.ensureLitNodeClientReady();

    // If no PKP public key is provided, throw error
    if (!this.uncompressedPubKey) {
      this.throwError('pkpPubKey (aka. uncompressesPubKey) is required');
    }

    this.validateAuthContext();

    const controllerSessionSigs = await this.getSessionSigs();

    const executeJsArgs: JsonExecutionSdkParams = {
      ...(this.litActionCode && { code: this.litActionCode }),
      ...(this.litActionIPFS && { ipfsId: this.litActionIPFS }),
      sessionSigs: controllerSessionSigs,
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

    const res = await this.litNodeClient.executeJs(executeJsArgs);

    const sig = res.signatures[sigName];

    this.log('res:', res);
    this.log('res.signatures[sigName]:', sig);

    if (sig.r && sig.s) {
      // pad sigs with 0 if length is odd
      sig.r = sig.r.length % 2 === 0 ? sig.r : '0' + sig.r;
      sig.s = sig.s.length % 2 === 0 ? sig.s : '0' + sig.s;
    }

    return sig;
  }

  /**
   * Sign the provided data with the PKP private key.
   *
   * @param {Uint8Array} toSign - The data to be signed.
   *
   * @returns {Promise<any>} - A Promise that resolves with the signature of the provided data.
   *
   * @throws {Error} - Throws an error if `pkpPubKey` is not provided, if `controllerAuthSig` or `controllerSessionSigs` is not provided, if `controllerSessionSigs` is not an object, or if an error occurs during the signing process.
   */
  async runSign(toSign: Uint8Array): Promise<SigResponse> {
    await this.ensureLitNodeClientReady();

    // If no PKP public key is provided, throw error
    if (!this.uncompressedPubKey) {
      this.throwError('pkpPubKey (aka. uncompressedPubKey) is required');
    }

    this.validateAuthContext();

    const controllerSessionSigs = await this.getSessionSigs();

    try {
      const sig = await this.litNodeClient.pkpSign({
        toSign,
        pubKey: this.uncompressedPubKey,
        sessionSigs: controllerSessionSigs,
      });

      if (!sig) {
        throw new Error('No signature returned');
      }

      // pad sigs with 0 if length is odd
      sig.r = sig.r.length % 2 === 0 ? sig.r : '0' + sig.r;
      sig.s = sig.s.length % 2 === 0 ? sig.s : '0' + sig.s;

      return sig;
    } catch (e) {
      console.log('err: ', e);
      throw e;
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
