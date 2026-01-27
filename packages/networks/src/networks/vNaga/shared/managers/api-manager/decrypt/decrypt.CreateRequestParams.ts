import type { ConnectionInfo } from '../../LitChainClient/types';
import type { z } from 'zod';
import type { PricingContextSchema } from '../../pricing-manager/schema';
import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
} from '@lit-protocol/schemas';
import type { NagaJitContext } from '@lit-protocol/types';

export type DecryptCreateRequestParams = {
  pricingContext: z.input<typeof PricingContextSchema>;
  authContext: z.input<
    typeof PKPAuthContextSchema | typeof EoaAuthContextSchema
  >;
  ciphertext: string;
  dataToEncryptHash: string;
  accessControlConditions?: any;
  evmContractConditions?: any;
  solRpcConditions?: any;
  unifiedAccessControlConditions?: any;
  connectionInfo: ConnectionInfo;
  version: string;
  chain: string;
  jitContext: NagaJitContext;
  keySetIdentifier?: string;
};
