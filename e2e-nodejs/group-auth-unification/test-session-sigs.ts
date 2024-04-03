import { ILitNodeClient, LitContractContext } from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { networkContext } from "e2e-nodejs/network-context";
import { ethers } from "ethers";
import { getHotWalletAuthSig } from "./utils/get-hot-wallet-authsig";
import { AuthMethodScope, AuthMethodType } from "@lit-protocol/constants";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitAbility, LitActionResource, LitPKPResource } from "@lit-protocol/auth-helpers";
import { PKPEthersWallet } from "@lit-protocol/pkp-ethers";
import * as siwe from 'siwe';

const TO_SIGN = ethers.utils.arrayify(ethers.utils.keccak256([1, 2, 3, 4, 5]));

// -- local development setup
const PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
const LIT_RPC_URL = 'http://127.0.0.1:8545';

const BOOTSTRAP_URLS = [
  'http://127.0.0.1:7470',
  'http://127.0.0.1:7471',
  'http://127.0.0.1:7472',
];

const litNodeClient = new LitNodeClient({
  litNetwork: 'custom',
  bootstrapUrls: BOOTSTRAP_URLS,
  rpcUrl: LIT_RPC_URL,
  debug: true,
  checkNodeAttestation: false, // disable node attestation check for local testing
  contractContext: networkContext as unknown as LitContractContext,
});

await litNodeClient.connect();

// -- Setup EOA Wallet using private key, and connects to LIT RPC URL
const provider = new ethers.providers.JsonRpcProvider(LIT_RPC_URL);
const hotWallet = new ethers.Wallet(PRIVATE_KEY, provider);
console.log(`hotWallet address: ${await hotWallet.getAddress()}`);

// -- Get nonce from lit node
const nonce = await litNodeClient.getLatestBlockhash();

const hotWalletAuthSig = await getHotWalletAuthSig(hotWallet, nonce);

const hotWalletAuthMethod = {
  authMethodType: AuthMethodType.EthWallet,
  accessToken: JSON.stringify(hotWalletAuthSig),
};
// --- Setup contracts-sdk client
const contractsClient = new LitContracts({
  signer: hotWallet,
  debug: false,
  rpc: LIT_RPC_URL, // anvil rpc
  customContext: networkContext as unknown as LitContractContext,
});

await contractsClient.connect();

// -- Mint a PKP using the hot wallet auth method.
const mintResFromHotWallet = await contractsClient.mintWithAuth({
  authMethod: hotWalletAuthMethod,
  scopes: [AuthMethodScope.SignAnything],
});

let { pkp: hotWalletOwnedPkp } = mintResFromHotWallet;

console.log("hotWalletOwnedPkp:", hotWalletOwnedPkp);
hotWalletOwnedPkp.publicKey = hotWalletOwnedPkp.publicKey.startsWith('0x')
  ? hotWalletOwnedPkp.publicKey
  : '0x' + hotWalletOwnedPkp.publicKey;


// -- mint new Capacity Credits NFT
const { capacityTokenIdStr } = await contractsClient.mintCapacityCreditsNFT({
  requestsPerDay: 14400, // 10 request per minute
  daysUntilUTCMidnightExpiration: 2,
});

console.log("capacityTokenIdStr:", capacityTokenIdStr);

const { capacityDelegationAuthSig, litResource } =
  await litNodeClient.createCapacityDelegationAuthSig({
    uses: '1',
    dAppOwnerWallet: hotWallet,
    capacityTokenId: capacityTokenIdStr,
    delegateeAddresses: [hotWallet.address],
  });
console.log('capacityDelegationAuthSig:', capacityDelegationAuthSig);
console.log('litResource:', JSON.stringify(litResource));

// We need to setup a generic siwe auth callback that will be called by the lit-node-client
const endUserControllerAuthNeededCallback = async ({
  resources,
  expiration,
  uri,
}) => {
  console.log('resources:', resources);
  console.log('expiration:', expiration);

  const litResource = new LitActionResource('*');

  const recapObject =
    await litNodeClient.generateSessionCapabilityObjectWithWildcards([
      litResource,
    ]);

  recapObject.addCapabilityForResource(
    litResource,
    LitAbility.LitActionExecution
  );

  const verified = recapObject.verifyCapabilitiesForResource(
    litResource,
    LitAbility.LitActionExecution
  );

  if (!verified) {
    throw new Error('Failed to verify capabilities for resource');
  }

  console.log('authCallback verified:', verified);

  let siweMessage = new siwe.SiweMessage({
    domain: 'localhost:3000',
    address: hotWallet.address,
    statement: 'Some custom statement.',
    uri,
    version: '1',
    chainId: 1,
    expirationTime: expiration,
    resources,
  });

  siweMessage = recapObject.addToSiweMessage(siweMessage);
  console.log('authCallback siwe:', siweMessage);

  const messageToSign = siweMessage.prepareMessage();
  const signature = await hotWallet.signMessage(messageToSign);

  const authSig = {
    sig: signature.replace('0x', ''),
    derivedVia: 'web3.eth.personal.sign',
    signedMessage: messageToSign,
    // address: delegatedWalletB_address,
    address: hotWallet.address,
    // algo: null,
  };

  console.log('authCallback authSig:', authSig);

  return authSig;
};
let sessionSigs = await litNodeClient.getSessionSigs({
  expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
  chain: 'ethereum',
  resourceAbilityRequests: [
    {
      resource: new LitActionResource('*'),
      ability: LitAbility.LitActionExecution,
    },
  ],
  authNeededCallback: endUserControllerAuthNeededCallback as any,
  capabilities: [capacityDelegationAuthSig],
});

console.log("sessionSigs:", sessionSigs);

const res = await litNodeClient.executeJs({
  sessionSigs,
  code: `(async () => {
    // const sigShare = await LitActions.signEcdsa({
    //   toSign: dataToSign,
    //   publicKey,
    //   sigName: "sig",
    // });
    console.log("test")
  })();`,
  jsParams: {
    dataToSign: ethers.utils.arrayify(
      ethers.utils.keccak256([1, 2, 3, 4, 5])
    ),
    publicKey: hotWalletOwnedPkp.publicKey,
  },
});

console.log("res:", res);

process.exit();