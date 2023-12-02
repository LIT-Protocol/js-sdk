import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { client } from '../00-setup.mjs';
import { PKPClient } from '@lit-protocol/pkp-client';
import { ethers } from 'ethers';

export async function main() {
  // ==================== Setup ====================
  const pkpClient = new PKPClient({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpcs: {
      eth: LITCONFIG.CHRONICLE_RPC,
      cosmos: LITCONFIG.COSMOS_RPC,
    },
    litNetwork: LITCONFIG.TEST_ENV.litNetwork,
    cosmosAddressPrefix: 'cosmos',
  });

  await pkpClient.connect();

  // ==================== Test Logic ====================
  const PAYLOAD = {
    to: LITCONFIG.PKP_ETH_ADDRESS,
    value: 0,
    data: '0x',
  };

  const rawSignedTx = await pkpClient.getEthWallet().signTransaction(PAYLOAD);

  const parsedTransaction = ethers.utils.parseTransaction(rawSignedTx);

  const signature = ethers.utils.joinSignature({
    r: parsedTransaction.r,
    s: parsedTransaction.s,
    v: parsedTransaction.v,
  });

  const rawTx = {
    nonce: parsedTransaction.nonce,
    gasPrice: parsedTransaction.gasPrice,
    gasLimit: parsedTransaction.gasLimit,
    to: parsedTransaction.to,
    value: parsedTransaction.value,
    data: parsedTransaction.data,
    chainId: parsedTransaction.chainId, // Include chainId if the transaction is EIP-155
  };

  const txHash = ethers.utils.keccak256(
    ethers.utils.serializeTransaction(rawTx)
  );

  const { v, r, s } = parsedTransaction;

  const recoveredAddress = ethers.utils.recoverAddress(txHash, { r, s, v });
  // ==================== Post-Validation ====================

  if (signature.length !== 132) {
    return fail('signature should be defined');
  }

  if (recoveredAddress !== LITCONFIG.PKP_ETH_ADDRESS) {
    return fail(
      `recoveredAddres should be ${LITCONFIG.PKP_ETH_ADDRESS}, got ${recoveredAddress}`
    );
  }

  // ==================== Success ====================
  return success('(Without RPC) PKPClient should sign tx using eth wallet');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
