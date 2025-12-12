// import { NagaDevModule } from './networks/vNaga/envs/naga-rc-naga-2025-04-04/naga-dev.module';
import type { NagaLocalModule } from './networks/vNaga';
import type { NagaDevModule } from './networks/vNaga';
import type { NagaTestModule } from './networks/vNaga';
import type { NagaStagingModule } from './networks/vNaga';
import type { NagaMainnetModule } from './networks/vNaga';
import type { NagaProtoModule } from './networks/vNaga';
import type { NagaModule } from './networks/vNaga';
import type { DatilDevModule } from './networks/vDatil';
import type { DatilTestModule } from './networks/vDatil';
import type { DatilModule } from './networks/vDatil';

// Network modules
export {
  // nagaDev,
  // naga,
  nagaStaging,
  nagaLocal,
  nagaDev,
  nagaTest,
  nagaMainnet,
  nagaProto,
  naga,
} from './networks/vNaga';
export { 
  datilDev, 
  datilTest, 
  datil 
} from './networks/vDatil';

// Network module types
export type { NagaLocalModule } from './networks/vNaga';
export type { NagaDevModule } from './networks/vNaga';
export type { NagaTestModule } from './networks/vNaga';
export type { NagaStagingModule } from './networks/vNaga';
export type { NagaMainnetModule } from './networks/vNaga';
export type { NagaProtoModule } from './networks/vNaga';
export type { NagaModule } from './networks/vNaga';
export type { DatilDevModule } from './networks/vDatil';
export type { DatilTestModule } from './networks/vDatil';
export type { DatilModule } from './networks/vDatil';
export type {
  DatilDevEnvironment,
  DatilTestEnvironment,
  DatilEnvironment,
} from './networks/vDatil';

// All Network modules
export type LitNetworkModule =
  | NagaLocalModule
  | NagaDevModule
  | NagaTestModule
  | NagaStagingModule
  | NagaMainnetModule
  | NagaProtoModule
  | NagaModule
  | DatilDevModule
  | DatilTestModule
  | DatilModule;

// ----- types
export type { ConnectionInfo } from './networks/vNaga/shared/managers/LitChainClient/types';
export type { PKPStorageProvider } from './storage/types';

// Schema types
export type { MintRequestRaw } from './networks/vNaga/shared/managers/LitChainClient/schemas/MintRequestSchema';

// ----- re-exports for SDK consumers
export type { ExpectedAccountOrWalletClient } from './networks/vNaga/shared/managers/contract-manager/createContractsManager';
export { PKPPermissionsManager } from './networks/vNaga/shared/managers/LitChainClient/apis/highLevelApis/PKPPermissionsManager';
export { PaymentManager } from './networks/vNaga/shared/managers/LitChainClient/apis/highLevelApis/PaymentManager/PaymentManager';
export type {
  GenericTxRes,
  LitTxRes,
} from './networks/vNaga/shared/managers/LitChainClient/apis/types';
export type { PKPData } from './networks/vNaga/shared/managers/LitChainClient/schemas/shared/PKPDataSchema';
export type { AuthMethod } from './networks/vNaga/shared/managers/LitChainClient/apis/highLevelApis/PKPPermissionsManager/handlers/getPermissionsContext';
export type { PkpIdentifierRaw } from './networks/vNaga/shared/managers/LitChainClient/apis/rawContractApis/permissions/utils/resolvePkpTokenId';
export { getMaxPricesForNodeProduct } from './networks/vNaga/shared/managers/pricing-manager/getMaxPricesForNodeProduct';
export { getUserMaxPrice } from './networks/vNaga/shared/managers/pricing-manager/getUserMaxPrice';
export { PRODUCT_IDS } from './networks/vNaga/shared/managers/pricing-manager/constants';
export { PricingContextSchema } from './networks/vNaga/shared/managers/pricing-manager/schema';
export { issueSessionFromContext } from './networks/vNaga/shared/managers/session-manager/issueSessionFromContext';
export { resolveKeysetForPkp } from './networks/shared/keyset-resolver';
