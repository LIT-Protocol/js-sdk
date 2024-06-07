import { LitNodeClient } from '@lit-protocol/lit-node-client';

export enum LIT_NETWORK {
  LOCALCHAIN = 'localchain',

  /**
   * @deprecated Use `LIT_NETWORK.DECENTRALIZED_TESTNET` instead.
   */
  MANZANO = 'manzano',

  /**
   * @deprecated Use `LIT_NETWORK.DECENTRALIZED_MAINNET` instead.
   */
  CAYENNE = 'cayenne',
  CENTRALIZED_TESTNET = 'cayenne',
  DECENTRALIZED_TESTNET = 'manzano',
  DECENTRALIZED_MAINNET = 'habanero',
}

export interface PersonEnvs {
  PERSON_FUNDING_STRATEGY: 'faucet' | 'known-private-keys';
  PERSON_FUNDED: boolean;
  PERSON_INIT_ETH_EOA_AUTHSIG: boolean;
  PERSON_INIT_EOA_AUTH_METHOD: boolean;
  PERSON_INIT_CONTRACT_CLIENT: boolean;
  PERSON_MINT_PKP_WITH_EOA_WALLET: boolean;
  PERSON_MINT_PKP_WITH_ETH_WALLET_AUTH_METHOD: boolean;
}
export interface SetupEnvs extends PersonEnvs {
  SETUP_LIT_NODE_CLIENT: boolean;
  SETUP_CAPACITY_DELEGATION_AUTHSIG: boolean;
  SETUP_BARE_AUTHSIG: boolean;
}

export interface ProcessEnvs extends SetupEnvs {
  /**
   * Each test is executed in a loop with a maximum number of attempts specified by `devEnv.processEnvs.MAX_ATTEMPTS`.
   */
  MAX_ATTEMPTS: number;

  /**
   * The network to use for testing. This can be one of the following:
   * - `LIT_NETWORK.LOCALCHAIN`
   * - `LIT_NETWORK.MANZANO`
   * - `LIT_NETWORK.CAYENNE`
   */
  NETWORK: LIT_NETWORK;

  /**
   * The number of milliseconds to wait between each request.
   */
  DEBUG: boolean;

  /**
   * Capacity Credits: In order to execute a transaction with Lit, you’ll need to reserve capacity on the network using Capacity Credits. These allow holders to reserve a set number of requests over a desired period of time (by default expiration set to 2 days)
   */
  REQUEST_PER_KILOSECOND: number;

  /**
   * Wait time in milliseconds if no private keys are available.
   */
  WAIT_FOR_KEY_INTERVAL: number;

  /**
   * Time to wait before releasing the key after requesting it.
   */
  TIME_TO_RELEASE_KEY: number;

  /**
   * Run all the tests in a single thread.
   */
  RUN_IN_BAND: boolean;

  /**
   * The interval in milliseconds to run the tests in a single thread.
   */
  RUN_IN_BAND_INTERVAL: number;

  // =========== In most cases you won't need to change the following values ===========
  /**
   * The URL of Lit RPC server. If it's running locally on Anvil, it should be 'http://127.0.0.1:8545'
   */
  LIT_RPC_URL: string;

  /**
   * The URL of the official Lit RPC server. Usually 'https://chain-rpc.litprotocol.com/http' but can be changed if needed
   */
  LIT_OFFICIAL_RPC: string;

  /**
   * This is usually used when you're running tests locally depending how many nodes you are running.
   */
  BOOTSTRAP_URLS: string[];

  /**
   * The list of private keys to use for testing.
   */
  PRIVATE_KEYS: string[];

  /**
   * The list of keys that are currently in use.
   */
  KEY_IN_USE: boolean[];

  /**
   * Ignore setup steps. Usually when you run to quickly run a single test.
   */
  NO_SETUP: boolean;
}

/**
 * Represents the PKP information.
 */
export type PKPInfo = {
  tokenId: string;
  publicKey: string;
  ethAddress: string;
};

export interface TinnyEnvConfig {
  rpc: string;
  litNodeClient: LitNodeClient;
  network: LIT_NETWORK;
  processEnvs: ProcessEnvs;
}
