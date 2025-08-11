/**
 * Utility for resolving PKP token IDs from various input types (pubkey, address, or direct tokenId)
 * This module provides a consistent way to obtain PKP token IDs regardless of the input format.
 */

import { z } from 'zod';
import { logger } from '../../../../../../shared/logger';

import { DefaultNetworkConfig } from '../../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../../contract-manager/createContractsManager';
import { pubkeyToTokenId } from './pubkeyToTokenId';
import { toBigInt } from '../../../../../../shared/utils/z-transformers';
import { isEthAddress } from '../../../../../../shared/utils/z-validate';

// Input validation schema
export const PkpIdentifierSchema = z.discriminatedUnion('field', [
  z
    .object({
      field: z.literal('tokenId'),
      tokenId: z
        .union([z.string(), z.number(), z.bigint()])
        .transform((val) => {
          return typeof val === 'bigint' ? val : toBigInt.parse(val);
        }),
    })
    .strict(),
  z
    .object({
      field: z.literal('address'),
      address: isEthAddress,
    })
    .strict(),
  z
    .object({
      field: z.literal('pubkey'),
      pubkey: z.string(),
    })
    .strict(),
]);

// Helper type to ensure only one property exists
type ExactlyOne<T> = {
  [K in keyof T]: Record<K, T[K]> & Partial<Record<Exclude<keyof T, K>, never>>;
}[keyof T];

// @deprecated - use the one in types package instead
export type PkpIdentifierRaw = ExactlyOne<{
  tokenId: string | number | bigint;
  address: string;
  pubkey: string;
}>;

/**
 * Resolves a PKP token ID from various input types
 * @param identifier - Object containing exactly one of: tokenId, address, or pubkey
 * @param networkCtx - Network context for contract interactions
 * @returns Promise resolving to the PKP token ID as bigint
 * @throws Error if unable to resolve token ID or if input is invalid
 */
export async function resolvePkpTokenId(
  identifier: PkpIdentifierRaw,
  networkCtx?: DefaultNetworkConfig,
  accountOrWalletClient?: ExpectedAccountOrWalletClient
): Promise<bigint> {
  // Check for multiple fields
  const providedFields = Object.keys(identifier);
  if (providedFields.length !== 1) {
    throw new Error(
      `Invalid identifier: exactly one of tokenId, address, or pubkey must be provided. Found: ${providedFields.join(
        ', '
      )}`
    );
  }

  // Determine the field type and validate input
  const validatedInput = PkpIdentifierSchema.parse({
    field:
      'tokenId' in identifier
        ? 'tokenId'
        : 'address' in identifier
        ? 'address'
        : 'pubkey' in identifier
        ? 'pubkey'
        : (() => {
            throw new Error(
              'Invalid identifier: must provide tokenId, address, or pubkey'
            );
          })(),
    ...identifier,
  });

  logger.debug({ validatedInput });

  // Handle direct token ID
  if (validatedInput.field === 'tokenId') {
    return validatedInput.tokenId;
  }

  // Handle pubkey
  if (validatedInput.field === 'pubkey') {
    return pubkeyToTokenId(validatedInput.pubkey);
  }

  // Handle address (requires network context)
  if (validatedInput.field === 'address') {
    if (!networkCtx) {
      throw new Error('Network context required for address resolution');
    }

    const { pubkeyRouterContract } = createContractsManager(
      networkCtx,
      accountOrWalletClient
    );
    const pkpTokenId = await pubkeyRouterContract.read.ethAddressToPkpId([
      validatedInput.address as `0x${string}`,
    ]);

    if (!pkpTokenId) {
      throw new Error('PKP token ID not found for address');
    }

    return pkpTokenId;
  }

  throw new Error('Unable to resolve PKP token ID');
}
