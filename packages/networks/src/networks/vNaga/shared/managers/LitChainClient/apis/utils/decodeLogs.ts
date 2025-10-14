import { decodeEventLog } from 'viem';
import { type Log as ViemLog } from 'viem';
import { DefaultNetworkConfig } from '../../../../../shared/interfaces/NetworkContext';
import {
  createContractsManager,
  ExpectedAccountOrWalletClient,
} from '../../../contract-manager/createContractsManager';

export type DecodedLog = {
  eventName: string;
  args: {
    [key: string]: any;
  };
};

/**
 * Decodes event logs from Lit Protocol contract transactions
 * @param logs Array of transaction logs to decode
 * @returns Array of decoded logs with event names and parameters
 */
export const decodeLogs = async (
  // The `Log` type imported doesn't include the `topics` property, so we need to add it manually.
  logs: (ViemLog & { topics?: `0x${string}`[] })[],
  networkCtx: DefaultNetworkConfig,
  accountOrWalletClient: ExpectedAccountOrWalletClient
): Promise<DecodedLog[]> => {
  // Get network context for contract ABIs
  const networkContext = networkCtx.abiSignatures;

  if (!networkContext) {
    throw new Error(`Network "${networkCtx.network}" not found`);
  }

  const {
    pkpHelperContract,
    pkpNftContract,
    pkpPermissionsContract,
    pubkeyRouterContract,
    publicClient,
    walletClient,
  } = createContractsManager(networkCtx, accountOrWalletClient);

  // Map contract addresses to their ABIs
  const contractABIs = new Map<string, any>();
  contractABIs.set(pkpNftContract.address.toLowerCase(), pkpNftContract.abi);
  contractABIs.set(
    pkpHelperContract.address.toLowerCase(),
    pkpHelperContract.abi
  );
  contractABIs.set(
    pkpPermissionsContract.address.toLowerCase(),
    pkpPermissionsContract.abi
  );
  contractABIs.set(
    pubkeyRouterContract.address.toLowerCase(),
    pubkeyRouterContract.abi
  );

  // Decode each log
  const decodedLogs = logs.map((log) => {
    try {
      const abi = contractABIs.get(log.address.toLowerCase());
      if (!abi) {
        return {
          ...log,
          decoded: null,
          error: 'No matching ABI found for address',
        };
      }

      // build a tuple type for topics that matches viem's expectation (as we don't want to cast it to `any`)
      const [signature, ...rest] = log.topics ?? [];
      const topics = signature
        ? ([signature, ...rest] as [`0x${string}`, ...`0x${string}`[]])
        : ([] as []);

      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics,
      });

      return decoded;
    } catch (error) {
      return {
        ...log,
        decoded: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  });

  return decodedLogs as DecodedLog[];
};
