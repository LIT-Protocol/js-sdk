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
  concat,
  hexDataSlice,
  joinSignature,
} from '@ethersproject/bytes';
import { hashMessage, _TypedDataEncoder } from '@ethersproject/hash';
import { defaultPath, HDNode, entropyToMnemonic } from '@ethersproject/hdnode';
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

import { ethers, Wallet } from 'ethers';
import {
  LITChainRequiredProps,
  PKPClientHelpers,
  PKPEthersWalletProp,
} from '@lit-protocol/types';
import { PKPBase } from '@lit-protocol/pkp-base';
import { ethRequestHandler } from './handler';
import {
  ETHHandlerReq,
  ETHRequestSigningPayload,
  ETHSignature,
  ETHTxRes,
} from './pkp-ethers-types';
import { LIT_CHAINS } from '@lit-protocol/constants';
import { getTransactionToSign, isSignedTransaction } from './helper';

const logger = new Logger(version);

export class PKPEthersWallet
  extends PKPBase
  implements Signer, ExternallyOwnedAccount, TypedDataSigner, PKPClientHelpers
{
  readonly address!: string;
  readonly _isSigner!: boolean;

  rpcProvider: ethers.providers.JsonRpcProvider;
  provider!: Provider;

  // -- manual tx settings --
  manualGasPrice?: string;
  manualGasLimit?: string;
  nonce?: string;
  chainId?: number;

  constructor(prop: PKPEthersWalletProp) {
    super(prop);

    this.rpcProvider = new ethers.providers.JsonRpcProvider(
      prop.rpc ?? LIT_CHAINS['chronicleTestnet'].rpcUrls[0]
    );

    this.provider = prop.provider ?? this.rpcProvider;

    defineReadOnly(this, '_isSigner', true);

    defineReadOnly(
      this,
      'address',
      computeAddress(this.uncompressedPubKeyBuffer)
    );
  }

  getRpc = (): string => {
    return this.rpcProvider.connection.url;
  };

  setRpc = async (rpc: string): Promise<void> => {
    this.rpcProvider = new ethers.providers.JsonRpcProvider(rpc);
  };

  handleRequest = async <T = ETHSignature | ETHTxRes>(
    payload: ETHRequestSigningPayload
  ): Promise<T> => {
    return await ethRequestHandler<T>({
      signer: this,
      payload,
    });
  };

  request = async <T = ETHSignature | ETHTxRes>(
    payload: ETHRequestSigningPayload
  ): Promise<T> => {
    return this.handleRequest<T>(payload);
  };

  setGasPrice = (gasPrice: string): void => {
    this.manualGasPrice = gasPrice;
  };

  setGasLimit = (gasLimit: string): void => {
    this.manualGasLimit = gasLimit;
  };

  setNonce = (nonce: string): void => {
    this.nonce = nonce;
  };

  setChainId = (chainId: number): void => {
    this.chainId = chainId;
  };

  resetManualSettings = (): void => {
    this.manualGasPrice = undefined;
    this.manualGasLimit = undefined;
    this.nonce = undefined;
    this.chainId = undefined;
  };

  get publicKey(): string {
    return this.uncompressedPubKey;
  }

  override getAddress(): Promise<string> {
    const addr = computeAddress(this.uncompressedPubKeyBuffer);
    return Promise.resolve(addr);
  }

  connect(): never {
    throw new Error('Use setRPC to set a new JSON RPC provider');
  }

  async signTransaction(transaction: TransactionRequest): Promise<string> {
    this.log('signTransaction => transaction:', transaction);

    if (!this.litNodeClientReady) {
      await this.init();
    }

    const addr = await this.getAddress();
    this.log('signTransaction => addr:', addr);

    // if manual settings are set, use them
    if (this.manualGasPrice) {
      transaction.gasPrice = this.manualGasPrice;
    }

    if (this.manualGasLimit) {
      transaction.gasLimit = this.manualGasLimit;
    }

    if (this.nonce) {
      transaction.nonce = this.nonce;
    }

    if (this.chainId) {
      transaction.chainId = this.chainId;
    }

    try {
      if (!transaction['gasLimit']) {
        transaction.gasLimit = await this.rpcProvider.estimateGas(transaction);
        this.log('signTransaction => gasLimit:', transaction.gasLimit);
      }

      if (!transaction['nonce']) {
        transaction.nonce = await this.rpcProvider.getTransactionCount(addr);
        this.log('signTransaction => nonce:', transaction.nonce);
      }

      if (!transaction['chainId']) {
        transaction.chainId = (await this.rpcProvider.getNetwork()).chainId;
        this.log('signTransaction => chainId:', transaction.chainId);
      }

      if (!transaction['gasPrice']) {
        transaction.gasPrice = await this.getGasPrice();
        this.log('signTransaction => gasPrice:', transaction.gasPrice);
      }
    } catch (err) {
      this.log(
        'signTransaction => unable to populate transaction with details:',
        err
      );
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
      let signature;

      if (this.useAction) {
        this.log('running lit action => sigName: pkp-eth-sign-tx');
        signature = (await this.runLitAction(toSign, 'pkp-eth-sign-tx'))
          .signature;
      } else {
        this.log('requesting signature from nodes');
        signature = (await this.runSign(toSign)).signature;
      }

      // -- reset manual settings --
      this.resetManualSettings();

      return serialize(<UnsignedTransaction>tx, signature);
    });
  }

  async signMessage(message: Bytes | string): Promise<string> {
    if (!this.litNodeClientReady) {
      await this.init();
    }

    const toSign = arrayify(hashMessage(message));
    let signature;
    if (this.useAction) {
      this.log('running lit action => sigName: pkp-eth-sign-message');
      signature = await this.runLitAction(toSign, 'pkp-eth-sign-message');
    } else {
      this.log('requesting signature from nodes');
      signature = await this.runSign(toSign);
    }

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
    if (!this.litNodeClientReady) {
      await this.init();
    }

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
    const toSignBuffer = arrayify(toSign);
    let signature;

    if (this.useAction) {
      this.log('running lit action => sigName: pkp-eth-sign-message');
      signature = await this.runLitAction(toSignBuffer, 'pkp-eth-sign-message');
    } else {
      this.log('requesting signature from nodes');
      signature = await this.runSign(toSignBuffer);
    }

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

  async sendTransaction(transaction: TransactionRequest | any): Promise<any> {
    this.log('sendTransaction => transaction:', transaction);

    let res;
    let signedTxn;

    try {
      if (!isSignedTransaction(transaction)) {
        const unsignedTxFormatted = getTransactionToSign(transaction);
        signedTxn = await this.signTransaction(unsignedTxFormatted);
      } else {
        signedTxn = transaction;
      }

      res = await this.rpcProvider.sendTransaction(signedTxn);
    } catch (e) {
      this.log('sendTransaction => error:', e);
      throw e;
    }

    return res;
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

  getBalance(
    blockTag?: ethers.providers.BlockTag | undefined
  ): Promise<ethers.BigNumber> {
    return this.rpcProvider.getBalance(this.address, blockTag);
  }

  getTransactionCount(
    blockTag?: ethers.providers.BlockTag | undefined
  ): Promise<number> {
    return this.rpcProvider.getTransactionCount(this.address, blockTag);
  }

  estimateGas(
    transaction: ethers.utils.Deferrable<TransactionRequest>
  ): Promise<ethers.BigNumber> {
    return this.rpcProvider.estimateGas(transaction);
  }

  async call(
    transaction: ethers.utils.Deferrable<TransactionRequest>,
    blockTag?: ethers.providers.BlockTag | undefined
  ): Promise<string> {
    if (!blockTag) {
      return this.throwError(`blockTag is required`);
    }

    const resolved = await resolveProperties({
      transaction: this.rpcProvider._getTransactionRequest(transaction),
      blockTag: this.rpcProvider._getBlockTag(blockTag),
      ccipReadEnabled: Promise.resolve(transaction.ccipReadEnabled),
    });

    // @ts-ignore
    return this.rpcProvider._call(
      resolved.transaction as TransactionRequest,
      resolved.blockTag,
      resolved.ccipReadEnabled as any
    );
  }

  async getChainId() {
    return (await this.rpcProvider.getNetwork()).chainId;
  }

  getGasPrice() {
    return this.rpcProvider.getGasPrice();
  }
  getFeeData() {
    return this.rpcProvider.getFeeData();
  }

  resolveName(name: string): Promise<string> {
    return this.throwError(`Not available in PKPEthersWallet`);
  }

  checkTransaction(
    transaction: ethers.utils.Deferrable<TransactionRequest>
  ): ethers.utils.Deferrable<TransactionRequest> {
    return this.throwError(`Not available in PKPEthersWallet`);
  }

  populateTransaction(
    transaction: ethers.utils.Deferrable<TransactionRequest>
  ): Promise<TransactionRequest> {
    return this.throwError(`Not available in PKPEthersWallet`);
  }

  _checkProvider(operation?: string | undefined): void {
    this.log('This function is not implemented yet, but will skip it for now.');
  }

  get mnemonic() {
    return this.throwError(`There's no mnemonic for a PKPWallet`);
  }

  get privateKey(): string {
    return this.throwError(
      `This PKP contains no private key (can you imagine!?)`
    );
  }
}
