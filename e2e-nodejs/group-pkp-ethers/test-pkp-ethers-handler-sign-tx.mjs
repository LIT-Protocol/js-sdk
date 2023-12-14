import path from 'path';
import { success, fail, testThis } from '../../tools/scripts/utils.mjs';
import LITCONFIG from '../../lit.config.json' assert { type: 'json' };
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import { AuthMethodType, ProviderType } from '@lit-protocol/constants';
import { client } from '../00-setup.mjs';
export async function main() {
  // ==================== Setup ====================
  const authMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(globalThis.LitCI.CONTROLLER_AUTHSIG),
  };

  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthMethods: [authMethod],
    controllerAuthSig: globalThis.LitCI.CONTROLLER_AUTHSIG,
    pkpPubKey: globalThis.LitCI.PKP_INFO.publicKey,
    rpc: LITCONFIG.CHRONICLE_RPC,
    litNetwork: globalThis.LitCI.network,
  });

  await pkpEthersWallet.init();

  // ==================== Test Logic ====================
  // Transaction to sign and send
  const from = globalThis.LitCI.PKP_INFO.ethAddress;
  const to = globalThis.LitCI.PKP_INFO.ethAddress;
  const gasLimit = ethers.BigNumber.from('21000');
  const value = ethers.BigNumber.from('0');
  const data = '0x';

  // pkp-ethers signer will automatically add missing fields (nonce, chainId, gasPrice, gasLimit)
  const tx = {
    from: from,
    to: to,
    gasLimit,
    value,
    data,
  };

  // eth_sendTransaction parameters
  // Transaction - Object
  // Reference: https://ethereum.github.io/execution-apis/api-documentation/#eth_sendTransaction
  // A serialized form of the whole transaction
  const rawSignedTx = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: {
      method: 'eth_signTransaction',
      params: [tx],
    },
  });

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
  if (!parsedTransaction) {
    return fail('parsedTransaction should not be null');
  }

  if (signature.length !== 132) {
    return fail(
      `signature should be 132 characters long, got ${signature.length}`
    );
  }

  if (
    recoveredAddress.toLowerCase() !==
    globalThis.LitCI.PKP_INFO.ethAddress.toLowerCase()
  ) {
    return fail(
      `recoveredAddres should be ${globalThis.LitCI.PKP_INFO.ethAddress}, got ${recoveredAddress}`
    );
  }

  // ==================== Success ====================
  return success('PKPEthersWallet should be able to sign tx');
}

await testThis({ name: path.basename(import.meta.url), fn: main });
