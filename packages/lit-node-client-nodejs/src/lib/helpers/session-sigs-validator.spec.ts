import { AuthSig } from '@lit-protocol/types';
import { validateSessionSignature } from './session-sigs-validator';

describe('validateSessionSignature', () => {
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

  // Helper function to parse the signedMessage from validSessionSig
  function getParsedSignedMessage(sessionSig: AuthSig): any {
    return JSON.parse(sessionSig.signedMessage);
  }

  // 1. Invalid JSON in signedMessage
  it('should handle invalid JSON in signedMessage', () => {
    const invalidJsonSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: '{ invalid JSON }',
    };

    const validationResult = validateSessionSignature(invalidJsonSessionSig);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      'Main signedMessage is not valid JSON.'
    );
  });

  // 2. Missing capabilities field
  it('should handle missing capabilities field', () => {
    const parsedMessage = getParsedSignedMessage(validSessionSig);
    delete parsedMessage.capabilities; // Remove the capabilities field

    const missingCapabilitiesSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const validationResult = validateSessionSignature(
      missingCapabilitiesSessionSig
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      'Capabilities not found in main signedMessage.'
    );
  });

  // 3. Empty capabilities array
  it('should handle empty capabilities array', () => {
    const parsedMessage = getParsedSignedMessage(validSessionSig);
    parsedMessage.capabilities = []; // Set capabilities to empty array

    const emptyCapabilitiesSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const validationResult = validateSessionSignature(
      emptyCapabilitiesSessionSig
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      'No capabilities found in main signedMessage.'
    );
  });

  // 4. Invalid capability in capabilities
  it('should handle invalid capability in capabilities', () => {
    const parsedMessage = getParsedSignedMessage(validSessionSig);
    parsedMessage.capabilities[0].signedMessage = `Capability Signed Message
Expiration Time: invalid-date-format`; // Invalid expiration date in capability

    const invalidCapabilitySessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const validationResult = validateSessionSignature(
      invalidCapabilitySessionSig
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining('Invalid Expiration Time format in capability 0')
    );
  });

  // 5. Missing expiration in main signedMessage
  it('should handle missing expiration in main signedMessage', () => {
    const parsedMessage = getParsedSignedMessage(validSessionSig);
    delete parsedMessage.expiration; // Remove the expiration field

    const missingExpirationSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const validationResult = validateSessionSignature(
      missingExpirationSessionSig
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContain(
      'Expiration Time not found in main signedMessage.'
    );
  });

  // 6. Invalid expiration date format in main signedMessage
  it('should handle invalid expiration date format in main signedMessage', () => {
    const parsedMessage = getParsedSignedMessage(validSessionSig);
    parsedMessage.expiration = 'invalid-date-format'; // Set invalid expiration date

    const invalidExpirationFormatSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const validationResult = validateSessionSignature(
      invalidExpirationFormatSessionSig
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining(
        'Invalid Expiration Time format in main signedMessage'
      )
    );
  });

  // 7. Expired expiration date in main signedMessage
  it('should handle expired expiration date in main signedMessage', () => {
    const parsedMessage = getParsedSignedMessage(validSessionSig);
    parsedMessage.expiration = '2000-01-01T00:00:00Z'; // Past date

    const expiredExpirationSessionSig: AuthSig = {
      ...validSessionSig,
      signedMessage: JSON.stringify(parsedMessage),
    };

    const validationResult = validateSessionSignature(
      expiredExpirationSessionSig
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.errors).toContainEqual(
      expect.stringContaining('Expired main signedMessage. Expiration Time:')
    );
  });
});
