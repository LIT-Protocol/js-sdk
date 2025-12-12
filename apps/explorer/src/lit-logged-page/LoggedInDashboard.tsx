import { useState, useEffect, useRef, useMemo , useState as useReactState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAddress } from "viem";

import { APP_INFO } from "@/_config";
import { getDefaultChainForNetwork } from "@/domain/lit/networkDefaults";
import {
  TopNavBar,
  GlobalMessage,
  StickySidebarLayout,
  type TopNavTab,
} from "@layout";
import { PKPData } from "@lit-protocol/schemas";

import PKPSelectionModal from "./PKPSelectionModal";
import {
  PKPPermissionsProvider,
  PermissionsDashboard,
  WalletOperationsDashboard,
  PaymentManagementDashboard,
  TransactionToastContainer,
  BalanceInfo,
  TransactionToast,
  TransactionResult,
  getAllChains,
  PKPInfoCard,
} from "./protectedApp/index";
import { formatPublicKey } from "./protectedApp/utils";
import copyIcon from "../assets/copy.svg";
import { useLitAuth } from "../lit-login-modal/LitAuthProvider";

enum LOGIN_STYLE {
  button = "button",
  popup = "popup",
}

const LOGIN_METHOD = LOGIN_STYLE.popup;

export default function LoggedInDashboard() {
  const {
    user,
    services,
    initiateAuthentication,
    isInitializingServices,
    isServicesReady,
    authServiceBaseUrl,
    currentNetworkName,
    shouldDisplayNetworkMessage,
    autoLoginWithDefaultKey,
    isAutoLoggingIn,
    forceNetworkSelection,
    autoLoginStatus,
  } = useLitAuth();

  const hasAutoStartedRef = useRef(false);
  const shareAutoLoginTriggeredRef = useRef(false);
  const hasInitialBalanceRefetch = useRef(false);
  const blockWatcherCleanupRef = useRef<null | (() => void)>(null);
  const lastBalanceUpdateAtRef = useRef<number>(0);

  const navigate = useNavigate();
  const location = useLocation();
  const autoLoginRequested = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const flag = params.get("autoLogin");
    return flag === "1" || flag === "true";
  }, [location.search]);

  useEffect(() => {
    if (autoLoginRequested) return;
    if (
      LOGIN_METHOD === LOGIN_STYLE.popup &&
      !user &&
      !hasAutoStartedRef.current
    ) {
      hasAutoStartedRef.current = true;
      initiateAuthentication();
    }
  }, [user, initiateAuthentication, autoLoginRequested]);

  useEffect(() => {
    if (!autoLoginRequested) return;
    if (user) return;
    if (shareAutoLoginTriggeredRef.current) return;

    shareAutoLoginTriggeredRef.current = true;

    autoLoginWithDefaultKey({ forceNetwork: "naga-dev" })
      .then((success) => {
        if (!success) {
          initiateAuthentication();
        }
      })
      .catch(() => {
        initiateAuthentication();
      });
  }, [
    autoLoginRequested,
    user,
    autoLoginWithDefaultKey,
    initiateAuthentication,
  ]);

  useEffect(() => {
    if (!autoLoginRequested) return;
    if (!user) return;
    if (currentNetworkName === "naga-dev") return;

    forceNetworkSelection("naga-dev").catch((error) => {
      console.error("Failed to switch network for share link:", error);
    });
  }, [
    autoLoginRequested,
    user,
    currentNetworkName,
    forceNetworkSelection,
  ]);

  // Core state
  const [showPkpModal, setShowPkpModal] = useState(false);
  const [selectedPkp, setSelectedPkp] = useState<PKPData | null>(
    user?.pkpInfo || null
  );
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>("yellowstone");
  const [, setStatus] = useState<string>("");

  useEffect(() => {
    setSelectedChain(getDefaultChainForNetwork(currentNetworkName));
  }, [currentNetworkName]);

  // Transaction toast state
  const [transactionToasts, setTransactionToasts] = useState<
    TransactionToast[]
  >([]);

  // Tab configuration
  const tabs: TopNavTab[] = [
    { id: "playground", label: "Playground" },
    { id: "permissions", label: "PKP Permissions" },
    { id: "payment-management", label: "Payment Management" },
  ];

  // URL-driven tab state
  const pathToTab: Record<string, string> = {
    "/playground": "playground",
    "/pkp-permissions": "permissions",
    "/payment-management": "payment-management",
  };
  const tabToPath: Record<string, string> = {
    playground: "/playground",
    permissions: "/pkp-permissions",
    "payment-management": "/payment-management",
  };
  const activeTabId = pathToTab[location.pathname] ?? "playground";

  // Toast management
  const addTransactionToast = (
    message: string,
    txHash: string,
    type: "success" | "error" = "success"
  ) => {
    const toast: TransactionToast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      txHash,
      type,
      timestamp: Date.now(),
    };
    setTransactionToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setTransactionToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 8000);
  };

  const removeTransactionToast = (id: string) => {
    setTransactionToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Handle transaction completion
  const handleTransactionComplete = (result: TransactionResult) => {
    console.log("Transaction completed:", result);
    addTransactionToast("Transaction sent successfully!", result.hash);

    setTimeout(() => {
      loadBalance({ silent: true });
    }, 2000);
  };

  // Load balance function
  const loadBalance = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!selectedPkp?.ethAddress || !services?.litClient) return;

    if (!silent) setIsLoadingBalance(true);
    try {
      const { createPublicClient, http } = await import("viem");
      const allChains = getAllChains();
      const chainInfo = allChains[selectedChain as keyof typeof allChains];
      if (!chainInfo) throw new Error(`Unknown chain: ${selectedChain}`);

      const chainConfig = {
        id: chainInfo.id,
        name: chainInfo.name,
        nativeCurrency: {
          name: chainInfo.name,
          symbol: chainInfo.symbol,
          decimals: 18,
        },
        rpcUrls: {
          default: { http: [chainInfo.rpcUrl] },
          public: { http: [chainInfo.rpcUrl] },
        },
      };

      const client = createPublicClient({
        chain: chainConfig,
        transport: http(chainInfo.rpcUrl),
      });

      const balance = await client.getBalance({
        address: selectedPkp.ethAddress as `0x${string}`,
      });

      setBalance({
        balance: (Number(balance) / 1e18).toFixed(6),
        symbol: chainInfo.symbol,
        chainId: chainInfo.id,
      });
    } catch (error) {
      console.error("Failed to load balance:", error);
      setBalance(null);
    } finally {
      if (!silent) setIsLoadingBalance(false);
    }
  };

  // Load balance when PKP or chain changes
  useEffect(() => {
    if (selectedPkp) {
      loadBalance();
    }
  }, [selectedPkp, selectedChain]);

  // Ensure balance is (re)fetched after hot refresh when services become ready
  useEffect(() => {
    if (hasInitialBalanceRefetch.current) return;
    if (isServicesReady && selectedPkp) {
      hasInitialBalanceRefetch.current = true;
      loadBalance();
    }
  }, [isServicesReady, selectedPkp]);

  // Live balance updates: refetch on new blocks (polling if ws not available)
  useEffect(() => {
    // Clean up any previous watcher
    if (blockWatcherCleanupRef.current) {
      try {
        blockWatcherCleanupRef.current();
      } catch {
        // ignore
      }
      blockWatcherCleanupRef.current = null;
    }

    // Preconditions
    if (!isServicesReady || !selectedPkp?.ethAddress) return;

    let cancelled = false;
    (async () => {
      try {
        const { createPublicClient, http } = await import("viem");
        const allChains = getAllChains();
        const chainInfo = allChains[selectedChain as keyof typeof allChains];
        if (!chainInfo) return;

        const chainConfig = {
          id: chainInfo.id,
          name: chainInfo.name,
          nativeCurrency: {
            name: chainInfo.name,
            symbol: chainInfo.symbol,
            decimals: 18,
          },
          rpcUrls: {
            default: { http: [chainInfo.rpcUrl] },
            public: { http: [chainInfo.rpcUrl] },
          },
        } as const;

        const client = createPublicClient({
          chain: chainConfig,
          transport: http(chainInfo.rpcUrl),
        });

        if (cancelled) return;

        const unwatch = client.watchBlockNumber({
          poll: true,
          pollingInterval: 5_000,
          emitOnBegin: true,
          onBlockNumber: () => {
            const now = Date.now();
            // simple debounce to avoid overlapping calls
            if (now - lastBalanceUpdateAtRef.current < 2_500) return;
            lastBalanceUpdateAtRef.current = now;
            loadBalance({ silent: true });
          },
          onError: (err) => {
            console.error("Block watch error:", err);
          },
        });
        blockWatcherCleanupRef.current = unwatch;
      } catch (err) {
        console.error("Failed to start block watcher:", err);
      }
    })();

    return () => {
      cancelled = true;
      if (blockWatcherCleanupRef.current) {
        try {
          blockWatcherCleanupRef.current();
        } catch {
          // ignore
        }
        blockWatcherCleanupRef.current = null;
      }
    };
  }, [isServicesReady, selectedPkp?.ethAddress, selectedChain]);

  // Sync selectedPkp with user.pkpInfo
  useEffect(() => {
    if (user?.pkpInfo) {
      const mappedPkp = {
        tokenId: user.pkpInfo.tokenId || "unknown",
        pubkey: user.pkpInfo.pubkey || "",
        ethAddress: user.pkpInfo.ethAddress || "",
      };
      setSelectedPkp(mappedPkp as PKPData);
    } else {
      setSelectedPkp(null);
    }
  }, [user?.pkpInfo]);

  // PKP selection handler
  const handlePkpSelected = (pkpInfo: PKPData) => {
    console.log("PKP selected:", pkpInfo);
    setSelectedPkp(pkpInfo);
    setStatus(`Selected PKP: ${pkpInfo.ethAddress}`);
  };

  // Authentication and loading states
  if (!user) {
    if (autoLoginRequested) {
      return (
        <div className="p-5 text-center">
          <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#007bff] rounded-full animate-spin mb-5" />
          <h2 className="text-[#333] mb-2">Loading shared playground…</h2>
          <p className="text-gray-600">
            {autoLoginStatus ||
              (isAutoLoggingIn
                ? "Automatically signing you in with the development wallet…"
                : "Preparing your session…")}
          </p>
        </div>
      );
    }

    if (LOGIN_METHOD === LOGIN_STYLE.popup) {
      return (
        <div className="p-5 text-center">
          <h2>Starting sign-in</h2>
          <p>Launching the authentication popup…</p>
        </div>
      );
    }
    return (
      <div className="p-5 text-center">
        <h2>Not authenticated</h2>
        <p>Please sign in to continue.</p>
        <button
          onClick={initiateAuthentication}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#007bff] px-6 py-3 text-white text-base font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#007bff]/50"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (user && !isServicesReady) {
    return (
      <div className="p-5 text-center">
        <div className="inline-block w-10 h-10 border-4 border-gray-200 border-t-[#007bff] rounded-full animate-spin mb-5" />
        <h2 className="text-[#333] mb-2">Initialising Lit Protocol Services</h2>
        <p className="text-gray-600">
          {isInitializingServices
            ? "Setting up your authentication context..."
            : "Loading your PKP wallet..."}
        </p>
      </div>
    );
  }

  return (
    <PKPPermissionsProvider
      selectedPkp={selectedPkp}
      setStatus={setStatus}
      addTransactionToast={addTransactionToast}
    >
      <TopNavBar
        tabs={tabs}
        activeTab={activeTabId}
        onTabChange={(id) => navigate(tabToPath[id] ?? "/playground")}
        rightSlot={
          <div className="flex items-center gap-2 mb-1.5">
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold mr-13">
              <span>Network:</span>
              <span className="font-mono">{currentNetworkName}</span>
            </span>
            <AccountMenu
              selectedChain={selectedChain}
              onChainChange={setSelectedChain}
              onShowPkpModal={() => setShowPkpModal(true)}
            />
          </div>
        }
      />

      <div className="w-full border-b border-gray-500/5"></div>
      <GlobalMessage
        visible={Boolean(shouldDisplayNetworkMessage)}
        message={`⚠️ The ${currentNetworkName} testnet is a public testnet and is not meant for production use as there's no persistency guarantees. Please use for testing and development purposes only.`}
      />

      <StickySidebarLayout
        sidebar={
          <>
            <PKPInfoCard
              selectedPkp={selectedPkp}
              balance={balance}
              isLoadingBalance={isLoadingBalance}
              onShowPkpModal={() => setShowPkpModal(true)}
              userMethod={user.method}
              selectedChain={selectedChain}
              onChainChange={setSelectedChain}
            />

            <h5 className="mt-5 text-sm font-medium mb-3">Resources</h5>
            <ul id="sidebar-group">
              <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
                <a
                  className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                  style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                  href="https://chronicle-yellowstone-faucet.getlit.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 flex items-center space-x-2.5">
                    <div className="text-sm">Faucet (test tokens)</div>
                  </div>
                </a>
              </li>
              <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
                <a
                  className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                  style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                  href="https://hub.conduit.xyz/chronicle-yellowstone-testnet-9qgmzfcohk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 flex items-center space-x-2.5">
                    <div className="text-sm">Private RPC URL</div>
                  </div>
                </a>
              </li>
              <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
                <a
                  className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                  style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                  href="https://yellowstone-explorer.litprotocol.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 flex items-center space-x-2.5">
                    <div className="text-sm">Testnet Explorer</div>
                  </div>
                </a>
              </li>
              <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
                <a
                  className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                  style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                  href={APP_INFO.nagaLitActionsDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 flex items-center space-x-2.5">
                    <div className="text-sm">LitActions API Docs</div>
                  </div>
                </a>
              </li>
              <li className="text-sm text-[#1D1917] font-light pr-3 rounded-xl cursor-pointer">
                <a
                  className="group flex items-center pr-3 py-2 cursor-pointer focus:outline-primary dark:focus:outline-primary-light gap-x-3 rounded-xl hover:bg-gray-600/5 hover:text-black"
                  style={{ paddingLeft: "1rem", marginLeft: "-1rem" }}
                  href="https://naga.developer.litprotocol.com/sdk/introduction/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex-1 flex items-center space-x-2.5">
                    <div className="text-sm">Naga SDK Docs</div>
                  </div>
                </a>
              </li>
            </ul>
          </>
        }
      >
        {activeTabId === "playground" && (
          <WalletOperationsDashboard
            selectedPkp={selectedPkp}
            selectedChain={selectedChain}
            onTransactionComplete={handleTransactionComplete}
          />
        )}

        {activeTabId === "permissions" && <PermissionsDashboard />}

        {activeTabId === "payment-management" && (
          <PaymentManagementDashboard
            selectedPkp={selectedPkp}
            selectedChain={selectedChain}
            onTransactionComplete={handleTransactionComplete}
            services={services}
          />
        )}
      </StickySidebarLayout>

      {/* Status Display */}
      {/* <StatusDisplay status={status} onDismiss={() => setStatus("")} /> */}

      {/* Tab Navigation moved to top nav bar */}

      {/* Tab Content moved inside DashboardContent main area */}

      {/* Transaction Toast Notifications */}
      <TransactionToastContainer
        toasts={transactionToasts}
        onRemoveToast={removeTransactionToast}
      />

      {/* PKP Selection Modal */}
      {services && (
        <PKPSelectionModal
          isOpen={showPkpModal}
          onClose={() => setShowPkpModal(false)}
          authData={user.authData}
          authMethodName={user.method}
          services={services}
          disabled={false}
          authServiceBaseUrl={authServiceBaseUrl}
          onPkpSelected={(pkpInfo) => {
            handlePkpSelected(pkpInfo);
            setShowPkpModal(false);
          }}
        />
      )}

      {/* Tailwind handles animations; no inline keyframes needed */}
    </PKPPermissionsProvider>
  );
}

function AccountMenu({
  selectedChain,
  onChainChange,
  onShowPkpModal,
}: {
  selectedChain: string;
  onChainChange: (chain: string) => void;
  onShowPkpModal: () => void;
}) {
  const { user, logout } = useLitAuth();
  const [open, setOpen] = useReactState(false);
  const [copiedField, setCopiedField] = useReactState<string | null>(null);
  if (!user) return null;
  const pkp = user.pkpInfo || {};
  const publicKey: string = pkp.pubkey || "";
  const ethAddress: string = pkp.ethAddress || "";

  const handleCopy = async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    } catch {
      // ignore clipboard errors
    }
  };
  return (
    <div className="fixed top-2 right-2 sm:top-3 sm:right-3 z-[1100] block lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account menu"
        className="p-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M3.75 6.75h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[300px] max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[1200] overflow-hidden">
          <div className="text-xs text-gray-500 mb-2 font-semibold">PKP</div>
          <div className="grid gap-2 text-xs text-gray-800">
            {Boolean(
              pkp.tokenId &&
                typeof pkp.tokenId === "bigint" &&
                pkp.tokenId.toString() !== "0n"
            ) && (
                <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                  <div className="text-gray-500 whitespace-nowrap text-[11px]">
                    Token ID
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(pkp.tokenId.toString(), "tokenId")
                    }
                    className={`group w-full px-1.5 py-1 rounded border flex items-center justify-between gap-1 min-w-0 overflow-hidden ${
                      copiedField === "tokenId"
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    title="Click to copy Token ID"
                  >
                    <span className="truncate font-mono text-[11px]">
                      {copiedField === "tokenId"
                        ? `✅ ${pkp.tokenId.toString()}`
                        : pkp.tokenId.toString()}
                    </span>
                    <img
                      src={copyIcon}
                      alt="Copy"
                      className="h-3 w-3 opacity-70 group-hover:opacity-100"
                    />
                  </button>
                </div>
              )}
            {publicKey && typeof publicKey === "string" && publicKey !== "" && (
              <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                <div className="text-gray-500 whitespace-nowrap text-[11px]">
                  Public Key
                </div>
                <button
                  onClick={() => handleCopy(publicKey, "publicKey")}
                  className={`group w-full px-1.5 py-1 rounded border flex items-center justify-between gap-1 min-w-0 overflow-hidden ${
                    copiedField === "publicKey"
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                  title="Click to copy Public Key"
                >
                  <span className="truncate font-mono text-[11px]">
                    {copiedField === "publicKey"
                      ? `✅ ${publicKey.toString()}`
                      : formatPublicKey(publicKey)}
                  </span>
                  <img
                    src={copyIcon}
                    alt="Copy"
                    className="h-3 w-3 opacity-70 group-hover:opacity-100"
                  />
                </button>
              </div>
            )}
            {ethAddress &&
              typeof ethAddress === "string" &&
              ethAddress !== "" && (
                <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                  <div className="text-gray-500 whitespace-nowrap text-[11px]">
                    ETH
                  </div>
                  <button
                    onClick={() =>
                      handleCopy(
                        getAddress(ethAddress.toString()),
                        "ethAddress"
                      )
                    }
                    className={`group w-full px-1.5 py-1 rounded border flex items-center justify-between gap-1 min-w-0 overflow-hidden ${
                      copiedField === "ethAddress"
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    title="Click to copy ETH Address"
                  >
                    <span className="truncate font-mono text-[11px]">
                      {copiedField === "ethAddress"
                        ? `✅ ${getAddress(ethAddress.toString())}`
                        : getAddress(ethAddress)}
                    </span>
                    <img
                      src={copyIcon}
                      alt="Copy"
                      className="h-3 w-3 opacity-70 group-hover:opacity-100"
                    />
                  </button>
                </div>
              )}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2 font-semibold">
              Actions
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-[72px_1fr] items-center gap-2">
                <div className="text-gray-500 whitespace-nowrap text-[11px]">
                  Chain
                </div>
                <select
                  className="w-full px-2 py-1 rounded border border-gray-300 bg-white text-[12px] text-gray-800"
                  value={selectedChain}
                  onChange={(e) => onChainChange(e.target.value)}
                >
                  {Object.entries(getAllChains()).map(([key, info]) => (
                    <option key={key} value={key}>
                      {info.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  onShowPkpModal();
                }}
                className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm cursor-pointer"
              >
                Change PKP
              </button>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 w-full px-3 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm cursor-pointer"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
