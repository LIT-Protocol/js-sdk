import {
  AccessControlConditions,
  ConditionItem,
  EvmContractConditions,
  JsonSigningResourceId,
  SolRpcConditions,
  UnifiedAccessControlConditions,
} from '@litprotocol-dev/constants';

import {
  canonicalAccessControlConditionFormatter,
  canonicalEVMContractConditionFormatter,
  canonicalResourceIdFormatter,
  canonicalSolRpcConditionFormatter,
  canonicalUnifiedAccessControlConditionFormatter,
  log,
  uint8arrayToString,
} from '@litprotocol-dev/shared-utils';

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
  console.log(
    'unifiedAccessControlConditions:',
    unifiedAccessControlConditions
  );

  const conditions = unifiedAccessControlConditions.map(
    (condition: ConditionItem) => {
      canonicalUnifiedAccessControlConditionFormatter(condition);
    }
  );
  console.log('conditions:', conditions);
  const toHash = JSON.stringify(conditions);

  log('Hashing unified access control conditions: ', toHash);

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
  log('Hashing access control conditions: ', toHash);
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
 * @returns { Promise<ArrayBuffer> }
 *
 */
export const hashEVMContractConditions = (
  evmContractConditions: EvmContractConditions
): Promise<ArrayBuffer> => {
  const conds = evmContractConditions.map((c) =>
    canonicalEVMContractConditionFormatter(c)
  );

  const toHash = JSON.stringify(conds);
  log('Hashing evm contract conditions: ', toHash);
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
  const conds = solRpcConditions.map((c) =>
    canonicalSolRpcConditionFormatter(c)
  );

  const toHash = JSON.stringify(conds);
  log('Hashing sol rpc conditions: ', toHash);
  const encoder = new TextEncoder();
  const data = encoder.encode(toHash);

  return crypto.subtle.digest('SHA-256', data);
};
