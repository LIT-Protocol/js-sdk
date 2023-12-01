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
    litNetwork: LITCONFIG.TEST_ENV.litNetwork,
  });

  await pkpEthersWallet.init();

  // ==================== Test Logic ====================
  const msgParams = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: 80001,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  };

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_signTypedData_v3',
      params: [LITCONFIG.PKP_ETH_ADDRESS, JSON.stringify(msgParams)],
    },
  });

  const signatureBytes = ethers.utils.arrayify(signature);

  const recoveredAddr = recoverTypedSignature({
    data: {
      types: msgParams.types,
      domain: msgParams.domain,
      primaryType: msgParams.primaryType,
      message: msgParams.message,
    },
    signature: signature,
    version: SignTypedDataVersion.V3,
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
  return success('PKPEthersWallet should be able to eth_signTypedData_v3');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
