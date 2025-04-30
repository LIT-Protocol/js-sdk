import { LIT_NETWORK } from '@lit-protocol/constants';
import {
  DecryptRequest,
  EncryptResponse,
  ClaimKeyResponse,
  SignSessionKeyResponse,
  CapacityCreditsReq,
} from '@lit-protocol/types';

import { LitNodeClient } from './lit-node-client';

const isClass = (v: unknown) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitNodeClient', () => {
  // --start;

  it('imported { LitNodeClient } is a class', async () => {
    expect(isClass(LitNodeClient)).toBe(true);
  });

  it('should be able to instantiate a new LitNodeClient to custom', async () => {
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.Custom,
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClient to naga dev', async () => {
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.NagaDev,
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to defined a storage provider', async () => {
    const tmp = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', { value: undefined });
    const ls = require('node-localstorage').LocalStorage;
    const litNodeClient = new LitNodeClient({
      litNetwork: LIT_NETWORK.Custom,
      storageProvider: {
        provider: new ls('./storage.test.db'),
      },
    });
    expect(litNodeClient).toBeDefined();
    expect(litNodeClient.config.storageProvider?.provider).toBeInstanceOf(ls);
    Object.defineProperty(globalThis, 'localStorage', { value: tmp });
  });
});
