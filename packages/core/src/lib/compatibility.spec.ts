import { compatibilityCheck } from './compatibility';

describe('compatibilityCheck', () => {
  describe('manzano', () => {
    it('should pass for valid params with manzano network', () => {
      expect(() => {
        compatibilityCheck({
          network: 'manzano',
          func: 'getSessionSigs',
          params: { capacityDelegationAuthSig: 'exampleSig' },
        });
      }).not.toThrow();
    });
    it('should throw an error for invalid params with manzano network', () => {
      expect(() => {
        compatibilityCheck({
          network: 'manzano',
          func: 'getSessionSigs',
          params: {},
        });
      }).toThrow('capacityDelegationAuthSig is required for manzano');
    });
  });

  describe('habanero', () => {
    it('should pass for valid params with habanero network', () => {
      expect(() => {
        compatibilityCheck({
          network: 'habanero',
          func: 'getSessionSigs',
          params: { capacityDelegationAuthSig: 'exampleSig' },
        });
      }).not.toThrow();
    });
    it('should throw an error for invalid params with habanero network', () => {
      expect(() => {
        compatibilityCheck({
          network: 'habanero',
          func: 'getSessionSigs',
          params: {},
        });
      }).toThrow('capacityDelegationAuthSig is required for habanero');
    });
  });

  it('should return true if no specific requirement is needed', () => {
    const result = compatibilityCheck({
      network: 'cayenne',
      func: 'getSessionSigs',
      params: { someParam: 'someValue' },
    });

    expect(result).toEqual(true);
  });
});
