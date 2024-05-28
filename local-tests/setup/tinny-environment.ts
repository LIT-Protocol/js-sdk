import { LIT_TESTNET, ProcessEnvs, TinnyEnvConfig } from './tinny-config';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from '@lit-protocol/contracts-sdk';
import {
  AuthSig,
  CosmosAuthSig,
  LitContractContext,
  SolanaAuthSig,
} from '@lit-protocol/types';
import { TinnyPerson } from './tinny-person';
import networkContext from './networkContext.json';
import { ethers } from 'ethers';
import { createSiweMessage, generateAuthSig } from '@lit-protocol/auth-helpers';

export class TinnyEnvironment {
  public network: LIT_TESTNET;

  /**
   * Environment variables used in the process.
   */
  public processEnvs: ProcessEnvs = {
    MAX_ATTEMPTS: parseInt(process.env['MAX_ATTEMPTS']) || 1,
    NETWORK: (process.env['NETWORK'] as LIT_TESTNET) || LIT_TESTNET.LOCALCHAIN,
    DEBUG: Boolean(process.env['DEBUG']) || false,
    REQUEST_PER_KILOSECOND:
      parseInt(process.env['REQUEST_PER_KILOSECOND']) || 200,
    LIT_RPC_URL: process.env['LIT_RPC_URL'] || 'http://127.0.0.1:8545',
    WAIT_FOR_KEY_INTERVAL:
      parseInt(process.env['WAIT_FOR_KEY_INTERVAL']) || 3000,
    BOOTSTRAP_URLS: process.env['BOOTSTRAP_URLS']?.split(',') || [
      'http://127.0.0.1:7470',
      'http://127.0.0.1:7471',
      'http://127.0.0.1:7472',
    ],
    LIT_OFFICIAL_RPC:
      process.env['LIT_OFFICIAL_RPC'] ||
      'https://chain-rpc.litprotocol.com/http',
    TIME_TO_RELEASE_KEY: parseInt(process.env['TIME_TO_RELEASE_KEY']) || 10000,
    RUN_IN_BAND: Boolean(process.env['RUN_IN_BAND']) || false,
    RUN_IN_BAND_INTERVAL: parseInt(process.env['RUN_IN_BAND_INTERVAL']) || 5000,

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
    NO_SETUP: Boolean(process.env['NO_SETUP']) || false,
    STOP_TESTNET: Boolean(process.env['STOP_TESTNET']) || false,
    TESTNET_MANAGER_URL: 'http://0.0.0.0:8000',
    LIT_NODE_BINARY_PATH: process.env['LIT_NODE_BINARY_PATH'] || `./../../../lit-assets/rust/lit-node/target/debug/lit_node`
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

  //=========== PRIVATE MEMBERS ===========
  private _testnetId: string | undefined;

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
    if (this.network === LIT_TESTNET.LOCALCHAIN) {
      this.rpc = this.processEnvs.LIT_RPC_URL;
    } else {
      this.rpc = this.processEnvs.LIT_OFFICIAL_RPC;
    }
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

        // Set a timer to automatically release the key after 10 seconds
        setTimeout(() => {
          this.releasePrivateKey(index);
          // console.log(
          //   '[𐬺🧪 Tinny Environment𐬺] 🔓 Automatically released key at index',
          //   index,
          //   `after ${this.processEnvs.TIME_TO_RELEASE_KEY / 10000} seconds`
          // );
        }, this.processEnvs.TIME_TO_RELEASE_KEY);

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
      this.litNodeClient = new LitNodeClient({
        litNetwork: 'custom',
        bootstrapUrls: this.processEnvs.BOOTSTRAP_URLS,
        rpcUrl: this.processEnvs.LIT_RPC_URL,
        debug: this.processEnvs.DEBUG,
        checkNodeAttestation: false, // disable node attestation check for local testing
        contractContext: networkContext as LitContractContext,
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
    return {
      rpc: this.rpc,
      litNodeClient: this.litNodeClient,
      network: this.network,
      processEnvs: this.processEnvs,
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
    if (this.network === LIT_TESTNET.LOCALCHAIN) {
      await this.startTestnetManager();
      // wait for the testnet to be active before we start the tests.
      await this.pollTestnetForActive();
      await this.getTestnetConfig();
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
      nonce: await this.litNodeClient.getLatestBlockhash(),
      expiration: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000).toISOString(),
      litNodeClient: this.litNodeClient,
    });

    this.bareEthAuthSig = await generateAuthSig({
      signer: wallet,
      toSign,
    });
  }

  /**
   * Used to start an instanc of a lit network through the Lit Testnet Manager
   * if an isntance exists, we will just take it as we optimistically assume it will not be shut down in the test life time.
   * If an instance does not exist then we create one
   */
  async startTestnetManager() {
    const existingTestnetResp = await fetch(
      this.processEnvs.TESTNET_MANAGER_URL + '/test/get/testnets'
    );
    const existingTestnets: string[] = await existingTestnetResp.json();
    if (existingTestnets.length > 0) {
      this._testnetId = existingTestnets[0];
    } else {
      console.log("binary path: ", this.processEnvs.LIT_NODE_BINARY_PATH)
      const createTestnetResp = await fetch(
        this.processEnvs.TESTNET_MANAGER_URL + '/test/create/testnet',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nodeCount: 6,
            pollingInterval: '2000',
            epochLength: 100,
            customBuildPath: this.processEnvs.LIT_NODE_BINARY_PATH
          }),
        }
      );

      const createTestnet = await createTestnetResp.json();
      this._testnetId = createTestnet.testnetId;
    }
  }

  async pollTestnetForActive() {
    let state = 'Busy';
    while (state != 'Active') {
      const pollRes = await fetch(
        this.processEnvs.TESTNET_MANAGER_URL +
          '/test/poll/testnet/' +
          this._testnetId
      );
      const res = await pollRes.json();
      state = res.body;
      console.log('found state to be', state);
      if (state != 'Active') {
        await new Promise<void>((res, _) => {
          setTimeout(() => {
            res();
          }, 5_000);
        });
      }
    }
  }

  async getTestnetConfig() {
    let infoResponse = await fetch(this.processEnvs.TESTNET_MANAGER_URL +
      '/test/get/info/testnet/' +
      this._testnetId
    );
    const res = await infoResponse.json();
    console.log('testnet info:', res);
  }

  async transitionAndEpochAndWait() {
    const stopRandomPeerRes = await fetch(
      this.processEnvs.TESTNET_MANAGER_URL +
        '/test/action/transition/epoch/wait/' +
        this._testnetId
    );
    
    if (stopRandomPeerRes.status === 200) {
      const resp = await stopRandomPeerRes.json();
      console.log("transition res ", resp);
    }
  }

  async stopRandomNetworkPeer() {
    const stopRandomPeerRes = await fetch(
      this.processEnvs.TESTNET_MANAGER_URL +
        '/test/action/stop/random/wait/' +
        this._testnetId
    );
    
    if (stopRandomPeerRes.status === 200) {
      let resp = await stopRandomPeerRes.json();
      console.log(
        "validator kick response: ", resp
      )
      await this.pollTestnetForActive();
    } 
  }

  async stopTestnet() {
    if (this.network === LIT_TESTNET.LOCALCHAIN && this.processEnvs.STOP_TESTNET) {
      console.log('stopping testnet with id:', this._testnetId);
      const shutdownResp = await fetch(
        this.processEnvs.TESTNET_MANAGER_URL + '/test/delete/testnet/' + this._testnetId
      );
      const existingTestnets: string[] = await shutdownResp.json();
      console.log('testnet manager shutdown: ', existingTestnets);
    } else {
      console.log('skipping testnet shutdown.')
    }
  }
  
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
      this.contractsClient = new LitContracts({
        signer: wallet,
        debug: this.processEnvs.DEBUG,
        rpc: this.processEnvs.LIT_RPC_URL, // anvil rpc
        customContext: networkContext as unknown as LitContractContext,
      });
    } else {
      // TODO: This wallet should be cached somehwere and reused to create delegation signatures.
      // There is a correlation between the number of Capacity Credit NFTs in a wallet and the speed at which nodes can verify a given rate limit authorization. Creating a single wallet to hold all Capacity Credit NFTs improves network performance during tests.
      const capacityCreditWallet =
        ethers.Wallet.createRandom().connect(provider);

      const transferTx = await wallet.sendTransaction({
        to: capacityCreditWallet.address,
        value: ethers.utils.parseEther('0.001'),
      });
      await transferTx.wait();
      this.contractsClient = new LitContracts({
        signer: capacityCreditWallet,
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
    console.log(
      '[𐬺🧪 Tinny Environment𐬺] Mint a Capacity Credits NFT and get a capacity delegation authSig with it'
    );
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
  };
}
