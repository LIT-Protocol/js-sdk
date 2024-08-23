import * as _LitNodeClient from './lib/lit-node-client';

declare global {
  // This `var` is necessary for global hackery
  // eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
  var LitNodeClient: any;
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
