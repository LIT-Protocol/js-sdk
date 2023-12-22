// @ts-nocheck

// This will prevent it logging the following
// [Lit-JS-SDK v2.2.39] ✅ [BLS SDK] wasmExports loaded
// [Lit-JS-SDK v2.2.39] ✅ [ECDSA SDK NodeJS] wasmECDSA loaded.
global.jestTesting = true;

import { LitNodeClientNodeJs } from './lit-node-client-nodejs';
import { hashResourceIdForSigning } from '@lit-protocol/access-control-conditions';

import {
  LitAbility,
  LitAccessControlConditionResource,
} from '@lit-protocol/auth-helpers';
import * as LITCONFIG from 'lit.config.json';
import { StorageProvider } from '../../../types/src/lib/interfaces';

const isClass = (v) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitNodeClientNodeJs', () => {
  // --start;
  it('imported { LitNodeClientNodeJs } is a class', async () => {
    expect(isClass(LitNodeClientNodeJs)).toBe(true);
  });

  it('should be able to instantiate a new LitNodeClientNodeJs', async () => {
    const litNodeClient = new LitNodeClientNodeJs();
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to localhost', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'localhost',
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to custom', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'custom',
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to instantiate a new LitNodeClientNodeJs to cayenne', async () => {
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'cayenne',
    });
    expect(litNodeClient).toBeDefined();
  });

  it('should be able to defined a storage provider', async () => {
    const tmp = globalThis.localStorage;
    globalThis.localStorage = undefined; // null localStorage for test
    const ls = require('node-localstorage').LocalStorage;
    const litNodeClient = new LitNodeClientNodeJs({
      litNetwork: 'custom',
      storageProvider: {
        provider: new ls('./storage.test.db'),
      },
    });
    expect(litNodeClient).toBeDefined();
    expect(litNodeClient.config.storageProvider?.provider).toBeInstanceOf(ls);
    globalThis.localStorage = tmp; // set it back
  });

  it('gets capabilities', async () => {
    const path = '/bglyaysu8rvblxlk7x0ksn';

    let resourceId = {
      baseUrl: 'my-dynamic-content-server.com',
      path,
      orgId: '',
      role: '',
      extraData: '',
    };

    let hashedResourceId = await hashResourceIdForSigning(resourceId);

    const litResource = new LitAccessControlConditionResource(hashedResourceId);

    let sessionCapabilityObject =
      LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards([
        litResource,
      ]);
    expect(sessionCapabilityObject.attenuations).toStrictEqual({
      [`lit-accesscontrolcondition://${hashedResourceId}`]: {
        '*/*': [{}],
      },
    });
    expect(
      sessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(true);
  });

  it('gets expiration', () => {
    const expiration = LitNodeClientNodeJs.getExpiration();

    expect(expiration).toContain('T');
  });

  describe('normalizeParams', () => {
    it('should normalise params', () => {
      // Setup
      const buffer = new ArrayBuffer(2);
      const view = new Uint8Array(buffer);
      view[0] = 1;
      view[1] = 2;
      let params = { jsParams: { bufferArray: view } };

      // Action
      params = LitNodeClientNodeJs.normalizeParams(params);

      // Assert
      expect(params.jsParams.bufferArray).toEqual([1, 2]);
    });

    it('should leave normal arrays unchanged', () => {
      // Setup
      let params = { jsParams: { normalArray: [1, 2, 3] } };

      // Action
      params = LitNodeClientNodeJs.normalizeParams(params);

      // Assert
      expect(params.jsParams.normalArray).toEqual([1, 2, 3]);
    });

    it('should ignore non-array and non-ArrayBuffer properties', () => {
      // Setup
      let params = { jsParams: { number: 123, string: 'test' } };

      // Action
      params = LitNodeClientNodeJs.normalizeParams(params);

      // Assert
      expect(params.jsParams.number).toEqual(123);
      expect(params.jsParams.string).toEqual('test');
    });

    it('should handle multiple properties', () => {
      // Setup
      const buffer = new ArrayBuffer(2);
      const view = new Uint8Array(buffer);
      view[0] = 1;
      view[1] = 2;
      let params = {
        jsParams: {
          bufferArray: view,
          normalArray: [3, 4, 5],
        },
      };

      // Action
      params = LitNodeClientNodeJs.normalizeParams(params);

      // Assert
      expect(params.jsParams.bufferArray).toEqual([1, 2]);
      expect(params.jsParams.normalArray).toEqual([3, 4, 5]);
    });
  });
});
