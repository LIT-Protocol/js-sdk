/**
 * useLitServiceSetup.ts
 *
 * React hook for setting up Lit Protocol services with proper configuration.
 * Handles network setup, auth manager creation, and storage plugin configuration.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { createLitClient } from "@lit-protocol/lit-client";
import { naga, nagaDev, nagaProto, nagaTest } from "@lit-protocol/networks";

// Configuration constants at the top
const DEFAULT_APP_NAME = "lit-auth-app";
type NetworkModule =
  | typeof nagaDev
  | typeof nagaTest
  | typeof nagaProto
  | typeof naga;
const NETWORK_MODULES: Record<string, NetworkModule> = {
  "naga-dev": nagaDev,
  "naga-test": nagaTest,
  "naga-proto": nagaProto,
  naga,
};

interface LitServiceSetupConfig {
  appName?: string;
  networkName?: string;
  network?: NetworkModule;
  autoSetup?: boolean;
}

export interface LitServices {
  litClient: Awaited<ReturnType<typeof createLitClient>>;
  authManager: Awaited<
    ReturnType<(typeof import("@lit-protocol/auth"))["createAuthManager"]>
  >;
}

interface UseLitServiceSetupReturn {
  services: LitServices | null;
  isInitializing: boolean;
  error: string | null;
  setupServices: () => Promise<LitServices>;
  clearServices: () => void;
  isReady: boolean;
}

/**
 * Hook for setting up Lit Protocol services
 *
 * @param config Configuration options for the setup
 * @returns Object containing services, setup state, and control functions
 */
export const useLitServiceSetup = (
  config: LitServiceSetupConfig = {}
): UseLitServiceSetupReturn => {
  const [services, setServices] = useState<LitServices | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track if services are being initialized to prevent multiple calls
  const initializingRef = useRef(false);

  const setupServices = useCallback(async (): Promise<LitServices> => {
    // Prevent multiple simultaneous initialization attempts
    if (initializingRef.current) {
      throw new Error("Services are already being initialized");
    }

    try {
      initializingRef.current = true;
      setIsInitializing(true);
      setError(null);

      console.log("🚀 Starting Lit Protocol service setup...");

      // Step 1: Create Lit Client with singleton pattern
      console.log(`📡 Creating Lit Client...`);
      const networkModule: NetworkModule | undefined =
        config.network ||
        (config.networkName ? NETWORK_MODULES[config.networkName] : undefined);
      if (!networkModule) {
        throw new Error(
          `Unknown or unsupported network configuration. Provide a 'network' instance or a valid 'networkName'.`
        );
      }
      const litClient = await createLitClient({
        network: networkModule as unknown as Parameters<
          typeof createLitClient
        >[0]["network"],
      });
      console.log("✅ Lit Client created successfully");

      // Step 2: Create Auth Manager with storage configuration
      console.log("🔐 Creating Auth Manager...");
      if (!config.networkName) {
        throw new Error(
          "No networkName provided for storage configuration. Pass 'networkName' to useLitServiceSetup."
        );
      }
      const { createAuthManager, storagePlugins } = await import(
        "@lit-protocol/auth"
      );
      const authManager = createAuthManager({
        storage: storagePlugins.localStorage({
          appName: config.appName || DEFAULT_APP_NAME,
          networkName: config.networkName,
        }),
      });
      console.log("✅ Auth Manager created successfully");

      const newServices = { litClient, authManager };
      setServices(newServices);

      console.log(
        `🎉 All Lit Protocol services initialized successfully. Network: ${config.networkName}`
      );
      return newServices;
    } catch (err) {
      const details =
        err instanceof Error ? err.message : JSON.stringify(err);
      const errorMessage = `Failed to initialize Lit Protocol services: ${details}`;
      console.error("❌", errorMessage, err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsInitializing(false);
      initializingRef.current = false;
    }
  }, [config]);

  const clearServices = useCallback(() => {
    console.log("🧹 Clearing Lit Protocol services...");
    setServices(null);
    setError(null);
  }, []);

  // Auto-setup on mount if requested
  useEffect(() => {
    if (config.autoSetup && !services && !isInitializing) {
      setupServices().catch(console.error);
    }
  }, [config.autoSetup, services, isInitializing, setupServices]);

  return {
    services,
    isInitializing,
    error,
    setupServices,
    clearServices,
    isReady: !!(services?.litClient && services?.authManager),
  };
};
