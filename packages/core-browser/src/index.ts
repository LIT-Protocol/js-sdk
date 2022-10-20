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

// 1. -- Initialize the BLS SDK
initWasmBlsSdk().then((exports) => {
    globalThis.wasmExports = exports;
    log("BLS wasmExports loaded");
});

// 2. -- Initialize the ECDSA SDK
wasmECDSA.initWasmEcdsaSdk().then(() => {
    log("wasmECDSA loaded");
});