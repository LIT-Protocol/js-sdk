import { getChildLogger } from '@lit-protocol/logger';
import { HexPrefixedSchema, SessionKeyUriSchema } from '@lit-protocol/schemas';
import {
  AuthSig,
  LitResourceAbilityRequest,
  SessionKeyPair,
} from '@lit-protocol/types';
import { z } from 'zod';
import { AuthData } from '@lit-protocol/schemas';
import { AuthManagerParams } from '../auth-manager';
import { processResources } from '../utils/processResources';

const _logger = getChildLogger({
  module: 'getPkpAuthContextFromPreGeneratedAdapter',
});

/**
 * Extracts auth config information from a delegation signature's SIWE message
 */
function extractAuthConfigFromDelegationAuthSig(delegationAuthSig: AuthSig): {
  domain?: string;
  statement?: string;
  expiration?: string;
  resources?: LitResourceAbilityRequest[];
} {
  const siweMessage = delegationAuthSig.signedMessage;

  // Extract domain
  const domainMatch = siweMessage.match(/^([^\s]+) wants you to sign in/m);
  const domain = domainMatch ? domainMatch[1] : undefined;

  // Extract statement
  const statementMatch = siweMessage.match(/^(.*?)(?:\n\nURI:|$)/m);
  const statement = statementMatch
    ? statementMatch[1].split('\n').slice(2).join('\n').trim()
    : undefined;

  // Extract expiration
  const expirationMatch = siweMessage.match(/^Expiration Time: (.*)$/m);
  const expiration = expirationMatch ? expirationMatch[1].trim() : undefined;

  // Extract resources from RECAP URN - simplified for now
  // TODO: Implement proper RECAP parsing when needed
  const resources: LitResourceAbilityRequest[] = [];

  return { domain, statement, expiration, resources };
}

/**
 * Validates that the provided delegation auth sig hasn't expired and contains required resources
 */
function validateDelegationAuthSig(
  delegationAuthSig: AuthSig,
  requiredResources: LitResourceAbilityRequest[],
  sessionKeyUri: string
): void {
  try {
    // Parse the signed message to extract expiration and validate session key match
    const siweMessage = delegationAuthSig.signedMessage;

    // Check expiration
    const expirationMatch = siweMessage.match(/^Expiration Time: (.*)$/m);
    if (expirationMatch && expirationMatch[1]) {
      const expiration = new Date(expirationMatch[1].trim());
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

    // TODO: Add resource validation - check if delegationAuthSig has required resources
    // This would involve parsing the RECAP URN and checking against requiredResources
    _logger.debug(
      'validateDelegationAuthSig: Delegation signature validated successfully',
      {
        sessionKeyUri,
        hasResources: requiredResources.length > 0,
      }
    );
  } catch (error) {
    throw new Error(
      `Invalid delegation signature: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Creates a PKP auth context from pre-generated session materials.
 * This is a streamlined API for server-side scenarios where session materials
 * are generated once and reused across multiple requests.
 */
export async function getPkpAuthContextFromPreGeneratedAdapter(
  upstreamParams: AuthManagerParams,
  params: {
    pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
    sessionKeyPair: SessionKeyPair;
    delegationAuthSig: AuthSig;
    authData?: AuthData;
  }
) {
  _logger.info(
    'getPkpAuthContextFromPreGeneratedAdapter: Creating PKP auth context from pre-generated materials',
    {
      pkpPublicKey: params.pkpPublicKey,
      hasSessionKeyPair: !!params.sessionKeyPair,
      hasDelegationAuthSig: !!params.delegationAuthSig,
      hasAuthData: !!params.authData,
    }
  );

  // Extract auth config from delegation signature
  const extractedAuthConfig = extractAuthConfigFromDelegationAuthSig(
    params.delegationAuthSig
  );

  // Create auth config using extracted information with sensible defaults
  const authConfig = {
    domain: extractedAuthConfig.domain || 'localhost',
    resources:
      extractedAuthConfig.resources || processResources([['pkp-signing', '*']]),
    capabilityAuthSigs: [],
    expiration:
      extractedAuthConfig.expiration ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    statement: extractedAuthConfig.statement || '',
  };

  // Generate sessionKeyUri from the public key
  const sessionKeyUri = SessionKeyUriSchema.parse(
    'lit:session:' + params.sessionKeyPair.publicKey
  );

  // Validate the delegation signature
  validateDelegationAuthSig(
    params.delegationAuthSig,
    authConfig.resources,
    sessionKeyUri
  );

  // Return auth context using pre-generated materials
  return {
    chain: 'ethereum',
    pkpPublicKey: params.pkpPublicKey,
    authData:
      params.authData ||
      ({
        // Provide minimal auth data if not provided
        authMethodType: 1, // Default auth method type
      } as AuthData),
    authConfig,
    sessionKeyPair: params.sessionKeyPair,
    // Provide the pre-generated delegation signature
    authNeededCallback: async () => {
      _logger.debug(
        'getPkpAuthContextFromPreGeneratedAdapter: Returning pre-generated delegation signature'
      );
      return params.delegationAuthSig;
    },
  };
}
