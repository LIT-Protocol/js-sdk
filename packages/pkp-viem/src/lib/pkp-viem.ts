export function pkpViem(): string {
  return 'pkp-viem';
}
import { PKPBase } from '@lit-protocol/pkp-base';
import { PKPBaseProp } from '@lit-protocol/types';
import {
  SignableMessage,
  isBytes,
  toBytes,
  LocalAccount,
  signatureToHex,
  Hash,
  hashMessage,
  TypedDataDefinition,
  TypedData,
  hashTypedData,
  TransactionSerializable,
  keccak256,
  Signature,
  serializeTransaction,
  SerializedTransactionReturnType,
  Hex,
  Address,
} from 'viem';
import { publicKeyToAddress, toHex } from 'viem/utils';

export class PKPViemAccount extends PKPBase implements LocalAccount {
  readonly publicKey!: Hex;
  readonly source = 'custom';
  readonly type = 'local';
  readonly address!: Address;

  defaultSigName: string = 'pkp-viem-sign';

  constructor(prop: PKPBaseProp) {
    super(prop);
    this.publicKey = toHex(this.uncompressedPubKeyBuffer);
    this.address = publicKeyToAddress(this.publicKey);
  }

  async signMessage({ message }: { message: SignableMessage }): Promise<Hash> {
    const signature = await this.sign(hashMessage(message));
    return signatureToHex(signature);
  }

  async signTypedData<
    TTypedData extends TypedData | { [key: string]: unknown },
    TPrimaryType extends string = string
  >(typedData: TypedDataDefinition<TTypedData, TPrimaryType>): Promise<Hash> {
    const signauture = await this.sign(hashTypedData(typedData));
    return signatureToHex(signauture);
  }

  async signTransaction<
    TTransactionSerializable extends TransactionSerializable
  >(
    transaction: TTransactionSerializable
  ): Promise<SerializedTransactionReturnType<TTransactionSerializable>> {
    const signature = await this.sign(
      keccak256(serializeTransaction(transaction))
    );
    return serializeTransaction(transaction, signature);
  }

  async sign(msgHash: `0x${string}` | Uint8Array): Promise<Signature> {
    await this.ensureLitNodeClientReady();

    if (isBytes(msgHash)) {
      if (this.useAction) {
        const litSignature = await this.runLitAction(msgHash, 'pkp-viem-sign');
        const signature: Signature = {
          r: `0x${litSignature.r}` as Hex,
          s: `0x${litSignature.s}` as Hex,
          v: BigInt(27 + litSignature.recid),
        };
        return signature;
      } else {
        const litSignature = await this.runSign(msgHash);
        const signature: Signature = {
          r: `0x${litSignature.r}` as Hex,
          s: `0x${litSignature.s}` as Hex,
          v: BigInt(27 + litSignature.recid),
        };
        return signature;
      }
    } else {
      const msgHashUint8Array: Uint8Array = toBytes(msgHash);
      if (this.useAction) {
        const litSignature = await this.runLitAction(
          msgHashUint8Array,
          'pkp-viem-sign'
        );
        const signature: Signature = {
          r: `0x${litSignature.r}` as Hex,
          s: `0x${litSignature.s}` as Hex,
          v: BigInt(27 + litSignature.recid),
        };
        return signature;
      } else {
        const litSignature = await this.runSign(msgHashUint8Array);
        const signature: Signature = {
          r: `0x${litSignature.r}` as Hex,
          s: `0x${litSignature.s}` as Hex,
          v: BigInt(27 + litSignature.recid),
        };
        return signature;
      }
    }
  }
}
