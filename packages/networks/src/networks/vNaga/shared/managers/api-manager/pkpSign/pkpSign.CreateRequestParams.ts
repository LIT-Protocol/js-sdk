import { SigningSchemeSchema } from '@lit-protocol/constants';
import type { KEY_SET_IDENTIFIER_VALUES } from '@lit-protocol/constants';
import {
  EoaAuthContextSchema,
  HexPrefixedSchema,
  PKPAuthContextSchema,
  SigningChainSchema,
} from '@lit-protocol/schemas';
import { NagaJitContext, AuthSig, SessionSigsMap } from '@lit-protocol/types';
import { z } from 'zod';
import { ConnectionInfo } from '../../LitChainClient/types';
import { PricingContextSchema } from '../../pricing-manager/schema';
import { RawHandshakeResponseSchema } from '../handshake/handshake.schema';

export type PKPSignCreateRequestParams = {
  serverKeys: Record<
    string,
    z.infer<typeof RawHandshakeResponseSchema>['data']
  >;
  pricingContext: z.input<typeof PricingContextSchema>;
  authContext: z.input<
    typeof PKPAuthContextSchema | typeof EoaAuthContextSchema
  >;
  signingContext: {
    pubKey: z.infer<typeof HexPrefixedSchema>;
    toSign: any;
    signingScheme: z.infer<typeof SigningSchemeSchema>;
    bypassAutoHashing?: boolean;
  };
  connectionInfo: ConnectionInfo;
  version: string;
  chain: z.infer<typeof SigningChainSchema>;
  jitContext: NagaJitContext;
  sessionSigs?: SessionSigsMap;
  delegationAuthSig?: AuthSig;
  keySetIdentifier?: KEY_SET_IDENTIFIER_VALUES;
};
