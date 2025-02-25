import { z } from 'zod';

import { AtomAccSchema, type AtomAcc } from './AtomAcc';
import { EvmBasicAccSchema, type EvmBasicAcc } from './EvmBasicAcc';
import { EvmContractAccSchema, type EvmContractAcc } from './EvmContractAcc';
import { OperatorAccSchema, type OperatorAcc } from './OperatorAcc';
import { SolAccSchema, type SolAcc } from './SolAcc';

// Type definitions
export type AtomCondition = AtomAcc | OperatorAcc | AtomCondition[]; // Recursive definition
export type EvmBasicCondition = EvmBasicAcc | OperatorAcc | EvmBasicCondition[]; // Recursive definition
export type EvmContractCondition =
  | EvmContractAcc
  | OperatorAcc
  | EvmContractCondition[]; // Recursive definition
export type SolRpcCondition = SolAcc | OperatorAcc | SolRpcCondition[]; // Recursive definition
export type ConditionItem =
  | AtomAcc
  | EvmBasicAcc
  | EvmContractAcc
  | SolAcc
  | OperatorAcc;
export type UnifiedAccessControlCondition =
  | ConditionItem
  | UnifiedAccessControlCondition[]; // Recursive definition

// Schema definitions
// Atom
const AtomConditionUnionSchema: z.ZodType<AtomCondition> = z.union([
  AtomAccSchema,
  OperatorAccSchema,
  z.array(z.lazy(() => AtomConditionSchema)),
]);
const AtomConditionSchema: z.ZodType<AtomCondition> = z.lazy(
  () => AtomConditionUnionSchema
);
export const AtomConditionsSchema: z.ZodType<AtomCondition[]> = z
  .array(AtomConditionSchema)
  .nonempty();
// EVM Basic
const EvmBasicConditionUnionSchema: z.ZodType<EvmBasicCondition> = z.union([
  EvmBasicAccSchema,
  OperatorAccSchema,
  z.array(z.lazy(() => EvmBasicConditionSchema)),
]);
const EvmBasicConditionSchema: z.ZodType<EvmBasicCondition> = z.lazy(
  () => EvmBasicConditionUnionSchema
);
export const EvmBasicConditionsSchema: z.ZodType<EvmBasicCondition[]> = z
  .array(EvmBasicConditionSchema)
  .nonempty();
// EVM Contract
const EvmContractConditionUnionSchema: z.ZodType<EvmContractCondition> =
  z.union([
    EvmContractAccSchema,
    OperatorAccSchema,
    z.array(z.lazy(() => EvmContractConditionSchema)),
  ]);
const EvmContractConditionSchema: z.ZodType<EvmContractCondition> = z.lazy(
  () => EvmContractConditionUnionSchema
);
export const EvmContractConditionsSchema: z.ZodType<EvmContractCondition[]> = z
  .array(EvmContractConditionSchema)
  .nonempty();
// Solana
const SolRpcConditionUnionSchema: z.ZodType<SolRpcCondition> = z.union([
  SolAccSchema,
  OperatorAccSchema,
  z.array(z.lazy(() => SolRpcConditionSchema)),
]);
const SolRpcConditionSchema: z.ZodType<SolRpcCondition> = z.lazy(
  () => SolRpcConditionUnionSchema
);
export const SolRpcConditionsSchema: z.ZodType<SolRpcCondition[]> = z
  .array(SolRpcConditionSchema)
  .nonempty();
// Unified
const UnifiedConditionUnionSchema: z.ZodType<UnifiedAccessControlCondition> =
  z.union([
    AtomAccSchema.required({ conditionType: true }),
    EvmBasicAccSchema.required({ conditionType: true }),
    EvmContractAccSchema.required({ conditionType: true }),
    SolAccSchema.required({ conditionType: true }),
    OperatorAccSchema,
    z.array(z.lazy(() => UnifiedConditionSchema)),
  ]);
const UnifiedConditionSchema: z.ZodType<UnifiedAccessControlCondition> = z.lazy(
  () => UnifiedConditionUnionSchema
);
export const UnifiedConditionsSchema: z.ZodType<
  UnifiedAccessControlCondition[]
> = z.array(UnifiedConditionSchema).nonempty();

export const MultipleAccessControlConditionsSchema = z.object({
  // The access control conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  accessControlConditions: EvmBasicConditionsSchema.optional(),

  // EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  evmContractConditions: EvmContractConditionsSchema.optional(),

  // Solana RPC call conditions that the user must meet to obtain this signed token.  This could be possession of an NFT, for example.
  solRpcConditions: SolRpcConditionsSchema.optional(),

  // An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
  unifiedAccessControlConditions: UnifiedConditionsSchema.optional(),
});

export type MultipleAccessControlConditions = z.infer<
  typeof MultipleAccessControlConditionsSchema
>;
