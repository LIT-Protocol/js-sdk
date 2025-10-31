import type {
  BuildSignaturesFromContextOptions,
  BuildSignaturesFromContextResult,
  GenerateSignaturesOptions,
} from './custom-network-signatures';

const UNSUPPORTED_MESSAGE =
  '@lit-protocol/contracts/custom-network-signatures is not supported in browser environments. ' +
  'Please generate contract signatures ahead of time in a Node.js process and ship the artifacts instead.';

function throwBrowserUnsupported(): never {
  throw new Error(UNSUPPORTED_MESSAGE);
}

export function buildSignaturesFromContext(
  _options: BuildSignaturesFromContextOptions
): BuildSignaturesFromContextResult {
  return throwBrowserUnsupported();
}

export async function generateSignaturesFromContext(
  _options: GenerateSignaturesOptions
): Promise<never> {
  throwBrowserUnsupported();
}

export type {
  BuildSignaturesFromContextOptions,
  BuildSignaturesFromContextResult,
  GenerateSignaturesOptions,
} from './custom-network-signatures';
