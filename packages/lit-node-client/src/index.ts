import { isNode, log } from '@lit-protocol/misc';
import * as _LitNodeClient from './lib/lit-node-client';

// ==================== Environment ====================
if (isNode()) {
  log('Oh hey you are running in Node.js!');
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
}

const LitNodeClient = _LitNodeClient.LitNodeClient;
if (!globalThis.LitNodeClient) {
  globalThis.LitNodeClient = LitNodeClient;
}

// ==================== Exports ====================

export * from './lib/lit-node-client';

export {
  checkAndSignAuthMessage,
  getSessionKeyUri,
  getSessionSigs,
  parseResource,
} from '@lit-protocol/auth-browser';

export {
  decryptFile,
  decryptString,
  decryptZip,
  decryptZipFileWithMetadata,
  encryptStringAndUploadMetadataToIpfs,
  decryptStringWithIpfs,
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
