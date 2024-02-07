import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { ethers } from 'ethers';
import { AuthMethodType, AuthMethodScope } from '@lit-protocol/constants';
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

  // -- minting a PKP using a PKP
  const mintTx = await contractClient.pkpNftContract.write.mintNext(2, {
    value: mintCost,
  });

  const mintTxReceipt = await mintTx.wait();

  const tokenId = mintTxReceipt.events[0].topics[1];
  console.log('tokenId', tokenId);

  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(LITCONFIG.CONTROLLER_AUTHSIG),
  };

  const authId = LitAuthClient.getAuthIdByAuthMethod(authMethod);

  // -- get the scopes
  const scopes =
    await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

  // -- validate both scopes should be false
  if (scopes[AuthMethodScope.SignAnything] !== false) {
    return fail('scope 1 (sign anything) should be false');
  }

  if (scopes[AuthMethodScope.PersonalSign] !== false) {
    return fail('scope 2 (personal sign) should be false');
  }

  // -- set the scope
  const setScopeTx =
    await contractClient.pkpPermissionsContract.write.addPermittedAuthMethodScope(
      tokenId,
      AuthMethodType.EthWallet,
      LITCONFIG.CONTROLLER_AUTHSIG.address, // auth id
      AuthMethodScope.SignAnything
    );

  const setScopeTxReceipt = await setScopeTx.wait();

  // -- check the scopes again
  const scopes2 =
    await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      tokenId,
      AuthMethodType.EthWallet,
      LITCONFIG.CONTROLLER_AUTHSIG.address, // auth id
      3
    );

  // ==================== Post-Validation ====================
  if (mintCost === undefined || mintCost === null) {
    return fail('mintCost should not be empty');
  }

  if (scopes2[1] !== true) {
    return fail('scope 1 (sign anything) should be true');
  }

  // ==================== Success ====================
  return success(`ContractsSDK mints a PKP
Logs:
---
mintHash: ${mintTxReceipt.transactionHash}
tokenId: ${tokenId}
setScopeHash: ${setScopeTxReceipt.transactionHash}
scope 1 (sign anything): ${scopes2[1]}
scope 2 (only sign messages): ${scopes2[2]}
`);
}

await testThis({ name: path.basename(import.meta.url), fn: main });
