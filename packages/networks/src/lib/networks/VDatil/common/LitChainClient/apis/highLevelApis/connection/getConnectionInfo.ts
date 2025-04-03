import { getActiveUnkickedValidatorStructsAndCounts } from 'services/lit/LitNetwork/vDatil/common/LitChainClient/apis/rawContractApis/staking/getActiveUnkickedValidatorStructsAndCounts';
import { GetActiveUnkickedValidatorStructsAndCountsTransformed } from 'services/lit/LitNetwork/vDatil/common/LitChainClient/schemas/GetActiveUnkickedValidatorStructsAndCountsSchema';
import { datilDevNetworkContext } from 'services/lit/LitNetwork/vDatil/datil-dev/networkContext';
import { DatilContext } from 'services/lit/LitNetwork/vDatil/types';

/**
 * Interface representing the structure of connection information
 */
interface ConnectionInfo {
  epochInfo: {
    epochLength: number;
    number: number;
    endTime: number;
    retries: number;
    timeout: number;
  };
  minNodeCount: number;
  bootstrapUrls: string[];
}

/**
 * Interface for the parameters of getConnectionInfo function
 */
interface GetConnectionInfoParams {
  networkCtx: DatilContext;
  nodeProtocol?: string | null;
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
}: GetConnectionInfoParams): Promise<ConnectionInfo> {
  // Get the validated data from the raw contract API
  const validatedData = await getActiveUnkickedValidatorStructsAndCounts(
    networkCtx
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

  return {
    epochInfo,
    minNodeCount: Number(minNodeCount),
    bootstrapUrls,
  };
}

/**
 * Self-executable script for testing the getConnectionInfo function
 *
 * Usage: bun run src/services/lit/LitNetwork/vDatil/common/LitChainClient/apis/highLevelApis/connection/getConnectionInfo.ts
 */
if (import.meta.main) {
  // Use the development network context for testing
  const results = await getConnectionInfo({
    networkCtx: datilDevNetworkContext,
  });

  console.log('Connection Info Results:');
  console.log(JSON.stringify(results, null, 2));
}
