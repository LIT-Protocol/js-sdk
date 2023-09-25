import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';

import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';

export async function main() {
  // ==================== Setup ====================
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.CHRONICLE_RPC,
  });

  await pkpEthersWallet.init();

  // ==================== Test Logic ====================
  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!',
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337',
    },
  ];

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_signTypedData_v1',
      params: [msgParams, LITCONFIG.PKP_ETH_ADDRESS],
    },
  });

  const signatureBytes = ethers.utils.arrayify(signature);

  const recoveredAddr = recoverTypedSignature({
    data: msgParams,
    signature: signatureBytes,
    version: SignTypedDataVersion.V1,
  });

  // ==================== Post-Validation ====================
  if (signature.length !== 132) {
    return fail('signature should be 132 characters long');
  }

  if (recoveredAddr.toLowerCase() !== LITCONFIG.PKP_ETH_ADDRESS.toLowerCase()) {
    return fail(
      `recoveredAddr ${recoveredAddr} should be ${LITCONFIG.PKP_ETH_ADDRESS}`
    );
  }

  // ==================== Success ====================
  return success('PKPEthersWallet should be able to eth_signTypedData_v1');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
