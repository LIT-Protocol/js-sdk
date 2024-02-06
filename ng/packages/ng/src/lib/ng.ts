import doInit from '@lit-protocol/wasm/wasm';

export { greet, sevSnpGetVcekUrl, sevSnpVerify } from '@lit-protocol/wasm/wasm';

export async function init() {
  await doInit(require('@lit-protocol/wasm/wasm_bg.wasm'));
}
