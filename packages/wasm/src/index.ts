import * as mod from './pkg/wasm-internal';

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

export async function init() {
  //@ts-ignore module added from our post build script, not in the source mapping
  let buffer = mod.getModule();
  mod.initSync(buffer);
}
