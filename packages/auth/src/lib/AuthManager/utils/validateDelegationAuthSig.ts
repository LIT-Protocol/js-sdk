import { AuthSig } from '@lit-protocol/types';
import { SessionKeyUriSchema } from '@lit-protocol/schemas';
import { parseSignedMessage } from '../../authenticators/helper/session-sigs-validator';

/**
 * Validates that the provided delegation auth sig hasn't expired and
 * references the expected session key URI.
 * Throws an error if validation fails.
 */
export function validateDelegationAuthSig(params: {
  delegationAuthSig: AuthSig;
  sessionKeyUri: string;
}) {
  const { delegationAuthSig, sessionKeyUri } = params;
  const expectedSessionKeyUri = SessionKeyUriSchema.parse(sessionKeyUri);

  try {
    const siweMessage = delegationAuthSig.signedMessage;
    const parsedMessage = parseSignedMessage(siweMessage);

    // Check expiration if it exists in the SIWE message
    const expirationField = parsedMessage['Expiration Time'];
    if (typeof expirationField === 'string') {
      const expiration = new Date(expirationField.trim());
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
    } else if (Array.isArray(expirationField)) {
      throw new Error(
        'Delegation signature contains multiple expiration timestamps'
      );
    }

    // Validate session key URI matches
    const parsedSessionKeyUri =
      typeof parsedMessage['URI'] === 'string'
        ? parsedMessage['URI'].trim()
        : undefined;

    if (parsedSessionKeyUri) {
      if (parsedSessionKeyUri !== expectedSessionKeyUri) {
        throw new Error(
          'Session key URI in delegation signature does not match provided session key pair'
        );
      }
    } else if (!siweMessage.includes(expectedSessionKeyUri)) {
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
