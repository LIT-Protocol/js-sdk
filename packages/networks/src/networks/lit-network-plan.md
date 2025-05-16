# Lit Network Refactoring Plan

This plan outlines the steps to refactor the Lit SDK's network handling, moving towards a more modular and functional design where network-specific logic is encapsulated and orchestrated by a top-level client setup function.

## Core Goals:

1.  **Decouple `LitNodeClient` (formerly `LitCore`) from Network Specifics**: `LitNodeClient` should not know the intimate details (RPC URLs, contract addresses, specific protocols) of each supported Lit Protocol network.
2.  **Centralise Network Configuration**: Each network (Naga, Datil, etc.) should have its configuration and data-fetching logic self-contained.
3.  **Functional Approach for Network Modules**: Instead of a `LitNetwork` abstract class, use functional modules or interfaces to define and implement network capabilities.
4.  **Orchestration via `createLitClient`**: A top-level `createLitClient` (or similar) function will be responsible for instantiating/configuring the correct network module and providing it to `LitNodeClient`.

## Phase 1: Define Network Module Interface & Initial Implementation

1.  **Task: Define `LitNetworkOperations` Interface (Functional Approach)**

    - Instead of an abstract class, define a TypeScript interface (e.g., `LitNetworkOperations`) that specifies the functions a network module must provide.
    - Key functions:
      - `getNetworkName(): string`
      - `getHttpProtocol(): typeof HTTP | typeof HTTPS`
      - `getEndpoints(): typeof LIT_ENDPOINT` (or a way to derive node URLs)
      - `getContractContext(): Promise<LitContractContext>` (or the raw addresses)
      - `getRpcUrl(): string`
      - `getBootstrapUrls(nodeProtocolOverride?: typeof HTTP | typeof HTTPS): Promise<string[]>`
      - `getEpochInfo(): Promise<EpochInfo>`
      - `getMinNodeCount(): Promise<number>`
      - `getNodePrices(): Promise<{ url: string; prices: bigint[] }[]>` (if this varies significantly by network beyond what `contracts-sdk` provides)
      - `getChainConfig(): LitChainConfig`
    - This interface will replace the current `LitNetwork.ts` abstract class.

2.  **Task: Create Initial Network Configuration Files/Objects**

    - For each supported network (e.g., Naga, Datil, specific testnets), create configuration objects/files that hold static information like default RPC URLs, known contract addresses (if not dynamically fetched), default node protocol, etc.
    - Example: `nagaDevConfig.ts`, `datilConfig.ts`.

3.  **Task: Implement `NagaDevNetworkModule` (Example)**
    - Create a module (e.g., `nagaDev.ts`) that implements the `LitNetworkOperations` interface for the "naga-dev" network.
    - This module will use its configuration (from step 2) and potentially the `contracts-sdk` (like `LitContracts.getConnectionInfo` or `LitContracts.getContractAddresses`) to provide the data required by the interface.
    - This module will be primarily functional, exporting the necessary operations.

## Phase 2: Refactor `LitNodeClient` (formerly `LitCore`)

1.  **Task: Modify `LitNodeClientConfig`**

    - Remove network-specific configuration like `litNetwork` (string name), `contractContext`, `rpcUrl`, `nodeProtocol` from the direct `LitNodeClientConfig`.
    - Instead, `LitNodeClientConfig` might take a `networkModule: LitNetworkOperations` instance/object.

2.  **Task: Update `LitNodeClient` to Use `LitNetworkModule`**

    - The `LitNodeClient` constructor will accept a `LitNetworkOperations` object.
    - Internal methods like the current `_getValidatorData` (and other places where network-specific config from `this.config` is used) will now call methods on `this.networkModule`.
      - For example, instead of `this.config.litNetwork`, it might use `this.networkModule.getNetworkName()` or pass the `networkModule` itself to `LitContracts` functions if they are adapted to accept it.
      - `this._getValidatorData` would simplify to primarily orchestrating calls to `this.networkModule.getBootstrapUrls()`, `this.networkModule.getEpochInfo()`, `this.networkModule.getMinNodeCount()`, and getting the staking contract (perhaps via `this.networkModule.getContractContext()` and then instantiating).
    - The `litNetwork` string property in `LitNodeClient` (if still needed for some SDK logic) would be sourced from `this.networkModule.getNetworkName()`.

3.  **Task: Update `_fetchCurrentEpochState`**
    - This method currently calls `_getValidatorData` if `epochInfo` isn't passed. It should be updated to potentially get `epochInfo` directly from the `networkModule` if `_getValidatorData`'s role changes.

## Phase 3: Implement `createLitClient` Orchestrator

1.  **Task: Implement/Refine `createLitClient`**

    - This function will take a simple network identifier (e.g., `network: 'naga-dev' | 'datil-mainnet'`).
    - Based on the identifier, it will:
      - Load/import the corresponding network configuration.
      - Instantiate/prepare the specific `LitNetworkOperations` module (e.g., `NagaDevNetworkModule`).
      - Instantiate `LitNodeClient` with this network module.
    - Return the configured `LitNodeClient` instance.

2.  **Task: Update `LitContracts` SDK (If Necessary)**
    - Review methods like `LitContracts.getConnectionInfo` and `LitContracts.getContractAddresses`.
    - Consider if they can be adapted to take a `networkModule: LitNetworkOperations` or a more focused `NetworkConfig` object derived from the module, instead of individual parameters like `litNetwork`, `networkContext`, `rpcUrl`.
    - Alternatively, network modules themselves might call these `LitContracts` methods using their own stored configuration.

## Phase 4: Testing and Refinement

1.  **Task: Unit Tests for Network Modules**
    - Write unit tests for each network module implementation to ensure they correctly provide data according to the `LitNetworkOperations` interface.
2.  **Task: Integration Tests**
    - Update/create integration tests to verify `LitNodeClient` functions correctly with different network modules orchestrated by `createLitClient`.
3.  **Task: Deprecate Old Configuration Paths**
    - Gradually deprecate direct network configuration on `LitNodeClient` if the new `createLitClient` and network module approach is adopted.

## Open Questions/Considerations:

- **Dynamic vs. Static Configuration**: How much of the network config (RPCs, contract addresses) can be static vs. needing dynamic fetching (e.g., from a service discovery or a resolver contract for custom networks)? The network modules should handle this.
- **Error Handling**: Standardise error handling for network data fetching within the network modules.
- **Singleton/Caching**: Should network modules cache data like contract context or bootstrap URLs? If so, how is this managed functionally?
- **Merging `LitCore` into `LitNodeClient`**: This is an ongoing parallel effort. The `LitNetworkModule` passed to `LitNodeClient` will serve the merged class.
