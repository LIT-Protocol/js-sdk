import {
    AccessControlConditions,
    EvmContractConditions,
    JsonSigningResourceId,
    SolRpcConditions,
} from '@litprotocol-dev/constants';
import {
    canonicalAccessControlConditionFormatter,
    canonicalEVMContractConditionFormatter,
    canonicalResourceIdFormatter,
    canonicalSolRpcConditionFormatter,
    canonicalUnifiedAccessControlConditionFormatter,
    log,
} from '@litprotocol-dev/utils';

// -- For TextEncoder()
const util = require('util');

/**
 * // #browser: TextEncoder() is browser only
 * // TEST: Add E2E Test
 * Hash the unified access control conditions using SHA-256 in a deterministic way.
 *
 * @param { Array<object> } unifiedAccessControlConditions - The unified access control conditions to hash.
 * @returns { Promise<ArrayBuffer> } A promise that resolves to an ArrayBuffer that contains the hash
 */
export const hashUnifiedAccessControlConditions = (
    unifiedAccessControlConditions: Array<object>
): Promise<ArrayBuffer> => {
    console.log(
        'unifiedAccessControlConditions:',
        unifiedAccessControlConditions
    );

    const conditions = unifiedAccessControlConditions.map(
        (condition: object) => {
            canonicalUnifiedAccessControlConditionFormatter(condition);
        }
    );

    const toHash = JSON.stringify(conditions);

    log('Hashing unified access control conditions: ', toHash);

    const encoder = new util.TextEncoder();
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
    const encoder = new util.TextEncoder();
    const data = encoder.encode(toHash);

    return crypto.subtle.digest('SHA-256', data);
};

/**
 *
 * Hash access control conditions
 *
 * @param { AccessControlConditions } accessControlConditions
 *
 * @returns { Promise<ArrayBuffer> }
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
    const encoder = new util.TextEncoder();
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
    const encoder = new util.TextEncoder();
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
    const encoder = new util.TextEncoder();
    const data = encoder.encode(toHash);

    return crypto.subtle.digest('SHA-256', data);
};
