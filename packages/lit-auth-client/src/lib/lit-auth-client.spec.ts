/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;
global.jestTesting = true;

import { AuthMethodType } from '@lit-protocol/constants';
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

const isClass = (v: unknown) => {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
};

describe('LitAuthClient', () => {
  it('is a class', async () => {
    expect(isClass(LitAuthClient)).toBe(true);
  });

  // TODO: Update tests
//   it('should throw an error if no API key or custom relay server is provided', () => {
//     expect(() => {
//       new LitAuthClient({
//         domain: 'localhost:3000',
//         redirectUri: 'http://localhost:3000/redirect',
//       });
//     }).toThrow(
//       'An API key is required to use the default Lit Relay server. Please provide either an API key or a custom relay server.'
//     );
//   });

//   it('should create a LitAuthClient instance with valid options', () => {
//     const validClient = new LitAuthClient({
//       domain: 'localhost:3000',
//       redirectUri: 'http://localhost:3000/redirect',
//       litRelayConfig: { relayApiKey: 'test-api-key' },
//     });
//     expect(validClient).toBeDefined();
//   });

//   describe('signInWithSocial', () => {
//     let client: LitAuthClient;

//     beforeEach(() => {
//       client = new LitAuthClient({
//         domain: 'localhost:3000',
//         redirectUri: 'http://localhost:3000/redirect',
//         litRelayConfig: { relayApiKey: 'test-api-key' },
//       });

//       // @ts-ignore
//       delete window.location;
//       window.location = {
//         ...window.location,
//         assign: jest.fn(),
//       };
//     });

//     afterEach(() => {
//       jest.restoreAllMocks();
//     });

//     it('should throw an error for an unsupported provider', () => {
//       const invalidProvider = 'bookface';
//       expect(() => {
//         client.signInWithSocial(invalidProvider);
//       }).toThrowError(
//         `Invalid OAuth provider: ${invalidProvider}. Please ensure that the given provider is either 'google' and 'discord'.`
//       );
//     });

//     it('should generate a valid URL with the given provider, redirect uri, and state parameter', () => {
//       const mockAssign = jest.fn();
//       Object.defineProperty(window, 'location', {
//         value: { assign: mockAssign },
//         writable: true,
//       });

//       const provider = 'google';
//       client.signInWithSocial(provider);

//       expect(mockAssign).toHaveBeenCalled();
//       const assignedUrl = mockAssign.mock.calls[0][0];
//       expect(assignedUrl).toContain(provider);

//       const searchParams = new URLSearchParams(new URL(assignedUrl).search);
//       const redirectUri = searchParams.get('app_redirect');
//       expect(redirectUri).toBe(client.redirectUri);

//       const state = searchParams.get('state');
//       expect(state).not.toBeNull();
//     });
//   });

//   describe('handleSignInRedirect', () => {
//     let client: LitAuthClient;

//     beforeEach(() => {
//       client = new LitAuthClient({
//         domain: 'localhost:5173',
//         redirectUri: 'http://localhost:5173/redirect',
//         litRelayConfig: { relayApiKey: 'test-api-key' },
//       });

//       // @ts-ignore
//       delete window.location;
//       // @ts-ignore
//       window.location = {
//         href: client.redirectUri,
//         search: '',
//       };

//       // Mock window.history
//       window.history.replaceState = jest.fn();
//     });

//     afterEach(() => {
//       jest.restoreAllMocks();
//     });

//     it('should throw an error if the current URL does not match the provided redirect URL', () => {
//       const wrongUrl = 'http://localhost:4444/incorrect';
//       window.location.href = wrongUrl;
//       expect(() => {
//         client.handleSignInRedirect();
//       }).toThrowError(
//         `Current url "${wrongUrl}" does not match provided redirect uri "${client.redirectUri}"`
//       );
//     });

//     it('should throw an error if there is an error in the URL parameters', () => {
//       window.location.search = '?error=token_error';
//       expect(() => {
//         client.handleSignInRedirect();
//       }).toThrowError();
//     });

//     it('should throw an error if the provider is not supported', () => {
//       const invalidProvider = 'bookface';
//       window.location.search = `?provider=${invalidProvider}&state=...`;
//       expect(() => {
//         client.handleSignInRedirect();
//       }).toThrowError(
//         `Invalid OAuth provider "${invalidProvider}" passed in redirect callback URL`
//       );
//     });

//     it('should throw an error if the state parameter is invalid', () => {
//       const invalidState = 'yolo';
//       window.location.search = `?provider=discord&access_token=testToken&state=${invalidState}`;
//       expect(() => {
//         client.handleSignInRedirect();
//       }).toThrowError(
//         `Invalid state parameter "${invalidState}" passed in redirect callback URL`
//       );
//     });

//     describe('set state param', () => {
//       let state: string;

//       beforeEach(() => {
//         setStateParam();
//         // @ts-ignore
//         state = getStateParam();
//       });

//       afterEach(() => {
//         removeStateParam();
//       });

//       it('should throw an error if the access token is missing for Discord OAuth', () => {
//         window.location.search = `?provider=discord&state=${encode(state)}`;
//         expect(() => {
//           client.handleSignInRedirect();
//         }).toThrowError(
//           'Missing access token in redirect callback URL for Discord OAuth"'
//         );
//       });

//       it('should throw an error if the ID token is missing for Google OAuth', () => {
//         window.location.search = `?provider=google&state=${encode(state)}`;
//         expect(() => {
//           client.handleSignInRedirect();
//         }).toThrowError(
//           'Missing ID token in redirect callback URL for Google OAuth"'
//         );
//       });

//       it('should return the correct AuthMethod object for Discord OAuth', () => {
//         const accessToken = 'test123';
//         window.location.search = `?provider=discord&access_token=${accessToken}&state=${encode(
//           state
//         )}`;
//         const result = client.handleSignInRedirect();
//         expect(result).toEqual({
//           authMethodType: AuthMethodType.Discord,
//           accessToken: accessToken,
//         });
//       });

//       it('should return the correct AuthMethod object for Google OAuth', () => {
//         const idToken = 'testxyz10';
//         window.location.search = `?provider=google&id_token=${idToken}&state=${encode(
//           state
//         )}`;
//         const result = client.handleSignInRedirect();
//         expect(result).toEqual({
//           authMethodType: AuthMethodType.GoogleJwt,
//           accessToken: idToken,
//         });
//       });
//     });
//   });
// });

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
