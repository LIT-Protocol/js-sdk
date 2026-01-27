import {
  PKPAuthContextSchema,
  EoaAuthContextSchema,
} from '@lit-protocol/schemas';
import {
  AuthSig,
  LitActionResponseStrategy,
  NagaJitContext,
} from '@lit-protocol/types';
import { z } from 'zod';
import { PricingContextSchema } from '../../pricing-manager/schema';
import { ConnectionInfo } from '../../LitChainClient/types';

type ExecuteJsCreateRequestParamsBase = {
  pricingContext: z.input<typeof PricingContextSchema>;
  executionContext: {
    code?: string;
    ipfsId?: string;
    jsParams?: Record<string, any>;
  };
  keySetIdentifier?: string;
  connectionInfo: ConnectionInfo;
  version: string;
  useSingleNode?: boolean;
  responseStrategy?: LitActionResponseStrategy;
  jitContext: NagaJitContext;
};

export type ExecuteJsCreateRequestParamsWithAuthContext =
  ExecuteJsCreateRequestParamsBase & {
    authContext: z.input<
      typeof PKPAuthContextSchema | typeof EoaAuthContextSchema
    >;
    sessionSigs?: never;
    delegationAuthSig?: AuthSig;
  };

export type ExecuteJsCreateRequestParamsWithSessionSigs =
  ExecuteJsCreateRequestParamsBase & {
    sessionSigs: Record<string, AuthSig>;
    authContext?: undefined;
    delegationAuthSig?: AuthSig;
  };

export type ExecuteJsCreateRequestParams =
  | ExecuteJsCreateRequestParamsWithAuthContext
  | ExecuteJsCreateRequestParamsWithSessionSigs;
