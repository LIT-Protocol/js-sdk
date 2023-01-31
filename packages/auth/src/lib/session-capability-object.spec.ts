import { SessionCapabilityObject } from './session-capability-object';

const isClass = (v: any) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('sessionCapabilityObject', () => {
  // --global
  let sessionCapabilityObject;

  // -- start
  it('imported { SessionCapabilityObject } is a class', async () => {
    expect(isClass(SessionCapabilityObject)).toBe(true);
  });

  it('should be able to instantiate a new SessionCapabilityObject', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    expect(sessionCapabilityObject).toBeDefined();
  });

  it('should be empty for a new SessionCapabilityObject', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    expect(sessionCapabilityObject.isEmpty()).toBe(true);
  });

  it('should not be empty for a SessionCapabilityObject with a capability', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.setCapableActionsForAllResources(['read']);
    expect(sessionCapabilityObject.isEmpty()).toBe(false);
  });

  it('should be able to set a capability for all resources', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.setCapableActionsForAllResources(['read']);
    expect(sessionCapabilityObject.getCapableActionsForAllResources()).toEqual([
      'read',
    ]);
  });

  it('should be able to set a capability for a resource', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.addCapableActionForResource('resourceId', 'read');
    expect(
      sessionCapabilityObject.hasCapabilitiesForResource('read', 'resourceId')
    ).toBe(true);
  });

  it('should be able to set multiple capable actions for a resource and check for capability to be true', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.addCapableActionForResource('resourceId', 'read');
    sessionCapabilityObject.addCapableActionForResource('resourceId', 'write');
    expect(
      sessionCapabilityObject.hasCapabilitiesForResource('write', 'resourceId')
    ).toBe(true);
  });

  it('should not have capability for resource for a new SessionCapabilityObject', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    expect(
      sessionCapabilityObject.hasCapabilitiesForResource('read', 'resourceId')
    ).toBe(false);
  });

  it('should not have a capability for a resource if the capable action is not set', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.addCapableActionForResource('resourceId', 'read');
    expect(
      sessionCapabilityObject.hasCapabilitiesForResource('write', 'resourceId')
    ).toBe(false);
  });

  it('should have a capability for a resource if the capable action is set', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.addCapableActionForResource('resourceId', 'read');
    expect(
      sessionCapabilityObject.hasCapabilitiesForResource('read', 'resourceId')
    ).toBe(true);
  });

  it('should encode itself as a SIWE resource string', async () => {
    const sessionCapabilityObject = new SessionCapabilityObject();
    sessionCapabilityObject.setCapableActionsForAllResources(['read']);
    sessionCapabilityObject.addCapableActionForResource('resourceId', 'write');
    expect(sessionCapabilityObject.encodeAsSiweResource()).toEqual(
      'urn:recap:lit:session:eyJkZWYiOlsicmVhZCJdLCJ0YXIiOnsicmVzb3VyY2VJZCI6WyJ3cml0ZSJdfX0='
    );
  });
});
