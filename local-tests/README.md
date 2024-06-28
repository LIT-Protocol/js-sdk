# Tinny

Tinny is a mini test framework, serving as a temporary solution for running e2e tests in TypeScript until we can integrate `Jest`. It utilizes `esbuild` for its rapid compilation speed to bundle all the tests into a single `test.mjs` file, then runs the built `test.mjs` file immediately. See [Benchmark](#esbuild-benchmark)

# Prerequisite

- Node v20 or above
- The generated file `networkContext.ts` after running `npm run deploy -- --network localchain` in the `lit-assets` repo

# How to run

In most cases, you will only need the following two environment variables, and a `--filter` flag. See [API](#api)

The `testName` specified in the filter **must be the same as the function name**.

## to run all tests

```
// run all tests on localchain
DEBUG=true NETWORK=localchain yarn test:local

// run filtered tests on manzano
DEBUG=true NETWORK=manzano yarn test:local --filter=testExample
DEBUG=true NETWORK=manzano yarn test:local --filter=testExample,testBundleSpeed

// run filtered tests by keyword
DEBUG=true NETWORK=manzano yarn test:local --filter=Encrypt

// eg.
yarn test:local --filter=testExample,testBundleSpeed

```

## API

Below is the API documentation for the `ProcessEnvs` interface, detailing the configurable environment variables and their purposes:

**NOTE: a `.env.sample` is contained in the repository root for the below env tables**

| Variable                 | Description                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `MAX_ATTEMPTS`           | Each test is executed in a loop with a maximum number of attempts specified by `devEnv.processEnvs.MAX_ATTEMPTS`.                                                        |
| `NETWORK`                | The network to use for testing, which can be one of the following: `LIT_TESTNET.LOCALCHAIN`, `LIT_TESTNET.MANZANO`, or `LIT_TESTNET.CAYENNE`.                            |
| `DEBUG`                  | Specifies whether to enable debug mode.                                                                                                                                  |
| `REQUEST_PER_KILOSECOND` | To execute a transaction with Lit, you must reserve capacity on the network using Capacity Credits. These allow a set number of requests over a period (default 2 days). |
| `WAIT_FOR_KEY_INTERVAL`  | Wait time in milliseconds if no private keys are available.                                                                                                              |
| `TIME_TO_RELEASE_KEY`    | Time to wait before releasing the key after requesting it.                                                                                                               |
| `RUN_IN_BAND`            | Run all tests in a single thread.                                                                                                                                        |
| `RUN_IN_BAND_INTERVAL`   | The interval in milliseconds to run the tests in a single thread.                                                                                                        |
| `LIT_RPC_URL`            | The URL of the Lit RPC server. If running locally on Anvil, it should be 'http://127.0.0.1:8545'.                                                                        |
| `LIT_OFFICIAL_RPC`       | The URL of the official Lit RPC server, usually 'https://chain-rpc.litprotocol.com/http' but can be changed if needed.                                                   |
| `USE_SHIVA`              | A flag to determine if `Shiva` should be used for the `localchain` network.                                                                                              |
| `PRIVATE_KEYS`           | A set of private keys to use which will be used to perform chain operations.                                                                                             |

Below is te API Documentation forthe `ProccessEnvs` interface for the `shiva-client` detailing the configurable enviorment variables and their purposes:

| Variable                 | Description                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `TESTNET_MAANGER_URL`    | URl to connect to Shiva (our testing tool for network management).                                          |
| `LIT_NODE_BINARY_PATH`   | Binary path for the lit node version you wish to run.                                                       |
| `LIT_Action_BINARY_PATH` | Binary path for the lit node version you wish to run.                                                       |
| `USE_LIT_BINARIES`       | Flag to indicate if a binary path should be used for testnet spawning or if it should be built from source. |
| `STOP_TESTNET`           | Flag to stop a single running testnet after the test run concludes.                                         |

# Writing a test

Writing a test is the same as writing any other code, except that you must throw an error if any occur. There are no assertion libraries, so all tests are written using basic `if-else` statements.

In the test function, a `devEnv` variable will automatically be added as the first parameter to your function.

## Using the devEnv API in the test

```ts
export const testExample = async (devEnv: TinnyEnvironment) => {

  // ========== Enviorment ==========
  // This test will be skipped if we are testing on the Cayenne network
  devEnv.setUnavailable(LIT_TESTNET.CAYENNE);

  // Using litNodeClient
  const res = await devEnv.litNodeClient.executeJs({...});

  // ========== Creating a new identify/user profile ==========
  const alice = await devEnv.createRandomPerson();

  // Alice minting a capacity creditrs NFT
  const aliceCcNft = await alice.mintCapacityCreditsNFT();

  // Alice creating a capacity delegation authSig
  const aliceCcAuthSig = await alice.createCapacityDelegationAuthSig();
};
```

## TinnyPerson Class API

The `TinnyPerson` class encapsulates various functionalities to manage wallet operations, authentication, and contract interactions for testing purposes. Below is a detailed API documentation:

### Alice's Properties

| Property             | Description                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `privateKey`         | The private key used to instantiate the wallet associated with the TinnyPerson instance.                                                    |
| `wallet`             | An `ethers.Wallet` instance created using the provided `privateKey` and connected to the specified provider.                                |
| `siweMessage`        | A string that holds the Sign-In with Ethereum (SIWE) message used for authentication.                                                       |
| `pkp`                | EOA/Hot wallet owned PKP NFT                                                                                                                |
| `authSig`            | An `AuthSig` object that stores the authentication signature derived from the SIWE message.                                                 |
| `authMethod`         | An `AuthMethod` object representing the authentication method used, typically related to blockchain wallet authentication.                  |
| `authMethodOwnedPkp` | PKP information specifically tied to the authentication method of the wallet.                                                               |
| `contractsClient`    | An instance of `LitContracts`, used to interact with Lit Protocol smart contracts for operations such as minting tokens or PKP NFTs.        |
| `provider`           | An `ethers.providers.JsonRpcProvider` instance connected to the blockchain network specified in `envConfig`.                                |
| `loveLetter`         | A `Uint8Array` containing a keccak256 hashed value, typically used as unsigned data to be passed to the `executeJs` and `pkpSign` functions |

### Methods

| Method                                       | Description                                                                                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `constructor({privateKey, envConfig})`       | Initializes a new instance of `TinnyPerson` with the specified private key and environment configuration. Sets up the wallet and provider based on these settings.                       |
| `spawn()`                                    | Performs several operations to set up the TinnyPerson instance fully, including authentication and contract client setup. It also mints a PKP using the specified authentication method. |
| `mintCapacityCreditsNFT()`                   | Mints a Capacity Credits NFT based on the `REQUEST_PER_KILOSECOND` setting in `envConfig`. Returns the token ID of the minted NFT.                                                       |
| `createCapacityDelegationAuthSig(addresses)` | Mints a Capacity Credits NFT and creates an authentication signature for delegating capacity, which can be used to authorize other addresses to use the minted credits.                  |

##

# esbuild benchmark

```ts

// test-bundle-speed.ts
export const testBundleSpeed = async (devEnv: TinnyEnvironment) => {
  const a = await import('@lit-protocol/lit-node-client');
  const b = await import('@lit-protocol/contracts-sdk');
  const c = await import('@lit-protocol/auth-helpers');
  const d = await import('@lit-protocol/constants');
  const e = await import('@lit-protocol/lit-auth-client');

  console.log(a, b, c, d, e);
};
----------------
Build time: 77ms
```
