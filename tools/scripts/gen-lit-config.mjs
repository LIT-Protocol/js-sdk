import fs from 'fs';
import { ethers } from 'ethers';
import {
  getCosmosAddress,
  getPubKeyBuffer,
  signAuthMessage,
  getFlagValue,
} from './utils.mjs';

import { getPKPNFTContract } from './lit-contracts/PKPNFT.sol/index.mjs';
import { PKPSuiWallet } from '@lit-protocol/pkp-sui';

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
      TEST_ENV: {
        litNetwork: 'cayenne',
        debug: false,
        minNodeCount: 2,
      },
      test: {
        sendRealTxThatCostsMoney: false,
      },
      MNEUMONIC:
        'island arrow object divide umbrella snap essay seminar top develop oyster success',
      COSMOS_RPC: 'https://cosmos-rpc.publicnode.com',
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
      PKP_SUI_ADDRESS: PKP1.PKP_SUI_ADDRESS,
      CONTROLLER_AUTHSIG: PKP1.CONTROLLER_AUTHSIG,

      CONTROLLER_ADDRESS_2: PKP2.CONTROLLER_ADDRESS,
      PKP_TOKENID_2: PKP2.PKP_TOKENID,
      PKP_PUBKEY_2: PKP2.PKP_PUBKEY,
      PKP_ETH_ADDRESS_2: PKP2.PKP_ETH_ADDRESS,
      PKP_COSMOS_ADDRESS_2: PKP2.PKP_COSMOS_ADDRESS,
      PKP_SUI_ADDRESS_2: PKP2.PKP_SUI_ADDRESS,
      CONTROLLER_AUTHSIG_2: PKP2.CONTROLLER_AUTHSIG,

      STYTCH_APP_ID: 'project-test-de4e2690-1506-4cf5-8bce-44571ddaebc9',
      STYTCH_USER_ID: 'user-test-68103e01-7468-4abf-83c8-885db2ca1c6c',
      STYTCH_TEST_TOKEN:
        'eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay10ZXN0LWZiMjhlYmY2LTQ3NTMtNDdkMS1iMGUzLTRhY2NkMWE1MTc1NyIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC10ZXN0LWRlNGUyNjkwLTE1MDYtNGNmNS04YmNlLTQ0NTcxZGRhZWJjOSJdLCJleHAiOjE2ODg1Njc0MTQsImh0dHBzOi8vc3R5dGNoLmNvbS9zZXNzaW9uIjp7ImlkIjoic2Vzc2lvbi10ZXN0LTlkZDI3ZGE1LTVjNjQtNDE5NS04NjdlLWIxNGE3MWE5M2MxMSIsInN0YXJ0ZWRfYXQiOiIyMDIzLTA3LTA1VDE0OjI1OjE0WiIsImxhc3RfYWNjZXNzZWRfYXQiOiIyMDIzLTA3LTA1VDE0OjI1OjE0WiIsImV4cGlyZXNfYXQiOiIyMDIzLTA5LTEzVDAxOjA1OjE0WiIsImF0dHJpYnV0ZXMiOnsidXNlcl9hZ2VudCI6IiIsImlwX2FkZHJlc3MiOiIifSwiYXV0aGVudGljYXRpb25fZmFjdG9ycyI6W3sidHlwZSI6Im90cCIsImRlbGl2ZXJ5X21ldGhvZCI6ImVtYWlsIiwibGFzdF9hdXRoZW50aWNhdGVkX2F0IjoiMjAyMy0wNy0wNVQxNDoyNToxNFoiLCJlbWFpbF9mYWN0b3IiOnsiZW1haWxfaWQiOiJlbWFpbC10ZXN0LTAwMzZmM2YzLTQ0MjQtNDg2My1iYWQ3LTFkNGU3NTM1ZDJiMCIsImVtYWlsX2FkZHJlc3MiOiJqb3NoQGxpdHByb3RvY29sLmNvbSJ9fV19LCJpYXQiOjE2ODg1NjcxMTQsImlzcyI6InN0eXRjaC5jb20vcHJvamVjdC10ZXN0LWRlNGUyNjkwLTE1MDYtNGNmNS04YmNlLTQ0NTcxZGRhZWJjOSIsIm5iZiI6MTY4ODU2NzExNCwic3ViIjoidXNlci10ZXN0LTY4MTAzZTAxLTc0NjgtNGFiZi04M2M4LTg4NWRiMmNhMWM2YyJ9.rZgaunT1UV2pmliZ0V7nYqYtyfdGas4eY6Q6RCzEEBc5y1K66lopUbvvkfNsLJUjSc3vw12NlIX3Q47zm0XEP8AahrJ0QWAC4v9gmZKVYbKiL2JppqnaxtNLZV9Zo1KAiqm9gdqRQSD29222RTC59PI52AOZd4iTv4lSBIPG2J9rUkUwaRI23bGLMQ8XVkTSS7wcd1Ls08Q-VDXuwl8vuoJhssBfNfxFigk7cKHwbbM-o1sh3upEzV-WFgvJrTstPUNbHOBvGnqKDZX6A_45M5zBnHrerifz4-ST771tajiuW2lQXWvocyYlRT8_a0XBsW77UhU-YBTvKVpj3jmH4A',
    },
    null,
    2
  )
);

process.exit(0);

// Get a new PKP
async function getNewPKP(privateKey) {
  const provider = new ethers.providers.JsonRpcProvider(LITPROTOCOL_CHAIN_RPC);

  const wallet = new ethers.Wallet(privateKey, provider);

  const CONTROLLER_ADDRESS = wallet.address;
  console.log('✅ CONTROLLER_ADDRESS:', CONTROLLER_ADDRESS);

  const CONTROLLER_AUTHSIG = await signAuthMessage(
    PKEY,
    'TESTING 123',
    'localhost',
    'http://localhost/login',
    1000 * 60 * 60 * 24 * 49
  );
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
  
  const suiWallet = new PKPSuiWallet({
    pkpPubKey: PKP_PUBKEY,
  });
  
  const PKP_SUI_ADDRESS = await suiWallet.getAddress();
  console.log('✅ PKP_SUI_ADDRESS:', PKP_SUI_ADDRESS);

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
    PKP_SUI_ADDRESS,
  };
}
