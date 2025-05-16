import { SigningSchemeSchema } from '@lit-protocol/constants';
import {
  AuthContextSchema,
  EoaAuthContextSchema,
  HexPrefixedSchema,
  SigningChainSchema,
} from '@lit-protocol/schemas';
import { z } from 'zod';
import { PricingContextSchema } from '../../pricing-manager/PricingContextSchema';
import { ConnectionInfo } from '../../../../LitChainClient/types';
export type PKPSignCreateRequestParams = {
  pricingContext: z.input<typeof PricingContextSchema>;
  authContext: z.input<typeof AuthContextSchema | typeof EoaAuthContextSchema>;
  signingContext: {
    pubKey: z.infer<typeof HexPrefixedSchema>;
    toSign: any;
    signingScheme: z.infer<typeof SigningSchemeSchema>;
  };
  connectionInfo: ConnectionInfo;
  version: string;
  chain: z.infer<typeof SigningChainSchema>;
};
