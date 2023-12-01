import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { client } from '../00-setup.mjs';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';

export async function main() {
  // ==================== Setup ====================
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network
  });

  await pkpEthersWallet.init();

  // ==================== Test Logic ====================
  // Typed data to sign
  // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1155
  const msgParams = {
    domain: {
      chainId: 80001,
      name: 'Ether Mail',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      contents: 'Hello, Bob!',
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
    },
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallets', type: 'address[]' },
      ],
    },
  };

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_signTypedData_v4',
      params: [LITCONFIG.PKP_ETH_ADDRESS, JSON.stringify(msgParams)],
    },
  });

  const signatureBytes = ethers.utils.arrayify(signature);

  const recoveredAddr = recoverTypedSignature({
    data: msgParams,
    signature: signature,
    version: SignTypedDataVersion.V4,
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
  return success('PKPEthersWallet should be able to eth_signTypedData_v4');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
