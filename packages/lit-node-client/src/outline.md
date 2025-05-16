# Refactoring Plan: LitCore -> Thin Wrapper, LitClient -> Orchestrator

## Goal

Refactor the current architecture where `LitCore` handles both low-level node communication and higher-level orchestration/state management. The new architecture will separate these concerns:

1.  **Thin Network Wrapper (Conceptual: `LitNodeApi`)**: Responsible _only_ for making individual HTTP requests to specific Lit node endpoints and handling basic request/response formatting and errors for that single interaction.
2.  **Orchestration Layer (`LitClient` / `createLitClient`)**: Responsible for managing the overall process, interacting with multiple nodes (using the thin wrapper), handling multi-node timeouts, performing consensus logic, verifying attestations, managing client-side state, and providing the user-facing SDK API.

**Ultimate Outcome:** This refactoring aims to **eliminate the need for the `LitCore` and `LitNodeClient` classes**, replacing them with the thin `LitNodeApi` wrapper and the `createLitClient` factory function + orchestration logic.

## Proposed File Structure

- **`packages/lit-node-client/src/lib/lit-node-api.ts` (New File):**
  - Contains the thin network wrapper functions (`handshake`, `executeJs`, `signSessionKey`, etc.) and the internal `sendNodeRequest` helper.
- **`packages/lit-client/src/utils/` (New Directory & Files):**
  - Houses helper functions used specifically for `LitClient` orchestration.
  - **`handshake-helpers.ts`:** Contains `processHandshakeResponse` (attestation verification) and `getCoreNodeConfig` (consensus).
  - **`identifiers.ts`:** Contains `getNewRequestId` and `getRandomHexString`.
  - **`mostCommonValue.ts`:** Utility for consensus logic (if not already centrally available).
  - _(Potentially other utility files as needed for orchestration helpers)_
- **`packages/lit-client/src/index.ts` (Existing File - Refactored):**
  - The main entry point (`createLitClient` factory function).
  - Imports and orchestrates calls to `lit-node-api` and `lit-client/utils`.
  - Defines the structure and methods of the returned client object.
- **`packages/lit-node-client/src/outline.md` (This File):**
  - Tracks the refactoring plan.

## Responsibilities

### Thin Network Wrapper (`LitNodeApi` - New Module/Functions)

- **Location:** `packages/lit-node-client/src/lib/lit-node-api.ts`
- **Input**: Node URL, endpoint identifier, request-specific data, request ID.
- **Actions**:
  - Construct full request URL.
  - Set required HTTP headers (Content-Type, SDK version, Request ID, etc.).
  - Serialize request body (JSON).
  - Execute `fetch` request.
  - Parse JSON response.
  - Handle basic network errors and non-OK HTTP statuses _for the single request_ (throw `NetworkError` or `NodeError`).
- **Output**: Parsed JSON response body on success, or throws an error.
- **Excludes**: Multi-node coordination, consensus logic, cross-node timeouts, complex error handling across nodes, attestation _verification_, state management.

### Orchestration Layer (`LitClient` / `createLitClient`)

- **Location:** `packages/lit-client/src/index.ts` (using helpers from `packages/lit-client/src/utils/`)
- **Input**: Network configuration module, user configuration (timeouts, attestation preferences).
- **Actions**:
  - Obtain bootstrap URLs (e.g., from `StateManager`).
  - Orchestrate calls to the `LitNodeApi` thin wrapper for multiple nodes (e.g., `Promise.all` for handshakes).
  - Manage timeouts for multi-node operations (`Promise.race`).
  - Generate necessary inputs for the thin wrapper (e.g., challenges via `getRandomHexString`).
  - Assign unique request IDs (via `getNewRequestId`).
  - Collect responses from the thin wrapper.
  - Process individual responses (e.g., verify attestations via `processHandshakeResponse`).
  - Perform consensus logic (`getCoreNodeConfig` using `mostCommonValue`) on collected responses.
  - Handle errors spanning multiple nodes (e.g., insufficient successful responses, timeout, consensus failure).
  - Manage client-side state derived from interactions (e.g., `coreNodeConfig`, `connectedNodes`).
  - **Reimplement the user-facing API methods** (e.g., `disconnect`, `getLatestBlockhash`, `executeJs`, `signSessionKey`, PKP operations, etc.) on the returned client object. These methods will internally use the `LitNodeApi` for network calls and apply necessary orchestration/processing logic.
- **Output**: An initialized client object with derived configuration and API methods.

## Refactoring Steps

1.  Create the new files and directories as outlined in the "Proposed File Structure" section.
2.  Implement the `LitNodeApi` module (`lit-node-api.ts`), starting with the `sendNodeRequest` helper and the `handshake` function.
3.  Implement the necessary helper functions in `packages/lit-client/src/utils/` (`identifiers.ts`, `handshake-helpers.ts`, etc.).
4.  Refactor `createLitClient` in `packages/lit-client/src/index.ts`:
    - Remove direct `fetch` calls or logic duplicated from `LitCore`.
    - Import and use `LitNodeApi.handshake` within the `Promise.all` loop for handshake orchestration.
    - Import and use the utility functions for response processing, consensus, and ID generation.
    - Ensure configuration (`connectTimeout`, `checkNodeAttestation`) is correctly passed down or used.
5.  Define the structure of the object returned by `createLitClient`, including the derived `config` and `connectedNodes`.
6.  Implement the essential user-facing methods on the returned client object (start with `disconnect`, `getLatestBlockhash`).
7.  Incrementally implement the remaining user-facing methods (e.g., `executeJs`, `signSessionKey`, etc.), following the pattern: orchestrate `LitNodeApi` calls -> collect results -> process/combine -> return.
8.  Gradually deprecate and remove the complex orchestration/state logic and eventually the entire classes from `LitCore` and `LitNodeClient`.

## Conceptual Code Examples

### Thin Wrapper (`
