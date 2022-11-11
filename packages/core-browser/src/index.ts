import { initWasmBlsSdk } from '@litprotocol-dev/bls-sdk';
import * as wasmECDSA from '@litprotocol-dev/ecdsa-sdk'

// ----- Initialization -----

log("---------- Lit Protocol's core-browser package is being initialized...---------- ");

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

    // > lit.ts
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

    // > browser.ts
    blobToBase64String,
    base64StringToBlob,
    getVarType,
    uint8arrayFromString,
    uint8arrayToString,

    // > session.ts
    getSessionSigs,
    getSessionKeyUri,
    parseResource,

    // > hashing.ts
    hashResourceIdForSigning,


} from '@litprotocol-dev/shared-utils';
import { log } from '@litprotocol-dev/misc';

export { 
    LitNodeClient,

    // ===== '@litprotocol-dev/shared-utils' =====

    // > lit.ts
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

    // > session.ts
    getSessionSigs,
    getSessionKeyUri,
    parseResource,

    // > browser.ts
    blobToBase64String,
    base64StringToBlob,
    getVarType,
    uint8arrayFromString,
    uint8arrayToString,

    // > hashing.ts
    hashResourceIdForSigning,

};