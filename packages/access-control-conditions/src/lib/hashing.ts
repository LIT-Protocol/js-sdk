import { LIT_ERROR } from '@lit-protocol/constants';

import {
  AccessControlConditions,
  ConditionItem,
  EvmContractConditions,
  JsonSigningResourceId,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@lit-protocol/types';

import { logDebug, throwError } from '@lit-protocol/misc';
import {
  canonicalAccessControlConditionFormatter,
  canonicalEVMContractConditionFormatter,
  canonicalResourceIdFormatter,
  canonicalSolRpcConditionFormatter,
  canonicalUnifiedAccessControlConditionFormatter,
} from './canonicalFormatter';
import { uint8arrayToString } from '@lit-protocol/uint8arrays';

// Same as:
// const unifiedAccs = [
//   {
//     conditionType: 'evmBasic',
//     contractAddress: '',
//     standardContractType: '',
//     chain: 'ethereum',
//     method: '',
//     parameters: [':userAddress'],
//     returnValueTest: {
//       comparator: '=',
//       value: '0xBD4701851e9C9a22f448860A78872A00Da87899e',
//     },
//   },
//   { operator: 'or' },
//   {
//     conditionType: 'evmBasic',
//     contractAddress: '',
//     standardContractType: '',
//     chain: 'ethereum',
//     method: '',
//     parameters: [':userAddress'],
//     returnValueTest: {
//       comparator: '=',
//       value: '0x93E47A604BA72899a5f8dF986cF26C97AfdaE2A0',
//     },
//   },
// ];
// export const generateUnifiedAccsForRLIDelegation = async (
//   ethAddresses: string[]
// ): Promise<string> => {
//   const unifiedAccs: any[] = [];

//   ethAddresses.forEach((address, index) => {
//     const condition = {
//       conditionType: 'evmBasic',
//       contractAddress: '',
//       standardContractType: '',
//       chain: 'ethereum',
//       method: '',
//       parameters: [':userAddress'],
//       returnValueTest: {
//         comparator: '=',
//         value: address,
//       },
//     };

//     unifiedAccs.push(condition);

//     // Add the operator for all but the last address
//     if (index < ethAddresses.length - 1) {
//       unifiedAccs.push({ operator: 'or' });
//     }
//   });

//   const hash = await hashUnifiedAccessControlConditions(unifiedAccs);

//   return uint8arrayToString(new Uint8Array(hash), 'base16');
// };

/**
 *
 * Hash the unified access control conditions using SHA-256 in a deterministic way.
 *
 * @param { UnifiedAccessControlConditions } unifiedAccessControlConditions - The unified access control conditions to hash.
 * @returns { Promise<ArrayBuffer> } A promise that resolves to an ArrayBuffer that contains the hash
 */
export const hashUnifiedAccessControlConditions = (
  unifiedAccessControlConditions: UnifiedAccessControlConditions
): Promise<ArrayBuffer> => {
  logDebug('unifiedAccessControlConditions:', unifiedAccessControlConditions);

  const conditions = unifiedAccessControlConditions.map(
    (condition: ConditionItem) => {
      return canonicalUnifiedAccessControlConditionFormatter(condition);
    }
  );
  logDebug('conditions:', conditions);

  // check if there's any undefined in the conditions
  const hasUndefined = conditions.some((c) => c === undefined);
  if (hasUndefined) {
    throwError({
      message: 'Invalid access control conditions',
      errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
      errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
    });
  }

  if (conditions.length === 0) {
    throwError({
      message: 'No conditions provided',
      errorKind: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.kind,
      errorCode: LIT_ERROR.INVALID_ACCESS_CONTROL_CONDITIONS.name,
    });
  }
  const toHash = JSON.stringify(conditions);

  logDebug('Hashing unified access control conditions: ', toHash);

  const encoder = new TextEncoder();
  const data = encoder.encode(toHash);
  return crypto.subtle.digest('SHA-256', data);
};

/**
 *
 * Hash resource id
 *
 * @param { JsonSigningResourceId } resourceId
 *
 * @returns { Promise<ArrayBuffer> }
 *
 */
export const hashResourceId = (
  resourceId: JsonSigningResourceId
): Promise<ArrayBuffer> => {
  const resId = canonicalResourceIdFormatter(resourceId);
  const toHash = JSON.stringify(resId);
  const encoder = new TextEncoder();
  const data = encoder.encode(toHash);

  return crypto.subtle.digest('SHA-256', data);
};

/**
 *
 * Hash resourceId for signing
 *
 * @param { JSONSigningResourceId } resourceId
 *
 * @returns { string } example: "5b36d72f2145af3617e5da2a8a626f9f42e64ed14340622bdfe1a6f0702b9e8d"
 */
export const hashResourceIdForSigning = async (
  resourceId: JsonSigningResourceId
): Promise<string> => {
  const hashed = await hashResourceId(resourceId);
  return uint8arrayToString(new Uint8Array(hashed), 'base16');
};

/**
 *
 * Hash access control conditions
 *
 * @param { AccessControlConditions } accessControlConditions
 *
 * @returns { Promise<ArrayBuffer> } example: {"data": [83, 176, 31, 130, 12, 130, 232, 109, 126, 76, 216, 4, 184, 166, 246, 134, 130, 34, 30, 235, 125, 247, 111, 212, 62, 231, 119, 200, 202, 171, 86, 40], "type": "Buffer"}
 *
 */
export const hashAccessControlConditions = (
  accessControlConditions: AccessControlConditions
): Promise<ArrayBuffer> => {
  const conds = accessControlConditions.map((c) =>
    canonicalAccessControlConditionFormatter(c)
  );

  const toHash = JSON.stringify(conds);
  logDebug('Hashing access control conditions: ', toHash);
  const encoder = new TextEncoder();
  const data = encoder.encode(toHash);

  return crypto.subtle.digest('SHA-256', data);
};

/**
 *
 * Hash EVM access control conditions
 *
 * @param { EvmContractConditions } evmContractConditions
 *
 * @returns { Promise<ArrayBuffer> } {"data": [216, 92, 128, 31, 171, 114, 74, 115, 133, 44, 234, 171, 214, 205, 228, 137, 117, 238, 14, 229, 254, 239, 97, 126, 1, 20, 166, 144, 176, 147, 217, 32], "type": "Buffer"}
 *
 */
export const hashEVMContractConditions = (
  evmContractConditions: EvmContractConditions
): Promise<ArrayBuffer> => {
  const conds = evmContractConditions.map((c) =>
    canonicalEVMContractConditionFormatter(c)
  );

  const toHash = JSON.stringify(conds);
  logDebug('Hashing evm contract conditions: ', toHash);
  const encoder = new TextEncoder();
  const data = encoder.encode(toHash);
  return crypto.subtle.digest('SHA-256', data);
};

/**
 *
 * Hash SOL access control conditions
 *
 * @param { SolRpcConditions } solRpcConditions
 *
 * @returns { Promise<ArrayBuffer> }
 *
 */
export const hashSolRpcConditions = (
  solRpcConditions: SolRpcConditions
): Promise<ArrayBuffer> => {
  const conds = solRpcConditions.map((c: any) =>
    canonicalSolRpcConditionFormatter(c)
  );

  const toHash = JSON.stringify(conds);
  logDebug('Hashing sol rpc conditions: ', toHash);
  const encoder = new TextEncoder();
  const data = encoder.encode(toHash);

  return crypto.subtle.digest('SHA-256', data);
};
