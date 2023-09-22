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
      LitNodeClientNodeJs.generateSessionCapabilityObjectWithWildcards([litResource]);
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
});
