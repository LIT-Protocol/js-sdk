/**
 * This module defines the PKPBase class, which provides a base implementation for wallet functionality
 * that can be shared between Ethers and Cosmos signers. The class is responsible for managing public key
 * compression, initializing and connecting to the LIT node, and running LIT actions based on provided properties.
 * The class also includes debug functions for logging and error handling.
 *
 * The module exports the PKPBase class, as well as the PKPBaseProp type definition used for
 * initializing the class instances.
 */
import { pino, Logger } from 'pino';

import {
  InitError,
  LitNodeClientNotReadyError,
  UnknownError,
} from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { publicKeyConvert } from '@lit-protocol/misc';
import {
  AuthenticationContext,
  JsonExecutionSdkParams,
  PKPBaseProp,
  PKPBaseDefaultParams,
  SigResponse,
  RPCUrls,
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
  const uint8array = Buffer.from(pubKey, 'hex');
  const compressedKey = publicKeyConvert(uint8array, true);
  const hex = Buffer.from(compressedKey).toString('hex');

  return hex;
};

/**
 * A base class that can be shared between Ethers and Cosmos signers.
 */
export class PKPBase<T = PKPBaseDefaultParams> {
  readonly #logger: Logger;
  rpcs?: RPCUrls;

  authContext: AuthenticationContext;

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

  get litNodeClientReady(): boolean {
    return this.litNodeClient.ready;
  }

  // Rest of the PKPBase class...

  private constructor(pkpBaseProp: PKPBaseProp) {
    const prop = { ...pkpBaseProp }; // Avoid modifications to the received object

    this.debug = prop.debug || false;
    this.#logger = pino({
      name: 'PKPBase',
      level: this.debug ? 'debug' : 'info',
    });

    if (prop.pkpPubKey.startsWith('0x')) {
      prop.pkpPubKey = prop.pkpPubKey.slice(2);
    }

    this.setUncompressedPubKeyAndBuffer(prop);
    this.setCompressedPubKeyAndBuffer(prop);

    this.rpcs = prop.rpcs;

    this.#logger.info('authContext:', prop.authContext);
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
      throw new UnknownError(
        {
          info: {
            param: 'pkpPubKey',
            value: prop.pkpPubKey,
          },
          cause: e,
        },
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
      throw new UnknownError(
        {
          info: {
            param: 'pkpPubKey',
            value: prop.pkpPubKey,
          },
          cause: e,
        },
        'Failed to set compressed public key and buffer'
      );
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
      throw new InitError(
        {
          info: {
            pkpBaseProp,
          },
        },
        'Both litActionCode and litActionIPFS cannot be present at the same time.'
      );
    }

    if (!pkpBaseProp.litActionCode && !pkpBaseProp.litActionIPFS) {
      this.#logger.debug(
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
      this.#logger.debug('Connected to Lit Node');
    } catch (e) {
      throw new LitNodeClientNotReadyError(
        {
          info: {
            litNodeConfig: this.litNodeClient.config,
          },
          cause: e,
        },
        'Failed to connect to Lit Node'
      );
    }
  }

  private validateAuthContext() {
    if (!this.authContext) {
      throw new InitError(
        {
          info: {
            authContext: this.authContext,
          },
        },
        'Must specify one, and only one, authentication method '
      );
    }

    // Check if authContext is provided correctly
    if (!this.authContext) {
      throw new InitError(
        {
          info: {
            authContext: this.authContext,
          },
        },
        'authContext must be provided'
      );
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async runLitAction(toSign: Uint8Array, sigName: string): Promise<any> {
    // -- validate executeJsArgs
    if (this.litActionCode && this.litActionIPFS) {
      throw new InitError(
        {
          info: {
            litActionCode: this.litActionCode,
            litActionIPFS: this.litActionIPFS,
          },
        },
        'litActionCode and litActionIPFS cannot exist at the same time'
      );
    }

    await this.ensureLitNodeClientReady();

    // If no PKP public key is provided, throw error
    if (!this.uncompressedPubKey) {
      throw new InitError(
        {},
        'pkpPubKey (aka. uncompressedPubKey) is required'
      );
    }

    this.validateAuthContext();

    const executeJsArgs: JsonExecutionSdkParams = {
      ...(this.litActionCode && { code: this.litActionCode }),
      ...(this.litActionIPFS && { ipfsId: this.litActionIPFS }),
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
      authContext: this.authContext,
    };

    // check if executeJsArgs has either code or ipfsId
    if (!executeJsArgs.code && !executeJsArgs.ipfsId) {
      throw new InitError(
        {
          info: {
            litActionCode: this.litActionCode,
            litActionIPFS: this.litActionIPFS,
          },
        },
        'executeJsArgs must have either code or ipfsId'
      );
    }

    this.#logger.debug('executeJsArgs:', executeJsArgs);

    const res = await this.litNodeClient.executeJs(executeJsArgs);

    const sig = res.signatures[sigName];

    this.#logger.debug('res:', res);
    this.#logger.debug('res.signatures[sigName]:', sig);

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
      throw new InitError(
        {},
        'pkpPubKey (aka. uncompressedPubKey) is required'
      );
    }

    this.validateAuthContext();

    const sig = await this.litNodeClient.pkpSign({
      toSign,
      pubKey: this.uncompressedPubKey,
      authContext: this.authContext,
    });

    if (!sig) {
      throw new UnknownError({}, 'No signature returned');
    }

    // pad sigs with 0 if length is odd
    sig.r = sig.r.length % 2 === 0 ? sig.r : '0' + sig.r;
    sig.s = sig.s.length % 2 === 0 ? sig.s : '0' + sig.s;

    return sig;
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
}
