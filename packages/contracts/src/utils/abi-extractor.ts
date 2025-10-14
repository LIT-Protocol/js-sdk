/**
 * Utility for extracting specific ABI methods from contract data
 *
 * Usage:
 * ```typescript
 * const methods = extractAbiMethods(networkCache, ['transfer', 'approve']);
 * ```
 */

import type { NetworkCache } from '../types/contracts';
import { toFunctionSignature } from 'viem/utils';
import { Interface } from 'ethers';

/**
 * Represents a single contract method with its metadata
 */
interface ContractMethod {
  contractName: string;
  address: string;
  // signature: string;
  abi: any;
}

/**
 * Maps method names to their contract metadata
 */
interface ExtractedMethods {
  [methodName: string]: ContractMethod;
}

/**
 * Extracts specified ABI methods from contract data
 * @param networkCache - The network cache containing contract data
 * @param methodNames - Array of method names to extract
 * @returns Object mapping method names to their contract metadata
 */
export function extractAbiMethods(
  networkCache: NetworkCache,
  methodNames: string[]
): ExtractedMethods {
  const result: ExtractedMethods = {};

  // Iterate through each contract in the network cache
  networkCache.data.forEach((contractGroup) => {
    const contractName = contractGroup.name;

    contractGroup.contracts.forEach((contract) => {
      const { address_hash: address, ABI } = contract;

      // Filter and process matching ABI methods
      ABI.forEach((abiItem) => {
        if (abiItem.type === 'function' && methodNames.includes(abiItem.name)) {
          try {
            const iface = new Interface(ABI);

            // Special case for safeTransferFrom - use the basic version to avoid ambiguity
            let functionFragment;
            if (abiItem.name === 'safeTransferFrom') {
              functionFragment = iface.getFunction(
                'safeTransferFrom(address,address,uint256)'
              );
            } else {
              functionFragment = iface.getFunction(abiItem.name);
            }

            const functionSignature = functionFragment?.format('full')!;

            result[abiItem.name] = {
              contractName,
              address,
              // signature: functionSignature,
              abi: abiItem,
            };
          } catch (error) {
            console.warn(
              `Failed to parse ABI item for method ${abiItem.name}:`,
              error
            );
          }
        }
      });
    });
  });

  return result;
}
