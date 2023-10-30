import * as LITCONFIG from './../../../../lit.config.json';
import { ProviderType } from '@lit-protocol/constants';
import {
  LitAuthClient,
  GoogleProvider,
  DiscordProvider,
  WebAuthnProvider,
  EthWalletProvider,
  AppleProvider,
  StytchOtpProvider
} from '@lit-protocol/lit-auth-client';
import { StytchOtpAuthenticateOptions } from '@lit-protocol/types';
import StytchAuthFactorOtpProvider from './providers/StytchAuthFactorOtp';

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

  it('should return an instance of DiscordProvider', () => {
    const provider = client.initProvider<DiscordProvider>(
      ProviderType.Discord,
      {
        redirectUri: 'http://localhost:3000/redirect',
      }
    );
    expect(provider).toBeInstanceOf(DiscordProvider);
  });

  it('should return an instance of GoogleProvider', () => {
    const provider = client.initProvider<GoogleProvider>(ProviderType.Google, {
      redirectUri: 'http://localhost:3000/redirect',
    });
    expect(provider).toBeInstanceOf(GoogleProvider);
  });

  it('should return an instance of AppleProvider', () => {
    const provider = client.initProvider<AppleProvider>(ProviderType.Apple, {
      redirectUri: 'http://localhost:3000/redirect',
    });
    expect(provider).toBeInstanceOf(AppleProvider);
  });

  it('should return an instance of EthWalletProvider', () => {
    const provider = client.initProvider<EthWalletProvider>(
      ProviderType.EthWallet
    );
    expect(provider).toBeInstanceOf(EthWalletProvider);
  });

  it('should return an instance of WebAuthnProvider', () => {
    const provider = client.initProvider<WebAuthnProvider>(
      ProviderType.WebAuthn
    );
    expect(provider).toBeInstanceOf(WebAuthnProvider);
  });
  
  it('Should create Stytch auth factor', () => {
    const provider = client.initProvider<StytchOtpProvider>(ProviderType.StytchOtp);
    expect(provider).toBeInstanceOf(StytchOtpProvider);
  });
  it('Should create stytch auth factor providers email', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'email'>>(ProviderType.StytchEmailFactorOtp);
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider<'email'>);
  });
  
  it('Should Create stytch auth factor providers sms', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'sms'>>(ProviderType.StytchSmsFactorOtp);
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider<'sms'>);
  });

  it('Should Create stytch auth factor providers whats app', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'whatsApp'>>(ProviderType.StytchWhatsAppFactorOtp);
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider<'whatsApp'>);
  });
  
  it('Should Create stytch auth factor providers totp', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'totp'>>(ProviderType.StytchEmailFactorOtp);
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider<'totp'>);
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
    client.initProvider<DiscordProvider>(ProviderType.Discord, {
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

// describe('StytchOtpProvider', () => {
//   let client: LitAuthClient;
//   let provider: StytchOtpProvider;

//   beforeEach(() => {
//     client = new LitAuthClient({
//       litRelayConfig: { relayApiKey: 'test-api-key' },
//     });

//     provider = client.initProvider<StytchOtpAuthenticateOptions>(ProviderType.StytchOtp, {
//       appId: LITCONFIG.STYTCH_APP_ID,
//       userId: LITCONFIG.STYTCH_USER_ID,
//     });
//   });

//   it('should parse jwt and resolve session', async () => {
//     const token: string = LITCONFIG.STYTCH_TEST_TOKEN;
//     const userId: string = LITCONFIG.STYTCH_USER_ID;
//     const authMethod = await provider.authenticate<OtpProviderOptions>({
//       accessToken: token,
//       userId: userId,
//     });
//     expect(authMethod).toBeDefined();

//     expect(authMethod.accessToken).toEqual(token);
//   });
// });

// describe('GoogleProvider', () => {
//   let client: LitAuthClient;
//   let provider: GoogleProvider;

//   beforeEach(() => {
//     client = new LitAuthClient({
//       litRelayConfig: { relayApiKey: 'test-api-key' },
//     });
//     provider = client.initProvider<GoogleProvider>(ProviderType.Google, {
//       redirectUri: 'http://localhost:3000/redirect',
//     });

//     // @ts-ignore
//     delete window.location;
//     window.location = {
//       ...window.location,
//       assign: jest.fn(),
//     };
//     window.location.href = 'http://localhost:3000/redirect';
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });

//   it('should generate a valid URL with the given provider, redirect uri, and state parameter', () => {
//     const mockAssign = jest.fn();
//     Object.defineProperty(window, 'location', {
//       value: { assign: mockAssign },
//       writable: true,
//     });

//     provider.signIn();

//     expect(mockAssign).toHaveBeenCalled();
//     const assignedUrl = mockAssign.mock.calls[0][0];
//     expect(assignedUrl).toContain('google');

//     const searchParams = new URLSearchParams(new URL(assignedUrl).search);
//     const redirectUri = searchParams.get('app_redirect');
//     expect(redirectUri).toBe(provider.redirectUri);

//     const state = searchParams.get('state');
//     expect(state).not.toBeNull();
//   });

//   it('should throw an error if the current URL does not match the provided redirect URL', async () => {
//     const wrongUrl = 'http://localhost:4444/incorrect';
//     window.location.href = wrongUrl;
//     await expect(provider.authenticate()).rejects.toThrowError(
//       `Current url "${wrongUrl}" does not match provided redirect uri "${provider.redirectUri}"`
//     );
//   });

//   it('should throw an error if there is an error in the URL parameters', async () => {
//     window.location.search = '?error=token_error';
//     await expect(provider.authenticate()).rejects.toThrowError();
//   });

//   it('should throw an error if the provider is not Google', async () => {
//     const invalidProvider = 'discord';
//     window.location.search = `?provider=${invalidProvider}&state=...`;
//     await expect(provider.authenticate()).rejects.toThrowError(
//       `OAuth provider "${invalidProvider}" passed in redirect callback URL does not match "google"`
//     );
//   });

//   it('should throw an error if the state parameter is invalid', async () => {
//     const invalidState = 'yolo';
//     window.location.search = `?provider=google&access_token=testToken&state=${invalidState}`;
//     await expect(provider.authenticate()).rejects.toThrowError(
//       `Invalid state parameter "${invalidState}" passed in redirect callback URL`
//     );
//   });

//   describe('set state param', () => {
//     let state: string;

//     beforeEach(async () => {
//       await setStateParam();
//       // @ts-ignore
//       state = getStateParam();
//     });

//     afterEach(() => {
//       removeStateParam();
//     });

//     it('should throw an error if the ID token is missing for Google OAuth', async () => {
//       window.location.search = `?provider=google&state=${encode(state)}`;
//       await expect(provider.authenticate()).rejects.toThrowError(
//         'Missing ID token in redirect callback URL for Google OAuth"'
//       );
//     });

//     it('should return the correct AuthMethod object for Google OAuth', async () => {
//       const idToken = 'testxyz10';
//       window.location.search = `?provider=google&id_token=${idToken}&state=${encode(
//         state
//       )}`;
//       const result = await provider.authenticate();
//       expect(result).toEqual({
//         authMethodType: AuthMethodType.GoogleJwt,
//         accessToken: idToken,
//       });
//     });
//   });
// });

// describe('LitAuthClient utility functions', () => {
//   afterEach(() => {
//     sessionStorage.clear();
//   });

//   test('should return true for supported social login providers', () => {
//     expect(isSocialLoginSupported('google')).toBe(true);
//     expect(isSocialLoginSupported('discord')).toBe(true);
//     expect(isSocialLoginSupported('unsupported')).toBe(false);
//   });

//   test('should generate a login URL with the specified provider and redirect URI', async () => {
//     const redirectUri = 'http://localhost:3000/redirect';
//     const url = await prepareLoginUrl('google', redirectUri);
//     const parsedUrl = new URL(url);

//     expect(parsedUrl.origin).toBe('https://login.litgateway.com');
//     expect(parsedUrl.pathname).toBe('/auth/google');

//     const searchParams = parsedUrl.searchParams;
//     expect(searchParams.get('app_redirect')).toBe(redirectUri);
//     expect(searchParams.has('state')).toBe(true);
//   });

//   test('should parse parameters from a query string', () => {
//     const search =
//       '?provider=google&access_token=abc&id_token=xyz&state=a1b2c3&error=fake_error';
//     const params = parseLoginParams(search);
//     expect(params).toEqual({
//       provider: 'google',
//       accessToken: 'abc',
//       idToken: 'xyz',
//       state: 'a1b2c3',
//       error: 'fake_error',
//     });
//   });

//   test('should retrieve OAuth 2.0 state param from session storage', async () => {
//     await setStateParam();
//     expect(getStateParam()).not.toBeNull();
//   });
// });
