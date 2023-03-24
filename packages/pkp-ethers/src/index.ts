import { getAddress } from '@ethersproject/address';
import { Provider, TransactionRequest } from '@ethersproject/abstract-provider';
import {
  ExternallyOwnedAccount,
  Signer,
  TypedDataDomain,
  TypedDataField,
  TypedDataSigner,
} from '@ethersproject/abstract-signer';
import {
  arrayify,
  Bytes,
  BytesLike,
  concat,
  hexDataSlice,
  isHexString,
  joinSignature,
  SignatureLike,
} from '@ethersproject/bytes';
import { hashMessage, _TypedDataEncoder } from '@ethersproject/hash';
import {
  defaultPath,
  HDNode,
  entropyToMnemonic,
  Mnemonic,
} from '@ethersproject/hdnode';
import { keccak256 } from '@ethersproject/keccak256';
import { defineReadOnly, resolveProperties } from '@ethersproject/properties';
import { randomBytes } from '@ethersproject/random';
import {
  decryptJsonWallet,
  decryptJsonWalletSync,
  encryptKeystore,
  ProgressCallback,
} from '@ethersproject/json-wallets';
import {
  computeAddress,
  serialize,
  UnsignedTransaction,
} from '@ethersproject/transactions';
import { Wordlist } from '@ethersproject/wordlists';
import { Logger } from '@ethersproject/logger';
import { version } from 'ethers';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

import { ethers, Wallet } from 'ethers';

const logger = new Logger(version);

export interface PKPWalletProp {
  pkpPubKey: string;
  controllerAuthSig?: any;
  controllerSessionSigs?: any;
  provider: string;
  litNetwork?: any;
  debug?: boolean;
  litActionCode?: string;
  litActionIPFS?: string;
  litActionJsParams?: any;
}

export interface PKPSigner {
  initPKP(prop: PKPWalletProp): any;
  runLitAction(toSign: Uint8Array | BytesLike): Promise<any>;
}

export class PKPWallet
  extends Signer
  implements ExternallyOwnedAccount, TypedDataSigner
{
  // @ts-ignore
  readonly address: string;
  // @ts-ignore
  readonly provider: Provider;
  pkpWalletProp: PKPWalletProp;
  litNodeClient: any;
  rpcProvider: ethers.providers.JsonRpcProvider;
  litActionCode: string | undefined;
  litActionIPFS: string | undefined;
  litActionJsParams: any;
  debug: boolean;

  log = async (...args: any) => {
    if (!this.debug) return;

    console.log('%c[PKPWallet]', 'color: #FDA778', ...args);
  };

  async runLitAction(
    toSign: Uint8Array | BytesLike,
    sigName: string
  ): Promise<any> {
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
      authSig = Object.values(this.pkpWalletProp.controllerSessionSigs)[0];
    }

    const executeJsArgs = {
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

    this.log('executeJsArgs:', executeJsArgs);

    try {
      const res = await this.litNodeClient.executeJs(executeJsArgs);

      this.log('res:', res);
      this.log('res.signatures[sigName]:', res.signatures[sigName]);

      return res.signatures[sigName];
    } catch (err) {
      console.log('err:', err);
      throw err;
    }
  }

  constructor(prop: PKPWalletProp) {
    super();

    this.pkpWalletProp = prop;

    this.debug = prop.debug || false;

    this.litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: prop.litNetwork ?? 'serrano',
      debug: prop.debug ?? false,
    });

    this.rpcProvider = new ethers.providers.JsonRpcProvider(
      this.pkpWalletProp.provider
    );

    defineReadOnly(
      this,
      'address',
      computeAddress(this.pkpWalletProp.pkpPubKey)
    );

    this.litActionCode = prop.litActionCode;

    this.litActionIPFS = prop.litActionIPFS;

    if (!this.litActionCode && !this.litActionIPFS) {
      this.log(`No code or ipfs provided. Using default code`);
      this.litActionCode = `
			(async () => {
					const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
			})();`;
    }

    if (this.litActionCode && this.litActionIPFS) {
      throw Error(`Cannot provide both code and ipfs. Using code`);
    }

    this.litActionJsParams = prop.litActionJsParams ?? {};

    this.log('prop:', prop);
  }

  get mnemonic() {
    throw new Error("There's no mnemonic for a PKPWallet");
  }

  get privateKey(): string {
    throw new Error(
      "There's no private key for a PKPWallet. (Can you imagine!?)"
    );
  }

  get publicKey(): string {
    return this.pkpWalletProp.pkpPubKey;
  }

  getAddress(): Promise<string> {
    const addr = computeAddress(this.publicKey);
    return Promise.resolve(addr);
  }

  connect(): PKPWallet {
    // throw new Error("PKPWallet cannot be connected to a provider");
    return new PKPWallet(this.pkpWalletProp);
  }

  async init() {
    await this.litNodeClient.connect();
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    const addr = await this.getAddress();

    if (!transaction['nonce']) {
      transaction.nonce = await this.rpcProvider.getTransactionCount(addr);
    }

    if (!transaction['chainId']) {
      transaction.chainId = (await this.rpcProvider.getNetwork()).chainId;
    }

    if (!transaction['gasPrice']) {
      transaction.gasPrice = await this.rpcProvider.getGasPrice();
    }

    if (!transaction['gasLimit']) {
      transaction.gasLimit = await this.rpcProvider.estimateGas(transaction);
    }

    return resolveProperties(transaction).then(async (tx) => {
      this.log('tx.from:', tx.from);
      this.log('this.address:', this.address);

      if (tx.from != null) {
        if (getAddress(tx.from) !== this.address) {
          logger.throwArgumentError(
            'transaction from address mismatch',
            'transaction.from',
            transaction.from
          );
        }
        delete tx.from;
      }

      const serializedTx = serialize(<UnsignedTransaction>tx);
      const unsignedTxn = keccak256(serializedTx);

      // -- lit action --
      const toSign = arrayify(unsignedTxn);

      this.log('running lit action => sigName: pkp-eth-sign-tx');
      const signature = (await this.runLitAction(toSign, 'pkp-eth-sign-tx'))
        .signature;

      this.log('signature', signature);

      return serialize(<UnsignedTransaction>tx, signature);
    });
  }

  async signMessage(message: Bytes | string): Promise<string> {
    const toSign = arrayify(hashMessage(message));

    this.log('running lit action => sigName: pkp-eth-sign-message');
    const signature = await this.runLitAction(toSign, 'pkp-eth-sign-message');

    return joinSignature({
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: signature.recid,
    });
  }

  async _signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): Promise<string> {
    // Populate any ENS names
    const populated = await _TypedDataEncoder.resolveNames(
      domain,
      types,
      value,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (name: string) => {
        if (this.provider == null) {
          logger.throwError(
            'cannot resolve ENS names without a provider',
            Logger.errors.UNSUPPORTED_OPERATION,
            {
              operation: 'resolveName',
              value: name,
            }
          );
        }
        return this.provider.resolveName(name);
      }
    );

    // -- lit action --
    const toSign = _TypedDataEncoder.hash(
      populated.domain,
      types,
      populated.value
    );
    const signature = await this.runLitAction(
      arrayify(toSign),
      'pkp-eth-sign-typed-data'
    );
    return joinSignature({
      r: '0x' + signature.r,
      s: '0x' + signature.s,
      v: signature.recid,
    });
  }

  encrypt(
    password: Bytes | string,
    options?: any,
    progressCallback?: ProgressCallback
  ): Promise<string> {
    if (typeof options === 'function' && !progressCallback) {
      progressCallback = options;
      options = {};
    }

    if (progressCallback && typeof progressCallback !== 'function') {
      throw new Error('invalid callback');
    }

    if (!options) {
      options = {};
    }

    return encryptKeystore(this, password, options, progressCallback);
  }

  override async sendTransaction(
    transaction: TransactionRequest | any
  ): Promise<any> {
    return await this.rpcProvider.sendTransaction(transaction);
  }

  /**
   *  Static methods to create Wallet instances.
   */
  static createRandom(options?: any): Wallet {
    let entropy: Uint8Array = randomBytes(16);

    if (!options) {
      options = {};
    }

    if (options.extraEntropy) {
      entropy = arrayify(
        hexDataSlice(keccak256(concat([entropy, options.extraEntropy])), 0, 16)
      );
    }

    const mnemonic = entropyToMnemonic(entropy, options.locale);
    return Wallet.fromMnemonic(mnemonic, options.path, options.locale);
  }

  static fromEncryptedJson(
    json: string,
    password: Bytes | string,
    progressCallback?: ProgressCallback
  ): Promise<Wallet> {
    return decryptJsonWallet(json, password, progressCallback).then(
      (account) => {
        return new Wallet(account);
      }
    );
  }

  static fromEncryptedJsonSync(json: string, password: Bytes | string): Wallet {
    return new Wallet(decryptJsonWalletSync(json, password));
  }

  static fromMnemonic(
    mnemonic: string,
    path?: string,
    wordlist?: Wordlist
  ): Wallet {
    if (!path) {
      path = defaultPath;
    }
    return new Wallet(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      HDNode.fromMnemonic(mnemonic, null, wordlist).derivePath(path)
    );
  }
}
