import { getChildLogger } from '@lit-protocol/logger';
import {
  RecapSessionCapabilityObject,
  getLitAbilityFromRecap,
  parseLitResource,
} from '@lit-protocol/auth-helpers';
import { RESOLVED_AUTH_CONTEXT_PREFIX } from '@lit-protocol/auth-helpers';
import {
  AUTH_METHOD_TYPE,
  AUTH_METHOD_TYPE_VALUES,
  LIT_ABILITY_VALUES,
} from '@lit-protocol/constants';
import {
  HexPrefixedSchema,
  SessionKeyUriSchema,
  AuthData,
  AuthDataSchema,
  DefinedJson,
  DefinedJsonSchema,
} from '@lit-protocol/schemas';
import {
  AuthSig,
  ILitResource,
  LitResourceAbilityRequest,
  SessionKeyPair,
} from '@lit-protocol/types';
import { z } from 'zod';
import { processResources } from '../utils/processResources';
import { validateDelegationAuthSig } from '../utils/validateDelegationAuthSig';

const _logger = getChildLogger({
  module: 'getPkpAuthContextFromPreGeneratedAdapter',
});

const AuthMethodContextSchema = z
  .object({
    appId: z.string().optional(),
    authMethodType: z.number(),
    usedForSignSessionKeyRequest: z.boolean().optional(),
    userId: z.string(),
  })
  .passthrough();

const AuthContextSchema = z
  .object({
    authMethodContexts: z.array(AuthMethodContextSchema),
    authSigAddress: z.string().optional().nullable(),
  })
  .passthrough();

function buildAuthDataFromAuthContext(authContext: unknown): AuthData | null {
  const parsedContext = AuthContextSchema.safeParse(authContext);

  if (!parsedContext.success) {
    _logger.debug(
      {
        issues: parsedContext.error.issues,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Unable to parse auth context from recap restriction'
    );
    return null;
  }

  const { authMethodContexts, authSigAddress } = parsedContext.data;

  if (authMethodContexts.length === 0) {
    return null;
  }

  const resolvedContext =
    authMethodContexts.find(
      (context) => context.usedForSignSessionKeyRequest === true
    ) ?? authMethodContexts[0];

  const authMethodType = resolvedContext.authMethodType;
  const userId = resolvedContext.userId;

  if (
    !Object.values(AUTH_METHOD_TYPE).includes(
      authMethodType as AUTH_METHOD_TYPE_VALUES
    )
  ) {
    _logger.warn(
      {
        authMethodType,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Unsupported auth method type found in delegation auth signature recap'
    );
    return null;
  }

  if (authMethodType !== AUTH_METHOD_TYPE.EthWallet) {
    _logger.info(
      {
        authMethodType,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Recap metadata present but only EthWallet is auto-derived; please supply authData explicitly for other auth methods'
    );
    return null;
  }

  if (!userId.startsWith('0x')) {
    _logger.warn(
      {
        userId,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Derived userId from delegation auth signature recap is not hex-prefixed'
    );
    return null;
  }

  const candidate = {
    authMethodType: authMethodType as AUTH_METHOD_TYPE_VALUES,
    authMethodId: userId,
    accessToken: JSON.stringify({
      userId,
      appId: resolvedContext.appId,
    }),
    ...(authSigAddress?.startsWith('0x') ? { publicKey: authSigAddress } : {}),
    metadata: {
      authContext: parsedContext.data,
    },
  };

  const parsedAuthData = AuthDataSchema.safeParse(candidate);

  if (!parsedAuthData.success) {
    _logger.warn(
      {
        candidate,
        issues: parsedAuthData.error.issues,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Unable to derive authData from delegation auth signature recap'
    );
    return null;
  }

  _logger.debug(
    {
      authMethodType: parsedAuthData.data.authMethodType,
      authMethodId: parsedAuthData.data.authMethodId,
    },
    'getPkpAuthContextFromPreGeneratedAdapter: Derived auth metadata from delegation recap'
  );

  return parsedAuthData.data;
}

function extractAuthMetadataFromRestriction(
  restriction: Record<string, unknown>
): AuthData | null {
  if (!('auth_context' in restriction)) {
    return null;
  }

  return buildAuthDataFromAuthContext(restriction['auth_context']);
}

function sanitiseRestrictionData(
  restriction: Record<string, unknown>
): Record<string, DefinedJson> | undefined {
  const parsedData = Object.entries(restriction).reduce((acc, [key, value]) => {
    const result = DefinedJsonSchema.safeParse(value);
    if (result.success) {
      acc[key] = result.data;
    }
    return acc;
  }, {} as Record<string, DefinedJson>);

  return Object.keys(parsedData).length > 0 ? parsedData : undefined;
}

function decodeRecapResource(urn: string): {
  requests: LitResourceAbilityRequest[];
  derivedAuthData: AuthData | null;
} {
  try {
    const recap = RecapSessionCapabilityObject.decode(urn);
    const attenuations = recap.attenuations;

    const requests: LitResourceAbilityRequest[] = [];
    let derivedAuthData: AuthData | null = null;

    for (const [resourceKey, abilityMap] of Object.entries(attenuations)) {
      if (
        !abilityMap ||
        typeof abilityMap !== 'object' ||
        Array.isArray(abilityMap)
      ) {
        continue;
      }

      const isResolvedAuthContext = resourceKey.startsWith(
        RESOLVED_AUTH_CONTEXT_PREFIX
      );

      let resource: ILitResource | null = null;
      if (!isResolvedAuthContext) {
        try {
          resource = parseLitResource(resourceKey);
        } catch (error) {
          _logger.warn(
            {
              resourceKey,
              error,
            },
            'getPkpAuthContextFromPreGeneratedAdapter: Unable to parse lit resource from recap attenuation'
          );
          continue;
        }
      }

      for (const [abilityKey, restrictions] of Object.entries(
        abilityMap as Record<string, unknown>
      )) {
        const restrictionArray = Array.isArray(restrictions)
          ? (restrictions as Array<unknown>)
          : [];

        const restriction = restrictionArray.find(
          (item): item is Record<string, unknown> =>
            !!item && typeof item === 'object'
        );

        let data: Record<string, DefinedJson> | undefined;

        if (restriction) {
          const restrictionRecord = restriction as Record<string, unknown>;

          if (!derivedAuthData) {
            derivedAuthData =
              extractAuthMetadataFromRestriction(restrictionRecord) ||
              derivedAuthData;
            if (derivedAuthData) {
              _logger.debug(
                {
                  authMethodType: derivedAuthData.authMethodType,
                  authMethodId: derivedAuthData.authMethodId,
                },
                'getPkpAuthContextFromPreGeneratedAdapter: Reusing derived auth metadata from recap payload'
              );
            }
          }

          data = sanitiseRestrictionData(restrictionRecord);
        }

        const [recapNamespace, recapAbility] = abilityKey.split('/');
        const litAbility = recapNamespace
          ? getLitAbilityFromRecap({
              recapNamespace,
              recapAbility: recapAbility ?? '',
              resourceKey,
            })
          : null;

        if (!litAbility || !resource) {
          continue;
        }

        requests.push({
          resource,
          ability: litAbility,
          ...(data ? { data } : {}),
        });
      }
    }

    return { requests, derivedAuthData };
  } catch (error) {
    _logger.warn(
      {
        urn,
        error,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Failed to decode recap resource'
    );

    return { requests: [], derivedAuthData: null };
  }
}

/**
 * Extracts auth config information from a delegation signature's SIWE message
 */
function extractAuthConfigFromDelegationAuthSig(delegationAuthSig: AuthSig): {
  domain?: string;
  statement?: string;
  expiration?: string;
  resources?: LitResourceAbilityRequest[];
  derivedAuthData?: AuthData;
} {
  const siweMessage = delegationAuthSig.signedMessage;

  // const parsedSiweMessage = new SiweMessage(siweMessage);

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

  const resourceMatches = [...siweMessage.matchAll(/-\s*(urn:recap:[^\s]+)/g)];

  const resources: LitResourceAbilityRequest[] = [];
  let derivedAuthData: AuthData | undefined;

  for (const match of resourceMatches) {
    const urn = match[1];
    const { requests, derivedAuthData: candidateAuthData } =
      decodeRecapResource(urn);

    resources.push(...requests);

    if (!derivedAuthData && candidateAuthData) {
      derivedAuthData = candidateAuthData;
    }
  }

  return { domain, statement, expiration, resources, derivedAuthData };
}

/**
 * Creates a PKP auth context from pre-generated session materials.
 * This is a streamlined API for server-side scenarios where session materials
 * are generated once and reused across multiple requests.
 */
/**
 * Builds a PKP auth context from session materials that were pre-generated elsewhere.
 *
 * @example
 * ```ts
 * const { sessionKeyPair, delegationAuthSig } = await generateMaterials();
 * const context = await getPkpAuthContextFromPreGeneratedAdapter({
 *   pkpPublicKey: '0xabc...',
 *   sessionKeyPair,
 *   delegationAuthSig,
 * });
 * ```
 *
 * @param params.pkpPublicKey PKP public key that minted the delegation.
 * @param params.sessionKeyPair Session key pair previously generated.
 * @param params.delegationAuthSig Delegation signature returned from PKP nodes.
 * @param params.authData Optional auth metadata from the original signer; if omitted,
 *                        the method will attempt to reconstruct it from the RECAP payload.
 * @returns An auth context that can be reused for issuing session signatures.
 */
export async function getPkpAuthContextFromPreGeneratedAdapter(params: {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  sessionKeyPair: SessionKeyPair;
  delegationAuthSig: AuthSig;
  authData?: AuthData;
}) {
  _logger.info(
    {
      pkpPublicKey: params.pkpPublicKey,
      hasSessionKeyPair: !!params.sessionKeyPair,
      hasDelegationAuthSig: !!params.delegationAuthSig,
      hasAuthData: !!params.authData,
    },
    'getPkpAuthContextFromPreGeneratedAdapter: Creating PKP auth context from pre-generated materials'
  );

  // Extract auth config from delegation signature
  const extractedAuthConfig = extractAuthConfigFromDelegationAuthSig(
    params.delegationAuthSig
  );

  // Create auth config using extracted information with sensible defaults
  const resources =
    extractedAuthConfig.resources && extractedAuthConfig.resources.length > 0
      ? extractedAuthConfig.resources
      : processResources([['pkp-signing', '*']]);

  const authConfig = {
    domain: extractedAuthConfig.domain || 'localhost',
    resources,
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
  validateDelegationAuthSig({
    delegationAuthSig: params.delegationAuthSig,
    sessionKeyUri,
  });

  const resolvedAuthData =
    params.authData || extractedAuthConfig.derivedAuthData;

  if (!resolvedAuthData) {
    _logger.error(
      {
        pkpPublicKey: params.pkpPublicKey,
      },
      'getPkpAuthContextFromPreGeneratedAdapter: Unable to derive authData from delegation signature and none supplied'
    );

    throw new Error(
      'Failed to derive authData from delegation signature. Provide authData explicitly when calling createPkpAuthContextFromPreGenerated.'
    );
  }

  _logger.debug(
    {
      authMethodType: resolvedAuthData.authMethodType,
      authMethodId: resolvedAuthData.authMethodId,
    },
    'getPkpAuthContextFromPreGeneratedAdapter: Using resolved auth metadata for PKP context'
  );

  // Return auth context using pre-generated materials
  return {
    chain: 'ethereum',
    pkpPublicKey: params.pkpPublicKey,
    authData: resolvedAuthData,
    authConfig,
    sessionKeyPair: params.sessionKeyPair,
    derivedAuthMetadata: extractedAuthConfig.derivedAuthData || undefined,
    // Provide the pre-generated delegation signature
    authNeededCallback: async () => {
      _logger.debug(
        'getPkpAuthContextFromPreGeneratedAdapter: Returning pre-generated delegation signature'
      );
      return params.delegationAuthSig;
    },
  };
}
