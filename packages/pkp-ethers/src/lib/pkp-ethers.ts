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
import { PKPClientHelpers, PKPEthersWalletProp } from '@lit-protocol/types';
import { PKPBase } from '@lit-protocol/pkp-base';
import { ethRequestHandler } from './handler';
import {
  ETHHandlerReq,
  ETHRequestSigningPayload,
  ETHSignature,
  ETHTxRes,
} from './pkp-ethers-types';

const logger = new Logger(version);

const DEFAULT_RPC_URL = 'https://lit-protocol.calderachain.xyz/http';

export class PKPEthersWallet
  extends PKPBase
  implements Signer, ExternallyOwnedAccount, TypedDataSigner, PKPClientHelpers
{
  readonly address!: string;
  readonly provider!: Provider;
  readonly _isSigner!: boolean;

  rpcProvider: ethers.providers.JsonRpcProvider;

  constructor(prop: PKPEthersWalletProp) {
    super(prop);

    this.rpcProvider = new ethers.providers.JsonRpcProvider(
      prop.rpc ?? DEFAULT_RPC_URL
    );

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

  get publicKey(): string {
    return this.uncompressedPubKey;
  }

  getAddress(): Promise<string> {
    const addr = computeAddress(this.uncompressedPubKeyBuffer);
    return Promise.resolve(addr);
  }

  override getAccount(): string {
    return this.address;
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

      this.log('running lit action => sigName: pkp-eth-sign-tx');
      const signature = (await this.runLitAction(toSign, 'pkp-eth-sign-tx'))
        .signature;

      this.log('signature', signature);

      return serialize(<UnsignedTransaction>tx, signature);
    });
  }

  async signMessage(message: Bytes | string): Promise<string> {
    if (!this.litNodeClientReady) {
      await this.init();
    }

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

  async sendTransaction(transaction: TransactionRequest | any): Promise<any> {
    this.log('sendTransaction => transaction:', transaction);

    let res;

    try {
      res = await this.rpcProvider.sendTransaction(transaction);
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

  call(
    transaction: ethers.utils.Deferrable<TransactionRequest>,
    blockTag?: ethers.providers.BlockTag | undefined
  ): Promise<string> {
    return this.throwError(`Not available in PKPEthersWallet`);
  }

  getChainId(): Promise<number> {
    return this.throwError(`Not available in PKPEthersWallet`);
  }

  getGasPrice(): Promise<ethers.BigNumber> {
    return this.rpcProvider.getGasPrice();
  }

  getFeeData(): Promise<ethers.providers.FeeData> {
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
    return this.throwError(`Not available in PKPEthersWallet`);
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
