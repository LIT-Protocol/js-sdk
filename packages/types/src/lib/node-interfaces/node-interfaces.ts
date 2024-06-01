/**
 * This file serves as a central location for all Lit node endpoints and their request/response interfaces & types.
 */

import {
  AuthMethod,
  AuthSig,
  MultipleAccessControlConditions,
} from '../interfaces';
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

// pub struct SigningAccessControlConditionRequest {
//     pub access_control_conditions: Option<Vec<AccessControlConditionItem>>,
//     pub evm_contract_conditions: Option<Vec<EVMContractConditionItem>>,
//     pub sol_rpc_conditions: Option<Vec<SolRpcConditionItem>>,
//     pub unified_access_control_conditions: Option<Vec<UnifiedAccessControlConditionItem>>,
//     pub chain: Option<String>,
//     pub auth_sig: AuthSigItem,
//     pub iat: u64,
//     pub exp: u64,
//     #[serde(default = "default_epoch")]
//     pub epoch: u64,
// }
export interface SigningAccessControlConditionRequest
  extends MultipleAccessControlConditions {
  // The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
  chain?: string;

  // The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
  authSig?: AuthSig;

  iat?: number;
  exp?: number;
}

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
