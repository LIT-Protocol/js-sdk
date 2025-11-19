import { DiscordAuthenticator, GoogleAuthenticator } from "@lit-protocol/auth";
import { Settings } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";
import { LitServices, useLitServiceSetup } from "../hooks/useLitServiceSetup";
import litPrimaryOrangeIcon from "../assets/lit-primary-orange.svg";
// Import icon assets
import tfaIcon from "../assets/2fa.svg";
import discordIcon from "../assets/discord.png";
import emailIcon from "../assets/email.svg";
import googleIcon from "../assets/google.png";
import passkeyIcon from "../assets/passkey.svg";
import phoneIcon from "../assets/phone.svg";
import web3WalletIcon from "../assets/web3-wallet.svg";
import whatsappIcon from "../assets/whatsapp.svg";
import PKPSelectionSection from "./PKPSelectionSection";
import { LedgerFundingPanel } from "./components/LedgerFundingPanel";
import { AuthSettingsPanel } from "./components/AuthSettingsPanel";
import { APP_INFO } from "../_config";
import { nagaDev, nagaTest, nagaProto, naga } from "@lit-protocol/networks";
import { PKPData } from "@lit-protocol/schemas";
import {
  AuthMethod,
  AuthUser,
  LitAuthContextValue,
  LitAuthProviderProps,
  SupportedNetworkName,
} from "./types";
import { LitAuthContext } from "./context/LitAuthContext";
import { isTestnetNetwork } from "@/domain/lit/networkDefaults";
export { useLitAuth, useOptionalLitAuth } from "./context/LitAuthContext";

const NETWORK_MODULES: Partial<Record<SupportedNetworkName, any>> = {
  "naga-dev": nagaDev,
  "naga-test": nagaTest,
  "naga-proto": nagaProto,
  naga,
};

// Configuration constants
const DEFAULT_PRIVATE_KEY = APP_INFO.defaultPrivateKey;
const FAUCET_URL = `${APP_INFO.faucetUrl}?action=combined&ledgerPercent=80`;
const DEFAULT_LOGIN_SERVICE_BASE_URL = APP_INFO.litLoginServer;
const DEFAULT_DISCORD_CLIENT_ID = APP_INFO.discordClientId;
const DEFAULT_AUTH_SERVICE_URLS = APP_INFO.authServiceUrls;
const LOGIN_SERVICE_URL_STORAGE_KEY = "lit-login-server-url"; // canonical key
const DISCORD_CLIENT_ID_STORAGE_KEY = "lit-discord-client-id";
const NETWORK_NAME_STORAGE_KEY = "lit-network-name";
const AUTH_SERVICE_URL_MAP_STORAGE_KEY = "lit-auth-server-url-map";

// Re-export hooks for consumers migrating from the previous file structure.

interface AuthMethodInfo {
  id: AuthMethod;
  name: string;
  icon: string;
  description: string;
  available: boolean;
  comingSoon?: boolean;
}

export const LitAuthProvider: React.FC<LitAuthProviderProps> = ({
  children,
  appName = "lit-auth-app",
  networkName,
  autoSetup = false,
  storageKey = "lit-auth-user",
  persistUser = false,
  closeOnBackdropClick = true,
  networkModule,
  supportedNetworks = ["naga-dev", "naga-test", "naga-proto", "naga"],
  defaultNetwork,
  showSettingsButton = true,
  showNetworkMessage = false,
  supportedAuthMethods,
  showSignUpPage = true,
  authServiceBaseUrl: authServiceBaseUrlProp,
}) => {
  const { data: walletClient } = useWalletClient();

  // Local network selection state for runtime switching (persisted)
  const [localNetworkName, setLocalNetworkName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(
        NETWORK_NAME_STORAGE_KEY
      ) as SupportedNetworkName | null;
      return (
        saved ||
        (defaultNetwork as SupportedNetworkName) ||
        (networkName as SupportedNetworkName) ||
        "naga-dev"
      );
    } catch {
      return (
        (defaultNetwork as SupportedNetworkName) ||
        (networkName as SupportedNetworkName) ||
        "naga-dev"
      );
    }
  });

  const [localNetwork, setLocalNetwork] = useState<any>(() => {
    const initialName = (() => {
      try {
        return (
          (localStorage.getItem(
            NETWORK_NAME_STORAGE_KEY
          ) as SupportedNetworkName | null) ||
          (defaultNetwork as SupportedNetworkName) ||
          (networkName as SupportedNetworkName) ||
          "naga-dev"
        );
      } catch {
        return (
          (defaultNetwork as SupportedNetworkName) ||
          (networkName as SupportedNetworkName) ||
          "naga-dev"
        );
      }
    })();

    const moduleFromName = NETWORK_MODULES[initialName as SupportedNetworkName];
    return networkModule || moduleFromName || nagaDev;
  });

  useEffect(() => {
    const nextName =
      (networkName as SupportedNetworkName | undefined) ||
      (localNetworkName as SupportedNetworkName);

    const nextModule =
      networkModule ||
      (nextName
        ? NETWORK_MODULES[nextName as SupportedNetworkName]
        : undefined);

    if (!nextName || !nextModule) {
      console.error("Network configuration missing or unknown:", { nextName });
      return;
    }

    setLocalNetwork(nextModule);

    // Only sync name from props when explicitly controlled via networkName
    if (networkName && networkName !== localNetworkName) {
      setLocalNetworkName(networkName);
    }
  }, [networkModule, networkName, localNetworkName]);

  // Re-initialise services when network selection changes (post-initial mount)
  const hasInitialisedNetworkRef = useRef(false);
  useEffect(() => {
    if (!hasInitialisedNetworkRef.current) {
      hasInitialisedNetworkRef.current = true;
      return;
    }
    (async () => {
      try {
        clearServices();
        await setupServices();
      } catch (err) {
        console.warn(
          "❗️ Failed to re-initialise services after network change:",
          err
        );
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localNetworkName, localNetwork]);

  // Setup Lit Protocol services
  const {
    services,
    isInitializing,
    error: setupError,
    setupServices,
    clearServices,
    isReady: isServicesReady,
  } = useLitServiceSetup({
    appName,
    networkName: localNetworkName,
    autoSetup,
    network: localNetwork,
  });

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUserAuthenticated = !!user && !!user.authContext && !!user.pkpInfo;

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [showMethodDetail, setShowMethodDetail] = useState(false);
  const [authStep, setAuthStep] = useState<
    "select" | "input" | "verify" | "fund" | "create"
  >("select");
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [showSettingsView, setShowSettingsView] = useState(false);

  // Pending funding/auth creation state
  const [pendingPkpInfo, setPendingPkpInfo] = useState<PKPData | null>(null);
  const [pendingAuthData, setPendingAuthData] = useState<any | null>(null);
  const [isCheckingFunding, setIsCheckingFunding] = useState(false);

  // Ensure we never remain in signup mode when sign up page is disabled
  useEffect(() => {
    if (!showSignUpPage && modalMode === "signup") {
      setModalMode("signin");
    }
  }, [showSignUpPage, modalMode]);

  // EOA specific state
  const [privateKey, setPrivateKey] = useState(DEFAULT_PRIVATE_KEY);
  const [accountMethod, setAccountMethod] = useState<"privateKey" | "wallet">(
    "wallet"
  );

  // Auth Service URL per-network map
  const [authServiceUrlMap, setAuthServiceUrlMap] = useState<
    Record<string, string>
  >(() => {
    try {
      const raw = localStorage.getItem(AUTH_SERVICE_URL_MAP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        return parsed || {};
      }
    } catch {}
    // Seed defaults per known network from config
    return {
      "naga-dev": authServiceBaseUrlProp || DEFAULT_AUTH_SERVICE_URLS["naga-dev"],
      "naga-test": authServiceBaseUrlProp || DEFAULT_AUTH_SERVICE_URLS["naga-test"],
      "naga-proto":
        authServiceBaseUrlProp || DEFAULT_AUTH_SERVICE_URLS["naga-proto"],
      naga: authServiceBaseUrlProp || DEFAULT_AUTH_SERVICE_URLS["naga"],
    } as Record<string, string>;
  });
  
  const authServiceBaseUrl =
    authServiceUrlMap[localNetworkName] ||
    authServiceBaseUrlProp ||
    DEFAULT_AUTH_SERVICE_URLS[localNetworkName as SupportedNetworkName] ||
    DEFAULT_AUTH_SERVICE_URLS["naga-dev"];
    
  const setAuthServiceBaseUrl = (url: string) => {
    setAuthServiceUrlMap((prev) => ({ ...prev, [localNetworkName]: url }));
  };
  
  // Compute per-network default for comparison
  const networkDefaultAuthUrl =
    DEFAULT_AUTH_SERVICE_URLS[localNetworkName as SupportedNetworkName] ||
    DEFAULT_AUTH_SERVICE_URLS["naga-dev"];
  const isAuthUrlCustom = (authServiceBaseUrl: string) =>
    (authServiceBaseUrl || "") !== (networkDefaultAuthUrl || "");

  // Login service state
  const [loginServiceBaseUrl, setLoginServiceBaseUrl] = useState(() => {
    try {
      const saved = localStorage.getItem(LOGIN_SERVICE_URL_STORAGE_KEY);
      return saved || DEFAULT_LOGIN_SERVICE_BASE_URL;
    } catch {
      return DEFAULT_LOGIN_SERVICE_BASE_URL;
    }
  });

  // Discord Client ID state
  const [discordClientId, setDiscordClientId] = useState(() => {
    try {
      const saved = localStorage.getItem(DISCORD_CLIENT_ID_STORAGE_KEY);
      return saved || DEFAULT_DISCORD_CLIENT_ID;
    } catch {
      return DEFAULT_DISCORD_CLIENT_ID;
    }
  });

  // No restore effect needed; initialiser above ensures correct precedence on first render

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_SERVICE_URL_MAP_STORAGE_KEY,
        JSON.stringify(authServiceUrlMap)
      );
    } catch (e) {
      console.warn("Failed to write auth service URL map to storage", e);
    }
  }, [authServiceUrlMap]);

  useEffect(() => {
    try {
      if (loginServiceBaseUrl) {
        localStorage.setItem(
          LOGIN_SERVICE_URL_STORAGE_KEY,
          loginServiceBaseUrl
        );
      } else {
        localStorage.removeItem(LOGIN_SERVICE_URL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to write login service URL to storage", e);
    }
  }, [loginServiceBaseUrl]);

  useEffect(() => {
    try {
      if (discordClientId) {
        localStorage.setItem(DISCORD_CLIENT_ID_STORAGE_KEY, discordClientId);
      } else {
        localStorage.removeItem(DISCORD_CLIENT_ID_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to write Discord Client ID to storage", e);
    }
  }, [discordClientId]);

  useEffect(() => {
    try {
      if (localNetworkName) {
        localStorage.setItem(NETWORK_NAME_STORAGE_KEY, localNetworkName);
      } else {
        localStorage.removeItem(NETWORK_NAME_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Failed to write network name to storage", e);
    }
  }, [localNetworkName]);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [userId, setUserId] = useState("");
  const [methodId, setMethodId] = useState("");

  // WebAuthn specific state
  const [webAuthnUsername, setWebAuthnUsername] = useState("");
  const [webAuthnMode, setWebAuthnMode] = useState<"register" | "authenticate">(
    "register"
  );
  const [isFido2Available, setIsFido2Available] = useState<boolean | null>(
    null
  );

  // Custom auth specific state (demo PKP and validation)
  const [customPkpPublicKey, setCustomPkpPublicKey] = useState(
    "0x04b8e68a0b4b95e39b2c49f7b8c4b8b3b6f16b52e4a1e4b6b8b3b6f16b52e4a1e4b6b8b3b6f16b52e4a1e4b6b8b3b6f16b52e4a1e4b6b8b3b6f16b52e4a1e4b6b8b3b6f16b52e4a1e"
  );
  const [customValidationCid, setCustomValidationCid] = useState(
    "QmYLeVmwJPVs7Uebk85YdVPivMyrvoeKR6X37kyVRZUXW4"
  );
  const [customUsername, setCustomUsername] = useState("alice");
  const [customPassword, setCustomPassword] = useState("lit");
  const [customAuthMethodId, setCustomAuthMethodId] = useState(
    "0x22b562b86d5d467a9f06c3f20137b37ed13981f63bd5dbdf6fc1e0fb97015401"
  );

  // PKP selection state for modal flow
  const [tempAuthData, setTempAuthData] = useState<any>(null);
  const [tempMethod, setTempMethod] = useState<AuthMethod | null>(null);
  const [showPkpSelection, setShowPkpSelection] = useState(false);
  const [isWebAuthnExistingFlow, setIsWebAuthnExistingFlow] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [autoLoginStatus, setAutoLoginStatus] = useState<string | null>(null);
  const autoLoginInProgressRef = useRef(false);
  const pendingNetworkChangeRef = useRef<{
    target: SupportedNetworkName;
    resolve: () => void;
  } | null>(null);
  const servicesRef = useRef<LitServices | null>(services);
  const setupServicesRef = useRef<typeof setupServices>(setupServices);
  const isServicesReadyRef = useRef<boolean>(isServicesReady);

  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  useEffect(() => {
    setupServicesRef.current = setupServices;
  }, [setupServices]);

  useEffect(() => {
    isServicesReadyRef.current = isServicesReady;
  }, [isServicesReady]);

  useEffect(() => {
    if (
      pendingNetworkChangeRef.current &&
      localNetworkName === pendingNetworkChangeRef.current.target
    ) {
      pendingNetworkChangeRef.current.resolve();
      pendingNetworkChangeRef.current = null;
    }
  }, [localNetworkName]);

  // Authentication methods configuration
  const authMethods: AuthMethodInfo[] = [
    {
      id: "google",
      name: "Google",
      icon: googleIcon,
      description: "Continue with Google",
      available: true,
    },
    {
      id: "discord",
      name: "Discord",
      icon: discordIcon,
      description: "Continue with Discord",
      available: true,
    },
    {
      id: "eoa",
      name: "Web3 Wallet",
      icon: web3WalletIcon,
      description: "Connect your web3 wallet",
      available: true,
    },
    {
      id: "webauthn",
      name: "WebAuthn",
      icon: passkeyIcon,
      description: "Use WebAuthn/Passkey",
      available: true,
    },
    {
      id: "stytch-email",
      name: "Email OTP",
      icon: emailIcon,
      description: "Email verification code",
      available: true,
    },
    {
      id: "stytch-sms",
      name: "SMS",
      icon: phoneIcon,
      description: "SMS verification code",
      available: true,
    },
    {
      id: "stytch-whatsapp",
      name: "WhatsApp",
      icon: whatsappIcon,
      description: "WhatsApp verification code",
      available: true,
    },
    {
      id: "stytch-totp",
      name: "Authenticator",
      icon: tfaIcon,
      description: "TOTP authenticator app",
      available: true,
    },
    // {
    //   id: "custom",
    //   name: "Custom Auth",
    //   icon: passkeyIcon,
    //   description: "Test custom authentication",
    //   available: false,
    // },
  ];

  // Determine which methods to show based on provided prop; defaults to all available
  const methodsToShow =
    supportedAuthMethods && supportedAuthMethods.length > 0
      ? supportedAuthMethods
      : authMethods.map((m) => m.id);
  const filteredAuthMethods = authMethods.filter((m) =>
    methodsToShow.includes(m.id)
  );

  // Load user from localStorage on mount
  useEffect(() => {
    if (!persistUser) return;
    try {
      const savedUser = localStorage.getItem(storageKey);
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Check if user data is not too old (24 hours)
        const isStale = Date.now() - userData.timestamp > 24 * 60 * 60 * 1000;
        if (!isStale) {
          setUser(userData);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch (error) {
      console.error("Failed to load saved user:", error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey, persistUser]);

  // Auto-initialize services when user exists but services aren't ready
  useEffect(() => {
    if (user && !isServicesReady && !isInitializing) {
      console.log(
        "🔄 User exists but services not ready - initializing services..."
      );
      setupServices().catch((error) => {
        console.error(
          "Failed to auto-initialize services for existing user:",
          error
        );
        // Don't logout the user automatically, but log the error
        // The user can try to use functionality and it will show appropriate error messages
      });
    }
  }, [user, isServicesReady, isInitializing, setupServices]);

  // Recreate authContext when services become ready for existing user
  useEffect(() => {
    const recreateAuthContext = async () => {
      if (
        user &&
        user.authData &&
        user.pkpInfo &&
        isServicesReady &&
        services
      ) {
        // Check if authContext is missing methods (indicates it was loaded from localStorage)
        const needsRecreation =
          !user.authContext?.authNeededCallback ||
          typeof user.authContext?.authNeededCallback !== "function";

        if (needsRecreation) {
          console.log(
            "🔧 Recreating authContext for user loaded from localStorage..."
          );
          try {
            const newAuthContext =
              await services.authManager.createPkpAuthContext({
                authData: user.authData,
                pkpPublicKey: user.pkpInfo.pubkey,
                authConfig: {
                  expiration: new Date(
                    Date.now() + 1000 * 60 * 60 * 24
                  ).toISOString(),

                  resources: [
                    ["pkp-signing", "*"],
                    ["lit-action-execution", "*"],
                    ["access-control-condition-decryption", "*"],
                  ],
                },
                litClient: services.litClient,
              });

            // Update user with new authContext
            const updatedUser = {
              ...user,
              authContext: newAuthContext,
            };
            setUser(updatedUser);
            if (persistUser) {
              localStorage.setItem(storageKey, JSON.stringify(updatedUser));
            }
            console.log("✅ AuthContext recreated successfully");
          } catch (error) {
            console.error("Failed to recreate authContext:", error);
            // Don't logout user, but they may need to re-authenticate for some functions
          }
        }
      }
    };

    recreateAuthContext();
  }, [user, isServicesReady, services, storageKey]);

  // Check WebAuthn availability
  useEffect(() => {
    async function checkFido2Availability() {
      if (window.PublicKeyCredential) {
        try {
          const available =
            await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsFido2Available(available);
        } catch (e) {
          console.warn("Error checking FIDO2 availability:", e);
          setIsFido2Available(false);
        }
      } else {
        setIsFido2Available(false);
      }
    }
    checkFido2Availability();
  }, []);

  // ESC key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        resetModalState();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, [showModal]);

  const formatError = (prefix: string, error: any): string => {
    if (error?.message) return `${prefix}${error.message}`;
    if (typeof error === "object")
      return `${prefix}${JSON.stringify(error, null, 2)}`;
    return `${prefix}${String(error)}`;
  };

  const handleError = (error: any, context: string) => {
    const errorMessage = formatError(`${context}: `, error);
    setError(errorMessage);
    setIsAuthenticating(false);
    console.error(`❌ ${context}:`, error);
  };

  const resetModalState = () => {
    setShowModal(false);
    setSelectedMethod(null);
    setShowMethodDetail(false);
    setAuthStep("select");
    setModalMode("signin");
    setShowSettingsView(false);
    setError(null);
    setEmail("");
    setPhoneNumber("");
    setOtpCode("");
    setTotpCode("");
    setUserId("");
    setMethodId("");
    setWebAuthnUsername("");
    setWebAuthnMode("register");
    // Reset PKP selection states
    setShowPkpSelection(false);
    setTempAuthData(null);
    setTempMethod(null);
    setIsWebAuthnExistingFlow(false);
    setPendingAuthData(null);
    setPendingPkpInfo(null);
  };

  const saveUser = (userData: AuthUser) => {
    setUser(userData);
    if (persistUser) {
      localStorage.setItem(storageKey, JSON.stringify(userData));
    }
    resetModalState();
  };

  const logout = () => {
    setUser(null);
    if (persistUser) {
      localStorage.removeItem(storageKey);
    }
    resetModalState();
    // Don't automatically show modal on logout - let user manually reconnect

    // redirect back to home page
    window.location.href = "/";
  };

  const showAuthModal = () => {
    if (!isUserAuthenticated) {
      setShowModal(true);
    }
  };
  const hideAuthModal = () => resetModalState();

  const initiateAuthentication = async () => {
    try {
      // If already authenticated, don't open modal; just ensure services are ready
      if (isUserAuthenticated) {
        if (!isServicesReady && !isInitializing) {
          await setupServices();
        }
        return;
      }

      // Show the modal (this will show loading if services aren't ready)
      setShowModal(true);

      // If services aren't ready, set them up first
      if (!isServicesReady && !isInitializing) {
        await setupServices();
      }
    } catch (error) {
      handleError(error, "Failed to initialize Lit Protocol services");
    }
  };

  // Close modal automatically if we detect an authenticated user (e.g., after refresh)
  useEffect(() => {
    if (isUserAuthenticated && showModal) {
      setShowModal(false);
      setShowMethodDetail(false);
      setShowPkpSelection(false);
      setShowSettingsView(false);
      setSelectedMethod(null);
    }
  }, [isUserAuthenticated, showModal]);

  const handlePkpSelectionInModal = async (pkpInfo: PKPData) => {
    console.log("[handlePkpSelectionInModal] pkpInfo:", pkpInfo);

    if (!tempAuthData || !tempMethod || !services) {
      console.error("Cannot complete PKP selection: missing data or services");
      return;
    }

    // wait for 2 seconds
    console.log("[handlePkpSelectionInModal] Waiting for 2 seconds...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      setIsAuthenticating(true);

      console.log(
        "[handlePkpSelectionInModal] Creating auth context for the selected PKP..."
      );
      // Create auth context for the selected PKP
      const authContext = await services.authManager.createPkpAuthContext({
        authData: tempAuthData,
        pkpPublicKey: pkpInfo.pubkey,
        authConfig: {
          expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          statement: "",
          domain: "",
          resources: [
            ["pkp-signing", "*"],
            ["lit-action-execution", "*"],
            ["access-control-condition-decryption", "*"],
          ],
        },
        litClient: services.litClient,
      });

      console.log("[handlePkpSelectionInModal] authContext:", authContext);

      // Create complete user object
      const userData: AuthUser = {
        authContext,
        pkpInfo,
        method: tempMethod,
        timestamp: Date.now(),
        authData: tempAuthData,
      };

      // Save user and provide success feedback before closing modal
      setUser(userData);
      if (persistUser) {
        localStorage.setItem(storageKey, JSON.stringify(userData));
      }

      // Brief success state before closing
      setTimeout(() => {
        resetModalState();
      }, 800);
    } catch (error) {
      console.error("Failed to create auth context for selected PKP:", error);
      // If creating context fails (e.g., unpaid on naga-test), route to funding step
      try {
        setPendingAuthData(tempAuthData);
        setPendingPkpInfo(pkpInfo);
        setAuthStep("fund");
        setShowPkpSelection(false);
        setShowMethodDetail(true);
        setSelectedMethod(tempMethod as AuthMethod);
        setError(
          "Please fund your Lit Ledger account for this PKP, then continue."
        );
      } catch {}
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ========== AUTHENTICATION FLOWS ==========

  const authenticateAndShowPkpSelection = async (
    authData: any,
    method: AuthMethod
  ) => {
    try {
      // Set WebAuthn existing-flow flag deterministically based on method and mode
      setIsWebAuthnExistingFlow(
        method === "webauthn" &&
          modalMode === "signin" &&
          webAuthnMode === "authenticate"
      );
      // Store auth data temporarily and show PKP selection in modal
      setTempAuthData(authData);
      setTempMethod(method);
      setSelectedMethod(null);
      setShowMethodDetail(false);
      setShowPkpSelection(true);
      setAuthStep("select");
      setError(null);

      // Modal stays open for PKP selection
    } catch (error) {
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const waitForServicesReady = useCallback(async (): Promise<LitServices> => {
    if (
      servicesRef.current?.litClient &&
      servicesRef.current?.authManager &&
      isServicesReadyRef.current
    ) {
      return servicesRef.current;
    }

    const setupServicesFn = setupServicesRef.current;
    if (setupServicesFn) {
      try {
        const newServices = await setupServicesFn();
        if (newServices) {
          servicesRef.current = newServices;
          return newServices;
        }
      } catch (error: any) {
        const message =
          typeof error?.message === "string" ? error.message : String(error);
        if (!message.includes("Services are already being initialized")) {
          throw error;
        }
      }
    }

    return await new Promise<LitServices>((resolve, reject) => {
      const start = Date.now();
      const timeoutMs = 15_000;
      const interval = setInterval(() => {
        if (
          servicesRef.current?.litClient &&
          servicesRef.current?.authManager &&
          isServicesReadyRef.current
        ) {
          clearInterval(interval);
          resolve(servicesRef.current);
        } else if (Date.now() - start > timeoutMs) {
          clearInterval(interval);
          reject(
            new Error("Timed out waiting for Lit services to become ready")
          );
        }
      }, 100);
    });
  }, []);

  const forceNetworkSelection = useCallback(
    async (network: SupportedNetworkName) => {
      if (localNetworkName !== network) {
        const moduleCandidate =
          NETWORK_MODULES[network] ||
          (network === "naga" ? networkModule : undefined) ||
          nagaDev;
        const waitForNetwork = new Promise<void>((resolve) => {
          pendingNetworkChangeRef.current = {
            target: network,
            resolve,
          };
        });

        setLocalNetwork(moduleCandidate);
        setLocalNetworkName(network);
        await waitForNetwork;
        clearServices();
      }

      await waitForServicesReady();
    },
    [localNetworkName, networkModule, waitForServicesReady, clearServices]
  );

  const autoLoginWithDefaultKey = useCallback(
    async (options?: {
      forceNetwork?: SupportedNetworkName;
    }): Promise<boolean> => {
      if (autoLoginInProgressRef.current) {
        return isUserAuthenticated;
      }

      if (isUserAuthenticated) {
        setAutoLoginStatus(null);
        if (
          options?.forceNetwork &&
          localNetworkName !== options.forceNetwork
        ) {
          await forceNetworkSelection(options.forceNetwork);
        }
        return true;
      }

      autoLoginInProgressRef.current = true;
      setIsAutoLoggingIn(true);
      setIsAuthenticating(true);
      setError(null);
      setAutoLoginStatus("Preparing automatic login…");

      try {
        const targetNetwork = options?.forceNetwork ?? "naga-dev";
        setAutoLoginStatus(`Switching to ${targetNetwork} network…`);
        await forceNetworkSelection(targetNetwork);
        setAutoLoginStatus("Initialising Lit services…");
        const activeServices = await waitForServicesReady();

        const account = privateKeyToAccount(
          DEFAULT_PRIVATE_KEY as `0x${string}`
        );
        setAutoLoginStatus("Authenticating with development wallet…");
        const { ViemAccountAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        const authData = await ViemAccountAuthenticator.authenticate(account);

        setAutoLoginStatus("Fetching PKPs for development wallet…");
        const pkpResult = await activeServices.litClient.viewPKPsByAuthData({
          authData: {
            authMethodType: authData.authMethodType,
            authMethodId: authData.authMethodId,
          },
          pagination: {
            limit: 1,
            offset: 0,
          },
        });

        const firstPkp = pkpResult?.pkps?.[0];
        if (!firstPkp) {
          setAutoLoginStatus(
            "No PKPs found for the development wallet. Please mint one."
          );
          setError(
            "No PKPs found for the default development private key. Please mint one first."
          );
          return false;
        }

        const pkpInfo: PKPData = {
          tokenId: firstPkp.tokenId,
          pubkey: firstPkp.pubkey || firstPkp.publicKey || "",
          ethAddress: firstPkp.ethAddress || "",
        };

        if (!pkpInfo.pubkey) {
          setAutoLoginStatus("Unable to locate PKP for development wallet.");
          throw new Error(
            "Unable to locate a public key for the default PKP during automatic login."
          );
        }

        setAutoLoginStatus("Creating Lit session for your PKP…");
        const authContext =
          await activeServices.authManager.createPkpAuthContext({
            authData,
            pkpPublicKey: pkpInfo.pubkey,
            authConfig: {
              expiration: new Date(
                Date.now() + 1000 * 60 * 60 * 24
              ).toISOString(),
              statement: "",
              domain: "",
              resources: [
                ["pkp-signing", "*"],
                ["lit-action-execution", "*"],
                ["access-control-condition-decryption", "*"],
              ],
            },
            litClient: activeServices.litClient,
          });

        const userData: AuthUser = {
          authContext,
          pkpInfo,
          method: "eoa",
          timestamp: Date.now(),
          authData,
        };

        saveUser(userData);
        setAccountMethod("privateKey");
        setAutoLoginStatus("Automatic login complete. Loading playground…");
        setTimeout(() => setAutoLoginStatus(null), 1500);
        return true;
      } catch (error) {
        console.error("Automatic share link login failed:", error);
        handleError(error, "Automatic share link login failed");
        setAutoLoginStatus("Automatic login failed. Opening sign-in modal…");
        return false;
      } finally {
        setIsAuthenticating(false);
        setIsAutoLoggingIn(false);
        autoLoginInProgressRef.current = false;
      }
    },
    [
      saveUser,
      forceNetworkSelection,
      waitForServicesReady,
      isUserAuthenticated,
      localNetworkName,
      handleError,
    ]
  );

  // New flow: Mint then await manual funding before creating auth context
  const mintThenAwaitFunding = async (authData: any, method: AuthMethod) => {
    console.log("[mintThenAwaitFunding] Called.");
    try {
      await services!.litClient.authService.mintWithAuth({
        authData,
        scopes: ["sign-anything"],
        authServiceBaseUrl: authServiceBaseUrl,
      });

      // After minting, return to PKP selection so user can pick and fund
      setTempAuthData(authData);
      setTempMethod(method);
      setShowPkpSelection(true);
      setShowMethodDetail(false);
      setSelectedMethod(null);
      setAuthStep("select");
      setError(null);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateGoogle = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const authData = await GoogleAuthenticator.authenticate(
        loginServiceBaseUrl
      );

      if (modalMode === "signin") {
        await authenticateAndShowPkpSelection(authData, "google");
      } else {
        await mintThenAwaitFunding(authData, "google");
      }
    } catch (error) {
      handleError(error, "Google authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateDiscord = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      console.log("loginServiceBaseUrl", loginServiceBaseUrl);
      console.log("discordClientId", discordClientId);

      const authData = await DiscordAuthenticator.authenticate(
        loginServiceBaseUrl,
        {
          clientId: discordClientId,
        }
      );

      if (modalMode === "signin") {
        await authenticateAndShowPkpSelection(authData, "discord");
      } else {
        await mintThenAwaitFunding(authData, "discord");
      }
    } catch (error) {
      handleError(error, "Discord authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateEOA = async () => {
    console.log("[authenticateEOA] Called.");

    try {
      setIsAuthenticating(true);
      setError(null);

      let account;
      let authData;

      if (accountMethod === "privateKey") {
        if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
          throw new Error("Invalid private key format");
        }
        account = privateKeyToAccount(privateKey as `0x${string}`);

        const { ViemAccountAuthenticator } = await import("@lit-protocol/auth");
        authData = await ViemAccountAuthenticator.authenticate(account);
      } else {
        if (!walletClient?.account) {
          throw new Error("No wallet connected");
        }
        account = walletClient;

        const { WalletClientAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        authData = await WalletClientAuthenticator.authenticate(walletClient);
      }

      if (modalMode === "signin") {
        await authenticateAndShowPkpSelection(authData, "eoa");
      } else {
        // Signup: mint and route to PKP selection/funding flow
        await mintThenAwaitFunding(authData, "eoa");
      }
    } catch (error) {
      handleError(error, "EOA authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateWebAuthn = async () => {
    console.log("[authenticateWebAuthn] Called.");

    try {
      setIsAuthenticating(true);
      setError(null);

      // Freeze network and URL for this run
      const networkAtStart = localNetworkName;
      const authUrlAtStart = authServiceBaseUrl;
      console.log("[authenticateWebAuthn] context", {
        networkAtStart,
        authUrlAtStart,
        isServicesReady,
        loginServiceBaseUrl,
        timestamp: new Date().toISOString(),
      });

      // Ensure services are initialised (for current network)
      if (!isServicesReady || !services) {
        console.log(
          "[authenticateWebAuthn] services not ready; setting up for network:",
          networkAtStart
        );
        clearServices();
        await setupServices();
      }

      try {
        const chainCfg: any = services?.litClient?.getChainConfig?.();
        console.log("[authenticateWebAuthn] litClient chainConfig:", chainCfg);
      } catch {}

      const { WebAuthnAuthenticator } = await import("@lit-protocol/auth");

      if (webAuthnMode === "register" || modalMode === "signup") {
        // Register new credential and mint PKP
        console.log("[authenticateWebAuthn][registerAndMintPKP] using:", {
          networkAtStart,
          authUrlAtStart,
          username: webAuthnUsername || `${networkAtStart}-${Date.now()}`,
        });
        const { pkpInfo } = await WebAuthnAuthenticator.registerAndMintPKP({
          authServiceBaseUrl: authUrlAtStart,
          username: webAuthnUsername || `${networkAtStart}-${Date.now()}`,
          scopes: ["sign-anything"],
        });

        // For registerAndMintPKP, we need to authenticate to get authData
        const authData = await WebAuthnAuthenticator.authenticate();

        console.log(
          "[authenticateWebAuthn][registerAndMintPKP] pkpInfo:",
          pkpInfo
        );

        // wait for 1 seconds
        console.log(
          "[authenticateWebAuthn][registerAndMintPKP] Waiting for 1 seconds..."
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // New: return to PKP selection to choose which PKP to fund
        setTempAuthData(authData);
        setTempMethod("webauthn");
        setShowPkpSelection(true);
        setShowMethodDetail(false);
        setSelectedMethod(null);
        setAuthStep("select");
        setError(null);
      } else {
        // Authenticate with existing credential
        console.log(
          "[authenticateWebAuthn][existing] calling authenticate (no override baseUrl)",
          { networkAtStart, authUrlAtStart }
        );
        const authData = await WebAuthnAuthenticator.authenticate();

        if (authData) {
          console.log(
            "[authenticateWebAuthn][existing] authenticated; proceeding",
            { modalMode }
          );
          if (modalMode === "signin") {
            await authenticateAndShowPkpSelection(authData, "webauthn");
          } else {
            // For signup too, go to PKP selection (after mint) instead of funding step
            await mintThenAwaitFunding(authData, "webauthn");
          }
        }
      }
    } catch (error) {
      handleError(error, "WebAuthn authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const sendStytchOtp = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      let result: { methodId?: string } | undefined;

      if (selectedMethod === "stytch-email") {
        if (!email || !email.includes("@")) {
          throw new Error("Please enter a valid email address");
        }
        const { StytchEmailOtpAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        result = await StytchEmailOtpAuthenticator.sendOtp({
          email,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === "stytch-sms") {
        if (!phoneNumber) {
          throw new Error("Please enter a valid phone number");
        }
        const { StytchSmsOtpAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        result = await StytchSmsOtpAuthenticator.sendOtp({
          phoneNumber,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === "stytch-whatsapp") {
        if (!phoneNumber) {
          throw new Error("Please enter a valid phone number");
        }
        const { StytchWhatsAppOtpAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        result = await StytchWhatsAppOtpAuthenticator.sendOtp({
          phoneNumber,
          authServiceBaseUrl,
        });
      }

      if (result?.methodId) {
        setMethodId(result.methodId);
        setAuthStep("verify");
      }
    } catch (error) {
      handleError(error, "Failed to send OTP");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const verifyStytchOtp = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      let authData;

      if (selectedMethod === "stytch-email") {
        const { StytchEmailOtpAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        authData = await StytchEmailOtpAuthenticator.authenticate({
          methodId,
          code: otpCode,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === "stytch-sms") {
        const { StytchSmsOtpAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        authData = await StytchSmsOtpAuthenticator.authenticate({
          methodId,
          code: otpCode,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === "stytch-whatsapp") {
        const { StytchWhatsAppOtpAuthenticator } = await import(
          "@lit-protocol/auth"
        );
        authData = await StytchWhatsAppOtpAuthenticator.authenticate({
          methodId,
          code: otpCode,
          authServiceBaseUrl,
        });
      }

      if (authData) {
        if (modalMode === "signin") {
          await authenticateAndShowPkpSelection(
            authData,
            selectedMethod as AuthMethod
          );
        } else {
          await mintThenAwaitFunding(authData, selectedMethod as AuthMethod);
        }
      }
    } catch (error) {
      handleError(error, "Failed to verify OTP");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateStytchTotp = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      if (!userId || !totpCode) {
        throw new Error("Please enter both User ID and TOTP code");
      }

      const { StytchTotp2FAAuthenticator } = await import("@lit-protocol/auth");
      const authData = await StytchTotp2FAAuthenticator.authenticate({
        userId,
        totpCode,
        authServiceBaseUrl,
      });

      if (modalMode === "signin") {
        await authenticateAndShowPkpSelection(authData, "stytch-totp");
      } else {
        await mintThenAwaitFunding(authData, "stytch-totp");
      }
    } catch (error) {
      handleError(error, "TOTP authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const authenticateCustom = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      if (
        !customPkpPublicKey ||
        !customValidationCid ||
        !customUsername ||
        !customPassword ||
        !customAuthMethodId
      ) {
        throw new Error("Please fill in all custom auth parameters");
      }

      // Create custom auth context using the demo parameters
      const customAuthContext =
        await services!.authManager.createCustomAuthContext({
          pkpPublicKey: customPkpPublicKey,
          authConfig: {
            expiration: new Date(
              Date.now() + 1000 * 60 * 60 * 24
            ).toISOString(),
            statement: "",
            domain: "",
            resources: [
              ["pkp-signing", "*"],
              ["lit-action-execution", "*"],
            ],
          },
          litClient: services!.litClient,
          customAuthParams: {
            litActionIpfsId: customValidationCid,
            jsParams: {
              pkpPublicKey: customPkpPublicKey,
              username: customUsername,
              password: customPassword,
              authMethodId: customAuthMethodId,
            },
          },
        });

      const userData: AuthUser = {
        authContext: customAuthContext,
        pkpInfo: {
          pubkey: customPkpPublicKey,
          tokenId: 0n,
          ethAddress: "0x0000000000000000000000000000000000000000",
        },
        method: "custom",
        timestamp: Date.now(),
        authData: {
          authMethodType: 10, // Custom auth method type
          authMethodId: customAuthMethodId,
        },
      };

      saveUser(userData);
    } catch (error) {
      handleError(error, "Custom authentication failed");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleMethodSelect = (method: AuthMethod) => {
    if (!authMethods.find((m) => m.id === method)?.available) return;

    setSelectedMethod(method);
    setError(null);

    if (
      [
        "eoa",
        "webauthn",
        "custom",
        "stytch-email",
        "stytch-sms",
        "stytch-whatsapp",
        "stytch-totp",
      ].includes(method)
    ) {
      setShowMethodDetail(true);
      setAuthStep("input");
    } else {
      // Direct authentication for OAuth methods
      switch (method) {
        case "google":
          authenticateGoogle();
          break;
        case "discord":
          authenticateDiscord();
          break;
      }
    }
  };

  const handleAuthAction = () => {
    switch (selectedMethod) {
      case "eoa":
        authenticateEOA();
        break;
      case "webauthn":
        authenticateWebAuthn();
        break;
      case "stytch-email":
      case "stytch-sms":
      case "stytch-whatsapp":
        if (authStep === "input") {
          sendStytchOtp();
        } else if (authStep === "verify") {
          verifyStytchOtp();
        }
        break;
      case "stytch-totp":
        authenticateStytchTotp();
        break;
      case "custom":
        authenticateCustom();
        break;
    }
  };

  const contextValue: LitAuthContextValue = {
    user,
    isAuthenticated: !!user && !!user.authContext && !!user.pkpInfo,
    logout,
    isAuthenticating,
    services,
    isServicesReady,
    showAuthModal,
    hideAuthModal,
    initiateAuthentication,
    isInitializingServices: isInitializing,
    showPkpSelectionModal: () => {
      if (user && user.authData) {
        setTempAuthData(user.authData);
        setTempMethod(user.method);
        setShowPkpSelection(true);
        setShowModal(true);
        setShowMethodDetail(false);
        setSelectedMethod(null);
        setIsWebAuthnExistingFlow(user.method === "webauthn");
      }
    },
    updateUserWithPkp: (pkpInfo: any, authContext?: any) => {
      if (user) {
        const updatedUser = {
          ...user,
          pkpInfo,
          authContext: authContext || user.authContext,
        };
        setUser(updatedUser);
        saveUser(updatedUser);
      }
    },
    currentNetworkName: localNetworkName,
    shouldDisplayNetworkMessage:
      showNetworkMessage && isTestnetNetwork(localNetworkName),
    authServiceBaseUrl,
    setAuthServiceBaseUrl,
    loginServiceBaseUrl,
    setLoginServiceBaseUrl,
    forceNetworkSelection,
    autoLoginWithDefaultKey,
    isAutoLoggingIn,
    autoLoginStatus,
  };

  // Always render children with context
  return (
    <LitAuthContext.Provider value={contextValue}>
      {children}

      {/* Setup loading overlay */}
      {!isServicesReady && showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl p-10 text-center max-w-[400px] m-5">
            {setupError ? (
              <div>
                <h3 className="text-red-600 mb-5">⚠️ Setup Failed</h3>
                <p className="text-gray-600 mb-5">{setupError}</p>
                <button
                  onClick={setupServices}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg text-base cursor-pointer"
                >
                  Retry Setup
                </button>
              </div>
            ) : (
              <div>
                <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-5" />
                <h3 className="text-gray-800 mb-2">Setting up Lit Protocol</h3>
                <p className="text-gray-600 m-0">Initialising services...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showModal && isServicesReady && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4 sm:p-5"
          onClick={(e) => {
            if (!closeOnBackdropClick) return;
            if (e.target === e.currentTarget) {
              resetModalState();
            }
          }}
        >
          <div
            id="lit-auth-modal-container"
            className={`bg-white rounded-xl px-4 sm:px-7 pt-6 sm:pt-7 pb-6 sm:pb-7 w-full max-h-[90vh] overflow-y-auto shadow-xl border border-gray-200 relative ${
              showPkpSelection
                ? "max-w-[92vw] sm:max-w-lg md:max-w-xl lg:max-w-[48rem]"
                : "max-w-[92vw] sm:max-w-sm md:max-w-md lg:max-w-[32rem]"
            }`}
          >
            {/* Network message moved to LoggedInDashboard */}
            {/* Settings (top-right) */}
            {showSettingsButton && !showPkpSelection && !showSettingsView && (
              <div className="absolute top-3 right-3 z-[1]">
                <button
                  aria-label="Settings"
                  onClick={() => {
                    setShowSettingsView(true);
                    setShowMethodDetail(false);
                    setShowPkpSelection(false);
                  }}
                  className="inline-flex items-center justify-center p-1.5 border border-gray-300 rounded-md bg-white text-gray-700 cursor-pointer outline-none shadow-none hover:bg-gray-50"
                >
                  <Settings size={16} />
                </button>
              </div>
            )}
            {showSettingsView ? (
              <AuthSettingsPanel
                onClose={() => setShowSettingsView(false)}
                loginServiceBaseUrl={loginServiceBaseUrl}
                setLoginServiceBaseUrl={setLoginServiceBaseUrl}
                defaultLoginServiceBaseUrl={DEFAULT_LOGIN_SERVICE_BASE_URL}
                discordClientId={discordClientId}
                setDiscordClientId={setDiscordClientId}
                defaultDiscordClientId={DEFAULT_DISCORD_CLIENT_ID}
                localNetworkName={localNetworkName}
                setLocalNetworkName={setLocalNetworkName}
                supportedNetworks={supportedNetworks}
                networkModules={NETWORK_MODULES}
                fallbackNetworkModule={nagaDev}
                setLocalNetwork={setLocalNetwork}
                authServiceBaseUrl={authServiceBaseUrl}
                setAuthServiceBaseUrl={setAuthServiceBaseUrl}
                networkDefaultAuthUrl={networkDefaultAuthUrl}
                isAuthUrlCustom={isAuthUrlCustom}
              />
            ) : !showMethodDetail ? (
              // Main method selection or PKP selection
              showPkpSelection ? (
                // PKP Selection View
                <div>
                  <div className="mb-5">
                    <button
                      onClick={() => {
                        setShowPkpSelection(false);
                        setIsWebAuthnExistingFlow(false);
                      }}
                      className="bg-transparent border-0 text-gray-500 text-[13px] cursor-pointer mb-3 flex items-center gap-1.5 px-2 py-1 rounded transition hover:bg-gray-100 hover:text-gray-700"
                    >
                      ← Back to Authentication
                    </button>
                  </div>

                  {tempAuthData && tempMethod && services && (
                    <PKPSelectionSection
                      authData={tempAuthData}
                      onPkpSelected={handlePkpSelectionInModal}
                      authMethodName={`${tempMethod} Auth`}
                      services={services}
                      disabled={isAuthenticating}
                      authServiceBaseUrl={authServiceBaseUrl}
                      singlePkpMessaging={isWebAuthnExistingFlow}
                      currentNetworkName={localNetworkName}
                    />
                  )}
                </div>
              ) : (
                // Main method selection or funding step
                <div className="text-black">
                  <div className="text-center mb-5">
                    <h2 className="text-[22px] font-bold text-gray-900 leading-tight">
                      {modalMode === "signin" ? "Log in" : "Sign up"}
                    </h2>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-700 text-[11px] font-semibold">
                      <span>Network:</span>
                      <span className="font-mono">{localNetworkName}</span>
                    </div>
                    <p className="mt-1.5 text-[13px] text-gray-500 leading-snug m-0">
                      {modalMode === "signin"
                        ? "Access your existing PKP wallet"
                        : "Create a new wallet secured by accounts you already have"}
                    </p>
                  </div>

                  {error && (
                    <div className="px-3 py-2 bg-red-50 border border-red-200 rounded mb-4 text-red-600 text-[12px]">
                      {error}
                    </div>
                  )}

                  {authStep === "fund" && pendingPkpInfo ? (
                    <LedgerFundingPanel
                      pkpAddress={pendingPkpInfo.ethAddress}
                      networkName={localNetworkName}
                      faucetUrl={FAUCET_URL}
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            if (
                              !services ||
                              !pendingAuthData ||
                              !pendingPkpInfo
                            )
                              return;
                            try {
                              setIsCheckingFunding(true);
                              const pm =
                                await services.litClient.getPaymentManager({
                                  account: undefined as any,
                                });
                              const balance = await pm.getBalance({
                                userAddress: pendingPkpInfo.ethAddress,
                              });
                              const available = (balance?.raw
                                ?.availableBalance ?? 0n) as bigint;
                              if (available > 0n) {
                                const authContext =
                                  await services.authManager.createPkpAuthContext(
                                    {
                                      authData: pendingAuthData,
                                      pkpPublicKey: pendingPkpInfo.pubkey,
                                      authConfig: {
                                        expiration: new Date(
                                          Date.now() + 1000 * 60 * 60 * 24
                                        ).toISOString(),
                                        statement: "",
                                        domain: "",
                                        resources: [
                                          ["pkp-signing", "*"],
                                          ["lit-action-execution", "*"],
                                          [
                                            "access-control-condition-decryption",
                                            "*",
                                          ],
                                        ],
                                      },
                                      litClient: services.litClient,
                                    }
                                  );
                                const userData: AuthUser = {
                                  authContext,
                                  pkpInfo: pendingPkpInfo,
                                  method: (tempMethod as AuthMethod) || "eoa",
                                  timestamp: Date.now(),
                                  authData: pendingAuthData,
                                };
                                saveUser(userData);
                              } else {
                                setError(
                                  "No available balance yet. Please deposit, then click Continue again."
                                );
                              }
                            } catch (e) {
                              handleError(
                                e,
                                "Failed to verify funding or create auth context"
                              );
                            } finally {
                              setIsCheckingFunding(false);
                            }
                          }}
                          disabled={isCheckingFunding}
                          className={`px-3 py-2 rounded text-white text-[13px] ${
                            isCheckingFunding ? "bg-gray-400" : "bg-green-600"
                          }`}
                        >
                          {isCheckingFunding ? "Checking..." : "Continue"}
                        </button>
                        <button
                          onClick={() => {
                            setAuthStep("select");
                            setPendingAuthData(null);
                            setPendingPkpInfo(null);
                            setShowMethodDetail(false);
                            setSelectedMethod(null);
                            setError(null);
                          }}
                          className="px-3 py-2 rounded border border-gray-300 text-[13px]"
                        >
                          Cancel
                        </button>
                      </div>
                    </LedgerFundingPanel>
                  ) : (
                    <div className="grid gap-2 mb-4">
                      {filteredAuthMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => handleMethodSelect(method.id)}
                          disabled={
                            !method.available ||
                            isAuthenticating ||
                            (method.id === "webauthn" &&
                              isFido2Available === false)
                          }
                          className={`flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-lg text-[14px] font-medium text-gray-700 transition ${
                            method.available &&
                            !isAuthenticating &&
                            !(
                              method.id === "webauthn" &&
                              isFido2Available === false
                            )
                              ? "bg-white hover:bg-gray-100 hover:border-gray-400 cursor-pointer"
                              : "bg-gray-50 cursor-not-allowed opacity-60"
                          } min-h-[44px] text-left`}
                        >
                          <div className="w-10 flex items-center justify-center">
                            <img
                              src={method.icon}
                              alt={method.name}
                              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                            />
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <span className="font-semibold leading-tight text-center">
                              {method.name}
                              {method.comingSoon && (
                                <span className="text-[12px] text-gray-500 font-normal ml-1">
                                  (Soon)
                                </span>
                              )}
                              {method.id === "webauthn" &&
                                isFido2Available === false && (
                                  <span className="text-[12px] text-red-600 font-normal ml-1">
                                    (Not Available)
                                  </span>
                                )}
                            </span>
                          </div>
                          <div className="w-10 flex items-center justify-center">
                            {isAuthenticating &&
                              selectedMethod === method.id && (
                                <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                              )}
                          </div>
                        </button>
                      ))}
                      {filteredAuthMethods.length === 0 && (
                        <div className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 text-[12px] text-center">
                          No sign-in methods available.
                        </div>
                      )}
                    </div>
                  )}

                  {closeOnBackdropClick && (
                    <div className="text-center mt-4 text-[11px] text-gray-500">
                      Press ESC to close
                    </div>
                  )}

                  {/* Mode Toggle */}
                  {showSignUpPage && (
                    <div className="text-center mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setModalMode(
                            modalMode === "signin" ? "signup" : "signin"
                          )
                        }
                        className="bg-transparent border-0 text-blue-500 text-[13px] cursor-pointer underline font-medium"
                      >
                        {modalMode === "signin"
                          ? "Need an account? Sign up"
                          : "Already have an account? Sign in"}
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              // Method detail view
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <button
                    onClick={() => {
                      setShowMethodDetail(false);
                      setSelectedMethod(null);
                      setAuthStep("select");
                      setError(null);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#6b7280",
                      fontSize: "12px",
                      cursor: "pointer",
                      marginBottom: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    ← Back
                  </button>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {authMethods.find((m) => m.id === selectedMethod)?.name}
                  </h3>
                </div>

                {error && (
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "6px",
                      marginBottom: "16px",
                      color: "#dc2626",
                      fontSize: "12px",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Method-specific form inputs */}
                <div className="mb-4">
                  {selectedMethod === "eoa" && (
                    <div className="text-black">
                      <div className="mb-3">
                        <label className="text-[13px] font-medium mb-1.5 block">
                          Account Method:
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAccountMethod("wallet")}
                            className={`px-4 py-2 border border-gray-300 rounded text-[12px] cursor-pointer font-medium ${
                              accountMethod === "wallet"
                                ? "bg-[#4285F4] text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            Connected Wallet
                          </button>
                          <button
                            onClick={() => setAccountMethod("privateKey")}
                            className={`px-4 py-2 border border-gray-300 rounded text-[12px] cursor-pointer font-medium ${
                              accountMethod === "privateKey"
                                ? "bg-[#4285F4] text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            Private Key
                          </button>
                        </div>
                      </div>
                      {accountMethod === "wallet" && (
                        <div className="text-black mb-3 p-3 bg-[#f8f9fa] rounded border border-[#e9ecef]">
                          <p className="m-0 mb-2 text-[13px] font-medium">
                            <strong className="text-black">
                              Using Connected Wallet:
                            </strong>
                          </p>
                          <p className="m-0 mb-2 text-[12px] text-black leading-snug">
                            This will use your currently connected wallet
                            account (e.g., MetaMask). Make sure your wallet is
                            connected and you have test tokens.
                          </p>
                          <p className="m-0 mb-2 text-[12px] text-gray-600">
                            Need tokens? Visit the{" "}
                            <a
                              href={FAUCET_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#4285F4] underline"
                            >
                              Chronicle Yellowstone Faucet
                            </a>
                          </p>
                          <div className="mt-2">
                            <ConnectButton showBalance={false} />
                          </div>
                        </div>
                      )}
                      {accountMethod === "privateKey" && (
                        <div className="mb-3 text-black">
                          <label className="text-[13px] font-medium mb-1.5 block">
                            Private Key:
                          </label>
                          <input
                            type="password"
                            value={privateKey}
                            onChange={(e) =>
                              setPrivateKey(e.target.value as any)
                            }
                            placeholder="0x..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-[12px] font-mono placeholder-black/70"
                          />
                          <small className="text-gray-600 text-[11px] block mt-1">
                            Default test private key is provided. Replace with
                            your own for production use.
                          </small>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMethod === "webauthn" && (
                    <div className="text-black">
                      <div className="mb-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setWebAuthnMode("register")}
                            className={`px-3 py-1.5 border border-gray-300 rounded text-[12px] cursor-pointer ${
                              webAuthnMode === "register"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            Register New
                          </button>
                          <button
                            onClick={() => setWebAuthnMode("authenticate")}
                            className={`px-3 py-1.5 border border-gray-300 rounded text-[12px] cursor-pointer ${
                              webAuthnMode === "authenticate"
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            Use Existing
                          </button>
                        </div>
                      </div>

                      {webAuthnMode === "register" && (
                        <div className="mb-3">
                          <label className="text-[13px] font-medium mb-1.5 block">
                            Username (optional):
                          </label>
                          <input
                            type="text"
                            value={webAuthnUsername}
                            onChange={(e) =>
                              setWebAuthnUsername(e.target.value)
                            }
                            placeholder="user@example.com"
                            className="w-full px-2.5 py-2 border border-gray-300 rounded text-[12px]"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedMethod === "stytch-email" ||
                    selectedMethod === "stytch-sms" ||
                    selectedMethod === "stytch-whatsapp") && (
                    <div className="text-black">
                      {authStep === "input" && (
                        <div className="mb-3">
                          <label className="text-[13px] font-medium mb-1.5 block">
                            {selectedMethod === "stytch-email"
                              ? "Email Address:"
                              : "Phone Number:"}
                          </label>
                          <input
                            type={
                              selectedMethod === "stytch-email"
                                ? "email"
                                : "tel"
                            }
                            value={
                              selectedMethod === "stytch-email"
                                ? email
                                : phoneNumber
                            }
                            onChange={(e) =>
                              selectedMethod === "stytch-email"
                                ? setEmail(e.target.value)
                                : setPhoneNumber(e.target.value)
                            }
                            placeholder={
                              selectedMethod === "stytch-email"
                                ? "user@example.com"
                                : "+1234567890"
                            }
                            className="w-full px-2.5 py-2 border border-gray-300 rounded text-[12px]"
                          />
                        </div>
                      )}

                      {authStep === "verify" && (
                        <div className="mb-3">
                          <label className="text-[13px] font-medium mb-1.5 block">
                            Verification Code:
                          </label>
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full px-2.5 py-2 border border-gray-300 rounded text-[14px] font-mono tracking-[0.2em] text-center"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMethod === "stytch-totp" && (
                    <div className="text-black">
                      <div className="mb-3">
                        <label className="text-[13px] font-medium mb-1.5 block">
                          Stytch User ID:
                        </label>
                        <input
                          type="text"
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="user-test-uuid-1234"
                          className="w-full px-2.5 py-2 border border-gray-300 rounded text-[12px] font-mono"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="text-[13px] font-medium mb-1.5 block">
                          TOTP Code:
                        </label>
                        <input
                          type="text"
                          value={totpCode}
                          onChange={(e) => setTotpCode(e.target.value)}
                          placeholder="123456"
                          maxLength={6}
                          className="w-full px-2.5 py-2 border border-gray-300 rounded text-[14px] font-mono tracking-[0.2em] text-center"
                        />
                      </div>
                    </div>
                  )}

                  {selectedMethod === "custom" && (
                    <div className="text-black">
                      <div className="mb-3">
                        <label className="text-[13px] font-medium mb-1.5 block">
                          PKP Public Key:
                        </label>
                        <input
                          type="text"
                          value={customPkpPublicKey}
                          onChange={(e) =>
                            setCustomPkpPublicKey(e.target.value)
                          }
                          className="w-full px-2.5 py-2 border border-gray-300 rounded text-[11px] font-mono"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="text-[13px] font-medium mb-1.5 block">
                          Validation CID:
                        </label>
                        <input
                          type="text"
                          value={customValidationCid}
                          onChange={(e) =>
                            setCustomValidationCid(e.target.value)
                          }
                          className="w-full px-2.5 py-2 border border-gray-300 rounded text-[12px] font-mono"
                        />
                      </div>

                      <div className="flex gap-2 mb-3">
                        <div className="flex-1">
                          <label className="text-[13px] font-medium mb-1.5 block">
                            Username:
                          </label>
                          <input
                            type="text"
                            value={customUsername}
                            onChange={(e) => setCustomUsername(e.target.value)}
                            className="w-full px-2.5 py-2 border border-gray-300 rounded text-[12px]"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="text-[13px] font-medium mb-1.5 block">
                            Password:
                          </label>
                          <input
                            type="password"
                            value={customPassword}
                            onChange={(e) => setCustomPassword(e.target.value)}
                            className="w-full px-2.5 py-2 border border-gray-300 rounded text-[12px]"
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="text-[13px] font-medium mb-1.5 block">
                          Auth Method ID:
                        </label>
                        <input
                          type="text"
                          value={customAuthMethodId}
                          onChange={(e) =>
                            setCustomAuthMethodId(e.target.value)
                          }
                          className="w-full px-2.5 py-2 border border-gray-300 rounded text-[11px] font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {authStep !== "fund" && (
                  <button
                    onClick={handleAuthAction}
                    disabled={isAuthenticating}
                    className={`w-full px-3 py-2 ${
                      isAuthenticating ? "bg-gray-400" : "bg-blue-500"
                    } text-white rounded-md text-[13px] font-semibold ${
                      isAuthenticating ? "cursor-not-allowed" : "cursor-pointer"
                    } flex items-center justify-center gap-1.5`}
                  >
                    {isAuthenticating && (
                      <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    )}
                    {isAuthenticating
                      ? "Connecting..."
                      : authStep === "verify"
                      ? "Verify Code"
                      : authStep === "input" &&
                        (selectedMethod === "stytch-email" ||
                          selectedMethod === "stytch-sms" ||
                          selectedMethod === "stytch-whatsapp")
                      ? "Send Code"
                      : "Connect"}
                  </button>
                )}
              </div>
            )}
            <div className="text-gray-700 text-xs text-center font-bold mt-4 flex items-center justify-center gap-1">
              <span>Powered by</span>
              <img src={litPrimaryOrangeIcon} alt="Lit logo" className="h-3" />
            </div>
          </div>
        </div>
      )}
    </LitAuthContext.Provider>
  );
};
