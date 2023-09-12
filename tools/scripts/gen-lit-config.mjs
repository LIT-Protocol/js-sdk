import fs from 'fs';
import { ethers } from 'ethers';
import {
  getCosmosAddress,
  getPubKeyBuffer,
  signAuthMessage,
  getFlagValue,
} from './utils.mjs';

import { getPKPNFTContract } from './lit-contracts/PKPNFT.sol/index.mjs';

// ----- Default values
const defaultPrivateKey =
  'f21d3fafe29fa10d26092ce4e91cd7108b734b98393f79b3c2cd04de24ca6817';
const LITPROTOCOL_CHAIN_RPC = 'https://chain-rpc.litprotocol.com/http';

// -- Input values
const PKEY = getFlagValue('privateKey') ?? defaultPrivateKey;

// ----- MAIN ------
const PKP1 = await getNewPKP(PKEY);
const PKP2 = await getNewPKP(PKEY);

// write file
fs.writeFileSync(
  'lit.config.json',
  JSON.stringify(
    {
      test: {
        sendRealTxThatCostsMoney: false,
      },
      MNEUMONIC:
        'island arrow object divide umbrella snap essay seminar top develop oyster success',
      COSMOS_RPC: 'https://rpc.cosmoshub.strange.love',
      CHRONICLE_RPC: 'https://chain-rpc.litprotocol.com/http',
      CHRONICLE_RPC_2: 'https://lit-protocol.calderachain.xyz/http',
      RECIPIENT: 'cosmos1jyz3m6gxuwceq63e44fqpgyw2504ux85ta8vma',
      DENOM: 'uatom',
      AMOUNT: 1,
      DEFAULT_GAS: 0.025,
      AUTH_METHOD_ACCESS_TOKEN: '<your access token here>',

      CONTROLLER_PRIVATE_KEY: PKEY,
      CONTROLLER_ADDRESS: PKP1.CONTROLLER_ADDRESS,
      PKP_TOKENID: PKP1.PKP_TOKENID,
      PKP_PUBKEY: PKP1.PKP_PUBKEY,
      PKP_ETH_ADDRESS: PKP1.PKP_ETH_ADDRESS,
      PKP_COSMOS_ADDRESS: PKP1.PKP_COSMOS_ADDRESS,
      CONTROLLER_AUTHSIG: PKP1.CONTROLLER_AUTHSIG,

      CONTROLLER_ADDRESS_2: PKP2.CONTROLLER_ADDRESS,
      PKP_TOKENID_2: PKP2.PKP_TOKENID,
      PKP_PUBKEY_2: PKP2.PKP_PUBKEY,
      PKP_ETH_ADDRESS_2: PKP2.PKP_ETH_ADDRESS,
      PKP_COSMOS_ADDRESS_2: PKP2.PKP_COSMOS_ADDRESS,
      CONTROLLER_AUTHSIG_2: PKP2.CONTROLLER_AUTHSIG,
    },
    null,
    2
  )
);

// Get a new PKP
async function getNewPKP(privateKey) {
  const provider = new ethers.providers.JsonRpcProvider(LITPROTOCOL_CHAIN_RPC);

  const wallet = new ethers.Wallet(privateKey, provider);

  const CONTROLLER_ADDRESS = wallet.address;
  console.log('✅ CONTROLLER_ADDRESS:', CONTROLLER_ADDRESS);

  const CONTROLLER_AUTHSIG = await signAuthMessage(PKEY);
  console.log('✅ CONTROLLER_AUTHSIG:', CONTROLLER_AUTHSIG);

  // -- mint a PKP
  const PKPNFTContract = getPKPNFTContract(wallet);

  let PKPMintTx;

  console.log('...minting PKP');
  try {
    PKPMintTx = await PKPNFTContract.mintNext(2, {
      value: await PKPNFTContract.mintCost(),
      // gasLimit: 1000000, // NOTE: Sometimes this is needed. To be monitored. 11/09/23
    });

    PKPMintTx = await PKPMintTx.wait();
  } catch (e) {
    console.log(e);
  }

  // console.log("PKPMintTx:", PKPMintTx);
  let PKP_TOKENID = PKPMintTx.events[0].topics[1];

  PKP_TOKENID = BigInt(PKP_TOKENID).toString();

  console.log('✅ PKP_TOKENID:', PKP_TOKENID);

  let PKP_PUBKEY = await PKPNFTContract.getPubkey(PKP_TOKENID);

  console.log('✅ PKP_PUBKEY:', PKP_PUBKEY);

  const PKP_ETH_ADDRESS = ethers.utils.computeAddress(PKP_PUBKEY);

  const pubKeyBuffer = getPubKeyBuffer(PKP_PUBKEY);

  const PKP_COSMOS_ADDRESS = getCosmosAddress(pubKeyBuffer);
  console.log('✅ PKP_COSMOS_ADDRESS:', PKP_COSMOS_ADDRESS);

  if (PKP_PUBKEY.startsWith('0x')) {
    PKP_PUBKEY = PKP_PUBKEY.slice(2);
  }

  return {
    CONTROLLER_ADDRESS,
    CONTROLLER_AUTHSIG,
    PKP_TOKENID,
    PKP_PUBKEY,
    PKP_ETH_ADDRESS,
    PKP_COSMOS_ADDRESS,
  };
}
