import { SessionSigsMap, SessionKeyUriSchema } from '@lit-protocol/types';
import { PricingContext } from '../pricing-manager/PricingContextSchema';
import { AuthContext } from './AuthContextSchema';

export const createJitSessionSigs = async (params: {
  authContext: AuthContext;
  pricingContext: PricingContext;
}): Promise<SessionSigsMap> => {
  console.log('🔄 creating jit session sigs');

  // -- prepare context
  const requestContext = {
    // properties:
    // - publicKey { string }
    // - secretKey { string }
    sessionKey: params.authContext.sessionKeyPair,

    // lit:session:<session-key-public-key>
    sessionKeyUri: SessionKeyUriSchema.parse(
      params.authContext.sessionKeyPair.publicKey
    ),

    // RecapSessionCapabilityObject
    sessionCapabilityObject: params.authContext.sessionCapabilityObject,
  };
};
