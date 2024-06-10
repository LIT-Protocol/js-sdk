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

import {
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  blsVerify,
  ecdsaCombine,
  ecdsaDeriveKey,
  ecdsaVerify,
  greet,
  sevSnpGetVcekUrl,
  sevSnpVerify,
} from './pkg/wasm-internal';

// loaded wasm module
let wasmSdkInstance: InitOutput | undefined;

export const initWASM = (): Promise<void> => {
  return new Promise<void>((res, rej) => {
    if (wasmSdkInstance) {
      res();
      return;
    }
    try {
      // use wasm-bigen `init sync` for loading wasm modules.
      // synchronously loads the module through `WebAssembly`
      wasmSdkInstance = initSync(getModule());
      res();
    } catch (e) {
      wasmSdkInstance = undefined;
      rej(e);
    }
  });
};

/**
 * async wrappers for wasm wrappers for future async implementations.
 * Allows for lazy loadnig of WASM.
 */

export async function loadModuleAndBlsCombine(
  variant: BlsVariant,
  signature_shares: Uint8Array[]
): Promise<Uint8Array> {
  await initWASM();
  return blsCombine(variant, signature_shares);
}

export async function loadModuleAndBlsDecrypt(
  variant: BlsVariant,
  ciphertext: Uint8Array,
  decryption_key: Uint8Array
): Promise<Uint8Array> {
  await initWASM();
  return blsDecrypt(variant, ciphertext, decryption_key);
}

export async function loadModuleAndBlsEncrypt(
  variant: BlsVariant,
  encryption_key: Uint8Array,
  message: Uint8Array,
  identity: Uint8Array
): Promise<Uint8Array> {
  await initWASM();
  return blsEncrypt(variant, encryption_key, message, identity);
}

export async function loadModuleAndBlsVerify(
  variant: BlsVariant,
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): Promise<void> {
  await initWASM();
  return blsVerify(variant, public_key, message, signature);
}

export async function loadModuleAndEcdsaCombine(
  variant: EcdsaVariant,
  presignature: Uint8Array,
  signature_shares: Uint8Array[]
): Promise<[Uint8Array, Uint8Array, number]> {
  await initWASM();
  return ecdsaCombine(variant, presignature, signature_shares);
}

export async function loadModuleAndEcdsaDeriveKey(
  variant: EcdsaVariant,
  id: Uint8Array,
  public_keys: Uint8Array[]
): Promise<Uint8Array> {
  await initWASM();
  return ecdsaDeriveKey(variant, id, public_keys);
}

export async function loadModuleAndEcdsaVerify(
  variant: EcdsaVariant,
  message_hash: Uint8Array,
  public_key: Uint8Array,
  signature: [Uint8Array, Uint8Array, number]
): Promise<void> {
  await initWASM();
  return ecdsaVerify(variant, message_hash, public_key, signature);
}

export async function loadModuleAndSevSnpGetVcekUrl(
  attestation_report: Uint8Array
): Promise<string> {
  await initWASM();
  return sevSnpGetVcekUrl(attestation_report);
}

export async function loadModuleAndSevSnpVerify(
  attestation_report: Uint8Array,
  attestation_data: Record<string, Uint8Array>,
  signatures: Uint8Array[],
  challenge: Uint8Array,
  vcek_certificate: Uint8Array
): Promise<void> {
  await initWASM();
  return sevSnpVerify(
    attestation_report,
    attestation_data,
    signatures,
    challenge,
    vcek_certificate
  );
}

export {
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  blsVerify,
  ecdsaCombine,
  ecdsaDeriveKey,
  ecdsaVerify,
  sevSnpGetVcekUrl,
  sevSnpVerify,
};
