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

## Refactoring Tasks Checklist

### 1. Dismantle `LitCore` & Simplify `LitNodeClient`
- [ ] Extract all logic from `LitCore`.
- [ ] Extract non-communication logic from the current `LitNodeClient`.
- [ ] Create the new, simplified `LitNodeClient` class/interface.
- [ ] **Implement Simplified `LitNodeClient` Methods:**
    - [ ] `_sendCommandToNode`
    - [ ] `generatePromise`
    - [ ] `_getNodePromises`
    - [ ] `_handleNodePromises`
    - [ ] `_throwNodeError`
    - [ ] `_getMostCommonNodeResponse` (helper)
    - [ ] `_handshakeWithNode` (raw communication part)
    - [ ] Minimal constructor
- [ ] **Relocate Logic to `LitClient` (Connection/State/Orchestration):**
    - [ ] `connect`, `disconnect`, `ready` state property
    - [ ] High-level `config` parts
    - [ ] State properties (`networkPubKeySet`, `subnetPubKey`, `currentEpochNumber`, `latestBlockhash`, `lastBlockHashRetrieved`, `serverKeys`, `connectedNodes`, `hdRootPubkeys`)
    - [ ] `_getValidatorData`
    - [ ] Epoch handling (`_listenForNewEpoch`, `_stopListeningForNewEpoch`, `_handleStakingContractStateChange`, `_fetchCurrentEpochState`, `_epochState` getter/setter)
    - [ ] `_syncBlockhash`
    - [ ] `_runHandshakeWithBootstrapUrls`
    - [ ] `_getCoreNodeConfigFromHandshakeResults`
    - [ ] `_getProviderWithFallback`
    - [ ] `setDefaultMaxPrice`
    - [ ] `computeHDPubKey`, `computeHDKeyId`
    - [ ] Orchestrator methods (`executeJs`, `pkpSign`, `encrypt`, `decrypt`)
    - [ ] `_getThreshold` (state-dependent utility)
- [ ] **Relocate Logic to `LitAuthManager`:**
    - [ ] `defaultAuthCallback`
    - [ ] `createCapacityDelegationAuthSig`
    - [ ] `_getSessionKey`, `_getSessionKeyUri`
    - [ ] `_getWalletSig`
    - [ ] `_authCallbackAndUpdateStorageItem`
    - [ ] `_checkNeedToResignSessionKey`
    - [ ] `_signSessionKey`
    - [ ] `_validateSignSessionKeyResponseData`
    - [ ] `getSignSessionKeyShares`
    - [ ] `_getSessionSigs`
    - [ ] `getPkpAuthContext`
    - [ ] `claimKeyId`
- [ ] **Relocate Logic to `LitNetwork` Implementations:**
    - [ ] `_getNodePrices`
    - [ ] `getMaxPricesForNodeProduct`
    - [ ] `executeJsNodeRequest` helper
    - [ ] Network-specific request formatting
    - [ ] Network-specific response processing (incl. share combination, response parsing)
    - [ ] `_getIdentityParamForEncryption`
    - [ ] `_decryptWithSignatureShares`
    - [ ] `_getFallbackIpfsCode`
- [ ] **Relocate Utilities:**
    - [ ] Move general helpers (`normalizeAndStringify`, crypto functions, etc.) to dedicated util modules.

### 2. Define/Refine `LitNetwork` Abstraction
- [ ] Review/extend existing `LitNetwork` abstract class (`packages/networks/src/lib/LitNetwork.ts`) for all network-specific methods.
- [ ] Implement/update concrete `LitNetwork` classes (e.g., `HabaneroNetwork`) with relocated logic.

### 3. Implement `LitAuthManager`, `LitAuthProvider` & `LitAuthStorageProvider` Interfaces
- [ ] Define `LitAuthProvider` interface (using conceptual example below).
- [ ] Define `LitAuthStorageProvider` interface (using conceptual example below).
- [ ] Create `LitAuthManager` class.
- [ ] Implement `LitAuthManager` core logic:
    - [ ] Provider registration/management.
    - [ ] Storage provider integration.
    *   [ ] Move PKP session signing logic (`_signSessionKey`) & session utilities.
    *   [ ] Implement `getAuthContext` orchestration.
    *   [ ] Move PKP auth/claim logic (`claimKeyId`).
- [ ] Refactor existing authenticators (e.g., `MetamaskAuthenticator`, `GoogleAuthenticator`) to implement `LitAuthProvider`.
    - [ ] Remove disallowed dependencies (`LitNodeClient`, `IRelay`).
    - [ ] Remove PKP management logic.

### 4. Refactor `LitClient`
- [ ] Update `LitClient` class definition.
- [ ] Add instance variables for `LitAuthManager`, `LitNetwork`, `LitNodeClient`, `LitChainClient`.
- [ ] Update `LitClient` constructor to initialize/inject dependencies.
- [ ] Rewrite public methods (`pkpSign`, `executeJs`, `encrypt`, `decrypt`, etc.) to orchestrate calls through the new modules.
- [ ] Implement connection lifecycle methods (`connect`, `disconnect`).
- [ ] Implement state management logic (epoch handling, blockhash syncing).

### 5. Clean Up & Testing
- [ ] Remove or merge old helper files (e.g., `preparePkpAuthContext.ts`).
- [ ] Update imports and type references across the codebase.
- [ ] Remove the old `LitCore` class.
- [ ] Add/update unit and integration tests for the new structure:
    - [ ] `LitNodeClient` (low-level communication mocks).
    - [ ] `LitNetwork` implementations (request/response processing).
    - [ ] `LitAuthManager` (auth flows, context generation).
    - [ ] `LitAuthProvider` implementations (mocking external services).
    - [ ] `LitClient` (orchestration, state management).

## Conceptual Interface Examples

### Revised `LitAuthProvider` Interface (Conceptual)
```typescript
import { AUTH_METHOD_TYPE_VALUES, LitAuthMethod } from '@lit-protocol/types'; // Assuming types exist

// Base options for all providers
interface LitAuthProviderOptions {
  // Provider-specific static configuration (e.g., OAuth client IDs)
  // Note: No LitNodeClient or IRelay here.
  [key: string]: any;
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

  [key: string]: any;
}

// The core interface for all auth providers
interface LitAuthProvider {
  readonly providerName: string; // e.g., 'google', 'metamask'
  readonly authMethodType: AUTH_METHOD_TYPE_VALUES;

  // Constructor takes static LitAuthProviderOptions

  /**
   * Performs authentication with the external service.
   * Receives dynamic options (like nonce) from LitAuthManager.
   * Returns the standardized authentication proof.
   */
  authenticate(options?: AuthenticateOptions): Promise<LitAuthMethod>;

  /**
   * Calculates the unique ID used by Lit Protocol for this auth method + credential.
   */
  getAuthMethodId(authMethod: LitAuthMethod): Promise<string>;

  // Optional: signOut() or disconnect() method if applicable for the provider's session management
  // signOut?(): Promise<void>;
}
```

### Revised `LitAuthStorageProvider` Interface (Conceptual)
```typescript
import { LitAuthMethod, AuthSig, SessionKeyPair } from '@lit-protocol/types'; // Assuming types exist

// Data structure stored by the provider
interface LitAuthData {
  authMethod: LitAuthMethod;
  // For PKPs, this would also include the generated AuthSig/SessionSigs
  pkpAuthSig?: AuthSig; // Or SessionSigsMap equivalent if we store that directly
  sessionKey?: SessionKeyPair; // If managing session keys here
  expiration?: string; // Expiration of the stored auth data/session
  // Other relevant metadata
}

// Interface for the storage mechanism
interface LitAuthStorageProvider {
  /** Retrieves authentication data for a given key (e.g., user identifier or session ID). */
  get(key: string): Promise<LitAuthData | null>;

  /** Stores authentication data associated with a key. */
  set(key: string, value: LitAuthData): Promise<void>;

  /** Deletes authentication data for a specific key. */
  delete(key: string): Promise<void>;

  /** Clears all authentication data managed by this provider. */
  clear(): Promise<void>;
}
```

## Conceptual Usage Examples

Here's how a developer might use the refactored `LitClient` with different configurations:


### Example 2: Using Manzano Network with Google Auth for PKP Signing

```typescript
import { LitClient, ManzanoNetwork } from '@lit-protocol/client';
import { GoogleProvider } from '@lit-protocol/auth-browser';
import { SessionStorageProvider } from '@lit-protocol/auth-storage-browser';

async function runPkpExample() {
  // 1. Configure the Client
  const client = new LitClient({
    litNetwork: new ManzanoNetwork(), // Specify Manzano network
    authStorage: new SessionStorageProvider(), // Use SessionStorage
    debug: false,
  });

  // 2. Register the Google Auth Provider with its specific config
  client.registerAuthProvider(new GoogleProvider({ clientId: 'YOUR_GOOGLE_CLIENT_ID' }));

  // 3. Connect
  await client.connect();

  // 4. Get PKP Auth Context using Google
  // This involves triggering the Google sign-in flow via the provider
  let pkpAuthContext;
  try {
    pkpAuthContext = await client.getAuthContext({
      provider: 'google', // Specify the registered provider
      // Additional options for the provider might be needed here
      // like specifying the PKP public key if known
      // pkpPublicKey: '0x...', // Optional: Associate with a specific PKP
      // redirectUri: 'http://localhost:3000/google-callback' // Often needed for OAuth
    });
    console.log('Authenticated with Google for PKP:', pkpAuthContext.pkpPublicKey);
  } catch (error) {
    console.error('Google PKP Authentication failed:', error);
    return;
  }

  // 5. Perform a PKP signing operation
  const messageToSign = new TextEncoder().encode('Sign this message with my PKP');
  try {
    const signature = await client.pkpSign({
      authContext: pkpAuthContext, // Provide the context obtained above
      toSign: messageToSign,
      pubKey: pkpAuthContext.pkpPublicKey, // Usually derived within the context
    });

    console.log('PKP Signature:', signature);
    // TODO: Add verification logic using the signature and pkpPublicKey

  } catch (error) {
    console.error('PKP signing failed:', error);
  }

  // 6. Disconnect
  await client.disconnect();
}

runPkpExample();
```

### Example 3: Running a Lit Action with a specified Auth Method (e.g., Discord)

```typescript
import { LitClient, HabaneroNetwork } from '@lit-protocol/client';
import { DiscordProvider } from '@lit-protocol/auth-browser';
import { MemoryStorageProvider } from '@lit-protocol/auth-storage-memory'; // Example: In-memory storage

async function runLitActionExample() {
  // 1. Configure Client
  const client = new LitClient({
    litNetwork: new HabaneroNetwork(),
    authStorage: new MemoryStorageProvider(),
  });

  // 2. Register Discord Provider
  client.registerAuthProvider(new DiscordProvider({ clientId: 'YOUR_DISCORD_CLIENT_ID' }));

  // 3. Connect
  await client.connect();

  // 4. Get Auth Context for the desired PKP via Discord
  let discordPkpContext;
  try {
    discordPkpContext = await client.getAuthContext({
      provider: 'discord',
      // redirectUri: 'http://localhost:3000/discord-callback'
    });
    console.log('Authenticated with Discord for PKP:', discordPkpContext.pkpPublicKey);
  } catch (error) {
    console.error('Discord PKP Authentication failed:', error);
    return;
  }

  // 5. Execute a Lit Action requiring PKP Auth
  const litActionCode = `(
    async () => {
      const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
    }
  )();`;

  const jsParams = {
    toSign: [/* some data */],
    publicKey: discordPkpContext.pkpPublicKey,
    sigName: 'actionSig',
  };

  try {
    const result = await client.executeJs({
      authContext: discordPkpContext,
      code: litActionCode,
      jsParams: jsParams,
    });

    console.log('Lit Action result:', result);
    // result might contain logs, response, signatures: result.signatures.actionSig

  } catch (error) {
    console.error('Lit Action execution failed:', error);
  }

  // 6. Disconnect
  await client.disconnect();
}

runLitActionExample();
```

