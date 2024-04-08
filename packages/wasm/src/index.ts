//@ts-ignore source map not found
import { getModule, initSync } from './pkg/wasm-internal';

export type {
  BlsVariant,
  EcdsaVariant,
  FrostVariant,
} from './pkg/wasm-internal';

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
} from './pkg/wasm-internal';

/**
 * Initalization for our Web Assembly module
 */

let buffer = getModule();
initSync(buffer);
