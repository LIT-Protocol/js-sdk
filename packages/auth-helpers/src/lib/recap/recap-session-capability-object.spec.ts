import { SiweMessage } from 'siwe';
import { LitAbility, LitResourcePrefix } from '../models';
import { LitAccessControlConditionResource } from '../resources';
import { RecapSessionCapabilityObject } from './recap-session-capability-object';
import { LitNamespace, LitRecapAbility } from './utils';

const isClass = (v: any) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

const dummyCID =
  'bafysameboaza4mnsng7t3djdbilbrnliv6ikxh45zsph7kpettjfbp4ad2g2uu2znujlf2afphw25d4y35pq';

describe('recapSessionCapabilityObject', () => {
  // --global
  let recapSessionCapabilityObject;

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
      LitAbility.AccessControlConditionDecryption
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
      LitAbility.AccessControlConditionDecryption
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
      LitAbility.AccessControlConditionDecryption
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
        LitNamespace.Threshold
      }': '${
        LitRecapAbility.Decryption
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
      LitAbility.AccessControlConditionDecryption
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
      LitAbility.AccessControlConditionDecryption
    );

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LitResourcePrefix.AccessControlCondition}://someResource`]: {
        [`${LitNamespace.Threshold}/${LitRecapAbility.Decryption}`]: [{}],
      },
    });
  });

  it('should be able to add multiple capabilities for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionDecryption
    );
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionSigning
    );

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LitResourcePrefix.AccessControlCondition}://someResource`]: {
        [`${LitNamespace.Threshold}/${LitRecapAbility.Decryption}`]: [{}],
        [`${LitNamespace.Threshold}/${LitRecapAbility.Signing}`]: [{}],
      },
    });
  });

  it('should be able to verify capability for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionDecryption
    );
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
  });

  it('should be able to verify capability for a resource with multiple capabilities', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionDecryption
    );
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionSigning
    );
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(true);

    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
  });

  it('should be able to verify capability does not exist for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionDecryption
    );
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(false);
  });

  it('should be able to verify capability does not exist for a new RecapSessionCapabilityObject', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(false);
  });

  it('should be able to add all the valid capabilities for a resource', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('someResource');
    recapSessionCapabilityObject.addAllCapabilitiesForResource(litResource);

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LitResourcePrefix.AccessControlCondition}://someResource`]: {
        [`*/*`]: [{}],
      },
    });
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.PKPSigning
      )
    ).toBe(false);
  });

  it('should be able to add a capability for all resources with a resource prefix', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('*');
    recapSessionCapabilityObject.addCapabilityForResource(
      litResource,
      LitAbility.AccessControlConditionDecryption
    );

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LitResourcePrefix.AccessControlCondition}://*`]: {
        [`${LitNamespace.Threshold}/${LitRecapAbility.Decryption}`]: [{}],
      },
    });
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(false);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        new LitAccessControlConditionResource('someResource'),
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
  });

  it('should be able to add all the valid capabilities for all resources with a resource prefix', async () => {
    const recapSessionCapabilityObject = new RecapSessionCapabilityObject();
    const litResource = new LitAccessControlConditionResource('*');
    recapSessionCapabilityObject.addAllCapabilitiesForResource(litResource);

    expect(recapSessionCapabilityObject.attenuations).toEqual({
      [`${LitResourcePrefix.AccessControlCondition}://*`]: {
        [`*/*`]: [{}],
      },
    });
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionSigning
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        litResource,
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        new LitAccessControlConditionResource('someResource'),
        LitAbility.AccessControlConditionDecryption
      )
    ).toBe(true);
    expect(
      recapSessionCapabilityObject.verifyCapabilitiesForResource(
        new LitAccessControlConditionResource('someResource'),
        LitAbility.PKPSigning
      )
    ).toBe(false);
  });
});
