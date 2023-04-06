import { PKPEthersWallet, ethRequestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
  recoverPersonalSignature,
} from '@metamask/eth-sig-util';

import {
  getTestConfig,
  log,
  testThese,
} from '../../../../tools/scripts/utils.mjs';
import { BigNumber } from 'ethers';

const LITCONFIG = await getTestConfig();

const pkpEthersWallet = new PKPEthersWallet({
  controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
  pkpPubKey: LITCONFIG.PKP_PUBKEY,
  rpc: LITCONFIG.COSMOS_RPC,
});

await pkpEthersWallet.init();

await testThese([
  { name: 'signTypedData', fn: shouldSignTypedData },
  { name: 'signTypedDataV1', fn: shouldSignTypedDataV1 },
  { name: 'signTypedDataV3', fn: shouldSignTypedDataV3 },
  { name: 'signTypedDataV4', fn: shouldSignTypedDataV4 },
  { name: 'signTransaction', fn: shouldSignTransaction },
  { name: 'sendTransaction', fn: shouldSendTransaction },
]);

process.exit();

async function shouldSignTypedData() {
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

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload,
  });

  const recoveredAddr = recoverTypedSignature({
    data: msgParams,
    signature: signature,
    version: SignTypedDataVersion.V3,
  });

  log.blue('recoveredAddr', recoveredAddr);

  if (recoveredAddr.toLowerCase() !== LITCONFIG.PKP_ADDRESS.toLowerCase()) {
    log.red();
    return {
      status: 500,
      message:
        'failed to should sign typed data - recovered address does not match PKP address',
    };
  }

  return {
    status: 200,
    message: 'should sign typed data',
  };
}

async function shouldSignTypedDataV1() {
  // it should sign v1 typed data
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

  const payload = {
    method: 'eth_signTypedData_v1',
    params: [msgParams, LITCONFIG.PKP_ADDRESS],
  };

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload: payload,
  });

  const signatureBytes = ethers.utils.arrayify(signature);

  const recoveredAddr = recoverTypedSignature({
    data: msgParams,
    signature: signatureBytes,
    version: SignTypedDataVersion.V1,
  });

  log.blue('recoveredAddr', recoveredAddr);

  if (recoveredAddr.toLowerCase() !== LITCONFIG.PKP_ADDRESS.toLowerCase()) {
    return {
      status: 500,
      message:
        'failed to sign v1 typed data - recovered address does not match PKP address',
    };
  }

  return {
    status: 200,
    message: 'should sign v1 typed data',
  };
}

async function shouldSignTypedDataV3() {
  const example = {
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

  const msgParamStr = JSON.stringify(example);

  const payload = {
    method: 'eth_signTypedData_v3',
    params: [LITCONFIG.PKP_ADDRESS, msgParamStr],
  };

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload,
  });

  // verify signature
  const { types, domain, primaryType, message } = JSON.parse(msgParamStr);

  // https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyTypedData
  const recoveredAddr = recoverTypedSignature({
    data: {
      types,
      domain,
      primaryType,
      message,
    },
    signature: signature,
    version: SignTypedDataVersion.V3,
  });

  log.blue('recoveredAddr', recoveredAddr);

  if (recoveredAddr.toLowerCase() !== LITCONFIG.PKP_ADDRESS.toLowerCase()) {
    return {
      status: 500,
      message:
        'failed to sign v3 typed data - recovered address does not match PKP address',
    };
  }

  return {
    status: 200,
    message: 'should sign v3 typed data',
  };
}

async function shouldSignTypedDataV4() {
  // Typed data to sign
  // Example from https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L1155
  const example = {
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

  // eth_signTypedData parameters
  // Address - 20 Bytes - Address of the account that will sign the messages.
  // TypedData - Typed structured data to be signed.
  // Reference: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md#eth_signtypeddata
  const msgParamStr = JSON.stringify(example);

  const payload = {
    method: 'eth_signTypedData_v4',
    params: [LITCONFIG.PKP_ADDRESS, msgParamStr],
  };

  // Sign eth_signTypedData_v4 request

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload,
  });

  log.blue('signature', signature);

  // verify signature
  const { types, domain, primaryType, message } = JSON.parse(msgParamStr);

  // https://docs.ethers.io/v5/api/utils/signing-key/#utils-verifyTypedData
  const recoveredAddr = recoverTypedSignature({
    data: example,
    signature,
    version: SignTypedDataVersion.V4,
  });

  log.blue('recoveredAddr', recoveredAddr);

  if (recoveredAddr.toLowerCase() !== LITCONFIG.PKP_ADDRESS.toLowerCase()) {
    return {
      status: 500,
      message:
        'failed to sign v4 typed data - recovered address does not match PKP address',
    };
  }

  return {
    status: 200,
    message: 'should sign v4 typed data',
  };
}

async function shouldSignTransaction() {
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.MUMBAI_RPC,
    debug: false,
  });

  await pkpEthersWallet.init();

  // Transaction to sign and send
  const from = LITCONFIG.PKP_ADDRESS;
  const to = LITCONFIG.PKP_ADDRESS;
  const gasLimit = BigNumber.from('21000');
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
  const payload = {
    method: 'eth_signTransaction',
    params: [tx],
  };

  const signature = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload,
  });

  log.blue('signature', signature);

  if (signature === '' || signature === null || signature === undefined) {
    return {
      status: 500,
      message:
        'failed to sign transaction - signature is empty, null or undefined',
    };
  }

  return {
    status: 200,
    message: 'should sign transaction',
  };
}

async function shouldSendTransaction() {
  const pkpEthersWallet = new PKPEthersWallet({
    controllerAuthSig: LITCONFIG.CONTROLLER_AUTHSIG,
    pkpPubKey: LITCONFIG.PKP_PUBKEY,
    rpc: LITCONFIG.MUMBAI_RPC,
    debug: false,
  });

  await pkpEthersWallet.init();

  // Transaction to sign and send
  const from = LITCONFIG.PKP_ADDRESS;
  const to = LITCONFIG.PKP_ADDRESS;
  const gasLimit = BigNumber.from('21000');
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
  const payload = {
    method: 'eth_sendTransaction',
    params: [tx],
  };

  const txRes = await ethRequestHandler({
    signer: pkpEthersWallet,
    payload,
  });

  if (!txRes) {
    return {
      status: 500,
      message: 'failed to send transaction',
    };
  }

  return {
    status: 200,
    message: 'should send transaction',
  };
}
