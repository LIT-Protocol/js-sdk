import { PKPEthersWallet, requestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';

import { getTestConfig } from '../../../../tools/scripts/utils.mjs';

const LITCONFIG = await getTestConfig();

const pkpEthersWallet = new PKPEthersWallet({
  controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
  pkpPubKey: LITCONFIG.PKP_PUBKEY,
  rpc: LITCONFIG.RPC_ENDPOINT,
});

await pkpEthersWallet.init();

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

const msgParamStr = JSON.stringify(msgParams);

const payload = {
  method: 'eth_signTypedData',
  params: [LITCONFIG.PKP_ADDRESS, msgParamStr],
};

const signature = await requestHandler({
  signer: pkpEthersWallet,
  payload,
});

const signatureBytes = ethers.utils.arrayify(signature);

const recoveredAddr = recoverTypedSignature({
  data: msgParams,
  signature: signatureBytes,
  version: SignTypedDataVersion.V3,
});

console.log('recoveredAddr', recoveredAddr);

if (recoveredAddr.toLowerCase() !== LITCONFIG.PKP_ADDRESS.toLowerCase()) {
  throw new Error('❌ Recovered address does not match PKP address');
}

console.log('✅ Recovered address matches PKP address');
process.exit();
