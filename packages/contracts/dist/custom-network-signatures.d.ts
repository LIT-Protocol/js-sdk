/**
 * Custom Network Context to Signatures Converter
 *
 * This script converts a custom networkContext.json file to exportable contract signatures.
 *
 * Usage as CLI:
 * ```
 * bun run ./src/custom-network-signatures.ts ./customNetworkContext.json naga-develop
 * ```
 *
 * Usage as module:
 * ```typescript
 * import { generateSignaturesFromContext } from '@lit-protocol/contracts/custom-network-signatures';
 * await generateSignaturesFromContext({
 *   jsonFilePath: './customNetworkContext.json',
 *   networkName: 'my-network',
 *   outputDir: './', // Will output in the same directory as the script
 *   useScriptDirectory: true, // Set to true to use calling script's directory as base
 *   callerPath: import.meta.url // Required when useScriptDirectory is true
 * });
 * ```
 */
import type { NetworkCache } from './types/contracts';
export interface GenerateSignaturesOptions {
    jsonFilePath: string;
    networkName?: string;
    outputDir?: string;
    useScriptDirectory?: boolean;
    callerPath?: string;
}
export interface BuildSignaturesFromContextOptions extends Omit<GenerateSignaturesOptions, 'outputDir'> {
}
export interface BuildSignaturesFromContextResult {
    signatures: GeneratedSignatures;
    networkName: string;
    resolvedJsonPath: string;
    baseDirectory: string;
}
/**
 * Generates ABI signatures in the standard format for Lit Protocol
 * @param networkData - The network cache object
 * @returns Signatures object with contract-organized structure
 */
declare function generateAbiSignatures(networkData: NetworkCache): Record<string, {
    address: string;
    methods: Record<string, any>;
    events: any[];
}>;
export type GeneratedSignatures = ReturnType<typeof generateAbiSignatures>;
export declare function buildSignaturesFromContext(options: BuildSignaturesFromContextOptions): BuildSignaturesFromContextResult;
/**
 * Generates signature files from a network context JSON file
 * @param options - Configuration options
 * @returns Promise that resolves when files are written
 */
export declare function generateSignaturesFromContext(options: GenerateSignaturesOptions): Promise<void>;
export {};
