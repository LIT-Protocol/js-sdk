import { fail, success, testThis } from '../../tools/scripts/utils.mjs';
import path from 'path';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { resolverAbi } from './resolver.data.js';

export async function main() {
  const contractContext = {
    resolverAddress: '0x9F0Ede26261451C5E784DC799D71ECf766EB7562',
    abi: resolverAbi,
    environment: 0,
  };

  const client = new LitNodeClient({
    // litNetwork: 'cayenne',
    litNetwork: 'custom',
    bootstrapUrls: [],
    debug: globalThis.LitCI.debug,
    contractContext: contractContext,
  });
  await client.connect();

  if (client.config.bootstrapUrls.length > 1) {
    fail('Should have more than 0 urls bootstrapped');
  }

  return success(
    `Can connect to custom network current urls from contract resolver: ${client.config.bootstrapUrls.length}`
  );
}

await testThis({ name: path.basename(import.meta.url), fn: main });
