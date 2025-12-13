/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { createLitClient } from '@lit-protocol/lit-client';
import { naga, nagaDev, nagaProto, nagaTest } from '@lit-protocol/networks';
import type { AuthData, PKPData } from '@lit-protocol/schemas';
import { WalletClientAuthenticator } from '@lit-protocol/auth';
import { createWalletClient, custom, getAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { LitAuthContext } from './LitAuthContext';
import { AuthSettingsPanel } from './components/AuthSettingsPanel';
import { DefaultPkpSelectionSection } from './components/DefaultPkpSelectionSection';
import { LedgerFundingPanel } from './components/LedgerFundingPanel';
import { AUTH_METHOD_ICON_SRC } from './theme/authMethodIcons';
import { EXPLORER_THEME_CSS } from './theme/explorerTheme';
import type {
  AuthMethod,
  AuthUser,
  LitLoginModalProps,
  LitServices,
  SupportedNetworkName,
} from './types';

type NetworkModule = typeof nagaDev | typeof nagaTest | typeof nagaProto | typeof naga;

const DEFAULT_SUPPORTED_NETWORKS: SupportedNetworkName[] = [
  'naga-dev',
  'naga-test',
  'naga-proto',
  'naga',
];

const DEFAULT_NETWORK_MODULES: Record<SupportedNetworkName, NetworkModule> = {
  'naga-dev': nagaDev,
  'naga-test': nagaTest,
  'naga-proto': nagaProto,
  naga,
};

function isTestnetNetwork(networkName: SupportedNetworkName): boolean {
  return networkName === 'naga-dev' || networkName === 'naga-test';
}

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timeoutId);
        resolve(value);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

function formatServicesSetupError(params: {
  networkName: SupportedNetworkName;
  error: unknown;
}): string {
  const { networkName, error } = params;
  const raw = error instanceof Error ? error.message : String(error);

  if (networkName === 'naga') {
    return `Failed to connect to '${networkName}'. This network may be unavailable or not live yet.\n\n${raw}`;
  }

  return `Failed to connect to '${networkName}'.\n\n${raw}`;
}

function getButtonClass(
  variant: 'primary' | 'secondary' | 'ghost',
): string {
  return `lit-login-modal__btn lit-login-modal__btn--${variant}`;
}

function ensureValidConfig(params: {
  enabledAuthMethods: AuthMethod[];
  supportedNetworks: SupportedNetworkName[];
  services: LitLoginModalProps['services'];
}): void {
  const { enabledAuthMethods, supportedNetworks, services } = params;

  const enablesNonEoa = enabledAuthMethods.some((method) => method !== 'eoa');
  if (!enablesNonEoa) return;

  const missing: string[] = [];
  if (!services) missing.push('services');

  const authServiceUrls = services?.authServiceUrls;
  if (!authServiceUrls) {
    missing.push('services.authServiceUrls');
  } else {
    for (const networkName of supportedNetworks) {
      if (!authServiceUrls[networkName]) {
        missing.push(`services.authServiceUrls['${networkName}']`);
      }
    }
  }

  const needsLoginServer = enabledAuthMethods.some(
    (method) => method === 'google' || method === 'discord'
  );
  if (needsLoginServer && !services?.loginServerUrl) {
    missing.push('services.loginServerUrl');
  }

  if (
    enabledAuthMethods.includes('discord') &&
    !services?.discordClientId
  ) {
    missing.push('services.discordClientId');
  }

  if (missing.length > 0) {
    throw new Error(
      `LitLoginModal: missing required config: ${missing.join(', ')}`
    );
  }
}

async function getInjectedWalletClient() {
  const ethereum = (globalThis as any).ethereum;
  if (!ethereum) throw new Error('No injected wallet found (window.ethereum)');

  const accounts: string[] = await ethereum.request({
    method: 'eth_requestAccounts',
  });
  const address = accounts?.[0];
  if (!address) throw new Error('No wallet accounts returned');

  return createWalletClient({
    account: getAddress(address),
    transport: custom(ethereum),
  });
}

type ModalStep = 'select-method' | 'method-detail' | 'pkp-select' | 'funding';

const AUTH_METHOD_DISPLAY: Record<AuthMethod, { name: string; iconSrc: string }> = {
  google: { name: 'Google', iconSrc: AUTH_METHOD_ICON_SRC.google },
  discord: { name: 'Discord', iconSrc: AUTH_METHOD_ICON_SRC.discord },
  eoa: { name: 'Web3 Wallet', iconSrc: AUTH_METHOD_ICON_SRC.eoa },
  webauthn: { name: 'WebAuthn', iconSrc: AUTH_METHOD_ICON_SRC.webauthn },
  'stytch-email': { name: 'Email OTP', iconSrc: AUTH_METHOD_ICON_SRC['stytch-email'] },
  'stytch-sms': { name: 'SMS', iconSrc: AUTH_METHOD_ICON_SRC['stytch-sms'] },
  'stytch-whatsapp': {
    name: 'WhatsApp',
    iconSrc: AUTH_METHOD_ICON_SRC['stytch-whatsapp'],
  },
  'stytch-totp': {
    name: 'Authenticator',
    iconSrc: AUTH_METHOD_ICON_SRC['stytch-totp'],
  },
};

function getAuthMethodDisplayName(method: AuthMethod): string {
  return AUTH_METHOD_DISPLAY[method]?.name ?? method;
}

export function LitLoginModal({
  children,
  appName,
  supportedNetworks = DEFAULT_SUPPORTED_NETWORKS,
  defaultNetwork = 'naga-dev',
  enabledAuthMethods = ['eoa'],
  services,
  features = {},
  components = {},
  persistUser = false,
  storageKey = 'lit-auth-user',
  closeOnBackdropClick = true,
  faucetUrl,
  showNetworkMessage = false,
  defaultPrivateKey,
}: LitLoginModalProps) {
  ensureValidConfig({ enabledAuthMethods, supportedNetworks, services });

  const initialNetwork = supportedNetworks.includes(defaultNetwork)
    ? defaultNetwork
    : supportedNetworks[0] ?? 'naga-dev';

  const currentNetworkNameRef = useRef<SupportedNetworkName>(initialNetwork);
  const [currentNetworkName, setCurrentNetworkName] =
    useState<SupportedNetworkName>(currentNetworkNameRef.current);
  const [servicesState, setServicesState] = useState<LitServices | null>(null);
  const [isInitializingServices, setIsInitializingServices] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [user, setUser] = useState<AuthUser | null>(null);
  const isAuthenticated = !!user?.authContext && !!user?.pkpInfo;

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<ModalStep>('select-method');
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null);
  const [showSettingsView, setShowSettingsView] = useState(false);

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [privateKey, setPrivateKey] = useState('');
  const [stytchEmail, setStytchEmail] = useState('');
  const [stytchPhoneNumber, setStytchPhoneNumber] = useState('');
  const [stytchOtpCode, setStytchOtpCode] = useState('');
  const [stytchMethodId, setStytchMethodId] = useState('');
  const [stytchTotpUserId, setStytchTotpUserId] = useState('');
  const [stytchTotpCode, setStytchTotpCode] = useState('');
  const [webAuthnUsername, setWebAuthnUsername] = useState('');
  const [webAuthnMode, setWebAuthnMode] = useState<'authenticate' | 'register'>(
    'authenticate'
  );
  const [isFido2Available, setIsFido2Available] = useState<boolean | null>(null);

  const [pendingAuthData, setPendingAuthData] = useState<AuthData | null>(null);
  const [pendingMethod, setPendingMethod] = useState<AuthMethod | null>(null);
  const [pendingPkpInfo, setPendingPkpInfo] = useState<PKPData | null>(null);

  const shouldPersistSettings = Boolean(features.persistSettings);
  const settingsStoragePrefix = `lit-login-modal:${appName}`;

  const [authServiceUrlsByNetwork, setAuthServiceUrlsByNetwork] = useState<
    Partial<Record<SupportedNetworkName, string>>
  >(() => {
    const base = services?.authServiceUrls ?? {};
    if (!shouldPersistSettings) return base;
    try {
      const raw = (globalThis as any)?.localStorage?.getItem(
        `${settingsStoragePrefix}:authServiceUrls`
      );
      if (!raw) return base;
      return {
        ...base,
        ...(JSON.parse(raw) as Partial<Record<SupportedNetworkName, string>>),
      };
    } catch {
      return base;
    }
  });
  const [loginServiceBaseUrl, setLoginServiceBaseUrlState] = useState(() => {
    const base = services?.loginServerUrl ?? '';
    if (!shouldPersistSettings) return base;
    try {
      return (
        (globalThis as any)?.localStorage?.getItem(
          `${settingsStoragePrefix}:loginServerUrl`
        ) ?? base
      );
    } catch {
      return base;
    }
  });
  const [discordClientId, setDiscordClientId] = useState(() => {
    const base = services?.discordClientId ?? '';
    if (!shouldPersistSettings) return base;
    try {
      return (
        (globalThis as any)?.localStorage?.getItem(
          `${settingsStoragePrefix}:discordClientId`
        ) ?? base
      );
    } catch {
      return base;
    }
  });

  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [autoLoginStatus, setAutoLoginStatus] = useState<string | null>(null);
  const autoLoginInProgressRef = useRef(false);

  const servicesRef = useRef<LitServices | null>(null);
  const initializingRef = useRef(false);

  const authServiceBaseUrl = useMemo(() => {
    const url = authServiceUrlsByNetwork[currentNetworkName];
    return url ?? '';
  }, [authServiceUrlsByNetwork, currentNetworkName]);

  const setAuthServiceBaseUrl = useCallback(
    (url: string) => {
      setAuthServiceUrlsByNetwork((prev) => ({
        ...prev,
        [currentNetworkName]: url,
      }));
    },
    [currentNetworkName]
  );

  const setLoginServiceBaseUrl = useCallback((url: string) => {
    setLoginServiceBaseUrlState(url);
  }, []);

  useEffect(() => {
    if (!shouldPersistSettings) return;
    try {
      localStorage.setItem(
        `${settingsStoragePrefix}:authServiceUrls`,
        JSON.stringify(authServiceUrlsByNetwork)
      );
    } catch {
      // ignore
    }
  }, [authServiceUrlsByNetwork, settingsStoragePrefix, shouldPersistSettings]);

  useEffect(() => {
    if (!shouldPersistSettings) return;
    try {
      localStorage.setItem(
        `${settingsStoragePrefix}:loginServerUrl`,
        loginServiceBaseUrl
      );
    } catch {
      // ignore
    }
  }, [loginServiceBaseUrl, settingsStoragePrefix, shouldPersistSettings]);

  useEffect(() => {
    if (!shouldPersistSettings) return;
    try {
      localStorage.setItem(
        `${settingsStoragePrefix}:discordClientId`,
        discordClientId
      );
    } catch {
      // ignore
    }
  }, [discordClientId, settingsStoragePrefix, shouldPersistSettings]);

  const shouldDisplayNetworkMessage = useMemo(
    () => !!showNetworkMessage && isTestnetNetwork(currentNetworkName),
    [currentNetworkName, showNetworkMessage]
  );

  const setupServices = useCallback(async (): Promise<LitServices> => {
    if (servicesRef.current) return servicesRef.current;
    if (initializingRef.current) {
      throw new Error('Services are already being initialized');
    }

    try {
      initializingRef.current = true;
      setIsInitializingServices(true);
      setServicesError(null);

      const networkName = currentNetworkNameRef.current;
      const networkModule =
        DEFAULT_NETWORK_MODULES[networkName] ?? nagaDev;

      const litClient = await withTimeout(
        createLitClient({
          network: networkModule as unknown as Parameters<
            typeof createLitClient
          >[0]['network'],
        }),
        15_000,
        `Timed out while connecting to '${networkName}'.`
      );

      const { createAuthManager, storagePlugins } = await import(
        '@lit-protocol/auth'
      );
      const authManager = createAuthManager({
        storage: storagePlugins.localStorage({
          appName,
          networkName,
        }),
      });

      const nextServices: LitServices = { litClient, authManager };
      servicesRef.current = nextServices;
      setServicesState(nextServices);
      return nextServices;
    } catch (err) {
      setServicesError(
        formatServicesSetupError({
          networkName: currentNetworkNameRef.current,
          error: err,
        })
      );
      throw err;
    } finally {
      setIsInitializingServices(false);
      initializingRef.current = false;
    }
  }, [appName]);

  const clearServices = useCallback(() => {
    servicesRef.current = null;
    setServicesState(null);
    setServicesError(null);
  }, []);

  const forceNetworkSelection = useCallback(
    async (networkName: SupportedNetworkName) => {
      if (networkName !== currentNetworkNameRef.current) {
        currentNetworkNameRef.current = networkName;
        setCurrentNetworkName(networkName);
        clearServices();
      }

      await setupServices();
    },
    [clearServices, setupServices]
  );

  const resetModalState = useCallback(() => {
    setShowModal(false);
    setStep('select-method');
    setSelectedMethod(null);
    setShowSettingsView(false);
    setError(null);
    setIsAuthenticating(false);
    setServicesError(null);

    setPrivateKey('');
    setStytchEmail('');
    setStytchPhoneNumber('');
    setStytchOtpCode('');
    setStytchMethodId('');
    setStytchTotpUserId('');
    setStytchTotpCode('');
    setWebAuthnUsername('');
    setWebAuthnMode('authenticate');

    setPendingAuthData(null);
    setPendingMethod(null);
    setPendingPkpInfo(null);
  }, []);

  useEffect(() => {
    if (!persistUser) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      // ignore
    }
  }, [persistUser, storageKey]);

  useEffect(() => {
    let cancelled = false;

    const checkFido2Availability = async () => {
      const publicKeyCredential = (globalThis as any).PublicKeyCredential;
      if (!publicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) {
        setIsFido2Available(false);
        return;
      }

      try {
        const available =
          await publicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!cancelled) setIsFido2Available(Boolean(available));
      } catch {
        if (!cancelled) setIsFido2Available(false);
      }
    };

    void checkFido2Availability();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveUser = useCallback(
    (userData: AuthUser) => {
      setUser(userData);
      if (persistUser) {
        localStorage.setItem(storageKey, JSON.stringify(userData));
      }
      resetModalState();
    },
    [persistUser, resetModalState, storageKey]
  );

  const logout = useCallback(() => {
    setUser(null);
    if (persistUser) {
      localStorage.removeItem(storageKey);
    }
    resetModalState();
  }, [persistUser, resetModalState, storageKey]);

  const showAuthModal = useCallback(() => {
    if (!isAuthenticated) {
      setShowModal(true);
    }
  }, [isAuthenticated]);

  const hideAuthModal = useCallback(() => {
    resetModalState();
  }, [resetModalState]);

  const initiateAuthentication = useCallback(() => {
    showAuthModal();
  }, [showAuthModal]);

  const ensureServicesReady = useCallback(async (): Promise<LitServices> => {
    if (servicesRef.current) return servicesRef.current;
    return await setupServices();
  }, [setupServices]);

  useEffect(() => {
    if (!showModal || isAuthenticated) return;
    if (servicesRef.current) return;
    if (isInitializingServices) return;
    if (servicesError) return;
    void setupServices().catch(() => {
      // handled via servicesError state
    });
  }, [isAuthenticated, isInitializingServices, servicesError, setupServices, showModal]);

  useEffect(() => {
    if (!showModal) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideAuthModal();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [hideAuthModal, showModal]);

  const handlePkpSelected = useCallback(
    async (pkpInfo: PKPData) => {
      if (!pendingAuthData || !pendingMethod) return;
      const activeServices = await ensureServicesReady();

      try {
        setIsAuthenticating(true);
        setError(null);

        const authContext = await activeServices.authManager.createPkpAuthContext(
          {
            authData: pendingAuthData,
            pkpPublicKey: pkpInfo.pubkey,
            authConfig: {
              expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
              statement: '',
              domain: '',
              resources: [
                ['pkp-signing', '*'],
                ['lit-action-execution', '*'],
                ['access-control-condition-decryption', '*'],
              ],
            },
            litClient: activeServices.litClient,
          }
        );

        saveUser({
          authContext,
          pkpInfo,
          method: pendingMethod,
          timestamp: Date.now(),
          authData: pendingAuthData,
        });
      } catch (err) {
        if (features.funding && faucetUrl && isTestnetNetwork(currentNetworkName)) {
          setPendingPkpInfo(pkpInfo);
          setStep('funding');
          setError(
            'Please fund your Lit Ledger account for this PKP, then continue.'
          );
        } else {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        setIsAuthenticating(false);
      }
    },
    [
      currentNetworkName,
      ensureServicesReady,
      faucetUrl,
      features.funding,
      pendingAuthData,
      pendingMethod,
      saveUser,
    ]
  );

  const proceedToPkpSelection = useCallback(
    async (authData: AuthData, method: AuthMethod) => {
      setPendingAuthData(authData);
      setPendingMethod(method);
      setSelectedMethod(null);
      setStep('pkp-select');
      setError(null);

      await ensureServicesReady();
    },
    [ensureServicesReady]
  );

  const authenticateGoogle = useCallback(async () => {
    if (!loginServiceBaseUrl) return;
    setIsAuthenticating(true);
    setError(null);
    try {
      const { GoogleAuthenticator } = await import('@lit-protocol/auth');
      const authData = await GoogleAuthenticator.authenticate(loginServiceBaseUrl);
      await proceedToPkpSelection(authData, 'google');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [loginServiceBaseUrl, proceedToPkpSelection]);

  const authenticateDiscord = useCallback(async () => {
    if (!loginServiceBaseUrl) return;
    if (!discordClientId) return;
    setIsAuthenticating(true);
    setError(null);
    try {
      const { DiscordAuthenticator } = await import('@lit-protocol/auth');
      const authData = await DiscordAuthenticator.authenticate(loginServiceBaseUrl, {
        clientId: discordClientId,
      });
      await proceedToPkpSelection(authData, 'discord');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [discordClientId, loginServiceBaseUrl, proceedToPkpSelection]);

  const authenticateEoa = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      let authData: AuthData;
      if (privateKey.trim()) {
        const account = privateKeyToAccount(privateKey.trim() as `0x${string}`);
        const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
        authData = await ViemAccountAuthenticator.authenticate(account);
      } else {
        const walletClient = await getInjectedWalletClient();
        authData = await WalletClientAuthenticator.authenticate(walletClient);
      }
      await proceedToPkpSelection(authData, 'eoa');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [privateKey, proceedToPkpSelection]);

  const authenticateWebAuthn = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const { WebAuthnAuthenticator } = await import('@lit-protocol/auth');
      if (webAuthnMode === 'register') {
        await WebAuthnAuthenticator.registerAndMintPKP({
          authServiceBaseUrl,
          apiKey: services?.authServiceApiKey,
          username:
            webAuthnUsername.trim() ||
            `${currentNetworkName}-${Date.now().toString(16)}`,
          scopes: ['sign-anything'],
        });
      }

      const authData = await WebAuthnAuthenticator.authenticate();
      await proceedToPkpSelection(authData, 'webauthn');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    authServiceBaseUrl,
    currentNetworkName,
    proceedToPkpSelection,
    services?.authServiceApiKey,
    webAuthnMode,
    webAuthnUsername,
  ]);

  const sendStytchOtp = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      let result: { methodId?: string } | undefined;

      if (selectedMethod === 'stytch-email') {
        const { StytchEmailOtpAuthenticator } = await import('@lit-protocol/auth');
        result = await StytchEmailOtpAuthenticator.sendOtp({
          email: stytchEmail,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === 'stytch-sms') {
        const { StytchSmsOtpAuthenticator } = await import('@lit-protocol/auth');
        result = await StytchSmsOtpAuthenticator.sendOtp({
          phoneNumber: stytchPhoneNumber,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === 'stytch-whatsapp') {
        const { StytchWhatsAppOtpAuthenticator } = await import(
          '@lit-protocol/auth'
        );
        result = await StytchWhatsAppOtpAuthenticator.sendOtp({
          phoneNumber: stytchPhoneNumber,
          authServiceBaseUrl,
        });
      }

      if (result?.methodId) {
        setStytchMethodId(result.methodId);
      } else {
        throw new Error('No Stytch method id returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    authServiceBaseUrl,
    selectedMethod,
    stytchEmail,
    stytchPhoneNumber,
  ]);

  const verifyStytchOtp = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      let authData: AuthData | undefined;

      if (selectedMethod === 'stytch-email') {
        const { StytchEmailOtpAuthenticator } = await import('@lit-protocol/auth');
        authData = await StytchEmailOtpAuthenticator.authenticate({
          methodId: stytchMethodId,
          code: stytchOtpCode,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === 'stytch-sms') {
        const { StytchSmsOtpAuthenticator } = await import('@lit-protocol/auth');
        authData = await StytchSmsOtpAuthenticator.authenticate({
          methodId: stytchMethodId,
          code: stytchOtpCode,
          authServiceBaseUrl,
        });
      } else if (selectedMethod === 'stytch-whatsapp') {
        const { StytchWhatsAppOtpAuthenticator } = await import(
          '@lit-protocol/auth'
        );
        authData = await StytchWhatsAppOtpAuthenticator.authenticate({
          methodId: stytchMethodId,
          code: stytchOtpCode,
          authServiceBaseUrl,
        });
      }

      if (!authData) throw new Error('No auth data returned');
      await proceedToPkpSelection(authData, selectedMethod as AuthMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    authServiceBaseUrl,
    proceedToPkpSelection,
    selectedMethod,
    stytchMethodId,
    stytchOtpCode,
  ]);

  const authenticateStytchTotp = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const { StytchTotp2FAAuthenticator } = await import('@lit-protocol/auth');
      const authData = await StytchTotp2FAAuthenticator.authenticate({
        userId: stytchTotpUserId,
        totpCode: stytchTotpCode,
        authServiceBaseUrl,
      });
      await proceedToPkpSelection(authData, 'stytch-totp');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, [authServiceBaseUrl, proceedToPkpSelection, stytchTotpCode, stytchTotpUserId]);

  const autoLoginWithDefaultKey = useCallback(
    async (options?: {
      forceNetwork?: SupportedNetworkName;
    }): Promise<boolean> => {
      if (autoLoginInProgressRef.current) {
        return isAuthenticated;
      }

      if (isAuthenticated) {
        setAutoLoginStatus(null);
        if (
          options?.forceNetwork &&
          currentNetworkNameRef.current !== options.forceNetwork
        ) {
          await forceNetworkSelection(options.forceNetwork);
        }
        return true;
      }

      const rawPrivateKey = defaultPrivateKey?.trim();
      if (!rawPrivateKey) return false;

      autoLoginInProgressRef.current = true;
      setIsAutoLoggingIn(true);
      setIsAuthenticating(true);
      setError(null);
      setAutoLoginStatus('Preparing automatic login…');

      try {
        const targetNetwork = options?.forceNetwork ?? currentNetworkNameRef.current;
        setAutoLoginStatus(`Switching to ${targetNetwork} network…`);
        await forceNetworkSelection(targetNetwork);

        setAutoLoginStatus('Initialising Lit services…');
        const activeServices = await ensureServicesReady();

        const normalizedPrivateKey = rawPrivateKey.startsWith('0x')
          ? rawPrivateKey
          : `0x${rawPrivateKey}`;
        if (normalizedPrivateKey.length !== 66) {
          throw new Error('Invalid private key format');
        }

        const account = privateKeyToAccount(normalizedPrivateKey as `0x${string}`);
        setAutoLoginStatus('Authenticating with development wallet…');
        const { ViemAccountAuthenticator } = await import('@lit-protocol/auth');
        const authData = await ViemAccountAuthenticator.authenticate(account);

        setAutoLoginStatus('Fetching PKPs for development wallet…');
        const pkpResult: any = await activeServices.litClient.viewPKPsByAuthData({
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
            'No PKPs found for the development wallet. Please mint one.'
          );
          setError(
            'No PKPs found for the default development private key. Please mint one first.'
          );
          return false;
        }

        const pkpInfo: PKPData = {
          tokenId: BigInt(firstPkp.tokenId),
          pubkey: firstPkp.pubkey || firstPkp.publicKey || '',
          ethAddress: firstPkp.ethAddress || '',
        };
        if (!pkpInfo.pubkey) {
          setAutoLoginStatus('Unable to locate PKP for development wallet.');
          throw new Error(
            'Unable to locate a public key for the default PKP during automatic login.'
          );
        }

        setAutoLoginStatus('Creating Lit session for your PKP…');
        const authContext = await activeServices.authManager.createPkpAuthContext({
          authData,
          pkpPublicKey: pkpInfo.pubkey,
          authConfig: {
            expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            statement: '',
            domain: '',
            resources: [
              ['pkp-signing', '*'],
              ['lit-action-execution', '*'],
              ['access-control-condition-decryption', '*'],
            ],
          },
          litClient: activeServices.litClient,
        });

        saveUser({
          authContext,
          pkpInfo,
          method: 'eoa',
          timestamp: Date.now(),
          authData,
        });

        setAutoLoginStatus('Automatic login complete.');
        setTimeout(() => setAutoLoginStatus(null), 1500);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setAutoLoginStatus('Automatic login failed. Opening sign-in modal…');
        return false;
      } finally {
        setIsAuthenticating(false);
        setIsAutoLoggingIn(false);
        autoLoginInProgressRef.current = false;
      }
    },
    [
      defaultPrivateKey,
      ensureServicesReady,
      forceNetworkSelection,
      isAuthenticated,
      saveUser,
    ]
  );

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthenticating,
      error: error ?? servicesError,

      services: servicesState,
      isServicesReady: !!servicesState?.litClient && !!servicesState?.authManager,
      isInitializingServices,

      currentNetworkName,
      authServiceBaseUrl,
      setAuthServiceBaseUrl,
      loginServiceBaseUrl,
      setLoginServiceBaseUrl,
      shouldDisplayNetworkMessage,

      showAuthModal,
      hideAuthModal,
      initiateAuthentication,
      forceNetworkSelection,
      autoLoginWithDefaultKey,
      isAutoLoggingIn,
      autoLoginStatus,
      logout,
    }),
    [
      authServiceBaseUrl,
      autoLoginStatus,
      autoLoginWithDefaultKey,
      currentNetworkName,
      error,
      forceNetworkSelection,
      hideAuthModal,
      initiateAuthentication,
      isAuthenticated,
      isAuthenticating,
      isAutoLoggingIn,
      isInitializingServices,
      loginServiceBaseUrl,
      logout,
      servicesError,
      servicesState,
      setAuthServiceBaseUrl,
      setLoginServiceBaseUrl,
      shouldDisplayNetworkMessage,
      showAuthModal,
      user,
    ]
  );

  const PkpSelection = components.PkpSelection ?? DefaultPkpSelectionSection;
  const FundingPanel = components.FundingPanel ?? LedgerFundingPanel;

  const renderAlerts = () => (
    <>
      {error ? (
        <div className="lit-login-modal__alert lit-login-modal__alert--error">
          {error}
        </div>
      ) : null}
      {servicesError ? (
        <div className="lit-login-modal__alert lit-login-modal__alert--warn">
          {servicesError}
        </div>
      ) : null}
    </>
  );

  const renderModalBody = () => {
    if (!showModal) return null;

    if (showSettingsView) {
      return (
        <div className="lit-login-modal__section">
          {renderAlerts()}
          <AuthSettingsPanel
            onClose={() => setShowSettingsView(false)}
            supportedNetworks={supportedNetworks}
            currentNetworkName={currentNetworkName}
            onSelectNetwork={(networkName) => {
              void forceNetworkSelection(networkName).catch(() => {
                // handled via servicesError state
              });
            }}
            loginServiceBaseUrl={loginServiceBaseUrl}
            setLoginServiceBaseUrl={setLoginServiceBaseUrl}
            defaultLoginServiceBaseUrl={services?.loginServerUrl ?? ''}
            discordClientId={discordClientId}
            setDiscordClientId={setDiscordClientId}
            defaultDiscordClientId={services?.discordClientId ?? ''}
            authServiceBaseUrl={authServiceBaseUrl}
            setAuthServiceBaseUrl={setAuthServiceBaseUrl}
            defaultAuthServiceBaseUrl={
              services?.authServiceUrls?.[currentNetworkName] ?? ''
            }
          />
        </div>
      );
    }

    if (!servicesState) return null;

    if (step === 'pkp-select' && pendingAuthData && pendingMethod && servicesState) {
      return (
        <div className="lit-login-modal__section">
          <div>
            <button
              type="button"
              onClick={() => {
                setStep('select-method');
                setPendingAuthData(null);
                setPendingMethod(null);
                setPendingPkpInfo(null);
              }}
              disabled={isAuthenticating}
              className={getButtonClass('ghost')}
            >
              ← Back to Authentication
            </button>
          </div>
          {renderAlerts()}
          <PkpSelection
            authData={pendingAuthData}
            onPkpSelected={handlePkpSelected}
            authMethodName={`${getAuthMethodDisplayName(pendingMethod)} Auth`}
            services={servicesState}
            disabled={isAuthenticating}
            authServiceBaseUrl={authServiceBaseUrl}
            currentNetworkName={currentNetworkName}
          />
        </div>
      );
    }

    if (step === 'funding' && pendingPkpInfo && faucetUrl) {
      return (
        <div className="lit-login-modal__section">
          {renderAlerts()}
          <FundingPanel
            pkpAddress={pendingPkpInfo.ethAddress}
            networkName={currentNetworkName}
            faucetUrl={faucetUrl}
          >
            <div className="lit-login-modal__row">
              <button
                type="button"
                onClick={() => {
                  if (pendingPkpInfo) void handlePkpSelected(pendingPkpInfo);
                }}
                disabled={isAuthenticating}
                className={getButtonClass('primary')}
              >
                I have funded it
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('pkp-select');
                  setPendingPkpInfo(null);
                }}
                disabled={isAuthenticating}
                className={getButtonClass('secondary')}
              >
                Back
              </button>
            </div>
          </FundingPanel>
        </div>
      );
    }

    if (step === 'method-detail' && selectedMethod) {
      return (
        <div className="lit-login-modal__section">
          <div>
            <button
              type="button"
              onClick={() => {
                setStep('select-method');
                setSelectedMethod(null);
                setError(null);
              }}
              disabled={isAuthenticating}
              className={getButtonClass('ghost')}
            >
              ← Back
            </button>
          </div>

          <div>
            <h3 className="lit-login-modal__h3">
              {getAuthMethodDisplayName(selectedMethod)}
            </h3>
          </div>

          {renderAlerts()}

          {selectedMethod === 'eoa' ? (
            <div className="lit-login-modal__section">
              <div className="lit-login-modal__muted">
                Leave the private key blank to use an injected wallet.
              </div>
              <label className="lit-login-modal__field">
                <span className="lit-login-modal__label">Private key (optional)</span>
                <input
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="0x…"
                  className="lit-login-modal__input"
                />
              </label>
              <button
                type="button"
                onClick={() => void authenticateEoa()}
                disabled={isAuthenticating}
                className={`${getButtonClass('primary')} lit-login-modal__btn--block`}
              >
                Continue
              </button>
            </div>
          ) : null}

          {selectedMethod === 'webauthn' ? (
            <div className="lit-login-modal__section">
              <label className="lit-login-modal__field">
                <span className="lit-login-modal__label">Mode</span>
                <select
                  value={webAuthnMode}
                  onChange={(e) =>
                    setWebAuthnMode(e.target.value as 'authenticate' | 'register')
                  }
                  className="lit-login-modal__select"
                >
                  <option value="authenticate">Use existing passkey</option>
                  <option value="register">Register new passkey (mints PKP)</option>
                </select>
              </label>
              {webAuthnMode === 'register' ? (
                <label className="lit-login-modal__field">
                  <span className="lit-login-modal__label">Username (optional)</span>
                  <input
                    value={webAuthnUsername}
                    onChange={(e) => setWebAuthnUsername(e.target.value)}
                    placeholder="alice"
                    className="lit-login-modal__input"
                  />
                </label>
              ) : null}
              <button
                type="button"
                onClick={() => void authenticateWebAuthn()}
                disabled={isAuthenticating}
                className={`${getButtonClass('primary')} lit-login-modal__btn--block`}
              >
                Continue
              </button>
            </div>
          ) : null}

          {['stytch-email', 'stytch-sms', 'stytch-whatsapp'].includes(
            selectedMethod
          ) ? (
            <div className="lit-login-modal__section">
              {selectedMethod === 'stytch-email' ? (
                <label className="lit-login-modal__field">
                  <span className="lit-login-modal__label">Email</span>
                  <input
                    value={stytchEmail}
                    onChange={(e) => setStytchEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="lit-login-modal__input"
                  />
                </label>
              ) : (
                <label className="lit-login-modal__field">
                  <span className="lit-login-modal__label">Phone number</span>
                  <input
                    value={stytchPhoneNumber}
                    onChange={(e) => setStytchPhoneNumber(e.target.value)}
                    placeholder="+1…"
                    className="lit-login-modal__input"
                  />
                </label>
              )}

              {stytchMethodId ? (
                <label className="lit-login-modal__field">
                  <span className="lit-login-modal__label">OTP code</span>
                  <input
                    value={stytchOtpCode}
                    onChange={(e) => setStytchOtpCode(e.target.value)}
                    placeholder="123456"
                    className="lit-login-modal__input"
                  />
                </label>
              ) : null}

              <div className="lit-login-modal__row">
                {!stytchMethodId ? (
                  <button
                    type="button"
                    onClick={() => void sendStytchOtp()}
                    disabled={isAuthenticating}
                    className={`${getButtonClass('primary')} lit-login-modal__btn--block`}
                  >
                    Send OTP
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void verifyStytchOtp()}
                    disabled={isAuthenticating}
                    className={`${getButtonClass('primary')} lit-login-modal__btn--block`}
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {selectedMethod === 'stytch-totp' ? (
            <div className="lit-login-modal__section">
              <label className="lit-login-modal__field">
                <span className="lit-login-modal__label">User ID</span>
                <input
                  value={stytchTotpUserId}
                  onChange={(e) => setStytchTotpUserId(e.target.value)}
                  placeholder="user_…"
                  className="lit-login-modal__input"
                />
              </label>
              <label className="lit-login-modal__field">
                <span className="lit-login-modal__label">TOTP code</span>
                <input
                  value={stytchTotpCode}
                  onChange={(e) => setStytchTotpCode(e.target.value)}
                  placeholder="123456"
                  className="lit-login-modal__input"
                />
              </label>
              <button
                type="button"
                onClick={() => void authenticateStytchTotp()}
                disabled={isAuthenticating}
                className={`${getButtonClass('primary')} lit-login-modal__btn--block`}
              >
                Continue
              </button>
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <div className="lit-login-modal__section">
        <div className="lit-login-modal__header">
          <h2 className="lit-login-modal__title">Log in</h2>
          <div className="lit-login-modal__badge">
            <span>Network:</span>
            <span className="lit-login-modal__mono">{currentNetworkName}</span>
          </div>
          <p className="lit-login-modal__subtitle">
            Access your existing PKP wallet
          </p>
        </div>

        {renderAlerts()}

        <div className="lit-login-modal__methodList">
          {enabledAuthMethods.map((method) => {
            const info = AUTH_METHOD_DISPLAY[method];
            const isUnavailable =
              method === 'webauthn' && isFido2Available === false;
            const disabled = isAuthenticating || isUnavailable;

            return (
              <button
                key={method}
                type="button"
                className="lit-login-modal__methodButton"
                onClick={() => {
                  setSelectedMethod(method);
                  setError(null);

                  if (method === 'google') {
                    void authenticateGoogle();
                    return;
                  }

                  if (method === 'discord') {
                    void authenticateDiscord();
                    return;
                  }

                  setStep('method-detail');
                }}
                disabled={disabled}
              >
                <div className="lit-login-modal__methodIcon">
                  {info?.iconSrc ? (
                    <img src={info.iconSrc} alt="" aria-hidden="true" />
                  ) : null}
                </div>
                <div className="lit-login-modal__methodLabel">
                  <span>{info?.name ?? method}</span>
                  {isUnavailable ? (
                    <span className="lit-login-modal__methodLabelSuffix lit-login-modal__methodLabelSuffix--danger">
                      (Not Available)
                    </span>
                  ) : null}
                </div>
                <div className="lit-login-modal__methodRight">
                  {isAuthenticating && selectedMethod === method ? (
                    <div className="lit-login-modal__spinner" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        <div className="lit-login-modal__actions">
          <button
            type="button"
            onClick={hideAuthModal}
            disabled={isAuthenticating}
            className={getButtonClass('secondary')}
          >
            Cancel
          </button>
          {isTestnetNetwork(currentNetworkName) && features.funding && faucetUrl ? (
            <a
              href={faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={getButtonClass('secondary')}
            >
              Faucet
            </a>
          ) : null}
        </div>

        {!closeOnBackdropClick ? (
          <div className="lit-login-modal__hint">Press ESC to close</div>
        ) : null}
      </div>
    );
  };

  return (
    <LitAuthContext.Provider value={contextValue}>
      {children}
      {showModal ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (!closeOnBackdropClick) return;
            if (e.target === e.currentTarget) hideAuthModal();
          }}
          className="lit-login-modal__backdrop"
        >
          <style>{EXPLORER_THEME_CSS}</style>

          {!servicesState ? (
            showSettingsView ? (
              <div className="lit-login-modal lit-login-modal__card">
                {renderModalBody()}
              </div>
            ) : (
              <div className="lit-login-modal lit-login-modal__overlayCard">
                {servicesError ? (
                  <div className="lit-login-modal__section">
                    <h3 className="lit-login-modal__overlayTitle">⚠️ Setup Failed</h3>
                    <div className="lit-login-modal__muted">
                      Network:{' '}
                      <span className="lit-login-modal__mono">
                        {currentNetworkName}
                      </span>
                    </div>
                    <div className="lit-login-modal__alert lit-login-modal__alert--warn">
                      {servicesError}
                    </div>
                    <div
                      className="lit-login-modal__row"
                      style={{ justifyContent: 'center', marginTop: 12 }}
                    >
                      <button
                        type="button"
                        className={getButtonClass('primary')}
                        onClick={() =>
                          void setupServices().catch(() => {
                            // handled via servicesError state
                          })
                        }
                        disabled={isInitializingServices}
                      >
                        Retry Setup
                      </button>
                      {features.settings ? (
                        <button
                          type="button"
                          className={getButtonClass('secondary')}
                          onClick={() => setShowSettingsView(true)}
                          disabled={isInitializingServices}
                        >
                          Settings
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={getButtonClass('secondary')}
                        onClick={hideAuthModal}
                        disabled={isInitializingServices}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="lit-login-modal__section">
                    <div
                      className="lit-login-modal__spinner lit-login-modal__spinner--lg"
                      style={{ margin: '0 auto 12px' }}
                    />
                    <h3 className="lit-login-modal__overlayTitle">
                      Setting up Lit Protocol
                    </h3>
                    <p className="lit-login-modal__overlayText">
                      Initialising services…
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div
              className={`lit-login-modal lit-login-modal__card ${
                step === 'pkp-select' ? 'lit-login-modal__card--wide' : ''
              }`}
            >
              {features.settings &&
              step === 'select-method' &&
              !showSettingsView ? (
                <div className="lit-login-modal__settingsButton">
                  <button
                    type="button"
                    className={`${getButtonClass('secondary')} lit-login-modal__btn--icon`}
                    aria-label="Settings"
                    onClick={() => setShowSettingsView(true)}
                  >
                    ⚙︎
                  </button>
                </div>
              ) : null}
              {renderModalBody()}
            </div>
          )}
        </div>
      ) : null}
    </LitAuthContext.Provider>
  );
}

export const LitAuthProvider = LitLoginModal;
