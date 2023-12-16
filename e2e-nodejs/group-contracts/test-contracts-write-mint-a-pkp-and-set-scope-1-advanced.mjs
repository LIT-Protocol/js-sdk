import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { AuthMethodType } from '@lit-protocol/constants';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

export async function main() {
  // ========== Controller Setup ===========
  const provider = new ethers.providers.JsonRpcProvider(
    LITCONFIG.CHRONICLE_RPC
  );

  const controllerWallet = new ethers.Wallet(
    LITCONFIG.CONTROLLER_PRIVATE_KEY,
    provider
  );

  // ==================== LitContracts Setup ====================
  const contractClient = new LitContracts({
    signer: controllerWallet,
    network: LITCONFIG.TEST_ENV.litNetwork,
  });

  await contractClient.connect();

  // ==================== Test Logic ====================
  const mintCost = await contractClient.pkpNftContract.read.mintCost();

  const authMethod = {
    authMethodType: 1,
    accessToken: JSON.stringify(LITCONFIG.CONTROLLER_AUTHSIG),
  };

  const authId = LitAuthClient.getAuthIdByAuthMethod(authMethod);

  // -- minting a PKP
  const mintTx =
    await contractClient.pkpHelperContract.write.mintNextAndAddAuthMethods(
      2,
      [AuthMethodType.EthWallet],
      [authId],
      ['0x'], // only for web3auth atm
      [[1]],
      true, // addPkpEthAddressAsPermittedAddress,
      true, // sendPkpToItself,
      {
        value: mintCost,
      }
    );

  const mintTxReceipt = await mintTx.wait();

  const tokenId = mintTxReceipt.events[0].topics[1];

  // -- get the scopes
  const scopes =
    await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

  // ==================== Post-Validation ====================
  if (mintCost === undefined || mintCost === null) {
    return fail('mintCost should not be empty');
  }

  if (scopes[1] !== true) {
    return fail('scope 1 (sign anything) should be true');
  }

  // ==================== Success ====================
  return success(`ContractsSDK mints a PKP
Logs:
---
mintHash: ${mintTxReceipt.transactionHash}
tokenId: ${tokenId}
scope 1 (sign anything): ${scopes[1]}
scope 2 (only sign messages): ${scopes[2]}
`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
