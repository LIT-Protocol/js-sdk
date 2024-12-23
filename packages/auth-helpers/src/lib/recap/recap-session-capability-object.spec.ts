import { SiweMessage } from 'siwe';
import {
  LIT_ABILITY,
  LIT_RESOURCE_PREFIX,
  LIT_NAMESPACE,
  LIT_RECAP_ABILITY,
} from '@lit-protocol/constants';
import { LitAccessControlConditionResource } from '../resources';
import { RecapSessionCapabilityObject } from './recap-session-capability-object';

const isClass = (v: any) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

const dummyCID =
  'bafysameboaza4mnsng7t3djdbilbrnliv6ikxh45zsph7kpettjfbp4ad2g2uu2znujlf2afphw25d4y35pq';

describe('recapSessionCapabilityObject', () => {
  // -- start
  it('imported { RecapSessionCapabilityObject } is a class', async () => {
    expect(isClass(RecapSessionCapabilityObject)).toBe(true);
  });

  it('should be able to instantiate a new RecapSessionCapabilityObject without constructor parameters', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    expect(recapSessionCapabilityObject).toBeDefined();
  });

  it('should be able to instantiate a new RecapSessionCapabilityObject with constructor parameters', async () => {
    const att = {
      someResource: {
        'someNamespace/someAbility': [{}],
      },
    };
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject(att, [
      dummyCID,
    ]);

    expect(recapSessionCapabilityObject).toBeDefined();
    expect(recapSessionCapabilityObject.attenuations).toEqual(att);
    expect(recapSessionCapabilityObject.proofs).toEqual([dummyCID]);
  });

  it('should be having empty attenuations and proofs when instantiated with empty constructor parameters', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    expect(recapSessionCapabilityObject.attenuations).toEqual({});
    expect(recapSessionCapabilityObject.proofs).toEqual([]);
  });

  it('should be able to decode a RecapSessionCapabilityObject', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    const decodedRecapSessionCapabilityObject =
      RecapSessionCapabilityObject.decode(
        'urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly9zb21lUmVzb3VyY2UiOnsiVGhyZXNob2xkL0RlY3J5cHRpb24iOlt7fV19fSwicHJmIjpbXX0='
      );
    expect(decodedRecapSessionCapabilityObject).toEqual(
      recapSessionCapabilityObject
    );
  });

  it('should be able to extract a RecapSessionCapabilityObject', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    const siweMessage = new SiweMessage({
      domain: 'example.com',
      address: '0x0000000000000000000000000000000000000000',
      statement: 'This is some existing statement.',
      uri: 'did:key:example',
      version: '1',
      chainId: 1,
      nonce: 'mynonce1',
      issuedAt: '2022-06-21T12:00:00.000Z',
      resources: [],
    });
    const newSiweMessage =
      recapSessionCapabilityObject.addToSiweMessage(siweMessage);

    const extractedRecapSessionCapabilityObject =
      RecapSessionCapabilityObject.extract(newSiweMessage);
    expect(extractedRecapSessionCapabilityObject).toEqual(
      recapSessionCapabilityObject
    );
  });

  it('should be able to get attenuations', async () => {
    const att = {
      someResource: {
        'someNamespace/someAbility': [{}],
      },
    };

    const recapSessionCapabilityObject = new RecapSessionCapabilityObject(
      att,
      []
    );
    expect(recapSessionCapabilityObject.attenuations).toEqual(att);
  });

  it('should be able to get proofs', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject({}, [
      dummyCID,
    ]);
    expect(recapSessionCapabilityObject.proofs).toEqual([dummyCID]);
  });

  it('should be able to get statement', async () => {
    const att = {
      someResource: {
        'someNamespace/someAbility': [{}],
      },
    };
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject(
      att,
      []
    );
    expect(recapSessionCapabilityObject.statement).toEqual(
      `I further authorize the stated URI to perform the following actions on my behalf: (1) 'someNamespace': 'someAbility' for 'someResource'.`
    );
  });

  it('should be able to add proof', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    recapSessionCapabilityObject.addProof(dummyCID);
    expect(recapSessionCapabilityObject.proofs).toEqual([dummyCID]);
  });

  it('should be able to add attenuation', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    recapSessionCapabilityObject.addAttenuation(
      'someResource',
      'someNamespace',
      'someAbility'
    );
    expect(recapSessionCapabilityObject.attenuations).toEqual({
      someResource: {
        'someNamespace/someAbility': [{}],
      },
    });
  });

  it('should be able to add multiple attenuations for the same resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    recapSessionCapabilityObject.addAttenuation(
      'someResource',
      'someNamespace',
      'someAbility'
    );
    recapSessionCapabilityObject.addAttenuation(
      'someResource',
      'someOtherNamespace',
      'someOtherAbility'
    );
    expect(recapSessionCapabilityObject.attenuations).toEqual({
      someResource: {
        'someNamespace/someAbility': [{}],
        'someOtherNamespace/someOtherAbility': [{}],
      },
    });
  });

  it('should be able to add to siwe message', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    const siweMessage = new SiweMessage({
      domain: 'example.com',
      address: '0x0000000000000000000000000000000000000000',
      statement: 'This is some existing statement.',
      uri: 'did:key:example',
      version: '1',
      chainId: 1,
      nonce: 'mynonce1',
      issuedAt: '2022-06-21T12:00:00.000Z',
      resources: [],
    });
    const newSiweMessage =
      recapSessionCapabilityObject.addToSiweMessage(siweMessage);
    expect(newSiweMessage.statement).toEqual(
      `This is some existing statement. I further authorize the stated URI to perform the following actions on my behalf: (1) '${
        LIT_NAMESPACE.Threshold
      }': '${
        LIT_RECAP_ABILITY.Decryption
      }' for '${litResource.getResourceKey()}'.`
    );
    expect(newSiweMessage.resources).toEqual([
      'urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly9zb21lUmVzb3VyY2UiOnsiVGhyZXNob2xkL0RlY3J5cHRpb24iOlt7fV19fSwicHJmIjpbXX0',
    ]);
  });

  it('should be able to encode as siwe resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );

    const siweResource = recapSessionCapabilityObject.encodeAsSiweResource();
    expect(siweResource).toEqual(
      'urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly9zb21lUmVzb3VyY2UiOnsiVGhyZXNob2xkL0RlY3J5cHRpb24iOlt7fV19fSwicHJmIjpbXX0'
    );
  });

  it('should be able to add capability for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LIT_RESOURCE_PREFIX.AccessControlCondition}://someResource`]: {
        [`${LIT_NAMESPACE.Threshold}/${LIT_RECAP_ABILITY.Decryption}`]: [{}],
      },
    });
  });

  it('should be able to add multiple capabilities for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionSigning
    );

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LIT_RESOURCE_PREFIX.AccessControlCondition}://someResource`]: {
        [`${LIT_NAMESPACE.Threshold}/${LIT_RECAP_ABILITY.Decryption}`]: [{}],
        [`${LIT_NAMESPACE.Threshold}/${LIT_RECAP_ABILITY.Signing}`]: [{}],
      },
    });
  });

  it('should be able to verify capability for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
  });

  it('should be able to verify capability for a resource with multiple capabilities', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionSigning
    );
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionSigning
      )
    ).toBe(true);

    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
  });

  it('should be able to verify capability does not exist for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionSigning
      )
    ).toBe(false);
  });

  it('should be able to verify capability does not exist for a new RecapSessionCapabilityObject', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionSigning
      )
    ).toBe(false);
  });

  it('should be able to add all the valid capabilities for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addAllCapabilitiesForResource(litResource);

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LIT_RESOURCE_PREFIX.AccessControlCondition}://someResource`]: {
        [`*/*`]: [{}],
      },
    });
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionSigning
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.PKPSigning
      )
    ).toBe(false);
  });

  it('should be able to add a capability for all resources with a resource prefix', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('*');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LIT_ABILITY.AccessControlConditionDecryption
    );

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LIT_RESOURCE_PREFIX.AccessControlCondition}://*`]: {
        [`${LIT_NAMESPACE.Threshold}/${LIT_RECAP_ABILITY.Decryption}`]: [{}],
      },
    });
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionSigning
      )
    ).toBe(false);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        new LitAccessControlConditionResource('someResource'),
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
  });

  it('should be able to add all the valid capabilities for all resources with a resource prefix', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('*');
    recapSessionCapabilityObject.addAllCapabilitiesForResource(litResource);

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LIT_RESOURCE_PREFIX.AccessControlCondition}://*`]: {
        [`*/*`]: [{}],
      },
    });
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionSigning
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        new LitAccessControlConditionResource('someResource'),
        LIT_ABILITY.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        new LitAccessControlConditionResource('someResource'),
        LIT_ABILITY.PKPSigning
      )
    ).toBe(false);
  });
});

// describe('strToCID', () => {
//   it('should handle string input', async () => {
//     const input = 'Hello, world!';
//     const result = await RecapSessionCapabilityObject.strToCID(input);
//     expect(result).toBe('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks');
//   });

//   it('should handle Uint8Array input', async () => {
//     const input = new TextEncoder().encode('Hello, world!');
//     const result = await RecapSessionCapabilityObject.strToCID(input);
//     expect(result).toBe('QmWGeRAEgtsHW3ec7U4qW2CyVy7eA2mFRVbk1nb24jFyks');
//   });

//   it('should handle object input', async () => {
//     const input = { message: 'Hello, world!' };
//     const result = await RecapSessionCapabilityObject.strToCID(input);
//     expect(result).toBe('QmTR2kDqux4yo5X9W6GKJKEn6azDqXqifRMGYtX27oAQLk');
//   });
// });
