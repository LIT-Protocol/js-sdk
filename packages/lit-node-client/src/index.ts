import { isNode, log } from '@lit-protocol/misc';
import * as _LitNodeClient from './lib/lit-node-client';

// ==================== Environment ====================
if (isNode()) {
  log('Oh hey you are running in Node.js!');
   // @ts-ignore
   if (typeof (fetch) === "undefined") {
    log("fetch is undefined");
    const fetch = require('node-fetch');
    globalThis.fetch = fetch;
  }
}

const LitNodeClient = _LitNodeClient.LitNodeClient;
if (!globalThis.LitNodeClient) {
  globalThis.LitNodeClient = LitNodeClient;
}

// ==================== Exports ====================

export * from './lib/lit-node-client';

export {
  checkAndSignAuthMessage,
  ethConnect,
  disconnectWeb3,
} from '@lit-protocol/auth-browser';

export * from '@lit-protocol/lit-node-client-nodejs';

// ----- autogen:polyfills:start  -----
//
// ----- autogen:polyfills:end  -----
