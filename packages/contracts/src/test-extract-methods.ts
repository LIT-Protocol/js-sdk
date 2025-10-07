// @ts-nocheck

/**
 * Script to extract ABI methods from contracts
 *
 * Usage:
 * ```bash
 * bun run src/scripts/extract-methods.ts
 * ```
 */

import { extractAbiMethods } from './utils/abi-extractor';
import { datil } from '../dist/prod/datil';
import type { NetworkCache } from './types/contracts';
import { METHODS_TO_EXTRACT } from './config/methods';

// Run the extractor
const extractedMethods = extractAbiMethods(
  datil as unknown as NetworkCache,
  METHODS_TO_EXTRACT
);

// Pretty print the results
console.log(JSON.stringify(extractedMethods, null, 2));
