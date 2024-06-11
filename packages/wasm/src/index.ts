//@ts-ignore source map not found
import {
  BlsVariant,
  EcdsaVariant,
  InitOutput,
  //@ts-ignore source map not found
  getModule,
  initSync,
} from './pkg/wasm-internal';
export type { BlsVariant, EcdsaVariant } from './pkg/wasm-internal';

import * as wasmInternal from './pkg/wasm-internal';


let wasmSdkInstance: InitOutput | undefined;
// loaded wasm module
let isWasmModuleLoading = false;
/**
 * Initializes the wasm module and keeps the module in scope within
 * the module context. Does not expose the module context as it is
 * not intended to be used directly.
 * @returns {Promise<void>}
 */
async function loadModules() {
  if (wasmSdkInstance || isWasmModuleLoading) {
    return;
  }
  try {
    isWasmModuleLoading = true;
    // use wasm-bindgen `init sync` for loading wasm modules.
    // synchronously loads the module through `WebAssembly.Module`
    wasmSdkInstance = initSync(getModule());
    isWasmModuleLoading = false;
  } catch (e) {
    wasmSdkInstance = undefined;
    isWasmModuleLoading = false;
    // Catch the error and rethrow which looses the stack trace context from `wasm-internal`
    throw e;
  }
}

export async function blsCombine(
  variant: BlsVariant,
  signature_shares: Uint8Array[]
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.blsCombine(variant, signature_shares);
}

export async function blsDecrypt(
  variant: BlsVariant,
  ciphertext: Uint8Array,
  decryption_key: Uint8Array
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.blsDecrypt(variant, ciphertext, decryption_key);
}

export async function blsEncrypt(
  variant: BlsVariant,
  encryption_key: Uint8Array,
  message: Uint8Array,
  identity: Uint8Array
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.blsEncrypt(variant, encryption_key, message, identity);
}

export async function blsVerify(
  variant: BlsVariant,
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): Promise<void> {
  await loadModules();
  return wasmInternal.blsVerify(variant, public_key, message, signature);
}

export async function ecdsaCombine(
  variant: EcdsaVariant,
  presignature: Uint8Array,
  signature_shares: Uint8Array[]
): Promise<[Uint8Array, Uint8Array, number]> {
  await loadModules();
  return wasmInternal.ecdsaCombine(variant, presignature, signature_shares);
}

export async function ecdsaDeriveKey(
  variant: EcdsaVariant,
  id: Uint8Array,
  public_keys: Uint8Array[]
): Promise<Uint8Array> {
  await loadModules();
  return wasmInternal.ecdsaDeriveKey(variant, id, public_keys);
}

export async function ecdsaVerify(
  variant: EcdsaVariant,
  message_hash: Uint8Array,
  public_key: Uint8Array,
  signature: [Uint8Array, Uint8Array, number]
): Promise<void> {
  await loadModules();
  return wasmInternal.ecdsaVerify(variant, message_hash, public_key, signature);
}

export async function sevSnpGetVcekUrl(
  attestation_report: Uint8Array
): Promise<string> {
  await loadModules();
  return wasmInternal.sevSnpGetVcekUrl(attestation_report);
}

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
