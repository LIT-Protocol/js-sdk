/**
 * This file serves as a central location for all Lit node endpoints and their request/response interfaces & types.
 */
import { z } from 'zod';
import { SigningAccessControlConditionRequestSchema } from '@lit-protocol/schemas';

import { AuthMethod, AuthSig } from '../interfaces';
import {
  AccessControlConditions,
  EvmContractConditions,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '../types';

// pub struct JsonPKPClaimKeyRequest {
//   pub auth_method: AuthMethod,
//   pub credential_public_key: Option<String>,
// }
export interface JsonPKPClaimKeyRequest {
  authMethod: AuthMethod;
  credentialPublicKey?: string | null;
}

export type SigningAccessControlConditionRequest = z.infer<
  typeof SigningAccessControlConditionRequestSchema
>;

// pub struct EncryptionSignRequest {
//   pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
//   pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
//   pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
//   pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
//   pub chain: Option<String>,
//   pub data_to_encrypt_hash: String,
//   pub auth_sig: AuthSigItem,
//   #[serde(default = "default_epoch")]
//   pub epoch: u64,
// }
export interface EncryptionSignRequest {
  accessControlConditions?: AccessControlConditions[];
  evmContractConditions?: EvmContractConditions[];
  solRpcConditions?: SolRpcConditions[];
  unifiedAccessControlConditions?: UnifiedAccessControlConditions[];
  chain?: string | null;
  dataToEncryptHash: string;
  authSig: AuthSig;
  epoch: number;
}
