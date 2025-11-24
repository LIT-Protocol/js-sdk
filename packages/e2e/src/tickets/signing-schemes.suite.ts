import { LitCurve } from '@lit-protocol/constants';
import { SigningChainSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { createEnvVars } from '../helper/createEnvVars';
import { createTestAccount } from '../helper/createTestAccount';
import { createTestEnv } from '../helper/createTestEnv';

type SigningChain = z.infer<typeof SigningChainSchema>;

type SchemeUnderTest = {
  scheme: LitCurve;
  chain: SigningChain;
};

const SIGNING_MATRIX: SchemeUnderTest[] = [
  // ECDSA variants
  { scheme: 'EcdsaK256Sha256', chain: 'ethereum' },
  { scheme: 'EcdsaP256Sha256', chain: 'ethereum' },
  { scheme: 'EcdsaP384Sha384', chain: 'ethereum' },
  // Schnorr over secp256k1 (Bitcoin / Taproot)
  { scheme: 'SchnorrK256Sha256', chain: 'bitcoin' },
  { scheme: 'SchnorrK256Taproot', chain: 'bitcoin' },
  // Schnorr over NIST curves
  { scheme: 'SchnorrP256Sha256', chain: 'cosmos' },
  { scheme: 'SchnorrP384Sha384', chain: 'cosmos' },
  // EdDSA-style curves
  { scheme: 'SchnorrEd25519Sha512', chain: 'solana' },
  { scheme: 'SchnorrEd448Shake256', chain: 'solana' },
  // ZK / privacy-focused curves
  { scheme: 'SchnorrRistretto25519Sha512', chain: 'solana' },
  { scheme: 'SchnorrRedJubjubBlake2b512', chain: 'solana' },
  { scheme: 'SchnorrRedDecaf377Blake2b512', chain: 'solana' },
  { scheme: 'SchnorrkelSubstrate', chain: 'solana' },
];

export function registerSigningSchemesTicketSuite() {
  describe('pkp signing schemes', () => {
    let testEnv: Awaited<ReturnType<typeof createTestEnv>>;
    let signerAccount: Awaited<ReturnType<typeof createTestAccount>>;

    beforeAll(async () => {
      const envVars = createEnvVars();
      testEnv = await createTestEnv(envVars);
      signerAccount = await createTestAccount(testEnv, {
        label: 'Signing Schemes',
        fundAccount: true,
        fundLedger: true,
        hasEoaAuthContext: true,
        hasPKP: true,
        fundPKP: true,
        fundPKPLedger: true,
      });
    });

    it.each(SIGNING_MATRIX)(
      'should sign using %s',
      async ({ scheme, chain }) => {
        if (!signerAccount.pkp?.pubkey) {
          throw new Error('Signer PKP was not initialized');
        }
        if (!signerAccount.eoaAuthContext) {
          throw new Error('Signer account is missing an EOA auth context');
        }

        const toSign = new TextEncoder().encode(
          `Lit signing e2e test using ${scheme}`
        );

        const signature = await testEnv.litClient.chain.raw.pkpSign({
          authContext: signerAccount.eoaAuthContext,
          pubKey: signerAccount.pkp.pubkey,
          signingScheme: scheme,
          chain,
          toSign,
          userMaxPrice: 100_000_000_000_000_000n, // 0.1 ETH in wei to clear threshold comfortably
        });

        expect(signature.signature).toBeTruthy();
        expect(signature.sigType).toBe(scheme);
      }
    );
  });
}
