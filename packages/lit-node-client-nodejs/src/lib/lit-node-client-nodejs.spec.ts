import { LIT_NETWORK, InvalidArgumentException } from '@lit-protocol/constants';

import { LitNodeClientNodeJs } from './lit-node-client-nodejs';

const isClass = (v: any) => {
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

  it('should be able to instantiate a new LitNodeClientNodeJs to datil dev', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: LIT_NETWORK.DatilDev,
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

  it('should throw when constructor is passed invalid params', () => {
    // @ts-expect-error testing invalid params
    expect(() => new LitNodeClientNodeJs({ litNetwork: 'invalid' })).toThrow(
      InvalidArgumentException
    );

    expect(
      () =>
        new LitNodeClientNodeJs({
          litNetwork: LIT_NETWORK.Datil,
          // @ts-expect-error testing invalid params
          checkNodeAttestation: 1,
          // @ts-expect-error testing invalid params
          minNodeCount: 'something',
          rpcUrl: 'notAnURL',
        })
    ).toThrow(InvalidArgumentException);
  });

  it('gets expiration', () => {
    const expiration = LitNodeClientNodeJs.getExpiration();

    // Regex pattern for ISO 8601 date format
    const dateRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|([+-]\d{2}:\d{2}))?$/;

    expect(expiration).toMatch(dateRegex);
  });
});
