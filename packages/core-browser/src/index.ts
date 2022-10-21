import { initWasmBlsSdk } from '@litprotocol-dev/core';
import * as wasmECDSA from '@litprotocol-dev/core';

import { log } from '@litprotocol-dev/utils';

// ----- BLS & ECDSA SDKS -----
export * from './lib/crypto-sdks/core-browser';
export * from './lib/crypto-sdks/bls-sdk';
export * from './lib/crypto-sdks/ecdsa-sdk';

// ----- Core -----
export * from './lib/lit-node-client';

// ----- Initialization -----

log("---------- Lit Protocol's core-browser package is being initialized...---------- ");

// 1. -- Initialize the BLS SDK
initWasmBlsSdk().then((exports) => {
    globalThis.wasmExports = exports;
    log(`✅ [BLS SDK] wasmExports loaded. ${Object.keys(exports).length} functions available.`);
});

// 2. -- Initialize the ECDSA SDK
wasmECDSA.initWasmEcdsaSdk().then(() => {
    log(`✅ [ECDSA SDK] wasmECDSA loaded. ${Object.keys(wasmECDSA).length} functions available.`);
});