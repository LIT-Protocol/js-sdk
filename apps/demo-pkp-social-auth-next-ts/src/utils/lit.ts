import {
  DiscordProvider,
  GoogleProvider,
  EthWalletProvider,
  WebAuthnProvider,
  LitAuthClient,
} from '@lit-protocol/lit-auth-client';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { AuthMethodType, ProviderType } from '@lit-protocol/constants';
import {
  AuthCallbackParams,
  AuthMethod,
  GetSessionSigsProps,
  IRelayPKP,
  MintRequestBody,
  SessionSigs,
} from '@lit-protocol/types';

export const DOMAIN = process.env.NEXT_PUBLIC_PROD_URL || 'localhost';
export const ORIGIN =
  process.env.NEXT_PUBLIC_ENV === 'production'
    ? `https://${DOMAIN}`
    : `http://${DOMAIN}:3000`;

export const litNodeClient: LitNodeClient = new LitNodeClient({
  alertWhenUnauthorized: false,
  litNetwork: 'cayenne',
  debug: true,
});

export const litAuthClient: LitAuthClient = new LitAuthClient({
  litRelayConfig: {
    // relayUrl: 'http://localhost:3001',
    relayApiKey: 'test-api-key',
  },
  litNodeClient,
});

/**
 * Validate provider
 */
export function isSocialLoginSupported(provider: string): boolean {
  return ['google', 'discord'].includes(provider);
}

/**
 * Redirect to Lit login
 */
export async function signInWithGoogle(redirectUri: string): Promise<void> {
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
    ProviderType.Google,
    { redirectUri }
  );
  await googleProvider.signIn();
}

/**
 * Get auth method object from redirect
 */
export async function authenticateWithGoogle(
  redirectUri: string
): Promise<AuthMethod | undefined> {
  const googleProvider = litAuthClient.initProvider<GoogleProvider>(
    ProviderType.Google,
    { redirectUri }
  );
  const authMethod = await googleProvider.authenticate();
  return authMethod;
}

/**
 * Redirect to Lit login
 */
export async function signInWithDiscord(redirectUri: string): Promise<void> {
  const discordProvider = litAuthClient.initProvider<DiscordProvider>(
    ProviderType.Discord,
    { redirectUri }
  );
  await discordProvider.signIn();
}

/**
 * Get auth method object from redirect
 */
export async function authenticateWithDiscord(
  redirectUri: string
): Promise<AuthMethod | undefined> {
  const discordProvider = litAuthClient.initProvider<DiscordProvider>(
    ProviderType.Discord,
    { redirectUri }
  );
  const authMethod = await discordProvider.authenticate();
  return authMethod;
}

/**
 * Get auth method object by signing a message with an Ethereum wallet
 */
export async function authenticateWithEthWallet(
  address?: string,
  signMessage?: (message: string) => Promise<string>
): Promise<AuthMethod | undefined> {
  const ethWalletProvider = litAuthClient.initProvider<EthWalletProvider>(
    ProviderType.EthWallet,
    {
      domain: DOMAIN,
      origin: ORIGIN,
    }
  );
  const authMethod = await ethWalletProvider.authenticate({
    address,
    signMessage,
  });
  return authMethod;
}

/**
 * Register new WebAuthn credential
 */
export async function registerWebAuthn(): Promise<IRelayPKP> {
  const provider = litAuthClient.initProvider<WebAuthnProvider>(
    ProviderType.WebAuthn
  );
  // Register new WebAuthn credential
  const options = await provider.register();

  // Verify registration and mint PKP through relay server
  const txHash = await provider.verifyAndMintPKPThroughRelayer(options);
  const response = await provider.relay.pollRequestUntilTerminalState(txHash);
  if (response.status !== 'Succeeded') {
    throw new Error('Minting failed');
  }
  const newPKP: IRelayPKP = {
    tokenId: response.pkpTokenId,
    publicKey: response.pkpPublicKey,
    ethAddress: response.pkpEthAddress,
  };
  return newPKP;
}

/**
 * Get auth method object by authenticating with a WebAuthn credential
 */
export async function authenticateWithWebAuthn(): Promise<
  AuthMethod | undefined
> {
  let provider = litAuthClient.getProvider(ProviderType.WebAuthn);
  if (!provider) {
    provider = litAuthClient.initProvider<WebAuthnProvider>(
      ProviderType.WebAuthn
    );
  }
  const authMethod = await provider.authenticate();
  return authMethod;
}

/**
 * Get auth method object by validating Stytch JWT
 */
export async function authenticateWithStytch(
  accessToken: string,
  userId?: string
) {
  const provider = litAuthClient.initProvider(ProviderType.StytchOtp, {
    appId: process.env.NEXT_PUBLIC_STYTCH_PROJECT_ID,
  });
  // @ts-ignore
  const authMethod = await provider?.authenticate({ accessToken, userId });
  return authMethod;
}

/**
 * Generate session sigs for given params
 */
export async function getSessionSigs({
  pkpPublicKey,
  authMethod,
  sessionSigsParams,
}: {
  pkpPublicKey: string;
  authMethod: AuthMethod;
  sessionSigsParams: GetSessionSigsProps;
}): Promise<SessionSigs> {

  // const provider = getProviderByAuthMethod(authMethod);
  // if (provider) {
  //   const sessionSigs = await provider.getSessionSigs({
  //     pkpPublicKey,
  //     authMethod,
  //     sessionSigsParams,
  //   });
  //   return sessionSigs;
  // } else {
  //   throw new Error(
  //     `Provider not found for auth method type ${authMethod.authMethodType}`
  //   );
  // }
  await litNodeClient.connect();
  const authNeededCallback = async (params: AuthCallbackParams) => {
    const response = await litNodeClient.signSessionKey({
      statement: params.statement,
      authMethods: [authMethod],
      pkpPublicKey: pkpPublicKey,
      expiration: params.expiration,
      resources: params.resources,
      chainId: 1,
    });
    return response.authSig;
  };

  const sessionSigs = await litNodeClient.getSessionSigs({
    ...sessionSigsParams,
    authNeededCallback,
  });

  return sessionSigs;
}

export async function updateSessionSigs(
  params: GetSessionSigsProps
): Promise<SessionSigs> {
  const sessionSigs = await litNodeClient.getSessionSigs(params);
  return sessionSigs;
}

/**
 * Fetch PKPs associated with given auth method
 */
export async function getPKPs(authMethod: AuthMethod): Promise<IRelayPKP[]> {
  const provider = getProviderByAuthMethod(authMethod);
  const allPKPs = await provider.fetchPKPsThroughRelayer(authMethod);
  return allPKPs;
}

/**
 * Mint a new PKP for current auth method
 */
export async function mintPKP(authMethod: AuthMethod): Promise<IRelayPKP> {
  const provider = getProviderByAuthMethod(authMethod);

  const authMethodScopePrompt = prompt('Enter the auth method scope.\n0 - no permissions\n1 - to sign anything\n2 - to only sign messages. \n\nRead more at https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes');
  const authMethodScope = parseInt(authMethodScopePrompt);
  console.log("authMethodScope:", authMethodScope);

  let txHash: string;

  if (authMethod.authMethodType === AuthMethodType.WebAuthn) {
    // Register new WebAuthn credential
    const options = await (provider as WebAuthnProvider).register();

    // Verify registration and mint PKP through relay server
    // TODO: Fix this after 3.0.21 is published to add optional custom args
    txHash = await (
      provider as WebAuthnProvider
    ).verifyAndMintPKPThroughRelayer(options);
  } else {
    // Mint PKP through relay server
    txHash = await provider.mintPKPThroughRelayer(authMethod, {
      permittedAuthMethodScopes: [[authMethodScope]],
    } as MintRequestBody);
  }

  const response = await provider.relay.pollRequestUntilTerminalState(txHash);
  if (response.status !== 'Succeeded') {
    throw new Error('Minting failed');
  }
  const newPKP: IRelayPKP = {
    tokenId: response.pkpTokenId,
    publicKey: response.pkpPublicKey,
    ethAddress: response.pkpEthAddress,
  };
  return newPKP;
}

/**
 * Get provider for given auth method
 */
function getProviderByAuthMethod(authMethod: AuthMethod) {
  switch (authMethod.authMethodType) {
    case AuthMethodType.GoogleJwt:
      return litAuthClient.getProvider(ProviderType.Google);
    case AuthMethodType.Discord:
      return litAuthClient.getProvider(ProviderType.Discord);
    case AuthMethodType.EthWallet:
      return litAuthClient.getProvider(ProviderType.EthWallet);
    case AuthMethodType.WebAuthn:
      return litAuthClient.getProvider(ProviderType.WebAuthn);
    case AuthMethodType.StytchOtp:
      return litAuthClient.getProvider(ProviderType.StytchOtp);
    default:
      return;
  }
}
