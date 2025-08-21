import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { Hex } from 'viem';
import { z } from 'zod';
import { logger } from '../../../../../../../shared/logger';
import { DefaultNetworkConfig } from '../../../../../../shared/interfaces/NetworkContext';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { PKPData } from '../../../schemas/shared/PKPDataSchema';
import { ScopeSchemaRaw } from '../../../schemas/shared/ScopeSchema';
import { mintNextAndAddAuthMethods } from '../../rawContractApis/pkp/write/mintNextAndAddAuthMethods';
import { LitTxRes } from '../../types';

export const MintWithMultiAuthsSchema = z
  .object({
    authMethodIds: z.array(HexPrefixedSchema),
    authMethodTypes: z.array(z.union([z.number(), z.bigint()])),
    authMethodScopes: z.array(z.array(ScopeSchemaRaw)),
    pubkeys: z.array(HexPrefixedSchema).optional(),
    addPkpEthAddressAsPermittedAddress: z.boolean().default(true),
    sendPkpToItself: z.boolean().default(true),
  })
  .transform(async (data) => {
    const numAuthMethods = data.authMethodIds.length;

    if (
      data.authMethodTypes.length !== numAuthMethods ||
      data.authMethodScopes.length !== numAuthMethods
    ) {
      throw new Error(
        'authMethodIds, authMethodTypes, and authMethodScopes arrays must have the same length'
      );
    }

    // If pubkeys not provided, default to '0x' for each auth method
    let derivedPubkeys: Hex[] = [];

    if (data.pubkeys) {
      if (data.pubkeys.length !== numAuthMethods) {
        throw new Error(
          'pubkeys array must have the same length as other auth method arrays'
        );
      }

      // Validate pubkeys for WebAuthn methods
      data.authMethodTypes.forEach((authMethodType, index) => {
        if (authMethodType === AUTH_METHOD_TYPE.WebAuthn) {
          if (!data.pubkeys![index] || data.pubkeys![index] === '0x') {
            throw new Error(
              `pubkey is required for WebAuthn at index ${index}`
            );
          }
        }
      });

      derivedPubkeys = data.pubkeys as Hex[];
    } else {
      // Check if any auth method is WebAuthn and require pubkeys
      data.authMethodTypes.forEach((authMethodType, index) => {
        if (authMethodType === AUTH_METHOD_TYPE.WebAuthn) {
          throw new Error(`pubkey is required for WebAuthn at index ${index}`);
        }
      });

      // Default to '0x' for all non-WebAuthn methods
      derivedPubkeys = new Array(numAuthMethods).fill('0x' as Hex);
    }

    return {
      ...data,
      pubkeys: derivedPubkeys,
    };
  });

export type MintWithMultiAuthsRequest = z.input<
  typeof MintWithMultiAuthsSchema
>;

/**
 * Mints a PKP with multiple authentication methods
 *
 * @param {MintWithMultiAuthsRequest} request - The request containing arrays of auth methods and configuration
 * @param {string[]} request.authMethodIds - Array of authentication method IDs
 * @param {(number|bigint)[]} request.authMethodTypes - Array of authentication method types
 * @param {number[][]} request.authMethodScopes - Array of scopes for each authentication method
 * @param {string[]} [request.pubkeys] - Array of public keys (optional, defaults to '0x' for non-WebAuthn)
 * @param {boolean} [request.addPkpEthAddressAsPermittedAddress=true] - Whether to add PKP's ETH address as permitted
 * @param {boolean} [request.sendPkpToItself=true] - Whether to send the PKP to itself (controls ownership)
 * @param {DefaultNetworkConfig} networkConfig - Network configuration
 * @param {ExpectedAccountOrWalletClient} accountOrWalletClient - Account or wallet client for transactions
 *
 * @returns {Promise<LitTxRes<PKPData>>} Transaction result with PKP data
 *
 * @example
 * ```ts
 * const result = await mintWithMultiAuths({
 *   authMethodIds: ['0x123...', '0x456...'],
 *   authMethodTypes: [88911, 2],
 *   authMethodScopes: [[1], [1]], // sign-anything for both
 *   addPkpEthAddressAsPermittedAddress: true,
 *   sendPkpToItself: true,
 * }, networkConfig, accountOrWalletClient);
 * ```
 */
export const mintWithMultiAuths = async (
  request: MintWithMultiAuthsRequest,
  networkConfig: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxRes<PKPData>> => {
  const validatedRequest = await MintWithMultiAuthsSchema.parseAsync(request);

  logger.debug({ validatedRequest });

  console.log('🔥 mintWithMultiAuths:', validatedRequest);

  const tx = await mintNextAndAddAuthMethods(
    {
      keyType: 2,
      keySetId: 'naga-keyset1',
      permittedAuthMethodTypes: validatedRequest.authMethodTypes,
      permittedAuthMethodIds: validatedRequest.authMethodIds,
      permittedAuthMethodPubkeys: validatedRequest.pubkeys,
      permittedAuthMethodScopes: validatedRequest.authMethodScopes,
      addPkpEthAddressAsPermittedAddress:
        validatedRequest.addPkpEthAddressAsPermittedAddress,
      sendPkpToItself: validatedRequest.sendPkpToItself,
    },
    networkConfig,
    accountOrWalletClient
  );

  return tx;
};
