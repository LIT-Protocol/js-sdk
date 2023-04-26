/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore - TextDecoder is not defined in Node
global.TextDecoder = TextDecoder;
// @ts-ignore - set global variable for testing
global.jestTesting = true;

import { AuthMethodType, ProviderType } from '@lit-protocol/constants';
import { LitAuthClient } from './lit-auth-client';
import {
  isSocialLoginSupported,
  prepareLoginUrl,
  parseLoginParams,
  setStateParam,
  getStateParam,
  removeStateParam,
  encode,
} from './utils';
import GoogleProvider from './providers/GoogleProvider';
import DiscordProvider from './providers/DiscordProvider';
import WebAuthnProvider from './providers/WebAuthnProvider';
import EthereumAccountProvider from './providers/EthWalletProvider';

const isClass = (v: unknown) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitAuthClient', () => {
  it('is a class', async () => {
    expect(isClass(LitAuthClient)).toBe(true);
  });

  it('should throw an error if no API key or custom relay server is provided', () => {
    expect(() => {
      new LitAuthClient();
    }).toThrow(
      'An API key is required to use the default Lit Relay server. Please provide either an API key or a custom relay server.'
    );
  });

  it('should create a LitAuthClient instance with valid options', () => {
    const validClient = new LitAuthClient({
      litRelayConfig: { relayApiKey: 'test-api-key' },
    });
    expect(validClient).toBeDefined();
  });
});

describe('initProvider', () => {
  let client: LitAuthClient;

  beforeEach(() => {
    client = new LitAuthClient({
      litRelayConfig: { relayApiKey: 'test-api-key' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should throw an error for an unsupported provider', () => {
    expect(() => {
      // @ts-ignore - Testing invalid provider type
      client.initProvider<ProviderType.BookFace>(ProviderType.BookFace);
    }).toThrowError(
      "Invalid provider type provided. Only 'google', 'discord', 'ethereum', and 'webauthn' are supported at the moment."
    );
  });

  it('should return an instance of DiscordProvider', () => {
    const provider = client.initProvider<ProviderType.Discord>(
      ProviderType.Discord,
      {
        redirectUri: 'http://localhost:3000/redirect',
      }
    );
    expect(provider).toBeInstanceOf(DiscordProvider);
  });

  it('should return an instance of GoogleProvider', () => {
    const provider = client.initProvider<ProviderType.Google>(
      ProviderType.Google,
      {
        redirectUri: 'http://localhost:3000/redirect',
      }
    );
    expect(provider).toBeInstanceOf(GoogleProvider);
  });

  it('should return an instance of EthereumAccountProvider', () => {
    const provider = client.initProvider<ProviderType.EthWallet>(
      ProviderType.EthWallet,
      {
        address: '0xbf90ce8Ab70eCd3a8776D18d9B7D679D64C6Dc97',
        signMessage: async (message: string) => message,
      }
    );
    expect(provider).toBeInstanceOf(EthereumAccountProvider);
  });

  it('should return an instance of WebAuthnProvider', () => {
    const provider = client.initProvider<ProviderType.WebAuthn>(
      ProviderType.WebAuthn
    );
    expect(provider).toBeInstanceOf(WebAuthnProvider);
  });
});

describe('getProvider', () => {
  let client: LitAuthClient;

  beforeEach(() => {
    client = new LitAuthClient({
      litRelayConfig: { relayApiKey: 'test-api-key' },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return the correct provider for the given provider type', () => {
    client.initProvider<ProviderType.Discord>(ProviderType.Discord, {
      redirectUri: 'http://localhost:3000/redirect',
    });
    const savedProvider = client.getProvider(ProviderType.Discord);
    expect(savedProvider).toBeInstanceOf(DiscordProvider);
  });

  it('should return undefined if the provider for the given provider type is not initialized', () => {
    const savedProvider = client.getProvider(ProviderType.Google);
    expect(savedProvider).toBeUndefined();
  });
});

describe('GoogleProvider', () => {
  let client: LitAuthClient;
  let provider: GoogleProvider;

  beforeEach(() => {
    client = new LitAuthClient({
      litRelayConfig: { relayApiKey: 'test-api-key' },
    });
    provider = client.initProvider<ProviderType.Google>(ProviderType.Google, {
      redirectUri: 'http://localhost:3000/redirect',
    });

    // @ts-ignore
    delete window.location;
    window.location = {
      ...window.location,
      assign: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate a valid URL with the given provider, redirect uri, and state parameter', () => {
    const mockAssign = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { assign: mockAssign },
      writable: true,
    });

    provider.signIn();

    expect(mockAssign).toHaveBeenCalled();
    const assignedUrl = mockAssign.mock.calls[0][0];
    expect(assignedUrl).toContain('google');

    const searchParams = new URLSearchParams(new URL(assignedUrl).search);
    const redirectUri = searchParams.get('app_redirect');
    expect(redirectUri).toBe(provider.redirectUri);

    const state = searchParams.get('state');
    expect(state).not.toBeNull();
  });

  it('should throw an error if the current URL does not match the provided redirect URL', () => {
    const wrongUrl = 'http://localhost:4444/incorrect';
    window.location.href = wrongUrl;
    expect(async () => {
      await provider.authenticate();
    }).toThrowError(
      `Current url "${wrongUrl}" does not match provided redirect uri "${provider.redirectUri}"`
    );
  });

  it('should throw an error if there is an error in the URL parameters', () => {
    window.location.search = '?error=token_error';
    expect(async () => {
      await provider.authenticate();
    }).toThrowError();
  });

  it('should throw an error if the provider is not Google', () => {
    const invalidProvider = 'discord';
    window.location.search = `?provider=${invalidProvider}&state=...`;
    expect(async () => {
      await provider.authenticate();
    }).toThrowError(
      `Invalid OAuth provider "${invalidProvider}" passed in redirect callback URL`
    );
  });

  it('should throw an error if the state parameter is invalid', () => {
    const invalidState = 'yolo';
    window.location.search = `?provider=google&access_token=testToken&state=${invalidState}`;
    expect(async () => {
      await provider.authenticate();
    }).toThrowError(
      `Invalid state parameter "${invalidState}" passed in redirect callback URL`
    );
  });

  describe('set state param', () => {
    let state: string;

    beforeEach(() => {
      setStateParam();
      // @ts-ignore
      state = getStateParam();
    });

    afterEach(() => {
      removeStateParam();
    });

    it('should throw an error if the ID token is missing for Google OAuth', () => {
      window.location.search = `?provider=google&state=${encode(state)}`;
      expect(async () => {
        await provider.authenticate();
      }).toThrowError(
        'Missing ID token in redirect callback URL for Google OAuth"'
      );
    });

    it('should return the correct AuthMethod object for Google OAuth', async () => {
      const idToken = 'testxyz10';
      window.location.search = `?provider=google&id_token=${idToken}&state=${encode(
        state
      )}`;
      const result = await provider.authenticate();
      expect(result).toEqual({
        authMethodType: AuthMethodType.GoogleJwt,
        accessToken: idToken,
      });
    });
  });
});

describe('LitAuthClient utility functions', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  test('should return true for supported social login providers', () => {
    expect(isSocialLoginSupported('google')).toBe(true);
    expect(isSocialLoginSupported('discord')).toBe(true);
    expect(isSocialLoginSupported('unsupported')).toBe(false);
  });

  test('should generate a login URL with the specified provider and redirect URI', () => {
    const redirectUri = 'http://localhost:3000/redirect';
    const url = prepareLoginUrl('google', redirectUri);
    const parsedUrl = new URL(url);

    expect(parsedUrl.origin).toBe('https://login.litgateway.com');
    expect(parsedUrl.pathname).toBe('/auth/google');

    const searchParams = parsedUrl.searchParams;
    expect(searchParams.get('app_redirect')).toBe(redirectUri);
    expect(searchParams.has('state')).toBe(true);
  });

  test('should parse parameters from a query string', () => {
    const search =
      '?provider=google&access_token=abc&id_token=xyz&state=a1b2c3&error=fake_error';
    const params = parseLoginParams(search);
    expect(params).toEqual({
      provider: 'google',
      accessToken: 'abc',
      idToken: 'xyz',
      state: 'a1b2c3',
      error: 'fake_error',
    });
  });

  test('should retrieve OAuth 2.0 state param from session storage', () => {
    setStateParam();
    expect(getStateParam()).not.toBeNull();
  });
});
