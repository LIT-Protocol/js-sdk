import { isNode, log } from '@litprotocol-dev/misc';
import * as _LitNodeClient from './lib/lit-node-client';

// ==================== Environment ====================
if (isNode()) {
  console.log('Oh hey you are running in Node.js!');
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
} from '@litprotocol-dev/auth-browser';

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
} from '@litprotocol-dev/encryption';

export {
  hashResourceIdForSigning,
  humanizeAccessControlConditions,
} from '@litprotocol-dev/access-control-conditions';

export {
  base64StringToBlob,
  blobToBase64String,
} from '@litprotocol-dev/misc-browser';

export {
  uint8arrayFromString,
  uint8arrayToString,
} from '@litprotocol-dev/uint8arrays';
