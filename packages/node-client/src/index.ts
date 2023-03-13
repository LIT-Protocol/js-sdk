import { isNode, log } from '@lit-protocol/misc';
import * as _NodeClient from './lib/node-client';

// ==================== Environment ====================
if (isNode()) {
  log('Oh hey you are running in Node.js!');
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
}

declare global {
    var NodeClient: any;
}

const NodeClient = _NodeClient.NodeClient;
if (!globalThis.NodeClient) {
  globalThis.NodeClient = NodeClient;
}

// ==================== Exports ====================
export * from './lib/node-client';

export {
    decryptFile,
    decryptString,
    decryptZip,
    decryptZipFileWithMetadata,
    encryptFile,
    encryptFileAndZipWithMetadata,
    encryptString,
    encryptZip,
    verifyJwt,
    zipAndEncryptFiles,
    zipAndEncryptString,
  } from '@lit-protocol/encryption';
  
  export {
    hashResourceIdForSigning,
    humanizeAccessControlConditions,
  } from '@lit-protocol/access-control-conditions';
  
  export {
    base64StringToBlob,
    blobToBase64String,
  } from '@lit-protocol/misc-browser';
  
  export {
    uint8arrayFromString,
    uint8arrayToString,
  } from '@lit-protocol/uint8arrays';
  
  // ----- autogen:polyfills:start  -----
  //
  // ----- autogen:polyfills:end  -----
  