// @ts-nocheck

// This will prevent it logging the following
// [Lit-JS-SDK v2.2.39] ✅ [BLS SDK] wasmExports loaded
// [Lit-JS-SDK v2.2.39] ✅ [ECDSA SDK NodeJS] wasmECDSA loaded.
global.jestTesting = true;

import { LIT_NETWORK } from '@lit-protocol/constants';

import { LitNodeClientNodeJs } from './lit-node-client-nodejs';

const isClass = (v) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitNodeClientNodeJs', () => {
  // --start;

  it('imported { LitNodeClientNodeJs } is a class', async () => {
    expect(isClass(LitNodeClientNodeJs)).toBe(true);
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to custom', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LIT_NETWORK.Custom,
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to naga dev', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LIT_NETWORK.NagaDev,
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to defined a storage provider', async () => {
    const tmp = globalThis.localStorage;
    Object.defineProperty(globalThis, 'localStorage', { value: undefined });
    const ls = require('node-localstorage').LocalStorage;
    const litNodeClient = new LitNodeClientNodeJs({
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
