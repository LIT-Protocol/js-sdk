// ==================== Imports ====================
import { getPermittedActions } from './rawContractApis/permissions/read/getPermittedActions';
import { getPermittedAddresses } from './rawContractApis/permissions/read/getPermittedAddresses';
import { isPermittedAction } from './rawContractApis/permissions/read/isPermittedAction';
import { isPermittedAddress } from './rawContractApis/permissions/read/isPermittedAddress';
import { addPermittedAction } from './rawContractApis/permissions/write/addPermittedAction';
import { addPermittedAddress } from './rawContractApis/permissions/write/addPermittedAddress';
import { removePermittedAction } from './rawContractApis/permissions/write/removePermittedAction';
import { removePermittedAddress } from './rawContractApis/permissions/write/removePermittedAddress';
import { tokenOfOwnerByIndex } from './rawContractApis/pkp/read/tokenOfOwnerByIndex';
import { claimAndMintNextAndAddAuthMethodsWithTypes } from './rawContractApis/pkp/write/claimAndMintNextAndAddAuthMethodsWithTypes';
import { mintNextAndAddAuthMethods } from './rawContractApis/pkp/write/mintNextAndAddAuthMethods';
import {
  getNodesForRequest,
  PRODUCT_IDS,
} from './rawContractApis/pricing/getNodesForRequest';

// Ledger APIs
import { getBalance } from './rawContractApis/ledger/read/getBalance';
import { getStableBalance } from './rawContractApis/ledger/read/getStableBalance';
import { getWithdrawRequest } from './rawContractApis/ledger/read/getWithdrawRequest';
import { getUserWithdrawDelay } from './rawContractApis/ledger/read/getUserWithdrawDelay';
import { deposit } from './rawContractApis/ledger/write/deposit';
import { depositForUser } from './rawContractApis/ledger/write/depositForUser';
import { requestWithdraw } from './rawContractApis/ledger/write/requestWithdraw';
import { withdraw } from './rawContractApis/ledger/write/withdraw';

// High-level APIs
import { mintPKP } from './highLevelApis/mintPKP/mintPKP';
import { mintWithEoa } from './highLevelApis/mintPKP/mintWithEoa';
import { mintWithMultiAuths } from './highLevelApis/mintPKP/mintWithMultiAuths';
import { PKPPermissionsManager } from './highLevelApis/PKPPermissionsManager';
import { PaymentManager } from './highLevelApis/PaymentManager/PaymentManager';
import {
  getNodePrices,
  getPriceFeedInfo,
} from './highLevelApis/priceFeed/priceFeedApi';
import { getConnectionInfo } from './highLevelApis/connection/getConnectionInfo';

// ==================== Exports ====================
// ========== Treeshakable ==========
// Individual exports allow better tree-shaking
// export { claimAndMintNextAndAddAuthMethodsWithTypes } from "./rawContractApis/pkp/write/claimAndMintNextAndAddAuthMethodsWithTypes";
// export { mintNextAndAddAuthMethods } from "./rawContractApis/pkp/write/mintNextAndAddAuthMethods";
// export { tokenOfOwnerByIndex } from "./rawContractApis/pkp/read/tokenOfOwnerByIndex";
// export { getPermittedAddresses } from "./rawContractApis/permissions/read/getPermittedAddresses";
// export { getPermittedActions } from "./rawContractApis/permissions/read/getPermittedActions";
// export { isPermittedAddress } from "./rawContractApis/permissions/read/isPermittedAddress";
// export { isPermittedAction } from "./rawContractApis/permissions/read/isPermittedAction";
// export { addPermittedAction } from "./rawContractApis/permissions/write/addPermittedAction";
// export { removePermittedAction } from "./rawContractApis/permissions/write/removePermittedAction";
// export { addPermittedAddress } from "./rawContractApis/permissions/write/addPermittedAddress";
// export { removePermittedAddress } from "./rawContractApis/permissions/write/removePermittedAddress";
// export { createContractsManager } from "./utils/createContractsManager";

// High-level APIs
// export { mintPKP } from "./highLevelApis/mintPKP/mintPKP";
// export { PKPPermissionsManager } from "./highLevelApis/PKPPermissionsManager";

// ========== Convenience API ==========
export const rawApi = {
  pkp: {
    read: {
      tokenOfOwnerByIndex,
    },
    write: {
      claimAndMintNextAndAddAuthMethodsWithTypes,
      mintNextAndAddAuthMethods,
    },
  },
  permission: {
    read: {
      getPermittedAddresses,
      isPermittedAddress,
      getPermittedActions,
      isPermittedAction,
    },
    write: {
      addPermittedAction,
      removePermittedAction,
      addPermittedAddress,
      removePermittedAddress,
    },
  },
  ledger: {
    read: {
      getBalance,
      getStableBalance,
      getWithdrawRequest,
      getUserWithdrawDelay,
    },
    write: {
      deposit,
      depositForUser,
      requestWithdraw,
      withdraw,
    },
  },
  pricing: {
    getNodesForRequest,
    constants: {
      PRODUCT_IDS,
    },
  },
  connection: {
    getConnectionInfo,
  },
};

export const api = {
  // PKP Management
  mintPKP,
  mintWithEoa,
  mintWithMultiAuths,
  // Permissions Management
  PKPPermissionsManager,
  // Payment Management
  PaymentManager,

  pricing: {
    getPriceFeedInfo,
    getNodePrices,
  },

  connection: {
    getConnectionInfo,
  },
};
