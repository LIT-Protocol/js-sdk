//@ts-ignore source map not found
import {
  BlsVariant,
  EcdsaVariant,
  FrostVariant,
  InitOutput,
  //@ts-ignore source map not found
  getModule,
  initSync,
} from './pkg/wasm-internal';
export type {
  BlsVariant,
  EcdsaVariant,
  FrostVariant,
} from './pkg/wasm-internal';

import * as wasmInternal from './pkg/wasm-internal';

let loadingPromise: Promise<any> | null = null;
let wasmSdkInstance: InitOutput | undefined;

// Give us a promise that _just_ encapsulates initializing the modules so we can wrap it in other logic
async function initWasm() {
  return initSync(getModule());
}

/**
 * Initializes the wasm module and keeps the module in scope within
 * the module context. Does not expose the module context as it is
 * not intended to be used directly.
 * @returns {Promise<void>}
 */
async function loadModules() {
  if (wasmSdkInstance) {
    // Runtime is 'hot'; already have loaded WASM modules
    return wasmSdkInstance;
  }

  if (loadingPromise) {
    // Runtime is currently loading the WASM modules; chain on the result of that load attempt
    return loadingPromise;
  }

  // If we got here, we need to load the wasmSdkInstance -- but we want to avoid any other concurrent
  // requests loading it in parallel, so we stash this promise for those to check for
  loadingPromise = initWasm();

  try {
    wasmSdkInstance = await loadingPromise;
  } finally {
    loadingPromise = null;
  }

  // If we got here, the SDK loaded successfully
  return;
}

/**
 * Combines bls signature shares to decrypt
 *
 * Supports:
 * - 12381G2
 * - 12381G1
 * @param {BlsVariant} variant
 * @param {(Uint8Array)[]} signature_shares
 * @returns {Uint8Array}
 */
export async function blsCombine(
  variant: BlsVariant,
  signature_shares: string[]
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.blsCombine(variant, signature_shares);
}

/**
 * Uses a combined BLS signature to decrypt with the
 * given ciphertext from {@link blsEncrypt}
 *
 * Supports:
 * - 12381G2
 * - 12381G1
 * @param {BlsVariant} variant
 * @param {Uint8Array} ciphertext
 * @param {Uint8Array} decryption_key
 * @returns {Uint8Array}
 */
export async function blsDecrypt(
  variant: BlsVariant,
  ciphertext: Uint8Array,
  decryption_key: Uint8Array
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.blsDecrypt(variant, ciphertext, decryption_key);
}

/**
 * Used for BLS encryption
 *
 * Supports:
 * - 12381G2
 * - 12381G1
 * @param {BlsVariant} variant
 * @param {Uint8Array} encryption_key
 * @param {Uint8Array} message
 * @param {Uint8Array} identity
 * @returns {Uint8Array}
 */
export async function blsEncrypt(
  variant: BlsVariant,
  encryption_key: Uint8Array,
  message: Uint8Array,
  identity: Uint8Array
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.blsEncrypt(variant, encryption_key, message, identity);
}

/**
 * Verifies a BLS signature
 *
 * Supports:
 * - 12381G2
 * - 12381G1
 * @param {BlsVariant} variant
 * @param {Uint8Array} public_key
 * @param {Uint8Array} message
 * @param {Uint8Array} signature
 */
export async function blsVerify(
  variant: BlsVariant,
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): Promise<void> {
  await loadModules();
  return wasmInternal.blsVerify(variant, public_key, message, signature);
}

/**
 * Combine ECDSA signatures shares
 *
 * Supports:
 *  - k256
 *  - p256
 *  - p384
 * @param {EcdsaVariant} variant
 * @param {Uint8Array} presignature
 * @param {(Uint8Array)[]} signature_shares
 * @returns {[Uint8Array, Uint8Array, number]}
 */
export async function ecdsaCombine(
  variant: EcdsaVariant,
  presignature: Uint8Array,
  signature_shares: Uint8Array[]
): Promise<[Uint8Array, Uint8Array, number]> {
  await loadModules();
  return wasmInternal.ecdsaCombine(variant, presignature, signature_shares);
}

/**
 * HD key derivation
 *
 * Supports:
 * - k256
 * - p256
 * - p384
 * @param {EcdsaVariant} variant ecdsa scheme
 * @param {Uint8Array} id keyid which will be used for the key derivation
 * @param {(Uint8Array)[]} public_keys ecdsa root keys
 * @returns {Uint8Array}
 */
export async function ecdsaDeriveKey(
  variant: EcdsaVariant,
  id: Uint8Array,
  public_keys: Uint8Array[]
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.ecdsaDeriveKey(variant, id, public_keys);
}

/**
 * Verifier for ECDSA signatures
 *
 * Supports:
 * - k256
 * - p256
 * - p384
 ** Note ** Not currently supported through the lit network. Please use other ECSDSA signature verification
 * @param {EcdsaVariant} variant
 * @param {Uint8Array} message_hash
 * @param {Uint8Array} public_key
 * @param {[Uint8Array, Uint8Array, number]} signature
 */
export async function ecdsaVerify(
  variant: EcdsaVariant,
  message_hash: Uint8Array,
  public_key: Uint8Array,
  signature: [Uint8Array, Uint8Array, number]
): Promise<void> {
  await loadModules();
  return wasmInternal.ecdsaVerify(variant, message_hash, public_key, signature);
}

/**
 * Combiner and verifier for ECDSA signatures
 *
 * Supports:
 * - k256
 * - p256
 * - p384
 *  ** Note ** Not currently supported through the lit network. Please use other ECSDSA signature verification
 * @param {EcdsaVariant} variant
 * @param {Uint8Array} pre_signature
 * @param {Uint8Array[]} signature_shares
 * @param {Uint8Array} message_hash
 * @param {Uint8Array} public_key
 */
export async function ecdsaCombineAndVerify(
  variant: EcdsaVariant,
  pre_signature: Uint8Array,
  signature_shares: Uint8Array[],
  message_hash: Uint8Array,
  public_key: Uint8Array
): Promise<[Uint8Array, Uint8Array, number]> {
  await loadModules();
  return wasmInternal.ecdsaCombineAndVerify(
    variant,
    pre_signature,
    signature_shares,
    message_hash,
    public_key
  );
}

/**
 * Aggregates FROST signature shares
 *
 * supports:
 * - Ed25519Sha512
 * - Ed448Shake256
 * - Ristretto25519Sha512
 * - K256Sha256
 * - P256Sha256
 * - P384Sha384
 * - RedJubjubBlake2b512
 * - K256Taproot
 *
 * @param {FrostVariant} variant
 * @param {Uint8Array} message
 * @param {Uint8Array[]} identifiers
 * @param {Uint8Array[]} signing_commitments
 * @param {Uint8Array[]} signature_shares
 * @param {Uint8Array} signer_pubkeys
 * @param {Uint8Array} verifying_key
 *
 * @returns {[FrostVariant, Uint8Array]}
 */
export async function frostAggregate(
  variant: FrostVariant,
  message: Uint8Array,
  identifiers: Uint8Array[],
  signing_commitments: Uint8Array[],
  signature_shares: Uint8Array[],
  signer_pubkeys: Uint8Array[],
  verifying_key: Uint8Array
): Promise<[FrostVariant, Uint8Array]> {
  await loadModules();
  return wasmInternal.frostAggregate(
    variant,
    message,
    identifiers,
    signing_commitments,
    signature_shares,
    signer_pubkeys,
    verifying_key
  );
}

/**
 * Verifier for FROST signatures
 *
 * supports:
 * - Ed25519Sha512
 * - Ed448Shake256
 * - Ristretto25519Sha512
 * - K256Sha256
 * - P256Sha256
 * - P384Sha384
 * - RedJubjubBlake2b512
 * - K256Taproot
 *
 * @param {Uint8Array} message
 * @param {Uint8Array} verifying_key
 * @param {[FrostVariant, Uint8Array]} signature
 * @returns {void}
 *
 */
export async function frostVerify(
  message: Uint8Array,
  verifying_key: Uint8Array,
  signature: [FrostVariant, Uint8Array]
): Promise<void> {
  await loadModules();
  return wasmInternal.frostVerify(message, verifying_key, signature);
}

/**
 * Gets the vcek url for the given attestation report.  You can fetch this certificate yourself, and pass it in to verify_attestation_report
 * @param {Uint8Array} attestation_report
 * @returns {string}
 */
export async function sevSnpGetVcekUrl(
  attestation_report: Uint8Array
): Promise<string> {
  await loadModules();
  return wasmInternal.sevSnpGetVcekUrl(attestation_report);
}

/**
 * Checks attestation from a node with AMD certs
 * @param {Uint8Array} attestation_report
 * @param {Record<string, Uint8Array>} attestation_data
 * @param {(Uint8Array)[]} signatures
 * @param {Uint8Array} challenge
 * @param {Uint8Array} vcek_certificate
 * @returns {Promise<void>}
 */
export async function sevSnpVerify(
  attestation_report: Uint8Array,
  attestation_data: Record<string, Uint8Array>,
  signatures: Uint8Array[],
  challenge: Uint8Array,
  vcek_certificate: Uint8Array
): Promise<void> {
  await loadModules();
  return wasmInternal.sevSnpVerify(
    attestation_report,
    attestation_data,
    signatures,
    challenge,
    vcek_certificate
  );
}
