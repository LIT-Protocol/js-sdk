import { getPkpAuthContextFromPreGeneratedAdapter } from './getPkpAuthContextFromPreGeneratedAdapter';
import type { AuthSig, SessionKeyPair } from '@lit-protocol/types';

const baseSessionKeyPair: SessionKeyPair = {
  publicKey: 'a1b2c3',
  secretKey: 'deadbeef',
};

const baseDelegation = ({
  recap,
}: {
  recap: Record<string, unknown>;
}): AuthSig => {
  const resourcesLine = `- urn:recap:${Buffer.from(JSON.stringify(recap)).toString('base64url')}`;

  const signedMessage = [
    'localhost wants you to sign in with your Ethereum account:',
    '0x1234567890abcdef1234567890ABCDEF12345678',
    '',
    "Lit Protocol PKP session signature I further authorize the stated URI to perform the following actions on my behalf: (1) 'Threshold': 'Signing' for 'lit-pkp://*'.",
    '',
    'URI: lit:session:a1b2c3',
    'Version: 1',
    'Chain ID: 1',
    'Nonce: 0xabc',
    'Issued At: 2025-01-01T00:00:00Z',
    'Expiration Time: 2099-01-01T00:00:00.000Z',
    'Resources:',
    resourcesLine,
  ].join('\n');

  return {
    sig: '{"ProofOfPossession":"proof"}',
    algo: 'LIT_BLS',
    derivedVia: 'lit.bls',
    signedMessage,
    address: '0x1234567890abcdef1234567890ABCDEF12345678',
  };
};

describe('getPkpAuthContextFromPreGeneratedAdapter', () => {
  it('derives authData from recap metadata when not provided', async () => {
    const recapPayload = {
      att: {
        'lit-pkp://*': {
          'Threshold/Signing': [{}],
        },
        'lit-resolvedauthcontext://*': {
          'Auth/Auth': [
            {
              auth_context: {
                authMethodContexts: [
                  {
                    appId: 'lit',
                    authMethodType: 1,
                    usedForSignSessionKeyRequest: true,
                    userId: '0xabcdef',
                  },
                ],
                authSigAddress: null,
              },
            },
          ],
        },
      },
      prf: [],
    };

    const delegationAuthSig = baseDelegation({ recap: recapPayload });

    const context = await getPkpAuthContextFromPreGeneratedAdapter({
      pkpPublicKey: '0xpkp',
      sessionKeyPair: baseSessionKeyPair,
      delegationAuthSig,
    });

    expect(context.authData).toBeDefined();
    expect(context.authData?.authMethodId).toBe('0xabcdef');
    expect(context.derivedAuthMetadata?.authMethodId).toBe('0xabcdef');
    expect(context.authConfig.resources.length).toBeGreaterThan(0);
  });

  it('throws when recap metadata is missing and authData not supplied', async () => {
    const recapPayload = {
      att: {
        'lit-pkp://*': {
          'Threshold/Signing': [{}],
        },
      },
      prf: [],
    };

    const delegationAuthSig = baseDelegation({ recap: recapPayload });

    await expect(
      getPkpAuthContextFromPreGeneratedAdapter({
        pkpPublicKey: '0xpkp',
        sessionKeyPair: baseSessionKeyPair,
        delegationAuthSig,
      })
    ).rejects.toThrow(/Failed to derive authData/);
  });
});
