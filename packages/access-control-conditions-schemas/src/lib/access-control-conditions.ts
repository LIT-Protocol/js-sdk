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

const AtomConditionBaseSchema = z.union([
  AtomAccSchema,
  OperatorAccSchema,
]);

const EvmBasicConditionBaseSchema = z.union([
  EvmBasicAccSchema,
  OperatorAccSchema,
]);

const EvmContractConditionBaseSchema = z.union([
  EvmContractAccSchema,
  OperatorAccSchema,
]);

const SolRpcConditionBaseSchema = z.union([
  SolAccSchema,
  OperatorAccSchema,
]);

const UnifiedConditionBaseSchema = z.union([
  AtomAccSchema,
  EvmBasicAccSchema,
  EvmContractAccSchema,
  SolAccSchema,
  OperatorAccSchema,
]);

// Export the array schemas that allow both base conditions and nested arrays
export const AtomConditionsSchema = z.array(
  z.union([AtomConditionBaseSchema, z.array(AtomConditionBaseSchema)])
).nonempty();

export const EvmBasicConditionsSchema = z.array(
  z.union([EvmBasicConditionBaseSchema, z.array(EvmBasicConditionBaseSchema)])
).nonempty();

export const EvmContractConditionsSchema = z.array(
  z.union([EvmContractConditionBaseSchema, z.array(EvmContractConditionBaseSchema)])
).nonempty();

export const SolRpcConditionsSchema = z.array(
  z.union([SolRpcConditionBaseSchema, z.array(SolRpcConditionBaseSchema)])
).nonempty();

export const UnifiedConditionsSchema = z.array(
  z.union([UnifiedConditionBaseSchema, z.array(UnifiedConditionBaseSchema)])
).nonempty();

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
