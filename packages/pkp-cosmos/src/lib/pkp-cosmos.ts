/**
 * This module defines the PKPCosmosWallet class, which is a modified version of the DirectSecp256k1HdWallet class
 * from "@cosmjs/proto-signing". The class extends the PKPBaseWallet class and implements the OfflineDirectSigner
 * interface, enabling it to use PKP for signing. The class handles the creation of a Cosmos wallet, management of
 * account data, and signing transactions with the wallet.
 *
 * The module exports the PKPCosmosWallet class, as well as the PKPCosmosWalletProp type definition used for
 * initializing the class instances.
 *
 * Source: https://github.com/cosmos/cosmjs/blob/4c8b278c1d988be3de415f767ce2f65ab3d40bd9/packages/proto-signing/src/directsecp256k1wallet.ts
 */

import {
  encodeSecp256k1Signature,
  rawSecp256k1PubkeyToRawAddress,
} from '@cosmjs/amino';
import { Secp256k1, sha256, ExtendedSecp256k1Signature } from '@cosmjs/crypto';
import { toBech32, fromHex } from '@cosmjs/encoding';
import { SignDoc } from 'cosmjs-types/cosmos/tx/v1beta1/tx';

import {
  makeSignBytes,
  AccountData,
  DirectSignResponse,
  OfflineDirectSigner,
} from '@cosmjs/proto-signing';

import { PKPBase } from '@lit-protocol/pkp-base';
import { PKPClientHelpers, PKPCosmosWalletProp } from '@lit-protocol/types';

const DEFAULT_COSMOS_RPC_URL =
  'https://cosmos-mainnet-rpc.allthatnode.com:26657';

/**
 * Similar to "DirectSecp256k1HdWallet", but uses PKP to sign
 */
export class PKPCosmosWallet
  extends PKPBase
  implements OfflineDirectSigner, PKPClientHelpers
{
  // Address prefix for Bech32 addresses
  addressPrefix: string;

  // RPC URL for the Cosmos network
  rpc: string;

  // Default Lit Action signanture name
  defaultSigName: string = 'pkp-cosmos-sign-tx';

  constructor(prop: PKPCosmosWalletProp) {
    super(prop);

    // Set the address prefix and RPC URL based on the provided properties
    this.addressPrefix = prop.addressPrefix ?? 'cosmos';

    // 2. Use a constant or configuration for the default RPC URL
    this.rpc = prop.rpc ?? DEFAULT_COSMOS_RPC_URL;
  }
  handleRequest = async (payload: any): Promise<any> => {
    throw new Error('Method not implemented.');
  };

  /**
   * Returns the Bech32 address with the human-readable part (address prefix)
   */
  private get address(): Readonly<string> {
    return toBech32(
      this.addressPrefix,
      rawSecp256k1PubkeyToRawAddress(
        Secp256k1.compressPubkey(this.uncompressedPubKeyBuffer)
      )
    );
  }

  /**
   * Returns account data, including the algorithm used, the address, and the compressed public key
   */
  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        algo: 'secp256k1',
        address: this.address,
        pubkey: this.compressedPubKeyBuffer,
      },
    ];
  }

  /**
   * Signs the provided transaction using the LIT node client and returns the signed transaction
   * and the encoded signature.
   *
   * @param {string} address - The address of the signer.
   * @param {SignDoc} signDoc - The transaction data to be signed.
   * @returns A promise that resolves to a DirectSignResponse containing the signed transaction
   * and the encoded signature.
   */
  public async signDirect(
    address: string,
    signDoc: SignDoc
  ): Promise<DirectSignResponse> {
    // Check if the LIT node client is connected, and connect if it's not.
    await this.ensureLitNodeClientReady();

    // Convert the SignDoc to binary format for signing.
    const signBytes = makeSignBytes(signDoc);

    // Check if the provided address matches the wallet address, and throw an error if it doesn't.
    if (address !== this.address) {
      return this.throwError(`Address ${address} not found in wallet`);
    }

    // Hash the binary format of the transaction data.
    const hashedMessage = sha256(signBytes);

    // Run the LIT action to obtain the signature.
    const signature = await this.runLitAction(
      hashedMessage,
      this.defaultSigName
    );

    // Create an ExtendedSecp256k1Signature from the signature components.
    const extendedSig = new ExtendedSecp256k1Signature(
      fromHex(signature.r),
      fromHex(signature.s),
      signature.recid
    );

    // Combine the R and S components of the signature into a Uint8Array.
    const signatureBytes = new Uint8Array([
      ...extendedSig.r(32),
      ...extendedSig.s(32),
    ]);

    // Encode the signature in the Cosmos-compatible format.
    const stdSignature = encodeSecp256k1Signature(
      this.compressedPubKeyBuffer,
      signatureBytes
    );

    // Log the encoded signature.
    this.log('stdSignature:', stdSignature);

    // Return the signed transaction and encoded signature.
    return {
      signed: signDoc,
      signature: stdSignature,
    };
  }
}
