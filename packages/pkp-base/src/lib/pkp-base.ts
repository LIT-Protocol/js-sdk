/**
 * This module defines the PKPBaseWallet class, which provides a base implementation for wallet functionality
 * that can be shared between Ethers and Cosmos signers. The class is responsible for managing public key
 * compression, initializing and connecting to the LIT node, and running LIT actions based on provided properties.
 * The class also includes debug functions for logging and error handling.
 *
 * The module exports the PKPBaseWallet class, as well as the PKPBaseWalletProp type definition used for
 * initializing the class instances.
 */

import {
  ExecuteJsProps,
  PKPBaseWalletProp,
  JsonAuthSig,
} from '@lit-protocol/types';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import EthCrypto from 'eth-crypto';

/**
 * A base class that can be shared between Ethers and Cosmos signers.
 */
export class PKPBaseWallet {
  pkpWalletProp: PKPBaseWalletProp;
  uncompressedPubKey!: string;
  uncompressedPubKeyBuffer!: Uint8Array;
  compressedPubKey!: string;
  compressedPubKeyBuffer!: Uint8Array;
  litNodeClient!: LitNodeClient;
  litNodeClientReady: boolean = false;
  litActionCode?: string;
  litActionIPFS?: string;
  litActionJsParams: any;
  debug: boolean;
  defaultLitActionCode: string = `
  (async () => {
      const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
  })();`;

  // -- debug things
  PREFIX = '[PKPCosmosWallet]';
  orange = '\x1b[33m';
  reset = '\x1b[0m';
  red = '\x1b[31m';

  /**
   * Constructor for the PKPBaseWallet class.
   * Initializes the instance with the provided properties.
   *
   * @param { PKPBaseWalletProp } prop - The properties for the PKPBaseWallet instance.
   */
  constructor(prop: PKPBaseWalletProp) {
    if (prop.pkpPubKey.startsWith('0x')) {
      prop.pkpPubKey = prop.pkpPubKey.slice(2);
    }

    this.log('prop.pkpPubKey', prop.pkpPubKey);

    this.pkpWalletProp = prop;
    this.setUncompressPubKeyAndBuffer(prop);
    this.setCompressedPubKeyAndBuffer(prop);
    this.debug = prop.debug || false;
    this.setLitAction(prop);
    this.litActionJsParams = prop.litActionJsParams || {};
    this.litNodeClient = new LitNodeClient({
      litNetwork: prop.litNetwork ?? 'serrano',
      debug: this.debug,
    });
  }

  /**
   * Sets the uncompressed public key and its buffer representation.
   *
   * @param { PKPBaseWalletProp } prop - The properties for the PKPBaseWallet instance.
   */
  setUncompressPubKeyAndBuffer(prop: PKPBaseWalletProp): void | never {
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
   * @param {PKPBaseWalletProp} prop - The properties for the PKPBaseWallet instance.
   */
  setCompressedPubKeyAndBuffer(prop: PKPBaseWalletProp): void | never {
    try {
      this.compressedPubKey = EthCrypto.publicKey.compress(prop.pkpPubKey);
      this.compressedPubKeyBuffer = Buffer.from(this.compressedPubKey, 'hex');
    } catch (e) {
      return this.throwError('Failed to set compressed public key and buffer');
    }
  }

  /**
   * Sets the LIT action code or IPFS hash.
   *
   * @param {PKPBaseWalletProp} prop - The properties for the PKPBaseWallet instance.
   */
  setLitAction(prop: PKPBaseWalletProp): never | void {
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
      this.litActionCode = this.defaultLitActionCode;
    }
  }

  /**
   * Initializes the PKPBaseWallet instance by connecting to the LIT node.
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
   * Runs the LIT action with the given parameters.
   *
   * @param {Uint8Array} toSign - The data to be signed.
   * @param {string} sigName - The signature name.
   * @returns {Promise<any>} - The result of the LIT action.
   */
  async runLitAction(toSign: Uint8Array, sigName: string): Promise<any> {
    // If no PKP public key is provided, throw error
    if (!this.pkpWalletProp.pkpPubKey) {
      throw new Error('pkpPubKey is required');
    }

    // If no authSig or sessionSigs are provided, throw error
    if (
      !this.pkpWalletProp.controllerAuthSig &&
      !this.pkpWalletProp.controllerSessionSigs
    ) {
      throw new Error('controllerAuthSig or controllerSessionSigs is required');
    }

    // If session sigs are provided, they must be an object
    if (
      this.pkpWalletProp.controllerSessionSigs &&
      typeof this.pkpWalletProp.controllerSessionSigs !== 'object'
    ) {
      throw new Error('controllerSessionSigs must be an object');
    }

    // If authSig is not provided but sessionSigs are, use the first sessionSig as authSig. In executeJs, the sessionSigs will take priority.
    let authSig = this.pkpWalletProp.controllerAuthSig;
    if (
      !authSig &&
      this.pkpWalletProp.controllerSessionSigs &&
      Object.values(this.pkpWalletProp.controllerSessionSigs).length > 0
    ) {
      authSig = Object.values(
        this.pkpWalletProp.controllerSessionSigs
      )[0] as unknown as JsonAuthSig;
    }

    if (!authSig) {
      return this.throwError('authSig is required');
    }

    const executeJsArgs: ExecuteJsProps = {
      ...(this.litActionCode && { code: this.litActionCode }),
      ...(this.litActionIPFS && { ipfsId: this.litActionIPFS }),
      authSig: authSig,
      sessionSigs: this.pkpWalletProp.controllerSessionSigs,
      jsParams: {
        ...{
          toSign,
          publicKey: this.pkpWalletProp.pkpPubKey,
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
      const res = await this.litNodeClient.executeJs(executeJsArgs);

      let sig = res.signatures[sigName];

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

  async ensureLitNodeClientReady(): Promise<void> {
    if (!this.litNodeClientReady) {
      await this.init();
    }
  }

  // Debug functions
  log(...args: any[]): void {
    if (this.debug) {
      console.log(this.orange + this.PREFIX + this.reset, ...args);
    }
  }

  throwError = (message: string): never => {
    console.error(
      this.orange + this.PREFIX + this.reset,
      this.red + message + this.reset
    );
    throw new Error(message);
  };
}
