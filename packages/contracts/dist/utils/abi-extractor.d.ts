/**
 * Utility for extracting specific ABI methods from contract data
 *
 * Usage:
 * ```typescript
 * const methods = extractAbiMethods(networkCache, ['transfer', 'approve']);
 * ```
 */
import type { NetworkCache } from "../types/contracts";
/**
 * Represents a single contract method with its metadata
 */
interface ContractMethod {
    contractName: string;
    address: string;
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
export declare function extractAbiMethods(networkCache: NetworkCache, methodNames: string[]): ExtractedMethods;
export {};
