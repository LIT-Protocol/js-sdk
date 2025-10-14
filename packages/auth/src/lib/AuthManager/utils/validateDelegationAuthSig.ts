import { AuthSig, LitResourceAbilityRequest } from '@lit-protocol/types';

/**
 * Validates that the provided delegation auth sig hasn't expired and
 * references the expected session key URI.
 * Throws an error if validation fails.
 */
export function validateDelegationAuthSig(params: {
  delegationAuthSig: AuthSig;
  requiredResources: LitResourceAbilityRequest[];
  sessionKeyUri: string;
}) {
  const { delegationAuthSig, sessionKeyUri } = params;

  try {
    const siweMessage = delegationAuthSig.signedMessage;

    // Check expiration if it exists in the SIWE message
    const expirationMatch = siweMessage.match(/^Expiration Time: (.*)$/m);
    if (expirationMatch?.[1]) {
      const expiration = new Date(expirationMatch[1].trim());
      if (Number.isNaN(expiration.getTime())) {
        throw new Error(
          'Delegation signature contains an invalid expiration timestamp'
        );
      }
      if (expiration.getTime() <= Date.now()) {
        throw new Error(
          `Delegation signature has expired at ${expiration.toISOString()}`
        );
      }
    }

    // Validate session key URI matches
    if (!siweMessage.includes(sessionKeyUri)) {
      throw new Error(
        'Session key URI in delegation signature does not match provided session key pair'
      );
    }

    // TODO: Add resource validation by parsing the RECAP URN when available.
  } catch (error) {
    throw new Error(
      `Invalid delegation signature: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
