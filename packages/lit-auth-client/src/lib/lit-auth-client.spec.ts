import * as LITCONFIG from './../../../../lit.config.json';
import { ProviderType } from '@lit-protocol/constants';
import {
  LitAuthClient,
  GoogleProvider,
  DiscordProvider,
  WebAuthnProvider,
  EthWalletProvider,
  AppleProvider,
  StytchOtpProvider,
  StytchAuthFactorOtpProvider,
} from '@lit-protocol/lit-auth-client';
import { StytchOtpAuthenticateOptions } from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';

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
    const provider = client.initProvider<StytchOtpProvider>(
      ProviderType.StytchOtp
    );
    expect(provider).toBeInstanceOf(StytchOtpProvider);
  });
  it('Should create stytch auth factor providers email', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'email'>>(
      ProviderType.StytchEmailFactorOtp
    );
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider);
  });

  it('Should Create stytch auth factor providers sms', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'sms'>>(
      ProviderType.StytchSmsFactorOtp
    );
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider);
  });

  it('Should Create stytch auth factor providers whats app', () => {
    const provider = client.initProvider<
      StytchAuthFactorOtpProvider<'whatsApp'>
    >(ProviderType.StytchWhatsAppFactorOtp);
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider);
  });

  it('Should Create stytch auth factor providers totp', () => {
    const provider = client.initProvider<StytchAuthFactorOtpProvider<'totp'>>(
      ProviderType.StytchTotpFactor
    );
    expect(provider).toBeInstanceOf(StytchAuthFactorOtpProvider);
  });
});

describe('getAuthMethodId', () => {
  let client: LitAuthClient;
  // static tokens from test project
  let accessTokenEmailFactor =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay10ZXN0LWZiMjhlYmY2LTQ3NTMtNDdkMS1iMGUzLTRhY2NkMWE1MTc1NyIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC10ZXN0LWRlNGUyNjkwLTE1MDYtNGNmNS04YmNlLTQ0NTcxZGRhZWJjOSJdLCJleHAiOjE2ODg1Njc0MTQsImh0dHBzOi8vc3R5dGNoLmNvbS9zZXNzaW9uIjp7ImlkIjoic2Vzc2lvbi10ZXN0LTlkZDI3ZGE1LTVjNjQtNDE5NS04NjdlLWIxNGE3MWE5M2MxMSIsInN0YXJ0ZWRfYXQiOiIyMDIzLTA3LTA1VDE0OjI1OjE0WiIsImxhc3RfYWNjZXNzZWRfYXQiOiIyMDIzLTA3LTA1VDE0OjI1OjE0WiIsImV4cGlyZXNfYXQiOiIyMDIzLTA5LTEzVDAxOjA1OjE0WiIsImF0dHJpYnV0ZXMiOnsidXNlcl9hZ2VudCI6IiIsImlwX2FkZHJlc3MiOiIifSwiYXV0aGVudGljYXRpb25fZmFjdG9ycyI6W3sidHlwZSI6Im90cCIsImRlbGl2ZXJ5X21ldGhvZCI6ImVtYWlsIiwibGFzdF9hdXRoZW50aWNhdGVkX2F0IjoiMjAyMy0wNy0wNVQxNDoyNToxNFoiLCJlbWFpbF9mYWN0b3IiOnsiZW1haWxfaWQiOiJlbWFpbC10ZXN0LTAwMzZmM2YzLTQ0MjQtNDg2My1iYWQ3LTFkNGU3NTM1ZDJiMCIsImVtYWlsX2FkZHJlc3MiOiJqb3NoQGxpdHByb3RvY29sLmNvbSJ9fV19LCJpYXQiOjE2ODg1NjcxMTQsImlzcyI6InN0eXRjaC5jb20vcHJvamVjdC10ZXN0LWRlNGUyNjkwLTE1MDYtNGNmNS04YmNlLTQ0NTcxZGRhZWJjOSIsIm5iZiI6MTY4ODU2NzExNCwic3ViIjoidXNlci10ZXN0LTY4MTAzZTAxLTc0NjgtNGFiZi04M2M4LTg4NWRiMmNhMWM2YyJ9.rZgaunT1UV2pmliZ0V7nYqYtyfdGas4eY6Q6RCzEEBc5y1K66lopUbvvkfNsLJUjSc3vw12NlIX3Q47zm0XEP8AahrJ0QWAC4v9gmZKVYbKiL2JppqnaxtNLZV9Zo1KAiqm9gdqRQSD29222RTC59PI52AOZd4iTv4lSBIPG2J9rUkUwaRI23bGLMQ8XVkTSS7wcd1Ls08Q-VDXuwl8vuoJhssBfNfxFigk7cKHwbbM-o1sh3upEzV-WFgvJrTstPUNbHOBvGnqKDZX6A_45M5zBnHrerifz4-ST771tajiuW2lQXWvocyYlRT8_a0XBsW77UhU-YBTvKVpj3jmH4A';
  let accessTokenSmsFactor =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6Imp3ay10ZXN0LTYyNWViODMxLTAwOWYtNGNiMy05YTk3LWJlNzU3YTMzNjQwZiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJvamVjdC10ZXN0LTI3OTA2MzVkLWJhMzEtNDcwNS1hYWY0LTIxM2JiMGYwNjgxMiJdLCJleHAiOjE2OTgzNTQyMTksImh0dHBzOi8vc3R5dGNoLmNvbS9zZXNzaW9uIjp7ImlkIjoic2Vzc2lvbi10ZXN0LWRhMzliOTBlLTkxMTMtNDQ3NC1hOWEyLWE5NTE3MzdkMGVlNSIsInN0YXJ0ZWRfYXQiOiIyMDIzLTEwLTI2VDIwOjU4OjM4WiIsImxhc3RfYWNjZXNzZWRfYXQiOiIyMDIzLTEwLTI2VDIwOjU4OjM5WiIsImV4cGlyZXNfYXQiOiIyMDIzLTExLTAyVDIwOjU4OjM4WiIsImF0dHJpYnV0ZXMiOnsidXNlcl9hZ2VudCI6IiIsImlwX2FkZHJlc3MiOiIifSwiYXV0aGVudGljYXRpb25fZmFjdG9ycyI6W3sidHlwZSI6Im90cCIsImRlbGl2ZXJ5X21ldGhvZCI6InNtcyIsImxhc3RfYXV0aGVudGljYXRlZF9hdCI6IjIwMjMtMTAtMjZUMjA6NTg6MzhaIiwicGhvbmVfbnVtYmVyX2ZhY3RvciI6eyJwaG9uZV9pZCI6InBob25lLW51bWJlci10ZXN0LWNmYTJjYTFlLTVmNzMtNGM0NS1hOWU2LWNjYWE5MWZkYjE3ZCIsInBob25lX251bWJlciI6IisxMjAxNDA3MjA3MyJ9fV19LCJpYXQiOjE2OTgzNTM5MTksImlzcyI6InN0eXRjaC5jb20vcHJvamVjdC10ZXN0LTI3OTA2MzVkLWJhMzEtNDcwNS1hYWY0LTIxM2JiMGYwNjgxMiIsIm5iZiI6MTY5ODM1MzkxOSwic3ViIjoidXNlci10ZXN0LWFhMGUwZmFhLTFjZTgtNGY4Yy05MGJhLWU2OTZmMWY4OTFlZiJ9.c-TAC_UNHQZgbcUBWYhBMCfctQAaVrL41bWGC3LifgEzFV-AWB9sPG8Ws18X2AdIi2FytAvpluWto4-oIdA5vghXx99pYnn45MuKvbvtixkz7tKXeyVN9BiXiPNWiHMjx_Iw_rPaF-KTLqQi7nCuS_UHcFr5uZrErDuYMdwfXxZPdl1pC0M_7Eh-wIOn_Fyy8bdftT1vqPlFTjxyTIZ2CLoAqizJi8cfPfAaC3dkxA54GT4LJdB9FY5VTkXO9Dc4BNZiL4MDx2jMNtE-RhY2iDDL4KC1yi4MQEdNSTm0KEoAF8_A7uzGkpHtJKjFyB8bZTmcrzqzgq6m732_nhMUbw';
  beforeEach(() => {
    client = new LitAuthClient({
      litRelayConfig: { relayApiKey: 'test-api-key' },
    });
  });

  it('should get auth method for stytch email factor', async () => {
    let provider = client.initProvider(ProviderType.StytchEmailFactorOtp);
    let id = await provider.getAuthMethodId({
      authMethodType: AuthMethodType.StytchEmailFactorOtp,
      accessToken: accessTokenEmailFactor,
    });

    expect(id).toBeDefined();
  });

  it('should get auth method for stytch sms factor', async () => {
    let provider = client.initProvider(ProviderType.StytchSmsFactorOtp);
    let id = await provider.getAuthMethodId({
      authMethodType: AuthMethodType.StytchSmsFactorOtp,
      accessToken: accessTokenSmsFactor,
    });

    expect(id).toBeDefined();
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
