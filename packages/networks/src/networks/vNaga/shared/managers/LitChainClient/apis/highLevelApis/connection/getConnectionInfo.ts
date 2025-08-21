import { DefaultNetworkConfig } from '../../../../../../shared/interfaces/NetworkContext';
import { ExpectedAccountOrWalletClient } from '../../../../contract-manager/createContractsManager';
import { GetActiveUnkickedValidatorStructsAndCountsTransformed } from '../../../schemas/GetActiveUnkickedValidatorStructsAndCountsSchema';
import { ConnectionInfo } from '../../../types';
import { getActiveUnkickedValidatorStructsAndCounts } from '../../rawContractApis/staking/getActiveUnkickedValidatorStructsAndCounts';
import { getPriceFeedInfo } from '../priceFeed';

/**
 * Interface for the parameters of getConnectionInfo function
 */
interface GetConnectionInfoParams {
  networkCtx: DefaultNetworkConfig;
  nodeProtocol?: string | null;
  accountOrWalletClient: ExpectedAccountOrWalletClient;
}

/**
 * Retrieves the connection information for a network.
 *
 * This high-level API builds on the raw contract API to provide formatted connection
 * information including epoch details, minimum node count, and bootstrap URLs with
 * proper protocol prefixes.
 *
 * @param params - Parameters for retrieving connection information
 * @param params.networkCtx - The network context for the contract
 * @param [params.nodeProtocol] - Optional protocol for the network node (HTTP or HTTPS)
 *
 * @returns An object containing the epoch information, minimum node count and an array of bootstrap URLs
 *
 * @throws Error if the minimum node count is not set or if the active validator set does not meet the threshold
 */
export async function getConnectionInfo({
  networkCtx,
  nodeProtocol,
  accountOrWalletClient,
}: GetConnectionInfoParams): Promise<ConnectionInfo> {
  // Get the validated data from the raw contract API
  const validatedData = await getActiveUnkickedValidatorStructsAndCounts(
    networkCtx,
    accountOrWalletClient
  );

  const { epochInfo, minNodeCount, validatorURLs } =
    validatedData as GetActiveUnkickedValidatorStructsAndCountsTransformed;

  // Verify minimum node count
  if (!minNodeCount) {
    throw new Error('❌ Minimum validator count is not set');
  }

  // Verify validator set meets the minimum threshold
  if (validatorURLs.length < Number(minNodeCount)) {
    throw new Error(
      `❌ Active validator set does not meet the threshold. Required: ${minNodeCount} but got: ${validatorURLs.length}`
    );
  }

  // Transform the URLs to bootstrap URLs based on the provided protocol
  // Note: validatorURLs from the schema are already processed with the network's httpProtocol
  // but we can override that with the nodeProtocol parameter if provided
  const bootstrapUrls = nodeProtocol
    ? validatorURLs.map((url: string) => {
        // Extract the hostname and port from the URL (remove any existing protocol)
        const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
        return `${nodeProtocol}${urlWithoutProtocol}`;
      })
    : validatorURLs;

  // The network nodes are known from the `getActiveUnkickedValidatorStructsAndCounts` function, but we also want to sort them by price feed,
  // which requires calling the price feed contract.
  const priceFeedInfo = await getPriceFeedInfo(
    {
      realmId: networkCtx.networkSpecificConfigs.realmId,
      networkCtx: networkCtx,
    },
    {
      accountOrWalletClient,
    }
  );

  const epochState = {
    currentNumber: epochInfo.number,
    startTime: epochInfo.endTime - epochInfo.epochLength,
  };

  return {
    epochInfo: epochInfo as {
      epochLength: number;
      number: number;
      endTime: number;
      retries: number;
      timeout: number;
    },
    epochState,
    minNodeCount: Number(minNodeCount),
    bootstrapUrls,
    priceFeedInfo,
  };
}

/**
 * Self-executable script for testing the getConnectionInfo function
 *
 * Usage: bun run src/services/lit/LitNetwork/vNaga/common/LitChainClient/apis/highLevelApis/connection/getConnectionInfo.ts
 */
// if (import.meta.main) {
//   // Use the development network context for testing
//   const results = await getConnectionInfo({
//     networkCtx: networkContext,
//   });

//   console.log('Connection Info Results:');
//   console.log(JSON.stringify(results, null, 2));
// }
