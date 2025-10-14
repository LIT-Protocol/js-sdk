/**
 * safeTransfer.ts
 *
 * Transfers a PKP NFT from one address to another using the safeTransferFrom method.
 * This function wraps the PKP NFT contract's safeTransferFrom function to transfer ownership
 * of a PKP to a different address.
 *
 * Usage:
 * ```typescript
 * const result = await safeTransfer(
 *   { from: "0x...", to: "0x...", tokenId: "123" },
 *   networkContext,
 *   accountOrWalletClient
 * );
 * ```
 */

import { DefaultNetworkConfig } from '../../../../../../../shared/interfaces/NetworkContext';
import type { ExpectedAccountOrWalletClient } from '../../../../../contract-manager/createContractsManager';
import { createContractsManager } from '../../../../../contract-manager/createContractsManager';
import { LitTxVoid } from '../../../types';
import { callWithAdjustedOverrides } from '../../../utils/callWithAdjustedOverrides';
import { decodeLogs } from '../../../utils/decodeLogs';

export interface SafeTransferParams {
  from: string;
  to: string;
  tokenId: string | number | bigint;
}

/**
 * Transfers a PKP NFT from one address to another
 * @param params - Transfer parameters containing from, to addresses and tokenId
 * @param networkCtx - Network context
 * @param accountOrWalletClient - Account or wallet client for transaction signing
 * @returns Promise resolving to transaction details
 */
export async function safeTransfer(
  params: SafeTransferParams,
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<LitTxVoid> {
  const { pkpNftContract, publicClient } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  // Convert tokenId to bigint if it's not already
  const tokenIdBigInt =
    typeof params.tokenId === 'bigint'
      ? params.tokenId
      : BigInt(params.tokenId);

  const hash = await callWithAdjustedOverrides(
    pkpNftContract,
    'safeTransferFrom',
    [
      params.from as `0x${string}`,
      params.to as `0x${string}`,
      tokenIdBigInt,
      '0x',
    ],
    {}
  );

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const decodedLogs = await decodeLogs(
    receipt.logs,
    networkCtx,
    accountOrWalletClient
  );

  return { hash, receipt, decodedLogs };
}
