import { Provider } from '@ethersproject/abstract-provider';
import { z } from 'zod';

import { ILitNodeClientSchema } from './ILitNodeClient';
import {
  GetPkpSessionSigsSchema,
  GetSessionSigsPropsSchema,
  GetWalletSigPropsSchema,
  LitResourceAbilityRequestSchema,
  SignSessionKeyPropSchema,
} from './models';
import {
  AuthMethodSchema,
  AuthSigSchema,
  SessionKeyPairSchema,
  SessionSigsMapSchema,
  SignSessionKeyResponseSchema,
  SigResponseSchema,
} from './schemas';

export const RPCUrlsSchema = z.object({
  eth: z.string().optional(),
  cosmos: z.string().optional(),
  btc: z.string().optional(),
});

export const LitClientSessionManagerSchema = z.object({
  getSessionKey: z.function().returns(SessionKeyPairSchema),
  isSessionKeyPair: z.function().args(z.any()).returns(z.boolean()),
  getExpiration: z.function().returns(z.string()),
  getWalletSig: z
    .function()
    .args(GetWalletSigPropsSchema)
    .returns(z.promise(AuthSigSchema)),
  // #authCallbackAndUpdateStorageItem: (params: {
  //   authCallbackParams: AuthCallbackParams;
  //   authCallback?: AuthCallback;
  // }) => Promise<AuthSig>;
  getPkpSessionSigs: z
    .function()
    .args(GetPkpSessionSigsSchema)
    .returns(z.promise(SessionSigsMapSchema)),
  checkNeedToResignSessionKey: z
    .function()
    .args(
      z.object({
        authSig: AuthSigSchema,
        sessionKeyUri: z.string(),
        resourceAbilityRequests: z.array(LitResourceAbilityRequestSchema),
      })
    )
    .returns(z.promise(z.boolean())),
  getSessionSigs: z
    .function()
    .args(GetSessionSigsPropsSchema)
    .returns(z.promise(SessionSigsMapSchema)),
  signSessionKey: z
    .function()
    .args(SignSessionKeyPropSchema)
    .returns(z.promise(SignSessionKeyResponseSchema)),
});

export const AuthenticationPropsSchema = z.object({
  /**
   * This params is equivalent to the `getSessionSigs` params in the `litNodeClient`
   */
  getSessionSigsProps: GetSessionSigsPropsSchema,
});

export const PKPBasePropSchema = z.object({
  litNodeClient: ILitNodeClientSchema,
  pkpPubKey: z.string(),
  rpcs: RPCUrlsSchema.optional(),
  authContext: AuthenticationPropsSchema.optional(),
  debug: z.boolean().optional(),
  litActionCode: z.string().optional(),
  litActionIPFS: z.string().optional(),
  litActionJsParams: z.any().optional(),
  controllerSessionSigs: z.record(z.string(), AuthSigSchema).optional(),
  /**
   * @deprecated - use authContext. Will be removed in v8
   */
  controllerAuthMethods: z.array(AuthMethodSchema).optional(),
  /**
   * @deprecated - use authContext. Will be removed in v8
   */
  controllerAuthSig: AuthSigSchema.optional(),
});

export const PKPWalletSchema = z.object({
  getAddress: z.function().returns(z.promise(z.string())),
  init: z.function().returns(z.promise(z.void())),
  runLitAction: z
    .function()
    .args(z.instanceof(Uint8Array), z.string())
    .returns(z.promise(z.any())),
  runSign: z
    .function()
    .args(z.instanceof(Uint8Array))
    .returns(z.promise(SigResponseSchema)),
});

export const PKPEthersWalletPropSchema = PKPBasePropSchema.omit({
  controllerAuthSig: true,
  controllerAuthMethods: true,
}).extend({
  litNodeClient: ILitNodeClientSchema,
  provider: z.instanceof(Provider).optional(),
  rpc: z.string().optional(),
});

export const PKPCosmosWalletPropSchema = PKPBasePropSchema.extend({
  addressPrefix: z.string().default('cosmos'),
  rpc: z.string().optional(),
});

export const PKPClientPropSchema = PKPBasePropSchema.extend({
  cosmosAddressPrefix: z.string().optional().default('cosmos'),
});

export const PKPBaseDefaultParamsSchema = z.object({
  toSign: z.instanceof(Uint8Array),
  publicKey: z.instanceof(Uint8Array),
  sigName: z.string(),
});

export const PKPClientHelpersSchema = z.object({
  handleRequest: z.function().args(z.any()).returns(z.promise(z.any())),
  setRpc: z.function().args(z.string()).returns(z.void()),
  getRpc: z.function().returns(z.string()),
});
