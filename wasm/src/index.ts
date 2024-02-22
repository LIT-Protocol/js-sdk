import doInit from '@lit-protocol/wasm-internal/wasm';
import * as wasmBinary from '@lit-protocol/wasm-internal/wasm_bg.wasm';

export type {
  BlsVariant,
  EcdsaVariant,
  FrostVariant,
} from '@lit-protocol/wasm-internal/wasm';

export {
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  blsVerify,
  ecdsaCombine,
  ecdsaDeriveKey,
  ecdsaVerify,
  frostCombine,
  frostVerify,
  greet,
  sevSnpGetVcekUrl,
  sevSnpVerify,
} from '@lit-protocol/wasm-internal/wasm';

export async function init() {
  const data = (wasmBinary as unknown as { default: Uint8Array }).default;
  await doInit(data);
}
