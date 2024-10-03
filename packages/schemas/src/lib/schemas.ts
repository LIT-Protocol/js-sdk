import { z } from 'zod';

import { LIT_AUTH_SIG_CHAIN_KEYS } from '@lit-protocol/constants';

export const LitAuthSigChainKeysSchema = z
  .enum(LIT_AUTH_SIG_CHAIN_KEYS)
  .readonly();
export type LIT_AUTH_SIG_CHAIN_KEYS_TYPE = z.infer<
  typeof LitAuthSigChainKeysSchema
>;

// Lit supported chains
export const LitBaseChainSchema = z.object({
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  rpcUrls: z.array(z.string()).nonempty().readonly(),
  blockExplorerUrls: z.array(z.string()).nonempty().readonly(),
});

// EVM
export const LitEVMChainSchema = LitBaseChainSchema.extend({
  vmType: z.literal('EVM'),
  chainId: z.number(),
  contractAddress: z.union([z.string().optional(), z.null()]),
  type: z.union([z.string().optional(), z.null()]),
  extra: z.boolean().optional(), // TODO Check if we need this
}).readonly();

// Solana
export const LitSVMChainSchema = LitBaseChainSchema.extend({
  vmType: z.literal('SVM'),
}).readonly();

// Cosmos
export const LitCosmosChainSchema = LitBaseChainSchema.extend({
  vmType: z.literal('CVM'),
  chainId: z.string(),
});

export const LitEVMChainsSchema = z.record(z.string(), LitEVMChainSchema);
export type LitEVMChains = z.infer<typeof LitEVMChainsSchema>;
export const LitSVMChainsSchema = z.record(z.string(), LitSVMChainSchema);
export type LitSVMChains = z.infer<typeof LitSVMChainsSchema>;
export const LitCosmosChainsSchema = z.record(z.string(), LitCosmosChainSchema);
export type LitCosmosChains = z.infer<typeof LitCosmosChainsSchema>;
export const AllLitChainsSchema = z.record(
  z.string(),
  z.union([LitEVMChainSchema, LitSVMChainSchema, LitCosmosChainSchema])
);
export type AllLitChains = z.infer<typeof AllLitChainsSchema>;
