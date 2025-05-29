import { SigningSchemeSchema } from '@lit-protocol/constants';
import {
  EoaAuthContextSchema,
  HexPrefixedSchema,
  PKPAuthContextSchema,
  SigningChainSchema,
} from '@lit-protocol/schemas';
import { NagaJitContext } from '@lit-protocol/types';
import { z } from 'zod';
import { ConnectionInfo } from '../../../../LitChainClient/types';
import { PricingContextSchema } from '../../pricing-manager/PricingContextSchema';
import { RawHandshakeResponseSchema } from '../handshake/handshake.schema';

export type PKPSignCreateRequestParams = {
  serverKeys: Record<string, z.infer<typeof RawHandshakeResponseSchema>>;
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
};
