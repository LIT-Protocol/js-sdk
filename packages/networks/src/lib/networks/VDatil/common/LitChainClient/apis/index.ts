// ==================== Imports ====================
import { claimAndMintNextAndAddAuthMethodsWithTypes } from './rawContractApis/pkp/write/claimAndMintNextAndAddAuthMethodsWithTypes';
import { mintNextAndAddAuthMethods } from './rawContractApis/pkp/write/mintNextAndAddAuthMethods';
import { tokenOfOwnerByIndex } from './rawContractApis/pkp/read/tokenOfOwnerByIndex';
import { getPermittedAddresses } from './rawContractApis/permissions/read/getPermittedAddresses';
import { getPermittedActions } from './rawContractApis/permissions/read/getPermittedActions';
import { isPermittedAddress } from './rawContractApis/permissions/read/isPermittedAddress';
import { isPermittedAction } from './rawContractApis/permissions/read/isPermittedAction';
import { addPermittedAction } from './rawContractApis/permissions/write/addPermittedAction';
import { removePermittedAction } from './rawContractApis/permissions/write/removePermittedAction';
import { addPermittedAddress } from './rawContractApis/permissions/write/addPermittedAddress';
import { removePermittedAddress } from './rawContractApis/permissions/write/removePermittedAddress';
import { createLitContracts } from './utils/createLitContracts';

// High-level APIs
import { mintPKP } from './highLevelApis/mintPKP/mintPKP';
import { PKPPermissionsManager } from './highLevelApis/PKPPermissionsManager';

// Define type for utils to avoid TypeScript serialization error
type UtilsType = {
  createLitContracts: typeof createLitContracts;
};

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
// export { createLitContracts } from "./utils/createLitContracts";

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
};

export const api = {
  // PKP Management
  mintPKP,

  // Permissions Management
  PKPPermissionsManager,
};

export const utils: UtilsType = {
  createLitContracts,
};
