import { z } from 'zod';
import { generateValidatorURLs } from '../../../../../shared/utils/transformers';
import {
  DefaultNetworkConfig,
  INetworkConfig,
} from '../../../../interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../contract-manager/createContractsManager';

/**
 * Product IDs used for price feed and node selection
 *
 * - DECRYPTION (0): Used for decryption operations
 * - SIGN (1): Used for signing operations
 * - LA (2): Used for Lit Actions execution
 */
export const PRODUCT_IDS = {
  DECRYPTION: 0n, // For decryption operations
  SIGN: 1n, // For signing operations
  LIT_ACTION: 2n, // For Lit Actions execution
} as const;

// Schema for the request
const getNodesForRequestSchema = z.object({
  productIds: z.array(z.bigint()).default(Object.values(PRODUCT_IDS)),
});

type GetNodesForRequestRequest = z.infer<typeof getNodesForRequestSchema>;

/**
 * Gets nodes for a given set of product IDs with their prices
 *
 * @param request - Object containing product IDs to get pricing for
 * @param networkCtx - The network context (any valid network configuration)
 * @returns Information about nodes, their prices, epoch ID, and minimum node count
 */
export async function getNodesForRequest(
  request: GetNodesForRequestRequest,
  networkCtx: INetworkConfig<any, any>,
  accountOrWalletClient: ExpectedAccountOrWalletClient
) {
  const { productIds } = getNodesForRequestSchema.parse(request);

  const { priceFeed } = createContractsManager(
    networkCtx,
    accountOrWalletClient
  );

  const nodesForRequest = await priceFeed.read.getNodesForRequest([
    networkCtx.networkSpecificConfigs.realmId,
    productIds,
  ]);

  const epochId = nodesForRequest[0];
  const minNodeCount = nodesForRequest[1];
  const nodesAndPrices = nodesForRequest[2];

  // @ts-ignore - this will show type error when createContractsManager is returning any (during build time)
  const nodesAndPricesWithUrls = nodesAndPrices.map((info) => {
    const { validator } = info;
    const validatorUrl = generateValidatorURLs([validator]);
    const fullUrl = networkCtx.httpProtocol + validatorUrl;
    return {
      ...info,
      validatorUrl: fullUrl,
    };
  });

  return {
    epochId,
    minNodeCount,
    nodesAndPrices: nodesAndPricesWithUrls,
  };
}

// if (import.meta.main) {
//   const networkCtx = networkContext;
//   const res = await getNodesForRequest(
//     { productIds: Object.values(PRODUCT_IDS) },
//     networkCtx
//   );
//   console.log(res);
// }
