import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
} from '@lit-protocol/schemas';
import { LitActionResponseStrategy, NagaJitContext } from '@lit-protocol/types';
import { z } from 'zod';
import { PricingContextSchema } from '../../pricing-manager/schema';
import { ConnectionInfo } from '../../LitChainClient/types';

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
  jitContext: NagaJitContext;
};
