import { decodeEventLog, Log } from 'viem';
import { NagaContext } from '../../../../types';
import { createLitContracts } from './createLitContracts';

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
  logs: Log[],
  networkCtx: NagaContext
): Promise<DecodedLog[]> => {
  // Get network context for contract ABIs
  const networkContext = networkCtx.chainConfig.contractData;

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
  } = createLitContracts(networkCtx);

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

      const decoded = decodeEventLog({
        abi,
        data: log.data,
        topics: log.topics,
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
