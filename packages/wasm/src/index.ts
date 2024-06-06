//@ts-ignore source map not found
import { getModule, initSync } from './pkg/wasm-internal';

export type { BlsVariant, EcdsaVariant } from './pkg/wasm-internal';

export {
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


// use wasm-bigen `init sync` for loading wasm modules.
// synchronously loads the module through `WebAssembly`
//
initSync(getModule());
