import {
  AuthMethod,
  BaseSiweMessage,
  LitContractContext,
  SignerLike,
} from '@lit-protocol/types';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { ethers } from 'ethers';
import {
  AuthMethodScope,
  AuthMethodType,
  LIT_ENDPOINT,
  LIT_ENDPOINT_VERSION,
} from '@lit-protocol/constants';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import { createSiweMessage, craftAuthSig } from '@lit-protocol/auth-helpers';
import { log } from '@lit-protocol/misc';
import { AuthSig } from '@lit-protocol/types';
import networkContext from './networkContext.json';
import { EthWalletProvider } from '@lit-protocol/lit-auth-client';

export enum LIT_TESTNET {
  LOCALCHAIN = 'localchain',
  MANZANO = 'manzano',
  CAYENNE = 'cayenne',
}

export let processEnvs = {
  MAX_ATTEMPTS: parseInt(process.env['MAX_ATTEMPTS']) || 3,
  RUN_IN_BAND: Boolean(process.env['RUN_IN_BAND']) || false,
  DELAY_BETWEEN_TESTS: parseInt(process.env['DELAY_BETWEEN_TESTS']) || 100,
  NETWORK: (process.env['NETWORK'] as LIT_TESTNET) || LIT_TESTNET.LOCALCHAIN,
  DEBUG: Boolean(process.env['DEBUG']) || false,
  REQUEST_PER_DAY: parseInt(process.env['REQUEST_PER_DAY']) || 14400,

  // Available Accounts
  // ==================

  // (0) "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" (10000.000000000000000000 ETH)
  // (1) "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" (10000.000000000000000000 ETH)
  // (2) "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" (10000.000000000000000000 ETH)
  // (3) "0x90F79bf6EB2c4f870365E785982E1f101E93b906" (10000.000000000000000000 ETH)
  // (4) "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65" (10000.000000000000000000 ETH)
  // (5) "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc" (10000.000000000000000000 ETH)
  // (6) "0x976EA74026E726554dB657fA54763abd0C3a0aa9" (10000.000000000000000000 ETH)
  // (7) "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955" (10000.000000000000000000 ETH)
  // (8) "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f" (10000.000000000000000000 ETH)
  // (9) "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720" (10000.000000000000000000 ETH)

  PRIVATE_KEYS: process.env['PRIVATE_KEYS']?.split(',') || [
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
    '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a',
    '0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6',
    '0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a',
    '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba',
    '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e',
    '0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356',
    '0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97',
    '0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6',
  ],
  KEY_IN_USE: new Array(),
};

// Track which keys are currently in use
processEnvs.KEY_IN_USE = new Array(processEnvs.PRIVATE_KEYS.length).fill(false);

/**
 * Asynchronously selects an available private key and marks it as in use.
 * If no key is available, it waits until one becomes available.
 * @returns {Promise<{privateKey: string, index: number}>} A promise that resolves with the selected key and its index.
 */
async function selectAvailablePrivateKey(): Promise<{
  privateKey: string;
  index: number;
}> {
  let index = -1;

  // Continuously check until an available key is found
  while (index === -1) {
    index = processEnvs.KEY_IN_USE.findIndex((used) => !used);
    if (index === -1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      processEnvs.KEY_IN_USE[index] = true; // Mark this key as in use
      const selectedKey = {
        privateKey: processEnvs.PRIVATE_KEYS[index],
        index,
      };

      log('Selected key:', selectedKey);

      return selectedKey;
    }
  }
}

/**
 * Marks a private key as available again after use.
 * @param {number} index - The index of the key to mark as available.
 */
function releasePrivateKey(index: number) {
  processEnvs.KEY_IN_USE[index] = false;
}

if (Object.values(LIT_TESTNET).indexOf(processEnvs.NETWORK) === -1) {
  throw new Error(
    `Invalid network environment. Please use one of ${Object.values(
      LIT_TESTNET
    )}`
  );
}

export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};

export interface DevEnv {
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
  toSignBytes32: Uint8Array;

  // All about Bob
  bobsWallet: ethers.Wallet;
  bobsWalletOwnedPkp: PKPInfo;
  bobsContractsClient: LitContracts;
  bobsWalletAuthMethod: AuthMethod;
  bobsWalletAuthMethoedOwnedPkp: PKPInfo;

  // Utility
  getContractsClient: (
    signer: ethers.Wallet | SignerLike
  ) => Promise<LitContracts>;
  setExecuteJsVersion: (
    network: LIT_TESTNET,
    version: LIT_ENDPOINT_VERSION
  ) => void;
  setPkpSignVersion: (
    network: LIT_TESTNET,
    version: LIT_ENDPOINT_VERSION
  ) => void;

  // Skip the execution of a test based when a feature is not available in a specific network environment.
  setUnavailable: (network: LIT_TESTNET) => void;

  useNewPrivateKey: () => Promise<void>;
}

// ----- Test Configuration -----
export const getDevEnv = async (
  {
    env,
    debug,
  }: {
    env?: LIT_TESTNET;
    debug?: boolean;
  } = {
    env: LIT_TESTNET.LOCALCHAIN,
    debug: processEnvs.DEBUG,
  }
): Promise<DevEnv> => {
  log('🧪 [tinny-setup.ts] Starting devEnv');

  const LIT_RPC_URL = 'http://127.0.0.1:8545';

  const BOOTSTRAP_URLS = [
    'http://127.0.0.1:7470',
    'http://127.0.0.1:7471',
    'http://127.0.0.1:7472',
  ];

  // People in this test
  let hotWalletKey = await selectAvailablePrivateKey();
  let bobsWalletKey = await selectAvailablePrivateKey();
  /**
   * ====================================
   * Setting up Lit Node Client
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Setting up LitNodeClient');
  let litNodeClient: LitNodeClient;

  if (env === LIT_TESTNET.LOCALCHAIN) {
    litNodeClient = new LitNodeClient({
      litNetwork: 'custom',
      bootstrapUrls: BOOTSTRAP_URLS,
      rpcUrl: LIT_RPC_URL,
      debug,
      checkNodeAttestation: false, // disable node attestation check for local testing
      contractContext: networkContext as LitContractContext,
      // FIXME: When this  is not provided, we are having issues of verified siwe session key mistmatched with the
      // one being signed, because we generate a new session key again when we cannot find the storage provider.
      // storageProvider: {
      //   provider: new LocalStorage('./storage.test.db'),
      // },
    });
  } else if (env === LIT_TESTNET.MANZANO) {
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
  } else {
    litNodeClient = new LitNodeClient({
      litNetwork: env,
      checkNodeAttestation: false,
      debug,
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
    '🧪 [tinny-setup.ts] Setup EOA Wallet using private key, and connects to LIT RPC URL'
  );
  let rpc: string;

  if (env === LIT_TESTNET.LOCALCHAIN) {
    rpc = LIT_RPC_URL;
  } else {
    rpc = 'https://chain-rpc.litprotocol.com/http';
  }
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(hotWalletKey.privateKey, provider);

  /**
   * ====================================
   * Get nonce from lit node
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Get nonce from lit node');
  const nonce = await litNodeClient.getLatestBlockhash();

  /**
   * ====================================
   * Get Hot Wallet Auth Sig
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Get Hot Wallet Auth Sig');
  const siweMessage = await createSiweMessage<BaseSiweMessage>({
    nonce,
    walletAddress: wallet.address,
  });

  log('🧪 [tinny-setup.ts] Crafting Auth Sig');
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
    '🧪 [tinny-setup.ts] Craft an authMethod from the authSig for the eth wallet auth method'
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
  log('🧪 [tinny-setup.ts] Setting up contracts-sdk client');
  let litContractsClient: LitContracts;

  if (env === LIT_TESTNET.LOCALCHAIN) {
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
    '🧪 [tinny-setup.ts] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
  );
  const { capacityTokenIdStr } =
    await litContractsClient.mintCapacityCreditsNFT({
      requestsPerDay: processEnvs.REQUEST_PER_DAY,
      daysUntilUTCMidnightExpiration: 2,
    });

  log('🧪 [tinny-setup.ts] Creating a delegation auth sig');
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: wallet,
      capacityTokenId: capacityTokenIdStr,
      // delegateeAddresses: [wallet.address], meaning anyone can use it
    });

  /**
   * ====================================
   * Mint a PKP
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Mint a PKP');
  const mintRes = await litContractsClient.pkpNftContractUtils.write.mint();
  const hotWalletOwnedPkp = mintRes.pkp;

  /**
   * ====================================
   * Mint a PKP using the hot wallet auth method.
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Mint a PKP using the hot wallet auth method');
  const mintWithAuthRes = await litContractsClient.mintWithAuth({
    authMethod: hotWalletAuthMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  let { pkp: hotWalletAuthMethodOwnedPkp } = mintWithAuthRes;

  /**
   * ====================================
   * A common toSign bytes32 for all signing tests
   * ====================================
   */
  const toSignBytes32 = ethers.utils.arrayify(
    ethers.utils.keccak256([1, 2, 3, 4, 5])
  );

  /**
   * ====================================
   * Bob's Wallet (Just another random wallet)
   * ====================================
   */
  const bobsPrivateKey = bobsWalletKey.privateKey;
  const bobsWallet = new ethers.Wallet(bobsPrivateKey, provider);

  /**
   * ====================================
   * Bob's Wallet Auth Method
   * ====================================
   */
  const bobsWalletAuthMethod = await EthWalletProvider.authenticate({
    signer: bobsWallet,
    litNodeClient,
  });

  /**
   * ====================================
   * Bobs mints a PKP
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Bobs mints a PKP');
  let bobsContractsClient: LitContracts;

  if (env === LIT_TESTNET.LOCALCHAIN) {
    bobsContractsClient = new LitContracts({
      signer: bobsWallet,
      debug,
      rpc: LIT_RPC_URL, // anvil rpc
      customContext: networkContext as unknown as LitContractContext,
    });
  } else {
    bobsContractsClient = new LitContracts({
      signer: bobsWallet,
      debug: false,
      network: env,
    });
  }

  const getContractsClient = async (signer: ethers.Wallet) => {
    let contractsClient: LitContracts;

    if (env === LIT_TESTNET.LOCALCHAIN) {
      contractsClient = new LitContracts({
        signer,
        debug,
        rpc: LIT_RPC_URL, // anvil rpc
        customContext: networkContext as unknown as LitContractContext,
      });
    } else {
      contractsClient = new LitContracts({
        signer,
        debug: false,
        network: env,
      });
    }

    await contractsClient.connect();

    return contractsClient;
  };

  const setExecuteJsVersion = (
    network: LIT_TESTNET,
    version: LIT_ENDPOINT_VERSION
  ) => {
    if (processEnvs.NETWORK === network) {
      process.env[LIT_ENDPOINT.EXECUTE_JS.envName] = version;
    }
  };

  const setPkpSignVersion = (
    network: LIT_TESTNET,
    version: LIT_ENDPOINT_VERSION
  ) => {
    if (processEnvs.NETWORK === network) {
      process.env[LIT_ENDPOINT.PKP_SIGN.envName] = version;
    }
  };

  const setUnavailable = (network: LIT_TESTNET) => {
    if (processEnvs.NETWORK === network) {
      throw new Error('LIT_IGNORE_TEST');
    }
  };

  const useNewPrivateKey = async () => {
    hotWalletKey = await selectAvailablePrivateKey();
    bobsWalletKey = await selectAvailablePrivateKey();
  };

  await bobsContractsClient.connect();

  const bobsMintRes =
    await bobsContractsClient.pkpNftContractUtils.write.mint();
  const bobsWalletOwnedPkp = bobsMintRes.pkp;

  /**
   * ====================================
   * Bob mints a PKP using the hot wallet auth method.
   * ====================================
   */
  log('🧪 [tinny-setup.ts] Bob mints a PKP using the hot wallet auth method');
  const bobsMintWithAuthRes = await bobsContractsClient.mintWithAuth({
    authMethod: bobsWalletAuthMethod,
    scopes: [AuthMethodScope.SignAnything],
  });

  const bobsWalletAuthMethoedOwnedPkp = bobsMintWithAuthRes.pkp;

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

✅ Bob's Wallet Address: ${await bobsWallet.getAddress()}
----- Test Starts Below -----
`);
  log('🧪 [tinny-setup.ts] End of devEnv');

  // Release the private keys after use
  releasePrivateKey(hotWalletKey.index);
  releasePrivateKey(bobsWalletKey.index);

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
    toSignBytes32,

    // All about Bob
    bobsWallet,
    bobsWalletOwnedPkp,
    bobsContractsClient,
    bobsWalletAuthMethod,
    bobsWalletAuthMethoedOwnedPkp,

    // Utility
    getContractsClient,
    setExecuteJsVersion,
    setPkpSignVersion,
    setUnavailable,
    useNewPrivateKey,
  };
};
