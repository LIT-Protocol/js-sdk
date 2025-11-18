## Architecture Improvements Roadmap

- [ ] **Decouple auth provider layers**
  - Extract a lean `lit-auth-service` module (hooks + context) from the 2.4k‑line `LitAuthProvider`.
  - Move modal UI, funding gate, and settings panes into dedicated presentational components that consume the new hooks.
  - [x] Remove the direct dependency on `PaymentManagementDashboard` inside the provider by introducing a minimal funding widget + callbacks.

- [x] **Modularize payment management**
  - Split `PaymentManagementDashboard` into headless hooks (`usePaymentManager`, `useLedgerBalance`, `useWithdrawals`) and small visual components.
  - Reuse shared types from `protectedApp/types.ts` instead of redefining them locally.
  - Replace inline style objects with styled components or utility classes for consistency.

- [ ] **Unify chain configuration + ledger helpers**
  - [x] Move the canonical chain list and ledger balance utilities into a shared `src/domain/lit/chains.ts`.
  - [x] Update `PKPSelectionSection`, wallet utilities, and dashboards to import the shared helpers instead of keeping local copies.

- [ ] **Route-level composition**
  - Define separate React Router child routes (`Playground`, `Permissions`, `Payments`) that each render focused page components.
  - Keep shared state (selected PKP, balances, toasts) in a parent provider instead of a monolithic `LoggedInDashboard`.

- [ ] **Strengthen domain typing**
  - Introduce typed service interfaces for permissions, payments, and ledger data instead of returning `any`.
  - Add discriminated unions / DTOs to the contexts so consumers know which operations and states are available without casting.
