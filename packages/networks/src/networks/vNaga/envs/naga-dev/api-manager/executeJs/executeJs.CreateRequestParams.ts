import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
} from '@lit-protocol/schemas';
import { LitActionResponseStrategy } from '@lit-protocol/types';
import { z } from 'zod';
import { PricingContextSchema } from '../../pricing-manager/PricingContextSchema';
import { ConnectionInfo } from '../../../../LitChainClient/types';

export type ExecuteJsCreateRequestParams = {
  pricingContext: z.input<typeof PricingContextSchema>;
  authContext: z.input<
    typeof PKPAuthContextSchema | typeof EoaAuthContextSchema
  >;
  executionContext: {
    code?: string;
    ipfsId?: string;
    jsParams?: Record<string, any>;
  };
  connectionInfo: ConnectionInfo;
  version: string;
  useSingleNode?: boolean;
  responseStrategy?: LitActionResponseStrategy;
}; 