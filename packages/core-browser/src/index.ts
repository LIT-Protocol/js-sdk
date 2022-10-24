import { initWasmBlsSdk } from '@litprotocol-dev/constants';
import * as wasmECDSA from '@litprotocol-dev/constants';

import { log } from '@litprotocol-dev/utils';

// ----- Initialization -----

log("---------- Lit Protocol's core-browser package is being initialized...---------- ");

// ----- Cross Envs (browser & node) Supports -----
import { crossEnvSupport } from './cross-env-support';
crossEnvSupport();

// 1. -- Initialize the BLS SDK
initWasmBlsSdk().then((exports) => {
    globalThis.wasmExports = exports;
    log(`✅ [BLS SDK] wasmExports loaded. ${Object.keys(exports).length} functions available. Run 'wasmExports' in the console to see them.`);
});

// 2. -- Initialize the ECDSA SDK
wasmECDSA.initWasmEcdsaSdk().then((sdk: any) => {
    globalThis.wasmECDSA = sdk;
    log(`✅ [ECDSA SDK] wasmECDSA loaded. ${Object.keys(wasmECDSA).length} functions available. Run 'wasmECDSA' in the console to see them.`);
});

// ----- Core -----
import _LitNodeClient from './lib/lit-node-client';

const LitNodeClient = _LitNodeClient;

if( ! globalThis.LitNodeClient ){
    globalThis.LitNodeClient = _LitNodeClient;
}

// ----- Utils -----
import { 
    checkAndSignAuthMessage,
    encryptString,
    decryptString,
    zipAndEncryptString,
    zipAndEncryptFiles,
    encryptZip,
    decryptZip,
    encryptFile,
    decryptFile,
    verifyJwt,
    encryptFileAndZipWithMetadata,
    decryptZipFileWithMetadata,
    humanizeAccessControlConditions,
    blobToBase64String,
    base64StringToBlob,
    getVarType,
    uint8arrayFromString,
    uint8arrayToString,
} from '@litprotocol-dev/utils';

// import {
//     fromString as uint8arrayFromString,
//     toString as uint8arrayToString,
// } from 'uint8arrays';


export { 
    LitNodeClient,

    // '@litprotocol-dev/utils'
    checkAndSignAuthMessage,
    encryptString,
    decryptString,
    zipAndEncryptString,
    zipAndEncryptFiles,
    encryptZip,
    decryptZip,
    encryptFile,
    decryptFile,
    verifyJwt,
    encryptFileAndZipWithMetadata,
    decryptZipFileWithMetadata,
    humanizeAccessControlConditions,

    // -- utils
    blobToBase64String,
    base64StringToBlob,
    getVarType,

    // uint8arrays
    uint8arrayFromString,
    uint8arrayToString
};