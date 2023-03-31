import { PKPEthersWallet, requestHandler } from '@lit-protocol/pkp-ethers';
import { ethers } from 'ethers';
import {
  SignTypedDataVersion,
  recoverTypedSignature,
} from '@metamask/eth-sig-util';

const LITCONFIG = {
  test: {
    sendRealTxThatCostsMoney: false,
  },
  MNEUMONIC:
    'island arrow object divide umbrella snap essay seminar top develop oyster success',
  RPC_ENDPOINT: 'https://cosmos-mainnet-rpc.allthatnode.com:26657',
  RECIPIENT: 'cosmos1jyz3m6gxuwceq63e44fqpgyw2504ux85ta8vma',
  DENOM: 'uatom',
  AMOUNT: 1,
  DEFAULT_GAS: 0.025,
  CONTROLLER_AUTHSIG: {
    sig: '0x7dadeec2ed2db9b17e32c858724a9cf718470568f40035b6d72d15ddf99375f139aa67298dbc9f06c5aa2296d6db95b2e976b005fae463c7ee982e341bf0b1861c',
    derivedVia: 'web3.eth.personal.sign',
    signedMessage:
      'localhost:4003 wants you to sign in with your Ethereum account:\n0x18f987D15a973776f6a60652B838688a1833fE95\n\n\nURI: http://localhost:4003/\nVersion: 1\nChain ID: 1\nNonce: o0ihUgFpC5RaAFQGf\nIssued At: 2023-03-29T17:37:59.343Z\nExpiration Time: 2297-01-10T17:37:40.600Z',
    address: '0x18f987d15a973776f6a60652b838688a1833fe95',
  },
  PKP_PUBKEY:
    '0x04cd5fc4b661a2ae2dc425aa42abbfeaa187c07063928322a8c748ebb7611868144c0ff28b1910faeafedea914ec8a23baa579b6ff7f03efa322e7eb098e62dd8f',
  PKP_ADDRESS: '0xf675E8Cdc5DbE5f78a47D23A3b1CCD07b986f17f',
};

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
