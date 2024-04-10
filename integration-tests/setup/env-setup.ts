// This file is a WIP test demo for auth unification. In this change, the only time we will create an authSig is to use it to generate session sigs
// client side. Anything server side, we will no longer accpet authSig.

import { AuthMethod, LitContractContext } from '@lit-protocol/types';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  BaseSiweMessage,
  createSiweMessage,
  craftAuthSig,
  CreateSiweType,
} from '@lit-protocol/auth-helpers';
// import { LocalStorage } from 'node-localstorage';
import { log } from '@lit-protocol/misc';
import { AuthSig } from '@lit-protocol/types';
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

export enum ENV {
  LOCALCHAIN = 'localchain',
  HABANERO = 'habanero',
  MANZANO = 'manzano',
}
export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};

// ----- Test Configuration -----
export const devEnv = async (
  {
    env,
    debug,
  }: {
    env?: ENV;
    debug?: boolean;
  } = {
    env: ENV.LOCALCHAIN,
    debug: true,
  }
): Promise<{
  litNodeClient: LitNodeClient;
  litContractsClient: LitContracts;
  hotWallet: ethers.Wallet;
  hotWalletOwnedPkp: PKPInfo;
  hotWalletAuthSig: AuthSig;
  hotWalletAuthMethod: AuthMethod;
  hotWalletAuthMethodOwnedPkp: PKPInfo;
  lastestBlockhash: string;
  capacityTokenId: string;
  capacityDelegationAuthSig: AuthSig;
  capacityDelegationAuthSigWithPkp: AuthSig;
}> => {
  log('🧪 [env-setup.ts] Starting devEnv');
  const PRIVATE_KEY =
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const LIT_RPC_URL = 'http://127.0.0.1:8545';

  const BOOTSTRAP_URLS = [
    'http://127.0.0.1:7470',
    'http://127.0.0.1:7471',
    'http://127.0.0.1:7472',
  ];

  /**
   * ====================================
   * Setting up Lit Node Client
   * ====================================
   */
  log('🧪 [env-setup.ts] Setting up LitNodeClient');
  let litNodeClient: LitNodeClient;

  if (env === ENV.LOCALCHAIN) {
    litNodeClient = new LitNodeClient({
      litNetwork: 'custom',
      bootstrapUrls: BOOTSTRAP_URLS,
      rpcUrl: LIT_RPC_URL,
      debug,
      checkNodeAttestation: false, // disable node attestation check for local testing
      contractContext: networkContext as unknown as LitContractContext,

      // FIXME: When this  is not provided, we are having issues of verified siwe session key mistmatched with the
      // one being signed, because we generate a new session key again when we cannot find the storage provider.
      // storageProvider: {
      //   provider: new LocalStorage('./storage.test.db'),
      // },
    });
  } else {
    litNodeClient = new LitNodeClient({
      litNetwork: env, // 'habanero' or 'manzano'
      checkNodeAttestation: true,
      debug,

      // FIXME: When this  is not provided, we are having issues of verified siwe session key mistmatched with the
      // one being signed, because we generate a new session key again when we cannot find the storage provider.
      // storageProvider: {
      //   provider: new LocalStorage('./storage.test.db'),
      // },
    });
  }

  await litNodeClient.connect();

  if (!litNodeClient.ready) {
    console.error('❌ litNodeClient not ready');
    process.exit();
  }

  /**
   * ====================================
   * Setup EOA Wallet using private key, and connects to LIT RPC URL
   * ====================================
   */
  log(
    '🧪 [env-setup.ts] Setup EOA Wallet using private key, and connects to LIT RPC URL'
  );
  let rpc: string;

  if (env === ENV.LOCALCHAIN) {
    rpc = LIT_RPC_URL;
  } else {
    rpc = 'https://chain-rpc.litprotocol.com/http';
  }
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  /**
   * ====================================
   * Get nonce from lit node
   * ====================================
   */
  log('🧪 [env-setup.ts] Get nonce from lit node');
  const nonce = await litNodeClient.getLatestBlockhash();

  /**
   * ====================================
   * Get Hot Wallet Auth Sig
   * ====================================
   */
  log('🧪 [env-setup.ts] Get Hot Wallet Auth Sig');
  const siweMessage = await createSiweMessage<BaseSiweMessage>({
    nonce,
    walletAddress: wallet.address,
    type: CreateSiweType.DEFAULT,
  });

  log('🧪 [env-setup.ts] Crafting Auth Sig');
  const hotWalletAuthSig = await craftAuthSig({
    signer: wallet,
    toSign: siweMessage,
  });

  /**
   * ====================================
   * Craft an authMethod from the authSig for the eth wallet auth method
   * ====================================
   */

  log(
    '🧪 [env-setup.ts] Craft an authMethod from the authSig for the eth wallet auth method'
  );
  const hotWalletAuthMethod = {
    authMethodType: AuthMethodType.EthWallet,
    accessToken: JSON.stringify(hotWalletAuthSig),
  };

  /**
   * ====================================
   * Setup contracts-sdk client
   * ====================================
   */
  log('🧪 [env-setup.ts] Setting up contracts-sdk client');
  let litContractsClient: LitContracts;

  if (env === ENV.LOCALCHAIN) {
    litContractsClient = new LitContracts({
      signer: wallet,
      debug,
      rpc: LIT_RPC_URL, // anvil rpc
      customContext: networkContext as unknown as LitContractContext,
    });
  } else {
    litContractsClient = new LitContracts({
      signer: wallet,
      debug: false,
      network: env,
    });
  }

  await litContractsClient.connect();

  // (assert) check if contracts-sdk is connected
  if (!litContractsClient.connected) {
    console.error('❌ litContractsClient not connected');
    process.exit();
  }

  /**
   * ====================================
   * Mint a Capacity Credits NFT and get a capacity delegation authSig with it
   * ====================================
   */
  log(
    '🧪 [env-setup.ts] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
  );
  const { capacityTokenIdStr } =
    await litContractsClient.mintCapacityCreditsNFT({
      requestsPerDay: 14400, // 10 request per minute
      daysUntilUTCMidnightExpiration: 2,
    });

  log('🧪 [env-setup.ts] Creating a delegation auth sig');
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: wallet,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [wallet.address],
    });

  /**
   * ====================================
   * Mint a PKP
   * ====================================
   */
  log('🧪 [env-setup.ts] Mint a PKP');
  const mintRes = await litContractsClient.pkpNftContractUtils.write.mint();
  const hotWalletOwnedPkp = mintRes.pkp;

  /**
   * ====================================
   * Mint a PKP using the hot wallet auth method.
   * ====================================
   */
  log('🧪 [env-setup.ts] Mint a PKP using the hot wallet auth method');
  const mintWithAuthRes = await litContractsClient.mintWithAuth({
    authMethod: hotWalletAuthMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  let { pkp: hotWalletAuthMethodOwnedPkp } = mintWithAuthRes;

  /**
   * ====================================
   * Creates a Capacity Delegation AuthSig
   * that has PKP as one of the delegatees
   * ====================================
   */
  log(
    '🧪 [env-setup.ts] Creates a Capacity Delegation AuthSig that has PKP as one of the delegatees'
  );
  const { capacityDelegationAuthSig: capacityDelegationAuthSigWithPkp } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: wallet,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [hotWalletAuthMethodOwnedPkp.ethAddress],
    });

  log(`\n----- Development Environment Configuration -----
✅ Chain RPC URL: ${LIT_RPC_URL}
✅ Bootstrap URLs: ${BOOTSTRAP_URLS}
✅ Wallet Address: ${await wallet.getAddress()}
✅ Hot Wallet Auth Sig: ${JSON.stringify(hotWalletAuthSig)}
✅ Hot Wallet Owned PKP ${JSON.stringify(hotWalletOwnedPkp)}
✅ Hot Wallet Auth Method: ${JSON.stringify(hotWalletAuthMethod)}
✅ Hot Wallet Auth Method Owned PKP: ${JSON.stringify(
    hotWalletAuthMethodOwnedPkp
  )}
✅ Capacity Token ID: ${capacityTokenIdStr}
✅ Capacity Delegation Auth Sig: ${JSON.stringify(capacityDelegationAuthSig)}
✅ Capacity Delegation Auth Sig With PKP: ${JSON.stringify(
    capacityDelegationAuthSigWithPkp
  )}

----- Test Starts Below -----
`);
  log('🧪 [env-setup.ts] End of devEnv');
  return {
    litNodeClient,
    litContractsClient,
    hotWallet: wallet,
    hotWalletAuthSig,
    hotWalletOwnedPkp,
    hotWalletAuthMethod,
    hotWalletAuthMethodOwnedPkp,
    lastestBlockhash: nonce,
    capacityTokenId: capacityTokenIdStr,
    capacityDelegationAuthSig,
    capacityDelegationAuthSigWithPkp,
  };
};
