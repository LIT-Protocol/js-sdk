import { AuthSig } from '@lit-protocol/types';
import { validateSessionSigs } from './session-sigs-validator';

describe('validateSessionSigs', () => {
  // Mock session signature with valid data for reference
  const validSessionSig: AuthSig = {
    sig: 'valid-sig',
    derivedVia: 'some-method',
    signedMessage: JSON.stringify({
      capabilities: [
        {
          sig: 'valid-capability-sig',
          signedMessage: `Capability Signed Message
Expiration Time: 2099-12-31T23:59:59Z`,
          address: '0xValidAddress',
        },
      ],
      expiration: '2099-12-31T23:59:59Z', // Valid future date
    }),
    address: '0xValidAddress',
    algo: 'ed25519',
  };

  // Helper function to create a SessionSigsMap
  function createSessionSigsMap(sigs: {
    [key: string]: AuthSig;
  }): Record<string, AuthSig> {
    return sigs;
  }

  // 1. Invalid JSON in signedMessage
  it('should handle invalid JSON in signedMessage', () => {
    const invalidJsonSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: '{ invalid JSON }',
    };

    const sessionSigs = createSessionSigsMap({
      session1: invalidJsonSessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "Session Sig 'session1': Main signedMessage is not valid JSON."
    );
  });

  // 2. Missing capabilities field
  it('should handle missing capabilities field', () => {
    const parsedMessage = JSON.parse(validSessionSig.signedMessage);
    delete parsedMessage.capabilities; // Remove the capabilities field

    const missingCapabilitiesSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const sessionSigs = createSessionSigsMap({
      session1: missingCapabilitiesSessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "Session Sig 'session1': Capabilities not found in main signedMessage."
    );
  });

  // 3. Empty capabilities array
  it('should not accept an empty capabilities array', () => {
    const parsedMessage = JSON.parse(validSessionSig.signedMessage);
    parsedMessage.capabilities = []; // Set capabilities to empty array

    const emptyCapabilitiesSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const sessionSigs = createSessionSigsMap({
      session1: emptyCapabilitiesSessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining('No capabilities found in main signedMessage.')
    );
  });

  // 4. Invalid capability in capabilities
  it('should handle invalid capability in capabilities', () => {
    const parsedMessage = JSON.parse(validSessionSig.signedMessage);
    parsedMessage.capabilities[0].signedMessage = `Capability Signed Message
Expiration Time: invalid-date-format`; // Invalid expiration date in capability

    const invalidCapabilitySessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const sessionSigs = createSessionSigsMap({
      session1: invalidCapabilitySessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining(
        "Session Sig 'session1': Invalid Expiration Time format in capability 0"
      )
    );
  });

  // 5. Missing expiration in main signedMessage
  it('should handle missing expiration in main signedMessage', () => {
    const parsedMessage = JSON.parse(validSessionSig.signedMessage);
    delete parsedMessage.expiration; // Remove the expiration field

    const missingExpirationSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const sessionSigs = createSessionSigsMap({
      session1: missingExpirationSessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "Session Sig 'session1': Expiration Time not found in main signedMessage."
    );
  });

  // 6. Invalid expiration date format in main signedMessage
  it('should handle invalid expiration date format in main signedMessage', () => {
    const parsedMessage = JSON.parse(validSessionSig.signedMessage);
    parsedMessage.expiration = 'invalid-date-format'; // Set invalid expiration date

    const invalidExpirationFormatSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const sessionSigs = createSessionSigsMap({
      session1: invalidExpirationFormatSessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining(
        "Session Sig 'session1': Invalid Expiration Time format in main signedMessage"
      )
    );
  });

  // 7. Expired expiration date in main signedMessage
  it('should handle expired expiration date in main signedMessage', () => {
    const parsedMessage = JSON.parse(validSessionSig.signedMessage);
    parsedMessage.expiration = '2000-01-01T00:00:00Z'; // Past date

    const expiredExpirationSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const sessionSigs = createSessionSigsMap({
      session1: expiredExpirationSessionSig,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining(
        "Session Sig 'session1': Expired main signedMessage. Expiration Time:"
      )
    );
  });

  // 8. Multiple session signatures, some valid and some invalid
  it('should validate multiple session signatures and report errors', () => {
    const session1 = validSessionSig; // Valid
    const session2: AuthSig = {
      ...validSessionSig,
      signedMessage: '{ invalid JSON }', // Invalid JSON
    };
    const session3: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify({
        capabilities: [
          {
            sig: 'valid-capability-sig',
            signedMessage: `Capability Signed Message
Expiration Time: invalid-date-format`, // Invalid date format
            address: '0xValidAddress',
          },
        ],
        expiration: '2099-12-31T23:59:59Z',
      }),
    };

    const sessionSigs = createSessionSigsMap({
      session1,
      session2,
      session3,
    });

    const validationResult = validateSessionSigs(sessionSigs);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      "Session Sig 'session2': Main signedMessage is not valid JSON."
    );
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining(
        "Session Sig 'session3': Invalid Expiration Time format in capability 0"
      )
    );
  });
});
