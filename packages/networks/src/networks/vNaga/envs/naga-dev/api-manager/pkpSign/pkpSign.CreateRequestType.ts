import { SigningSchemeSchema } from '@lit-protocol/constants';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { ConnectionInfo } from '@vNaga/LitChainClient';
import { z } from 'zod';
import { PricingContextSchema } from '../../pricing-manager/PricingContextSchema';
import { AuthContextSchema, EoaAuthContextSchema } from '@lit-protocol/schemas';

export type PKPSignCreateRequestType = {
  pricingContext: z.input<typeof PricingContextSchema>;
  authContext: z.input<typeof AuthContextSchema | typeof EoaAuthContextSchema>;
  signingContext: {
    pubKey: z.infer<typeof HexPrefixedSchema>;
    toSign: any;
    signingScheme: z.infer<typeof SigningSchemeSchema>;
  };
  connectionInfo: ConnectionInfo;
  version: string;
};
