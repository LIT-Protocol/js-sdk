import doInit from '@lit-protocol/wasm/wasm';

export {
  BlsVariant,
  EcdsaVariant,
  FrostVariant,
  blsCombine,
  blsDecrypt,
  blsEncrypt,
  blsVerify,
  ecdsaCombine,
  ecdsaDeriveKey,
  frostCombine,
  frostVerify,
  greet,
  sevSnpGetVcekUrl,
  sevSnpVerify,
} from '@lit-protocol/wasm/wasm';

export async function init() {
  await doInit(require('@lit-protocol/wasm/wasm_bg.wasm')); // eslint-disable-line @typescript-eslint/no-var-requires
}
