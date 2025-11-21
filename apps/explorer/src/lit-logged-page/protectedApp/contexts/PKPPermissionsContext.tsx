/**
 * PKP Permissions Context
 * 
 * Encapsulates PKP permissions manager initialization and provides
 * a centralized context for managing PKP permissions across components.
 * This eliminates the need to repeatedly initialize the permissions manager.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLitAuth } from '../../../lit-login-modal/LitAuthProvider';
import { UIPKP } from '../types';

interface PKPPermissionsContextType {
  // PKP data
  selectedPkp: UIPKP | null;
  
  // Permissions data
  permissionsContext: any;
  isLoadingPermissions: boolean;
  permissionsError: string;
  
  // Actions
  loadPermissionsContext: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  
  // Permissions manager instance (for direct operations)
  getPermissionsManager: () => Promise<any>;
  
  // Remove operations tracking
  removingItems: Set<string>;
  setRemovingItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  
  // Bulk operations
  isRevokingAll: boolean;
  revokeAllPermissions: () => Promise<void>;
  
  // Add operations
  addPermittedAction: (ipfsId: string, scopes: string[]) => Promise<void>;
  addPermittedAddress: (address: string, scopes: string[]) => Promise<void>;
  removePermittedAction: (ipfsCid: string) => Promise<void>;
  removePermittedAddress: (address: string) => Promise<void>;
  removePermittedAuthMethod: (authMethodType: number, authMethodId: string) => Promise<void>;
  
  // Permission checks
  checkPermissions: (actionIpfsId?: string, address?: string) => Promise<any>;
  
  // Status management
  setStatus: (status: string) => void;
  addTransactionToast: (message: string, txHash: string, type?: 'success' | 'error') => void;
}

const PKPPermissionsContext = createContext<PKPPermissionsContextType | undefined>(undefined);

interface PKPPermissionsProviderProps {
  children: React.ReactNode;
  selectedPkp: UIPKP | null;
  setStatus: (status: string) => void;
  addTransactionToast: (message: string, txHash: string, type?: 'success' | 'error') => void;
}

export const PKPPermissionsProvider: React.FC<PKPPermissionsProviderProps> = ({ 
  children, 
  selectedPkp, 
  setStatus, 
  addTransactionToast 
}) => {
  const { user, services } = useLitAuth();
  
  // State
  const [permissionsContext, setPermissionsContext] = useState<any>(null);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string>("");
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [isRevokingAll, setIsRevokingAll] = useState(false);
  
  // Cached permissions manager to avoid repeated initialization
  const [cachedPermissionsManager, setCachedPermissionsManager] = useState<any>(null);
  const [cacheKey, setCacheKey] = useState<string>("");

  // Helper to get permissions manager (cached)
  const getPermissionsManager = useCallback(async () => {
    if (!user?.authContext || !selectedPkp || !services?.litClient) {
      throw new Error("Missing required data");
    }

    const currentCacheKey = `${selectedPkp.tokenId}-${selectedPkp.pubkey}`;
    
    // Return cached manager if available and valid
    if (cachedPermissionsManager && cacheKey === currentCacheKey) {
      return cachedPermissionsManager;
    }

    // Create new permissions manager
    const chainConfig = services.litClient.getChainConfig().viemConfig;
    const pkpViemAccount = await services.litClient.getPkpViemAccount({
      pkpPublicKey: selectedPkp.pubkey || user?.pkpInfo?.pubkey,
      authContext: user.authContext,
      chainConfig: chainConfig,
    });

    const pkpPermissionsManager = await services.litClient.getPKPPermissionsManager({
      pkpIdentifier: {
        tokenId: selectedPkp.tokenId,
      },
      account: pkpViemAccount,
    });

    // Cache the manager
    setCachedPermissionsManager(pkpPermissionsManager);
    setCacheKey(currentCacheKey);
    
    return pkpPermissionsManager;
  }, [user, selectedPkp, services, cachedPermissionsManager, cacheKey]);

  // Clear cache when PKP changes
  useEffect(() => {
    setCachedPermissionsManager(null);
    setCacheKey("");
  }, [selectedPkp?.tokenId, selectedPkp?.pubkey]);

  const loadPermissionsContext = useCallback(async () => {
    if (!selectedPkp) {
      setPermissionsError("No PKP selected");
      return;
    }

    setIsLoadingPermissions(true);
    setPermissionsError("");
    
    try {
      const pkpPermissionsManager = await getPermissionsManager();
      const context = await pkpPermissionsManager.getPermissionsContext();
      // Merge explicit lists into context if missing to ensure UI stops loading
      let merged = { ...context } as any;
      if (!merged.addresses) {
        try {
          merged.addresses = await pkpPermissionsManager.getPermittedAddresses();
        } catch {}
      }
      if (!merged.actions) {
        try {
          merged.actions = await pkpPermissionsManager.getPermittedActions();
        } catch {}
      }
      if (!merged.authMethods) {
        try {
          merged.authMethods = await pkpPermissionsManager.getPermittedAuthMethods();
        } catch {}
      }
      setPermissionsContext(merged);
      console.log("✅ Permissions context loaded successfully");
    } catch (error: any) {
      console.error("Failed to load permissions context:", error);
      setPermissionsError(`Failed to load permissions: ${error.message || error}`);
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [selectedPkp, getPermissionsManager]);

  const refreshPermissions = useCallback(async () => {
    await loadPermissionsContext();
  }, [loadPermissionsContext]);

  const addPermittedAction = useCallback(async (ipfsId: string, scopes: string[]) => {
    const pkpPermissionsManager = await getPermissionsManager();
    const result = await pkpPermissionsManager.addPermittedAction({
      ipfsId,
      scopes,
    });

    const txHash = result?.hash || result?.transactionHash || result;
    if (txHash) {
      addTransactionToast("Permitted action added successfully!", txHash);
    } else {
      setStatus("✅ Permitted action added successfully!");
    }

    setTimeout(refreshPermissions, 5000);
  }, [getPermissionsManager, addTransactionToast, setStatus, refreshPermissions]);

  const addPermittedAddress = useCallback(async (address: string, scopes: string[]) => {
    const pkpPermissionsManager = await getPermissionsManager();
    const result = await pkpPermissionsManager.addPermittedAddress({
      address,
      scopes,
    });

    const txHash = result?.hash || result?.transactionHash || result;
    if (txHash) {
      addTransactionToast("Permitted address added successfully!", txHash);
    } else {
      setStatus("✅ Permitted address added successfully!");
    }

    setTimeout(refreshPermissions, 5000);
  }, [getPermissionsManager, addTransactionToast, setStatus, refreshPermissions]);

  const removePermittedAction = useCallback(async (actionIpfsCid: string) => {
    const actionKey = `action:${actionIpfsCid}`;
    setRemovingItems(prev => new Set([...prev, actionKey]));
    
    try {
      const pkpPermissionsManager = await getPermissionsManager();
      const result = await pkpPermissionsManager.removePermittedAction({
        ipfsId: actionIpfsCid,
      });

      const txHash = result?.hash || result?.transactionHash || result;
      if (txHash) {
        addTransactionToast("Permitted action removed successfully!", txHash);
      } else {
        setStatus("✅ Permitted action removed successfully!");
      }

      await refreshPermissions();
    } catch (error: any) {
      console.error("Failed to remove permitted action:", error);
      if (error.message?.includes("Not PKP NFT owner")) {
        setPermissionsError("❌ You don't own this PKP. Only PKP owners can modify permissions.");
      } else {
        setPermissionsError(`❌ Failed to remove permitted action: ${error.message || error}`);
      }
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(actionKey);
        return next;
      });
    }
  }, [getPermissionsManager, addTransactionToast, setStatus, refreshPermissions, setPermissionsError]);

  const removePermittedAddress = useCallback(async (address: string) => {
    const addressKey = `address:${address}`;
    setRemovingItems(prev => new Set([...prev, addressKey]));
    
    try {
      const pkpPermissionsManager = await getPermissionsManager();
      const result = await pkpPermissionsManager.removePermittedAddress({
        address,
      });

      const txHash = result?.hash || result?.transactionHash || result;
      if (txHash) {
        addTransactionToast("Address removed successfully!", txHash);
      } else {
        setStatus("✅ Address removed successfully!");
      }

      await refreshPermissions();
    } catch (error: any) {
      console.error("Failed to remove permitted address:", error);
      setPermissionsError(`Failed to remove address: ${error.message || error}`);
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(addressKey);
        return next;
      });
    }
  }, [getPermissionsManager, addTransactionToast, setStatus, refreshPermissions, setPermissionsError]);

  const removePermittedAuthMethod = useCallback(async (authMethodType: number, authMethodId: string) => {
    const authMethodKey = `${authMethodType}:${authMethodId}`;
    setRemovingItems(prev => new Set([...prev, authMethodKey]));
    
    try {
      const pkpPermissionsManager = await getPermissionsManager();
      const result = await pkpPermissionsManager.removePermittedAuthMethod({
        authMethodType,
        authMethodId,
      });

      const txHash = result?.hash || result?.transactionHash || result;
      if (txHash) {
        setStatus(`✅ Auth method removed successfully! Transaction: ${txHash}`);
      } else {
        setStatus("✅ Auth method removed successfully!");
      }

      await refreshPermissions();
    } catch (error: any) {
      console.error("Failed to remove auth method:", error);
      if (error.message?.includes("Not PKP NFT owner")) {
        setPermissionsError("❌ You don't own this PKP. Only PKP owners can modify permissions.");
      } else {
        setPermissionsError(`❌ Failed to remove auth method: ${error.message || error}`);
      }
    } finally {
      setRemovingItems(prev => {
        const next = new Set(prev);
        next.delete(authMethodKey);
        return next;
      });
    }
  }, [getPermissionsManager, setStatus, refreshPermissions, setPermissionsError]);

  const revokeAllPermissions = useCallback(async () => {
    if (!confirm("Are you sure you want to revoke ALL permissions? This action cannot be undone.")) {
      return;
    }

    setIsRevokingAll(true);
    
    try {
      const pkpPermissionsManager = await getPermissionsManager();
      const result = await pkpPermissionsManager.revokeAllPermissions();

      const txHash = result?.hash || result?.transactionHash || result;
      if (txHash) {
        setStatus(`✅ All permissions revoked successfully! Transaction: ${txHash}`);
      } else {
        setStatus("✅ All permissions revoked successfully!");
      }

      await refreshPermissions();
    } catch (error: any) {
      console.error("Failed to revoke all permissions:", error);
      if (error.message?.includes("Not PKP NFT owner")) {
        setPermissionsError("❌ You don't own this PKP. Only PKP owners can modify permissions.");
      } else {
        setPermissionsError(`❌ Failed to revoke all permissions: ${error.message || error}`);
      }
    } finally {
      setIsRevokingAll(false);
    }
  }, [getPermissionsManager, setStatus, refreshPermissions, setPermissionsError]);

  const checkPermissions = useCallback(async (actionIpfsId?: string, address?: string) => {
    const pkpPermissionsManager = await getPermissionsManager();
    
    const actionPermitted = actionIpfsId?.trim()
      ? await pkpPermissionsManager.isPermittedAction({ ipfsId: actionIpfsId })
      : null;

    const addressPermitted = address?.trim()
      ? await pkpPermissionsManager.isPermittedAddress({ address })
      : null;

    return {
      actionPermitted,
      addressPermitted,
      actionIpfsId: actionIpfsId || "",
      address: address || "",
      timestamp: new Date().toISOString(),
    };
  }, [getPermissionsManager]);

  const contextValue: PKPPermissionsContextType = {
    selectedPkp,
    permissionsContext,
    isLoadingPermissions,
    permissionsError,
    loadPermissionsContext,
    refreshPermissions,
    getPermissionsManager,
    removingItems,
    setRemovingItems,
    isRevokingAll,
    revokeAllPermissions,
    addPermittedAction,
    addPermittedAddress,
    removePermittedAction,
    removePermittedAddress,
    removePermittedAuthMethod,
    checkPermissions,
    setStatus,
    addTransactionToast,
  };

  return (
    <PKPPermissionsContext.Provider value={contextValue}>
      {children}
    </PKPPermissionsContext.Provider>
  );
};

export const usePKPPermissions = () => {
  const context = useContext(PKPPermissionsContext);
  if (context === undefined) {
    throw new Error('usePKPPermissions must be used within a PKPPermissionsProvider');
  }
  return context;
}; 
