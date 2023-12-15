import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { client } from '../00-setup.mjs';
export async function main() {
  // ==================== Setup ====================
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network,
  });

  await pkpEthersWallet.init();

  // ==================== Test Logic ====================
  // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1033
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
      method: 'eth_signTypedData',
      params: [globalThis.LitCI.PKP_INFO.ethAddress, msgParams],
    },
  });

  // https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyTypedData
  const recoveredAddr = ethers.utils.verifyTypedData(
    msgParams.domain,
    { Person: msgParams.types.Person, Mail: msgParams.types.Mail },
    msgParams.message,
    signature
  );

  // ==================== Post-Validation ====================
  if (signature.length !== 132) {
    return fail('signature should be 132 characters long');
  }

  if (
    recoveredAddr.toLowerCase() !==
    globalThis.LitCI.PKP_INFO.ethAddress.toLowerCase()
  ) {
    return fail(
      `recoveredAddr ${recoveredAddr} should be ${LITCONFIG.PKP_ETH_ADDRESS}`
    );
  }

  // ==================== Success ====================
  return success('PKPEthersWallet should be able to eth_signTypedData');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
