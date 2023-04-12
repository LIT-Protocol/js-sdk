import * as _LitAuthClient from './lib/lit-auth-client';

declare global {
  var LitAuthClient: any; //eslint-disable-line no-var
}

const LitAuthClient = _LitAuthClient.LitAuthClient;
if (!globalThis.LitAuthClient) {
  globalThis.LitAuthClient = LitAuthClient;
}

export * from './lib/lit-auth-client';
