// Test command:
// DEBUG=true NETWORK=cayenne yarn test:e2e:nodejs --filter=test-pkp-eth-wallet-provider.mjs

import { client } from '../00-setup.mjs';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import path from 'path';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';
import { ethers } from 'ethers';

export async function main() {
  const PRIVATE_KEY = LITCONFIG.CONTROLLER_PRIVATE_KEY;

  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const authMethod = await EthWalletProvider.authenticate({
    signer: wallet,
    litNodeClient: client,
  });

  if (!authMethod) {
    fail('Unable to authenticate with eth wallet provider');
  }

  return success(`authMethod created: ${JSON.stringify(authMethod)}`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
