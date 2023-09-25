import { isNode, log } from '@lit-protocol/misc';
import * as _LitNodeClientNodeJs from './lib/lit-node-client-nodejs';

// ==================== Environment ====================
if (isNode()) {
  log('Oh hey you are running in Node.js!');
  const fetch = require('node-fetch');
  globalThis.fetch = fetch;
}

declare global {
  var LitNodeClientNodeJs: any;
}

const LitNodeClientNodeJs = _LitNodeClientNodeJs.LitNodeClientNodeJs;
if (!globalThis.LitNodeClientNodeJs) {
  globalThis.LitNodeClientNodeJs = LitNodeClientNodeJs;
}

// ==================== Exports ====================
export * from './lib/lit-node-client-nodejs';

export {
  decryptToFile,
  decryptToString,
  decryptToZip,
  decryptZipFileWithMetadata,
  decryptFromIpfs,
  encryptFile,
  encryptFileAndZipWithMetadata,
  encryptString,
  encryptToIpfs,
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
