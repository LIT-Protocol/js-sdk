## Goal

Create a single source of truth for explorer network metadata (slugs, modules, tokens, auth URLs, default chains) so future networks can be onboarded by editing one object instead of touching multiple components.

## Files to update / add

1. `apps/explorer/src/domain/lit/networks.ts` (new)
2. `apps/explorer/src/domain/lit/networkDefaults.ts`
3. `apps/explorer/src/domain/lit/litChainConfig.ts`
4. `apps/explorer/src/hooks/useLitServiceSetup.ts`
5. `apps/explorer/src/lit-login-modal/LitAuthProvider.tsx`
6. `apps/explorer/src/_config.ts`
7. `apps/explorer/src/lit-login-modal/components/AuthSettingsPanel.tsx`
8. `apps/explorer/src/lit-logged-page/LoggedInDashboard.tsx`
9. `apps/explorer/src/lit-login-modal/PKPSelectionSection.tsx`
10. `apps/explorer/src/lit-logged-page/protectedApp/components/pkp/PKPInfoCard.tsx`
11. `apps/explorer/src/lit-logged-page/protectedApp/components/PaymentManagement/PaymentManagementDashboard.tsx`
12. `apps/explorer/src/main.tsx`

## Planned changes

### 1. `domain/lit/networks.ts` (new)
- **Before**: No registry; constants are duplicated across multiple files.
- **After**: Export a `NETWORKS` object keyed by `SupportedNetworkName`. Each entry contains `label`, `isTestnet`, `chainSlug`, `ledgerSymbol`, `authEnvVar`, and `moduleKey`. Also export derived helpers (`SUPPORTED_NETWORKS`, `getNetworkMeta`, `getAuthUrlForNetwork(env)`, etc.).

### 2. `domain/lit/networkDefaults.ts`
- **Before**: Manually defines `DEFAULT_CHAIN_BY_NETWORK` and `TESTNET_NETWORKS`.
- **After**: Re-export `SupportedNetworkName`, `SUPPORTED_NETWORKS`, `getDefaultChainForNetwork`, and `isTestnetNetwork` from the new registry so there is no bespoke map here.

### 3. `domain/lit/litChainConfig.ts`
- **Before**: Hard-codes Lit chain RPC/Explorer URLs and viem config.
- **After**: Export a `getLitChainConfig(env)` helper that reads env overrides once and feeds both the Ledger registry and wagmi config. Remove duplicate Chronicle definitions from other files by exporting `chronicleChainConfig`.

### 4. `hooks/useLitServiceSetup.ts`
- **Before**: Imports `@lit-protocol/networks` directly, builds `NETWORK_MODULES` locally, relies on literal strings.
- **After**: Import `LIT_NETWORK_MODULES` from the registry, so the hook simply looks up the module by `config.networkName`. Removes duplicate destructuring and string arrays.

### 5. `lit-login-modal/LitAuthProvider.tsx`
- **Before**: Contains its own `NETWORK_MODULES` and re-creates the `supportedNetworks` list, auth-service default map, and testnet logic.
- **After**: Consume the registry helpers. `supportedNetworks` defaults to `SUPPORTED_NETWORKS`. `forceNetworkSelection` uses `LIT_NETWORK_MODULES`. `authServiceUrlMap` seeds from `AppEnv.authUrls`. `shouldDisplayNetworkMessage` calls `isTestnetNetwork`.

### 6. `_config.ts`
- **Before**: Reads env vars inline and exports `APP_INFO`.
- **After**: Import `AppEnv` (new helper) so URLs are sourced from one place. Optionally expose `networkAuthServiceUrls` directly from the registry to avoid per-file duplication.

### 7. `lit-login-modal/components/AuthSettingsPanel.tsx`
- **Before**: Builds the network tab list from props and hard-coded labels.
- **After**: Map over `SUPPORTED_NETWORKS` and read labels/testnet badges from the registry. This ensures new networks automatically appear with correct metadata.

### 8. `lit-logged-page/LoggedInDashboard.tsx`
- **Before**: Tracks `selectedChain` default via inline `useEffect` + `getDefaultChainForNetwork`.
- **After**: Initialize state from `NETWORKS[currentNetworkName].chainSlug` and rely on the registry for network badges (e.g., the header pill).

### 9. `lit-login-modal/PKPSelectionSection.tsx`
- **Before**: Determines ledger symbol/testnet state via manual checks.
- **After**: Use the registry meta to decide which RPC to hit and which ledger symbol to display, avoiding local ternaries.

### 10. `lit-logged-page/protectedApp/components/pkp/PKPInfoCard.tsx`
- **Before**: Defines `ledgerUnit` using hard-coded comparisons.
- **After**: Import `NETWORKS` meta and read `ledgerSymbol`, so the UI automatically reflects any future testnet/mainnet differences.

### 11. `lit-logged-page/protectedApp/components/PaymentManagement/PaymentManagementDashboard.tsx`
- **Before**: Similar duplicate logic for ledger symbol and chain labels.
- **After**: Use registry meta for chain labels/ledger unit, keeping UI consistent.

### 12. `main.tsx`
- **Before**: Repeats Chronicle/Lit RPC constants and logs env vars manually.
- **After**: Consume `chronicleChainConfig` / `getLitChainConfig` plus `AppEnv` for logging. Wagmi config becomes data-driven.

## Testing

1. `pnpm nx run explorer:lint`
2. `pnpm nx run explorer:build`
3. Smoke-test the explorer dev server (`pnpm nx serve explorer`) to ensure the network selector and auth modal show the new options and ledger balances display correct tokens.
