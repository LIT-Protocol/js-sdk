// This file is a WIP test demo for auth unification. In this change, the only time we will create an authSig is to use it to generate session sigs
// client side. Anything server side, we will no longer accpet authSig.

import { AuthMethod, LitContractContext } from '@lit-protocol/types';
import {
  LitNodeClient,
} from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { getHotWalletAuthSig } from './get-hot-wallet-authsig';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { AuthSig } from '@lit-protocol/auth-helpers';

let data;

try {
  data = require('./networkContext.ts');
} catch (e) {
  console.error(`❌ networkContext not found. Please generate it from the node side and place it in the "setup" folder.

To generate networkContext.ts:
---------------------------
1. git clone lit-assets
2. run '~/.foundry/bin/anvil' (make sure it’s using **Lit Protocol Anvil Fork Launching**)
3. In the './blockchain/contracts' directory, run 'npm run deploy -- --network localchain'
    - Mostly answers to default, except:
    
    ? How many wallets would you like to stake (but not request to join the network)? 0
    ? How many wallets would you like to stake and request to join the network? 3
    ? Would you like to deploy with the above configuration? (y/N)  - Yes
    
4. You should see a network context file generated at './blockchain/contracts/networkContext.ts'
5. In the './rust/lit-node' directory, run './scripts/start_dev.sh 3'
`);
  process.exit();
}

const { networkContext } = data;

// ----- Test Configuration -----
export const devEnv = async (): Promise<{
  litNodeClient: LitNodeClient,
  contractsClient: LitContracts,
  hotWalletAuthSig: AuthSig,
  hotWalletAuthMethod: AuthMethod,
  hotWalletOwnedPkp: {
    tokenId: string,
    publicKey: string,
    ethAddress: string,
  },
}> => {
  const PRIVATE_KEY =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const LIT_RPC_URL = 'http://127.0.0.1:8545';

  const BOOTSTRAP_URLS = [
    'http://127.0.0.1:7470',
    'http://127.0.0.1:7471',
    'http://127.0.0.1:7472',
  ];

  // -- Setup Lit Node Client
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
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log(`wallet address: ${await wallet.getAddress()}`);

  // -- Get nonce from lit node
  const nonce = await litNodeClient.getLatestBlockhash();

  // -- Get authSig,
  const hotWalletAuthSig = await getHotWalletAuthSig(wallet, nonce);

  // --- Craft an authMethod from the authSig for the eth wallet auth method. For eth wallet auth method type, the access token is the authSig. This is different than the other auth methods where the access token might be a google, discord or other auth provider token.
  const hotWalletAuthMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(hotWalletAuthSig),
  };

  // --- Setup contracts-sdk client
  const contractsClient = new LitContracts({
    signer: wallet,
    debug: false,
    rpc: LIT_RPC_URL, // anvil rpc
    customContext: networkContext as unknown as LitContractContext,
  });

  await contractsClient.connect();

  // (assert) check if contracts-sdk is connected
  if (!contractsClient.connected) {
    console.error('❌ contractsClient not connected');
    process.exit();
  }

  // -- Mint a PKP using the hot wallet auth method.
  const mintResFromHotWallet = await contractsClient.mintWithAuth({
    authMethod: hotWalletAuthMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  let { pkp: hotWalletOwnedPkp } = mintResFromHotWallet;
  hotWalletOwnedPkp.publicKey = hotWalletOwnedPkp.publicKey.startsWith('0x')
    ? hotWalletOwnedPkp.publicKey
    : '0x' + hotWalletOwnedPkp.publicKey;


  console.log(`\n----- Development Environment Configuration -----
✅ Chain RPC URL: ${LIT_RPC_URL}
✅ Bootstrap URLs: ${BOOTSTRAP_URLS}
✅ Wallet Address: ${await wallet.getAddress()}
✅ Hot Wallet Auth Sig: ${JSON.stringify(hotWalletAuthSig)}
✅ Hot Wallet Auth Method: ${JSON.stringify(hotWalletAuthMethod)}
✅ Hot Wallet Owned PKP: ${JSON.stringify(hotWalletOwnedPkp)}

----- Test Starts Below -----
`);

  return {
    litNodeClient,
    contractsClient,
    hotWalletAuthSig,
    hotWalletAuthMethod,
    hotWalletOwnedPkp,
  }
}