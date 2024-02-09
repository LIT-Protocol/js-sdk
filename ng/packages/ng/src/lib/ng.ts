import doInit from '@lit-protocol/wasm/wasm';

export {
  blsG1Combine,
  blsG1Decrypt,
  blsG1Encrypt,
  blsG1Verify,
  blsG2Combine,
  blsG2Decrypt,
  blsG2Encrypt,
  blsG2Verify,
  ecdsaK256Combine,
  frostEd25519Combine,
  frostEd25519Verify,
  frostEd448Combine,
  frostP256Combine,
  frostRistretto255Combine,
  greet,
  sevSnpGetVcekUrl,
  sevSnpVerify,
} from '@lit-protocol/wasm/wasm';

export async function init() {
  await doInit(require('@lit-protocol/wasm/wasm_bg.wasm')); // eslint-disable-line @typescript-eslint/no-var-requires
}
