/**
 * ProtectedApp Module Index
 * 
 * Main export file for all ProtectedApp components, contexts, and utilities
 * This provides a clean interface for importing refactored components
 */

// Contexts
export { PKPPermissionsProvider, usePKPPermissions } from './contexts/PKPPermissionsContext';

// UI Components
export * from './components/ui';

// PKP Components
export { PKPInfoCard } from './components/pkp/PKPInfoCard';

// Permission Components
export * from './components/permissions';

// Wallet Components
export * from './components/wallet';

// Layout Components (Phase 4)
export * from './components/layout';

// Dashboard Components (Phase 4)
export * from './components/dashboard';

// Types
export * from './types';

// Utilities
export * from './utils';
export {
  SUPPORTED_CHAINS,
  SUPPORTED_CHAIN_ID,
  getAllChains,
  getCustomChains,
  addCustomChain,
  removeCustomChain,
  isCustomChain,
} from "@/domain/lit/chains";

// Hooks
export { usePaymentManagerInstance } from "./hooks/usePaymentManagerInstance";
export { useLedgerBalance } from "./hooks/useLedgerBalance";
export { useWithdrawStatus } from "./hooks/useWithdrawStatus";
