# Lit Protocol JS SDK Refactor Plan: Decoupling and Separation of Concerns

## Goal

Refactor the SDK to decouple the `LitNodeClient` from higher-level logic and improve separation of concerns among modules. This aims to simplify `LitNodeClient` to a pure request/response handler, move orchestration and state management to `LitClient`, dismantle the existing `LitCore`, and make the SDK more modular and easier to maintain for different network versions.

## `LitCore` Dismantling

The existing `LitCore` class will be dismantled. Its responsibilities will be redistributed as follows:
*   **Low-level node communication & promise handling**: Moved to the new, simplified `LitNodeClient`.
*   **High-level connection lifecycle, state management (epoch, blockhash, network keys), and orchestration**: Moved to `LitClient`.
*   **Utilities (crypto, etc.)**: Moved to dedicated utility modules or alongside their primary users.

## Proposed Module Structure & Responsibilities

1.  **`LitAuthManager`**:
    *   Central hub for authentication operations.
    *   Manages registered instances of `LitAuthProvider`.
    *   Uses a configured `LitAuthStorageProvider` for persistence.
    *   Contains logic for generating `AuthenticationContext` (for EOA & PKP flows).
        *   Orchestrates calls to `LitAuthProvider.authenticate()`.
        *   For PKPs, houses the session signing logic (previously `_signSessionKey`), using `LitClient` (and its `LitNodeClient` / `LitNetwork`) for node interactions.
        *   Fetches necessary dynamic data (like `nonce`) via `LitClient` to pass to `LitAuthProvider.authenticate()`.
    *   Handles PKP-specific auth actions like claiming/minting (potentially delegating relay interaction to `LitClient`).
    *   Manages session key utilities (`_getSessionKey`, `_getSessionKeyUri`).

2.  **`LitAuthProvider` (Interface & Implementations)**:
    *   **Purpose**: Abstract interaction with a *specific external authentication system* (e.g., Google, Metamask).
    *   **Focus**: Solely on performing the external authentication step and deriving the Auth Method ID.
    *   **Responsibilities**:
        *   `authenticate(options?: AuthenticateOptions)`: Implement the specific auth flow (e.g., OAuth redirect/popup, wallet signature). Receives dynamic data like `nonce` from `LitAuthManager` via `options`. Returns a standardized `LitAuthMethod`.
        *   `getAuthMethodId(authMethod: LitAuthMethod)`: Implement the logic to calculate the unique Lit Protocol ID for the given auth method.
    *   **Dependencies**: Should *not* depend on `LitNodeClient` or `IRelay`. Provider-specific configuration (e.g., OAuth client IDs) is passed via constructor options.
    *   **PKP Logic**: Does *not* contain PKP management logic (minting, fetching, claiming).

3.  **`LitAuthStorageProvider` (Interface & Implementations)**:
    *   **Purpose**: Provide a generic interface for persisting and retrieving authentication state (`LitAuthData`) managed by `LitAuthManager`.
    *   **Responsibilities**: Implement `get`, `set`, `delete`, `clear` methods for a specific storage mechanism (localStorage, sessionStorage, server-side, in-memory, etc.).
    *   **`LitAuthData` Structure (Conceptual)**: Contains `authMethod`, potentially `pkpAuthSig`/`SessionSigs`, `sessionKey`, `expiration`.

4.  **`LitNodeClient` (Simplified)**:
    *   **Purely low-level node communication handler.**
    *   Sends raw requests (`_sendCommandToNode`, `generatePromise`).
    *   Performs raw node handshakes (`_handshakeWithNode`).
    *   Manages node response promises (`_getNodePromises`, `_handleNodePromises`).
    *   Handles low-level node errors (`_throwNodeError`).
    *   *Unaware* of network state, connection lifecycle, request formatting, or response processing logic.

5.  **`LitNetwork`**:
    *   Encapsulates specifics of a Lit Network version.
    *   Holds network configuration (`LitChainConfig`, endpoints, keys).
    *   **Creates network-specific request bodies**.
    *   **Processes raw node responses** specific to the network.

6.  **`LitChainClient`**:
    *   Handles direct blockchain interactions.

7.  **`LitClient` (Orchestrator & State Manager)**:
    *   Main high-level developer API & central orchestrator.
    *   **Manages overall connection lifecycle**: `connect`, `disconnect`, `ready` state.
    *   **Holds SDK state**: `networkPubKeySet`, `subnetPubKey`, `currentEpochNumber`, `latestBlockhash`, `serverKeys`, `connectedNodes`, bootstrap URLs, min node count.
    *   **Handles network state updates**: Epoch changes, blockhash syncing, validator data fetching.
    *   Holds and coordinates instances of `LitAuthManager`, `LitNetwork`, simplified `LitNodeClient`, `LitChainClient`.
    *   Exposes primary functions (`pkpSign`, `encrypt`, `decrypt`, `runLitAction`), orchestrating the flow: Get Context -> Create Request -> Send Request -> Process Response -> Return Result.
    *   Manages high-level configuration (e.g., `setDefaultMaxPrice`).

## Refactoring Tasks

1.  **Dismantle `LitCore` & Simplify `LitNodeClient`**:
    *   Extract all logic from `LitCore` and the current `LitNodeClient`.
    *   Create the new, simplified `LitNodeClient` containing only the low-level methods identified below.
    *   Relocate the remaining extracted logic to `LitClient`, `LitAuthManager`, `LitNetwork`, or utility modules as detailed below.
    *   **Detailed Breakdown for Logic Relocation:**
        *   **Implement in Simplified `LitNodeClient`**: `_sendCommandToNode`, `generatePromise`, `_getNodePromises`, `_handleNodePromises`, `_throwNodeError`, `_getMostCommonNodeResponse` (helper for promise handling), `_handshakeWithNode` (raw communication part), minimal constructor.
        *   **Move to `LitClient` (Connection/State/Orchestration)**: `connect`, `disconnect`, `ready` (state property), `config` (high-level parts), `networkPubKeySet`, `subnetPubKey`, `currentEpochNumber`, `latestBlockhash`, `lastBlockHashRetrieved`, `serverKeys`, `connectedNodes`, `hdRootPubkeys` (state properties), `_getValidatorData`, `_listenForNewEpoch`, `_stopListeningForNewEpoch`, `_handleStakingContractStateChange`, `_fetchCurrentEpochState`, `_epochState` (getter/setter), `_syncBlockhash`, `_runHandshakeWithBootstrapUrls`, `_getCoreNodeConfigFromHandshakeResults`, `_getProviderWithFallback`, `setDefaultMaxPrice`, `computeHDPubKey`, `computeHDKeyId`, `executeJs`, `pkpSign`, `encrypt`, `decrypt` (as orchestrator methods), `_getThreshold` (state-dependent utility).
        *   **Move to `LitAuthManager`**: `defaultAuthCallback`, `createCapacityDelegationAuthSig`, `_getSessionKey`, `_getWalletSig`, `_authCallbackAndUpdateStorageItem`, `_checkNeedToResignSessionKey`, `_signSessionKey`, `_validateSignSessionKeyResponseData`, `getSignSessionKeyShares`, `_getSessionSigs`, `getPkpAuthContext`, `_getSessionKeyUri`, `claimKeyId`.
        *   **Move to `LitNetwork` Implementations**: `_getNodePrices`, `getMaxPricesForNodeProduct`, `executeJsNodeRequest` helper, Network-specific request formatting and response processing within orchestrator methods (including share combination, response parsing), `_getIdentityParamForEncryption`, `_decryptWithSignatureShares`, `_getFallbackIpfsCode`.
        *   **Utilities**: Move general helpers (`normalizeAndStringify`, crypto functions, etc.) to dedicated util modules.

2.  **Define/Refine `LitNetwork` Abstraction**:
    *   Review and potentially extend the existing `LitNetwork` abstract class (`packages/networks/src/lib/LitNetwork.ts`) to ensure it includes methods for all network-specific logic (request creation, response processing, pricing, etc.).
    *   Implement/update concrete `LitNetwork` classes (e.g., `HabaneroNetwork`) with the logic extracted in Step 1.

3.  **Implement `LitAuthManager`, `LitAuthProvider` & `LitAuthStorageProvider` Interfaces**:
    *   Define the interfaces for `LitAuthProvider` and `LitAuthStorageProvider` based on the refined responsibilities.
    *   Create the `LitAuthManager` class.
    *   Implement `LitAuthManager`'s core logic:
        *   Provider/storage management.
        *   Move the PKP session signing logic (`_signSessionKey`) and session utilities here.
        *   Implement `getAuthContext` orchestration.
        *   Move PKP auth/claim logic here.
    *   Refactor existing authenticators (e.g., `MetamaskAuthenticator`, `GoogleAuthenticator`) to implement the new `LitAuthProvider` interface, removing disallowed dependencies and logic.

4.  **Refactor `LitClient`**:
    *   Update `LitClient` to hold and orchestrate the new modules (`LitAuthManager`, `LitNetwork`, `LitNodeClient`, `LitChainClient`).
    *   Rewrite public methods (`pkpSign`, `executeJs`, etc.) to use the new orchestration flow.

5.  **Clean Up**:
    *   Remove or merge old helper files (like `preparePkpAuthContext.ts`) into the new structure.
    *   Update imports and types across the codebase.
    *   Add tests for the new structure.


Revised LitAuthProvider Interface (Conceptual):
```ts
// Base options for all providers
interface LitAuthProviderOptions {
  // e.g., specific RPC URLs for certain chains if needed by the provider,
  // OAuth client IDs, etc.
  // Note: No LitNodeClient or IRelay here.
}

// Options passed dynamically during authentication
interface AuthenticateOptions {
  // Common options that might be needed, supplied by LitAuthManager
  nonce?: string; // e.g., for SIWE messages
  expiration?: string; // If desired session duration differs from default

  // Provider-specific dynamic options (if any)
  // e.g., for EthWallet:
  address?: string;
  chain?: string;
  domain?: string; // Potentially sourced from LitClient/AuthManager config
  origin?: string; // Potentially sourced from LitClient/AuthManager config
  statement?: string; // Optional SIWE statement addition
}

// The core interface for all auth providers
interface LitAuthProvider {
  readonly authMethodType: AUTH_METHOD_TYPE_VALUES;

  // Constructor takes LitAuthProviderOptions

  // Performs authentication with the external service.
  // Receives dynamic options (like nonce) from LitAuthManager.
  // Returns the standardized authentication proof.
  authenticate(options?: AuthenticateOptions): Promise<LitAuthMethod>;

  // Calculates the unique ID used by Lit Protocol for this auth method + credential.
  getAuthMethodId(authMethod: LitAuthMethod): Promise<string>;

  // Optional: signOut() or disconnect() method if applicable for the provider's session management?
}
```

Revised LitAuthStorageProvider Interface (Conceptual):


```ts
// Data structure stored by the provider
interface LitAuthData {
  authMethod: LitAuthMethod;
  // For PKPs, this would also include the generated AuthSig/SessionSigs
  pkpAuthSig?: AuthSig; // Or SessionSigsMap equivalent if we store that directly
  sessionKey?: SessionKeyPair; // If managing session keys here
  expiration?: string;
  // Other relevant metadata
}

// Interface for the storage mechanism
interface LitAuthStorageProvider {
  get(key: string): Promise<LitAuthData | null>;
  set(key: string, value: LitAuthData): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```