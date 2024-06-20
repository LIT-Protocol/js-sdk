import {
  DevInspectResults,
  DryRunTransactionBlockResponse,
  ExecuteTransactionRequestType,
  FaucetResponse,
  HttpHeaders,
  IntentScope,
  JsonRpcProvider,
  Secp256k1PublicKey,
  SignedMessage,
  SignedTransaction,
  Signer,
  SignerWithProvider,
  SuiAddress,
  SuiTransactionBlockResponse,
  SuiTransactionBlockResponseOptions,
  TransactionBlock,
  fromB64,
  messageWithIntent,
  toB64,
  toSerializedSignature,
  getTotalGasUsedUpperBound,
} from '@mysten/sui.js';
import {
  hexToBytes,
  numberToBytesBE,
  bytesToHex,
} from '@noble/curves/abstract/utils';
import { secp256k1 } from '@noble/curves/secp256k1';
import { blake2b } from '@noble/hashes/blake2b';
import { sha256 } from '@noble/hashes/sha256';

import { PKPBase } from '@lit-protocol/pkp-base';
import { PKPBaseProp, SigResponse } from '@lit-protocol/types';

import { getDigestFromBytes } from './TransactionBlockData';

export class PKPSuiWallet implements Signer {
  private readonly pkpBase: PKPBase;

  readonly provider: JsonRpcProvider;
  readonly prop: PKPBaseProp;
  readonly publicKey: Secp256k1PublicKey;

  // Default Lit Action signature name
  defaultSigName: string = 'pkp-sui-sign-tx';

  constructor(prop: PKPBaseProp, provider: JsonRpcProvider) {
    this.pkpBase = new PKPBase(prop);

    this.prop = prop;
    this.provider = provider;
    this.publicKey = new Secp256k1PublicKey(
      this.pkpBase.compressedPubKeyBuffer
    );
  }

  /**
   * Initializes the PKPSuiWallet instance and its dependencies
   */
  async init(): Promise<void> {
    await this.pkpBase.init();
  }

  async getAddress(): Promise<SuiAddress> {
    return this.publicKey.toSuiAddress();
  }

  async signData(data: Uint8Array): Promise<string> {
    // Check if the LIT node client is connected, and connect if it's not.
    await this.pkpBase.ensureLitNodeClientReady();

    const digest = blake2b(data, { dkLen: 32 });
    const msgHash = sha256(digest);
    const signature = await this.runSign(msgHash);
    const numToNByteStr = (num: number | bigint): string =>
      bytesToHex(numberToBytesBE(num, secp256k1.CURVE.nByteLength));

    // TODO response from PKPBase.runSign has this values defined as strings
    const compactHex =
      (typeof signature.r === 'string'
        ? signature.r
        : numToNByteStr(signature.r)) +
      (typeof signature.s === 'string'
        ? signature.s
        : numToNByteStr(signature.s));
    const compactRawBytes = hexToBytes(compactHex);

    const result = toSerializedSignature({
      signature: compactRawBytes,
      signatureScheme: 'Secp256k1',
      pubKey: this.publicKey,
    });
    return result;
  }

  connect(provider: JsonRpcProvider): PKPSuiWallet {
    return new PKPSuiWallet(this.prop, provider);
  }

  ///////////////////
  // Sub-classes MAY override these

  /**
   * Request gas tokens from a faucet server and send to the signer
   * address
   * @param httpHeaders optional request headers
   */
  async requestSuiFromFaucet(
    httpHeaders?: HttpHeaders
  ): Promise<FaucetResponse> {
    return this.provider.requestSuiFromFaucet(
      await this.getAddress(),
      httpHeaders
    );
  }

  /**
   * Sign a message using the keypair, with the `PersonalMessage` intent.
   */
  async signMessage(input: { message: Uint8Array }): Promise<SignedMessage> {
    const signature = await this.signData(
      messageWithIntent(IntentScope.PersonalMessage, input.message)
    );

    return {
      messageBytes: toB64(input.message),
      signature,
    };
  }

  protected async prepareTransactionBlock(
    transactionBlock: Uint8Array | TransactionBlock
  ) {
    if (TransactionBlock.is(transactionBlock)) {
      // If the sender has not yet been set on the transaction, then set it.
      // NOTE: This allows for signing transactions with mis-matched senders, which is important for sponsored transactions.
      transactionBlock.setSenderIfNotSet(await this.getAddress());
      return await transactionBlock.build({
        provider: this.provider,
      });
    }
    if (transactionBlock instanceof Uint8Array) {
      return transactionBlock;
    }
    throw new Error('Unknown transaction format');
  }

  /**
   * Sign a transaction.
   */
  async signTransactionBlock(input: {
    transactionBlock: Uint8Array | TransactionBlock;
  }): Promise<SignedTransaction> {
    const transactionBlockBytes = await this.prepareTransactionBlock(
      input.transactionBlock
    );

    const intentMessage = messageWithIntent(
      IntentScope.TransactionData,
      transactionBlockBytes
    );
    const signature = await this.signData(intentMessage);

    return {
      transactionBlockBytes: toB64(transactionBlockBytes),
      signature,
    };
  }

  /**
   * Sign a transaction block and submit to the Fullnode for execution.
   *
   * @param options specify which fields to return (e.g., transaction, effects, events, etc).
   * By default, only the transaction digest will be returned.
   * @param requestType WaitForEffectsCert or WaitForLocalExecution, see details in `ExecuteTransactionRequestType`.
   * Defaults to `WaitForLocalExecution` if options.show_effects or options.show_events is true
   */
  async signAndExecuteTransactionBlock(input: {
    transactionBlock: Uint8Array | TransactionBlock;
    /** specify which fields to return (e.g., transaction, effects, events, etc). By default, only the transaction digest will be returned. */
    options?: SuiTransactionBlockResponseOptions;
    /** `WaitForEffectsCert` or `WaitForLocalExecution`, see details in `ExecuteTransactionRequestType`.
     * Defaults to `WaitForLocalExecution` if options.show_effects or options.show_events is true
     */
    requestType?: ExecuteTransactionRequestType;
  }): Promise<SuiTransactionBlockResponse> {
    const { transactionBlockBytes, signature } =
      await this.signTransactionBlock({
        transactionBlock: input.transactionBlock,
      });

    return await this.provider.executeTransactionBlock({
      transactionBlock: transactionBlockBytes,
      signature,
      options: input.options,
      requestType: input.requestType,
    });
  }

  /**
   * Derive transaction digest from
   * @param tx BCS serialized transaction data or a `Transaction` object
   * @returns transaction digest
   */
  async getTransactionBlockDigest(
    tx: Uint8Array | TransactionBlock
  ): Promise<string> {
    if (TransactionBlock.is(tx)) {
      tx.setSenderIfNotSet(await this.getAddress());
      return tx.getDigest({ provider: this.provider });
    } else if (tx instanceof Uint8Array) {
      return getDigestFromBytes(tx);
    } else {
      throw new Error('Unknown transaction format.');
    }
  }

  /**
   * Runs the transaction in dev-inspect mode. Which allows for nearly any
   * transaction (or Move call) with any arguments. Detailed results are
   * provided, including both the transaction effects and any return values.
   */
  async devInspectTransactionBlock(
    input: Omit<
      Parameters<JsonRpcProvider['devInspectTransactionBlock']>[0],
      'sender'
    >
  ): Promise<DevInspectResults> {
    const address = await this.getAddress();
    return this.provider.devInspectTransactionBlock({
      sender: address,
      ...input,
    });
  }

  /**
   * Dry run a transaction and return the result.
   */
  async dryRunTransactionBlock(input: {
    transactionBlock: TransactionBlock | string | Uint8Array;
  }): Promise<DryRunTransactionBlockResponse> {
    let dryRunTxBytes: Uint8Array;
    if (TransactionBlock.is(input.transactionBlock)) {
      input.transactionBlock.setSenderIfNotSet(await this.getAddress());
      dryRunTxBytes = await input.transactionBlock.build({
        provider: this.provider,
      });
    } else if (typeof input.transactionBlock === 'string') {
      dryRunTxBytes = fromB64(input.transactionBlock);
    } else if (input.transactionBlock instanceof Uint8Array) {
      dryRunTxBytes = input.transactionBlock;
    } else {
      throw new Error('Unknown transaction format');
    }

    return this.provider.dryRunTransactionBlock({
      transactionBlock: dryRunTxBytes,
    });
  }

  /**
   * Returns the estimated gas cost for the transaction
   * @param tx The transaction to estimate the gas cost. When string it is assumed it's a serialized tx in base64
   * @returns total gas cost estimation
   * @throws whens fails to estimate the gas cost
   */
  async getGasCostEstimation(
    ...args: Parameters<SignerWithProvider['dryRunTransactionBlock']>
  ) {
    const txEffects = await this.dryRunTransactionBlock(...args);
    const gasEstimation = getTotalGasUsedUpperBound(txEffects.effects);
    if (typeof gasEstimation === 'undefined') {
      throw new Error('Failed to estimate the gas cost from transaction');
    }
    return gasEstimation;
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
    return this.pkpBase.runLitAction(toSign, sigName);
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
    return this.pkpBase.runSign(toSign);
  }
}
