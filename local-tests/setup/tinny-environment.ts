import {
  LIT_TESTNET,
  ProcessEnvs,
  RPC_MAP,
  TinnyEnvConfig,
} from './tinny-config';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  AuthSig,
  CosmosAuthSig,
  LitContractContext,
  LitContractResolverContext,
  SolanaAuthSig,
} from '@lit-protocol/types';
import { TinnyPerson } from './tinny-person';

import { ethers } from 'ethers';
import { createSiweMessage, generateAuthSig } from '@lit-protocol/auth-helpers';
import { ShivaClient, TestnetClient } from './shiva-client';

import 'dotenv/config';
console.log('Loading env vars from dot config...');
console.log('Done loading env', process.env['DEBUG']);
export class TinnyEnvironment {
  public network: LIT_TESTNET;

  /**
   * Environment variables used in the process.
   */
  public processEnvs: ProcessEnvs = {
    MAX_ATTEMPTS: parseInt(process.env['MAX_ATTEMPTS']) || 1,
    TEST_TIMEOUT: parseInt(process.env['TEST_TIMEOUT']) || 30000,
    NETWORK: (process.env['NETWORK'] as LIT_TESTNET) || LIT_TESTNET.LOCALCHAIN,
    DEBUG: process.env['DEBUG'] === 'true',
    REQUEST_PER_KILOSECOND:
      parseInt(process.env['REQUEST_PER_KILOSECOND']) || 200,
    LIT_RPC_URL: process.env['LIT_RPC_URL'],
    WAIT_FOR_KEY_INTERVAL:
      parseInt(process.env['WAIT_FOR_KEY_INTERVAL']) || 3000,
    BOOTSTRAP_URLS: process.env['BOOTSTRAP_URLS']?.split(',') || [
      'http://127.0.0.1:7470',
      'http://127.0.0.1:7471',
      'http://127.0.0.1:7472',
    ],
    TIME_TO_RELEASE_KEY: parseInt(process.env['TIME_TO_RELEASE_KEY']) || 10000,
    RUN_IN_BAND: process.env['RUN_IN_BAND'] === 'true',
    RUN_IN_BAND_INTERVAL: parseInt(process.env['RUN_IN_BAND_INTERVAL']) || 5000,

    // Available Accounts
    // ==================
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
    NO_SETUP: process.env['NO_SETUP'] === 'true',
    USE_SHIVA: process.env['USE_SHIVA'] === 'true',
    NETWORK_CONFIG: process.env['NETWORK_CONFIG'] ?? './networkContext.json',
  };

  public litNodeClient: LitNodeClient;
  public contractsClient: LitContracts;
  public rpc: string;
  public superCapacityDelegationAuthSig: AuthSig;
  public bareEthAuthSig: AuthSig;
  public bareSolAuthSig: SolanaAuthSig = {
    sig: '706047fcab06ada3cbfeb6990617c1705d59bafb20f5f1c8103d764fb5eaec297328d164e2b891095866b28acc1ab2df288a8729cf026228ef3c4970238b190a',
    derivedVia: 'solana.signMessage',
    signedMessage:
      'I am creating an account to use Lit Protocol at 2024-05-08T16:39:44.481Z',
    address: 'F7r6ENi6dqH8SnMYZdK3YxWAQ4cwfSNXZyMzbea5fbS1',
  };

  public bareCosmosAuthSig: CosmosAuthSig = {
    sig: 'dE7J8oaWa8zECuMpaI/IVfJXGpLAO1paGLho+/dmtaQkN7Sh1lmJLAdYqZchDyYhQcg+nqfaoEOzLig3CPlosg==',
    derivedVia: 'cosmos.signArbitrary',
    signedMessage:
      '8c857343720203e3f52606409e6818284186a614e74026998f89e7417eed4d4b',
    address: 'cosmos14wp2s5kv07lt220rzfae57k73yv9z2azrmulku',
  };

  public testnet: TestnetClient | undefined;
  //=========== PRIVATE MEMBERS ===========
  private _shivaClient: ShivaClient = new ShivaClient();
  private _contractContext: LitContractContext | LitContractResolverContext;

  constructor(network?: LIT_TESTNET) {
    // -- setup networkj
    this.network = network || this.processEnvs.NETWORK;

    if (Object.values(LIT_TESTNET).indexOf(this.network) === -1) {
      throw new Error(
        `Invalid network environment. Please use one of ${Object.values(
          LIT_TESTNET
        )}`
      );
    }

    // -- create an empty array to keep track of all keys
    this.processEnvs.KEY_IN_USE = new Array(
      this.processEnvs.PRIVATE_KEYS.length
    ).fill(false);

    // -- setup rpc
    // Priority:
    // 1. Use environment variable if set
    // 2. Use RPC_MAP if network is recognized
    // 3. Throw error if neither condition is met
    if (this.processEnvs.LIT_RPC_URL) {
      // If LIT_RPC_URL is set in the environment, use it
      this.rpc = this.processEnvs.LIT_RPC_URL;
    } else if (this.network in RPC_MAP) {
      // If the network is recognized in RPC_MAP, use the corresponding RPC URL
      this.rpc = RPC_MAP[this.network];
    } else {
      // If neither condition is met, throw an error with available options
      const availableNetworks = Object.keys(RPC_MAP).join(', ');
      throw new Error(
        `No RPC URL found for network "${this.network}". Available networks are: ${availableNetworks}`
      );
    }

    console.log(
      '[𐬺🧪 Tinny Environment𐬺] Done configuring enviorment current config: ',
      this.processEnvs
    );
  }

  world: Map<string, TinnyPerson> = new Map();

  /**
   * Retrieves an available private key from a list, marking it as in use and scheduling
   * its automatic release. If no unused keys are available, it waits for a set interval
   * before rechecking.
   *
   * This function loops until it finds an unused key, marks it, and returns the key with
   * its index. If all keys are in use, it logs a wait message and pauses before retrying.
   *
   * Outputs:
   * - privateKey: The selected private key.
   * - index: The index of the selected key.
   *
   * Environment variables required:
   * - KEY_IN_USE: Boolean array indicating key usage.
   * - PRIVATE_KEYS: Array of key strings.
   * - TIME_TO_RELEASE_KEY: Milliseconds until a key is automatically released.
   * - WAIT_FOR_KEY_INTERVAL: Wait time in milliseconds if no keys are free.
   */
  async getAvailablePrivateKey(): Promise<{
    privateKey: string;
    index: number;
  }> {
    while (true) {
      const index = this.processEnvs.KEY_IN_USE.findIndex((used) => !used); // Find the first unused key

      if (index !== -1) {
        // If an available key is found
        this.processEnvs.KEY_IN_USE[index] = true; // Mark the key as in use
        // console.log('[𐬺🧪 Tinny Environment𐬺] 🔑 Selected key at index', index); // Log a message indicating that we have selected a key

        return { privateKey: this.processEnvs.PRIVATE_KEYS[index], index }; // Return the key and its index
      } else {
        // console.log('[𐬺🧪 Tinny Environment𐬺] No available keys. Waiting...'); // Log a message indicating that we are waiting
        // Wait for the specified interval before checking again
        await new Promise((resolve) =>
          setTimeout(resolve, this.processEnvs.WAIT_FOR_KEY_INTERVAL)
        );
      }
    }
  }

  /**
   * Marks a private key as available again after use.
   * @param {number} index - The index of the key to mark as available.
   */
  releasePrivateKeyFromUser(user: TinnyPerson) {
    const index = this.processEnvs.PRIVATE_KEYS.indexOf(user.privateKey);
    this.processEnvs.KEY_IN_USE[index] = false;
    // console.log(
    //   `[𐬺🧪 Tinny Environment𐬺] 🪽 Released key at index ${index}. Thank you for your service!`
    // );
  }

  /**
   * Marks a private key as available again after use.
   * @param {number} index - The index of the key to mark as available.
   */
  releasePrivateKey(index: number) {
    this.processEnvs.KEY_IN_USE[index] = false;
    // console.log(
    //   `[𐬺🧪 Tinny Environment𐬺] 🪽 Released key at index ${index}. Thank you for your service!`
    // );
  }

  /**
   * Initializes the LitNodeClient based on the specified network configuration and environment variables.
   * This setup differentiates between local and production environments, adjusts node attestation checks,
   * and sets network-specific parameters. The function ensures the client is connected and ready before proceeding.
   *
   * The LitNodeClient is configured differently based on the network:
   * - LOCALCHAIN: Uses custom settings for local testing, with node attestation disabled.
   * - MANZANO (or other specified testnets): Configures for specific network environments with node attestation enabled.
   *
   * Logs the process and exits if the client is not ready after attempting to connect.
   */

  async setupLitNodeClient() {
    console.log('[𐬺🧪 Tinny Environment𐬺] Setting up LitNodeClient');

    if (this.network === LIT_TESTNET.LOCALCHAIN) {
      const networkContext =
        this?.testnet?.ContractContext ?? this._contractContext;
      this.litNodeClient = new LitNodeClient({
        litNetwork: 'custom',
        rpcUrl: this.rpc,
        debug: this.processEnvs.DEBUG,
        checkNodeAttestation: false, // disable node attestation check for local testing
        contractContext: networkContext,
      });
    } else if (this.network === LIT_TESTNET.MANZANO) {
      this.litNodeClient = new LitNodeClient({
        litNetwork: this.network, // 'habanero' or 'manzano'
        checkNodeAttestation: true,
        debug: this.processEnvs.DEBUG,
      });
    } else {
      this.litNodeClient = new LitNodeClient({
        litNetwork: this.network,
        checkNodeAttestation: false,
        debug: this.processEnvs.DEBUG,
      });
    }

    if (globalThis.wasmExports) {
      console.warn(
        'WASM modules already loaded. Will overide when connect is called'
      );
    }

    if (globalThis.wasmECDSA) {
      console.warn(
        'WASM modules already loaded. wil overide. when connect is called'
      );
    }

    if (globalThis.wasmSevSnpUtils) {
      console.warn(
        'WASM modules already loaded. wil overide. when connect is called'
      );
    }

    await this.litNodeClient.connect();

    if (!this.litNodeClient.ready) {
      console.error('❌ litNodeClient not ready');
      process.exit();
    }
  }

  /**
   * Retrieves the environment configuration.
   * @returns The TinnyEnvConfig object containing the environment configuration.
   */
  getEnvConfig(): TinnyEnvConfig {
    const contractContext =
      this?.testnet?.ContractContext ?? this._contractContext;
    return {
      rpc: this.rpc,
      litNodeClient: this.litNodeClient,
      network: this.network,
      processEnvs: this.processEnvs,
      contractContext: contractContext as LitContractResolverContext,
    };
  }

  /**
   * Creates a new person with the given name.
   * @param name - The name of the person.
   * @returns The newly created person.
   * @throws Error if the name is not provided.
   */
  async createNewPerson(name: string) {
    console.log('[𐬺🧪 Tinny Environment𐬺] Creating new person:', name);
    if (!name) {
      throw new Error('Name is required');
    }
    const key = await this.getAvailablePrivateKey();
    const privateKey = key.privateKey;
    const envConfig = this.getEnvConfig();

    const person = new TinnyPerson({
      privateKey,
      envConfig,
    });

    await person.spawn();

    this.world.set(name, person);

    return person;
  }

  /**
   * Retrieves a person from the world by their name.
   * @param name - The name of the person to retrieve.
   * @returns The person object if found, or undefined if not found.
   */
  getPerson(name: string) {
    return this.world.get(name);
  }

  /**
   * Creates a random person.
   * @returns A promise that resolves to the created person.
   */
  async createRandomPerson() {
    return await this.createNewPerson('Alice');
  }

  setUnavailable = (network: LIT_TESTNET) => {
    if (this.processEnvs.NETWORK === network) {
      throw new Error('LIT_IGNORE_TEST');
    }
  };

  /**
   * Init
   */
  async init() {
    if (this.processEnvs.NO_SETUP) {
      console.log('[𐬺🧪 Tinny Environment𐬺] Skipping setup');
      return;
    }
    if (this.network === LIT_TESTNET.LOCALCHAIN && this.processEnvs.USE_SHIVA) {
      this.testnet = await this._shivaClient.startTestnetManager();
      // wait for the testnet to be active before we start the tests.
      let state = await this.testnet.pollTestnetForActive();
      if (state === `UNKNOWN`) {
        console.log(
          'Testnet state found to be Unknown meaning there was an error with testnet creation. shutting down'
        );
        throw new Error(`Error while creating testnet, aborting test run`);
      }

      await this.testnet.getTestnetConfig();
    } else if (this.network === LIT_TESTNET.LOCALCHAIN) {
      const context = await import('./networkContext.json');
      this._contractContext = context;
    }

    await this.setupLitNodeClient();
    await this.setupSuperCapacityDelegationAuthSig();
    await this.setupBareEthAuthSig();
  }

  /**
   * Setup bare eth auth sig to test access control and decryption
   */
  async setupBareEthAuthSig() {
    const privateKey = await this.getAvailablePrivateKey();
    const provider = new ethers.providers.JsonRpcBatchProvider(this.rpc);
    const wallet = new ethers.Wallet(privateKey.privateKey, provider);

    const toSign = await createSiweMessage({
      walletAddress: wallet.address,
      nonce: this.litNodeClient.latestBlockhash,
      expiration: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      litNodeClient: this.litNodeClient,
    });

    this.bareEthAuthSig = await generateAuthSig({
      signer: wallet,
      toSign,
    });
  }

  //============= SHIVA ENDPOINTS =============
  /**
   * Will stop the testnet that is being used in the test run.
   */
  async stopTestnet() {
    if (
      this.network === LIT_TESTNET.LOCALCHAIN &&
      this._shivaClient.processEnvs.STOP_TESTNET
    ) {
      await this.testnet.stopTestnet();
    } else {
      console.log('skipping testnet shutdown.');
    }
  }
  //============= END SHIVA ENDPOINTS =============

  /**
   * Sends funds from the current wallet to the specified wallet address.
   * @param walletAddress - The address of the recipient wallet.
   * @param amount - The amount of funds to send (default: '0.001').
   * @throws If there is an error sending the funds.
   */
  getFunds = async (walletAddress: string, amount = '0.001') => {
    try {
      const privateKey = await this.getAvailablePrivateKey();
      const provider = new ethers.providers.JsonRpcBatchProvider(this.rpc);
      const wallet = new ethers.Wallet(privateKey.privateKey, provider);

      const tx = await wallet.sendTransaction({
        to: walletAddress,
        value: ethers.utils.parseEther(amount),
      });

      await tx.wait();
    } catch (e) {
      throw new Error(`Failed to send funds to ${walletAddress}: ${e}`);
    }
  };

  /**
   * Context: the reason this is created instead of individually is because we can't allocate capacity beyond the global
   * max capacity.
   */
  setupSuperCapacityDelegationAuthSig = async () => {
    const privateKey = await this.getAvailablePrivateKey();
    const provider = new ethers.providers.JsonRpcBatchProvider(this.rpc);
    const wallet = new ethers.Wallet(privateKey.privateKey, provider);

    /**
     * ====================================
     * Setup contracts-sdk client
     * ====================================
     */
    if (this.network === LIT_TESTNET.LOCALCHAIN) {
      const networkContext =
        this?.testnet?.ContractContext ?? this._contractContext;
      this.contractsClient = new LitContracts({
        signer: wallet,
        debug: this.processEnvs.DEBUG,
        rpc: this.rpc,
        customContext: networkContext,
      });
    } else {
      async function _switchWallet() {
        // TODO: This wallet should be cached somehwere and reused to create delegation signatures.
        // There is a correlation between the number of Capacity Credit NFTs in a wallet and the speed at which nodes can verify a given rate limit authorization. Creating a single wallet to hold all Capacity Credit NFTs improves network performance during tests.
        const capacityCreditWallet =
          ethers.Wallet.createRandom().connect(provider);

        // get wallet balance
        const balance = await wallet.getBalance();
        console.log('this.rpc:', this.rpc);
        console.log('this.wallet.address', wallet.address);
        console.log('Balance:', balance.toString());

        const transferTx = await wallet.sendTransaction({
          to: capacityCreditWallet.address,
          value: ethers.utils.parseEther('0.001'),
        });
        await transferTx.wait();
      }

      // await _switchWallet();

      this.contractsClient = new LitContracts({
        // signer: capacityCreditWallet, // disabled switch wallet for now
        signer: wallet,
        debug: this.processEnvs.DEBUG,
        network: this.network,
      });
    }

    await this.contractsClient.connect();

    /**
     * ====================================
     * Mint a Capacity Credits NFT and get a capacity delegation authSig with it
     * ====================================
     */

    // Disabled for now
    async function _mintSuperCapacityDelegationAuthSig() {
      console.log(
        '[𐬺🧪 Tinny Environment𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
      );
      try {
        const capacityTokenId = (
          await this.contractsClient.mintCapacityCreditsNFT({
            requestsPerKilosecond: this.processEnvs.REQUEST_PER_KILOSECOND,
            daysUntilUTCMidnightExpiration: 2,
          })
        ).capacityTokenIdStr;

        this.superCapacityDelegationAuthSig = (
          await this.litNodeClient.createCapacityDelegationAuthSig({
            dAppOwnerWallet: wallet,
            capacityTokenId: capacityTokenId,
            // Sets a maximum limit of 200 times that the delegation can be used and prevents usage beyond it
            uses: '200',
          })
        ).capacityDelegationAuthSig;
      } catch (e: any) {
        if (
          e.message.includes(`Can't allocate capacity beyond the global max`)
        ) {
          console.log('❗️Skipping capacity delegation auth sig setup.', e);
        } else {
          console.log(
            '❗️Error while setting up capacity delegation auth sig',
            e
          );
        }
      }
    }
  };
}
