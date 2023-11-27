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
import { LitAbility, LitActionResource } from '@lit-protocol/auth-helpers';
import { LitAuthClient } from '@lit-protocol/lit-auth-client';

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
  // ======================================================================
  // =                              PKP INFO                              =
  // ======================================================================
  // -- token id
  let PKP_TOKENID = BigInt(PKPMintTx.events[0].topics[1]).toString();
  console.log('✅ PKP_TOKENID:', PKP_TOKENID);

  // -- public key
  let PKP_PUBKEY = await PKPNFTContract.getPubkey(PKP_TOKENID);
  console.log('✅ PKP_PUBKEY:', PKP_PUBKEY);

  // -- public key in buffer form
  const pubKeyBuffer = getPubKeyBuffer(PKP_PUBKEY);

  // -- eth address
  const PKP_ETH_ADDRESS = ethers.utils.computeAddress(PKP_PUBKEY);
  console.log('✅ PKP_ETH_ADDRESS:', PKP_ETH_ADDRESS);

  // -- cosmos address
  const PKP_COSMOS_ADDRESS = getCosmosAddress(pubKeyBuffer);
  console.log('✅ PKP_COSMOS_ADDRESS:', PKP_COSMOS_ADDRESS);

  // -- sui address
  const suiWallet = new PKPSuiWallet({
    pkpPubKey: PKP_PUBKEY,
  });

  const PKP_SUI_ADDRESS = await suiWallet.getAddress();
  console.log('✅ PKP_SUI_ADDRESS:', PKP_SUI_ADDRESS);

  if (PKP_PUBKEY.startsWith('0x')) {
    PKP_PUBKEY = PKP_PUBKEY.slice(2);
  }

  // ======================================================================================
  // =                              Authenticated signatures                              =
  // ======================================================================================

  // (option 1) -- auth sig
  const CONTROLLER_AUTHSIG = await signAuthMessage(PKEY);
  console.log('✅ CONTROLLER_AUTHSIG:', CONTROLLER_AUTHSIG);

  // -- (option 2) -- session sigs using eth wallet
  // const litNodeClient = new LitNodeClient({
  //   network: 'cayenne',
  // });
  // await litNodeClient.connect();

  // const litAuthClient = new LitAuthClient({
  //   litRelayConfig: {
  //     relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
  //   },
  //   version: 'V3',
  //   litNodeClient,
  // });

  // // -- getting auth method
  // const authProvider = litAuthClient.initProvider('ethwallet'); // in typescript, use "ProviderType.EthWallet"
  // const authMethod = {
  //   authMethodType: 1, // in typescript, use "AuthMethodType.EthWallet"
  //   accessToken: JSON.stringify(CONTROLLER_AUTHSIG),
  // };

  // // -- fetch pkp through the relayer
  // let pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);

  // // -- use the first pkp found. If not found, mint a new one then use it
  // if (pkps.length <= 0) {
  //   try {
  //     await authProvider.mintPKPThroughRelayer(authMethod);
  //   } catch (e) {
  //     return fail('Failed to mint PKP');
  //   }
  //   pkps = await authProvider.fetchPKPsThroughRelayer(authMethod);
  // }

  // const pkp = pkps[pkps.length - 1];

  // // convert BigNumber to string
  // pkp.tokenId = ethers.BigNumber.from(pkp.tokenId).toString();

  // const sessionKeyPair = litNodeClient.getSessionKey();

  // const authNeededCallback = async (params) => {
  //   const response = await litNodeClient.signSessionKey({
  //     sessionKey: sessionKeyPair,
  //     statement: params.statement,
  //     authSig: JSON.parse(authMethod.accessToken), // When this is empty or undefined, it will fail
  //     authMethods: [authMethod],
  //     pkpPublicKey: pkp.publicKey,
  //     expiration: params.expiration,
  //     resources: params.resources,
  //     chainId: 1,
  //   });
  //   return response.authSig;
  // };

  // const resourceAbilities = [
  //   {
  //     resource: new LitActionResource('*'),
  //     ability: LitAbility.PKPSigning,
  //   },
  // ];

  // const CONTROLLER_SESSIONSIGS = await litNodeClient.getSessionSigs({
  //   chain: 'ethereum',
  //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  //   resourceAbilityRequests: resourceAbilities,
  //   sessionKey: sessionKeyPair,
  //   authNeededCallback,
  // });

  // console.log('✅ CONTROLLER_SESSIONSIGS:', CONTROLLER_SESSIONSIGS);

  return {
    CONTROLLER_ADDRESS,
    CONTROLLER_AUTHSIG,
    // CONTROLLER_SESSIONSIGS,
    PKP_TOKENID,
    PKP_PUBKEY,
    PKP_ETH_ADDRESS,
    PKP_COSMOS_ADDRESS,
    PKP_SUI_ADDRESS,
  };
}
