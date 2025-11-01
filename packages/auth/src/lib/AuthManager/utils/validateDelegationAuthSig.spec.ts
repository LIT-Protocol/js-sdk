import { AuthSig } from '@lit-protocol/types';

import { validateDelegationAuthSig } from './validateDelegationAuthSig';

type ISOString = `${string}Z`;

const DEFAULT_SESSION_KEY_HEX =
  'd63204d1dd3b133f37d813532046ef63fdba1e312a950373eb6a54c9757ce281';
const getDefaultExpiration = (): ISOString =>
  new Date(Date.now() + 1000 * 60 * 60).toISOString() as ISOString;

function createDelegationAuthSig(
  params: {
    sessionKeyHex?: string;
    expiration?: ISOString;
  } = {}
): AuthSig {
  const sessionKeyHex = params.sessionKeyHex ?? DEFAULT_SESSION_KEY_HEX;
  const expiration = params.expiration ?? getDefaultExpiration();

  return {
    sig: '{"ProofOfPossession":"87655294574e145befb9ba8c6392d4dd54184effd3d69388a9d0a3be88a645ca6c480c1779871f6859c0688e8ffe03121004ca9374e7c7ff41261c64ba2ee63d64b6075acba9995cdbcc0644ef6a44037e51307ea1a95e10e68199d8051d96e6"}',
    algo: 'LIT_BLS',
    derivedVia: 'lit.bls',
    signedMessage: `localhost wants you to sign in with your Ethereum account:
0x7697f071cbe4764F596B64d95ca54Adf5e614C37

Lit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption' for 'lit-accesscontrolcondition://*'. (2) 'Threshold': 'Execution' for 'lit-litaction://*'. (3) 'Threshold': 'Signing' for 'lit-pkp://*'. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption' for 'lit-accesscontrolcondition://*'. (2) 'Threshold': 'Execution' for 'lit-litaction://*'. (3) 'Threshold': 'Signing' for 'lit-pkp://*'. (4) 'Auth': 'Auth' for 'lit-resolvedauthcontext://*'.

URI: lit:session:${sessionKeyHex}
Version: 1
Chain ID: 1
Nonce: 0xde5eca386bb63607b24c5256e6c483a678b99e51e3104ec4d9959a9f19af0b96
Issued At: 2025-10-15T15:27:11Z
Expiration Time: ${expiration}
Resources:
- urn:recap:eyJhdHQiOnsibGl0LWFjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dfSwibGl0LWxpdGFjdGlvbjovLyoiOnsiVGhyZXNob2xkL0V4ZWN1dGlvbiI6W3t9XX0sImxpdC1wa3A6Ly8qIjp7IlRocmVzaG9sZC9TaWduaW5nIjpbe31dfSwibGl0LXJlc29sdmVkYXV0aGNvbnRleHQ6Ly8qIjp7IkF1dGgvQXV0aCI6W3siYXV0aF9jb250ZXh0Ijp7ImFjdGlvbklwZnNJZFN0YWNrIjpbXSwiYXV0aE1ldGhvZENvbnRleHRzIjpbeyJhcHBJZCI6ImxpdCIsImF1dGhNZXRob2RUeXBlIjoxLCJ1c2VkRm9yU2lnblNlc3Npb25LZXlSZXF1ZXN0Ijp0cnVlLCJ1c2VySWQiOiIweGNmZjYzMjJBMDFGMkY5MDg1NUI3YUQwMThjODNGOUEyYzEzZjg3YmYifV0sImF1dGhTaWdBZGRyZXNzIjpudWxsLCJjdXN0b21BdXRoUmVzb3VyY2UiOiIiLCJyZXNvdXJjZXMiOltdfX1dfX0sInByZiI6W119`,
    address: '0x7697f071cbe4764F596B64d95ca54Adf5e614C37',
  };
}

describe('validateDelegationAuthSig', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('accepts a valid delegation signature from the network', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-10-15T15:30:00.000Z'));

    const delegationAuthSig = createDelegationAuthSig();

    expect(() =>
      validateDelegationAuthSig({
        delegationAuthSig,
        sessionKeyUri: DEFAULT_SESSION_KEY_HEX,
      })
    ).not.toThrow();
  });

  it('accepts a delegation signature when the provided URI already contains the prefix', () => {
    const delegationAuthSig = createDelegationAuthSig();

    expect(() =>
      validateDelegationAuthSig({
        delegationAuthSig,
        sessionKeyUri: `lit:session:${DEFAULT_SESSION_KEY_HEX}`,
      })
    ).not.toThrow();
  });

  it('throws when expiration timestamp cannot be parsed', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-10-15T15:30:00.000Z'));

    const invalidDelegationAuthSig = createDelegationAuthSig({
      expiration: '2025-13-32T00:00:00Z',
    });

    expect(() =>
      validateDelegationAuthSig({
        delegationAuthSig: invalidDelegationAuthSig,
        sessionKeyUri: DEFAULT_SESSION_KEY_HEX,
      })
    ).toThrowError(
      'Invalid delegation signature: Delegation signature contains an invalid expiration timestamp'
    );
  });

  it('throws when the delegation signature is expired', () => {
    jest.useFakeTimers().setSystemTime(new Date('2025-10-15T15:30:00.000Z'));

    const expiredDelegationAuthSig = createDelegationAuthSig({
      expiration: '2025-10-15T15:00:00Z',
    });

    expect(() =>
      validateDelegationAuthSig({
        delegationAuthSig: expiredDelegationAuthSig,
        sessionKeyUri: DEFAULT_SESSION_KEY_HEX,
      })
    ).toThrowError(
      'Invalid delegation signature: Delegation signature has expired at 2025-10-15T15:00:00.000Z'
    );
  });

  it('throws when the session key URI does not match', () => {
    const mismatchedDelegationAuthSig = createDelegationAuthSig({
      sessionKeyHex: 'another-session-key',
    });

    expect(() =>
      validateDelegationAuthSig({
        delegationAuthSig: mismatchedDelegationAuthSig,
        sessionKeyUri: DEFAULT_SESSION_KEY_HEX,
      })
    ).toThrowError(
      'Invalid delegation signature: Session key URI in delegation signature does not match provided session key pair'
    );
  });
});
