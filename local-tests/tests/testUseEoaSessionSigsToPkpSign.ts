import { p256 } from '@noble/curves/p256';
import { p384 } from '@noble/curves/p384';
import { secp256k1 } from '@noble/curves/secp256k1';
import { hexToBytes } from '@noble/hashes/utils';

import { UnknownSignatureError } from '@lit-protocol/constants';
import { hashLitMessage } from '@lit-protocol/crypto';
import { log } from '@lit-protocol/misc';
import { EcdsaSigType, SigType } from '@lit-protocol/types';

import { getEoaAuthContext } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

interface SigningSchemeConfig {
  hasRecoveryId?: boolean;
  hashesMessage: boolean;
  recoversPublicKey?: boolean;
  signingScheme: SigType;
}

// Map the right curve function per signing scheme
export const ecdsaCurveFunctions: Record<EcdsaSigType, any> = {
  EcdsaK256Sha256: secp256k1,
  EcdsaP256Sha256: p256,
  EcdsaP384Sha384: p384,
} as const;

/**
 * Test Commands:
 * ✅ NETWORK=naga-dev yarn test:local --filter=testUseEoaSessionSigsToPkpSign
 * ✅ NETWORK=naga-test yarn test:local --filter=testUseEoaSessionSigsToPkpSign
 * ✅ NETWORK=custom yarn test:local --filter=testUseEoaSessionSigsToPkpSign
 */
export const testUseEoaSessionSigsToPkpSign = async (
  devEnv: TinnyEnvironment
) => {
  const alice = await devEnv.createRandomPerson();
  const signingSchemeConfigs: SigningSchemeConfig[] = [
    // BLS
    // {
    //   signingScheme: 'Bls12381', // TODO nodes accept this signing scheme but they throw an unexpected error
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'Bls12381G1ProofOfPossession',
    //   hashesMessage: false,
    // },
    // ECDSA
    {
      hasRecoveryId: true,
      hashesMessage: true,
      recoversPublicKey: true,
      signingScheme: 'EcdsaK256Sha256',
    },
    {
      hasRecoveryId: true,
      hashesMessage: true,
      recoversPublicKey: true,
      signingScheme: 'EcdsaP256Sha256',
    },
    {
      hasRecoveryId: true,
      hashesMessage: true,
      recoversPublicKey: true,
      signingScheme: 'EcdsaP384Sha384',
    },
    // FROST
    {
      signingScheme: 'SchnorrEd25519Sha512',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrK256Sha256',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrP256Sha256',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrP384Sha384',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrRistretto25519Sha512',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrEd448Shake256',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrRedJubjubBlake2b512',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrK256Taproot',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrRedDecaf377Blake2b512',
      hashesMessage: false,
    },
    {
      signingScheme: 'SchnorrkelSubstrate',
      hashesMessage: false,
    },
  ];

  for (const signingSchemeConfig of signingSchemeConfigs) {
    try {
      const signingScheme = signingSchemeConfig.signingScheme;
      log(`Checking testUseEoaSessionSigsToPkpSign for ${signingSchemeConfig}`);

      const pkpSignature = await devEnv.litNodeClient.pkpSign({
        pubKey: alice.pkp.publicKey,
        authContext: getEoaAuthContext(devEnv, alice),
        messageToSign: alice.loveLetter,
        signingScheme,
      });

      devEnv.releasePrivateKeyFromUser(alice);

      // -- Combined signature format assertions
      for (const hexString of [
        'signature',
        'verifyingKey',
        'signedData',
        'publicKey',
      ]) {
        if (
          !pkpSignature[hexString] ||
          !pkpSignature[hexString].startsWith('0x')
        ) {
          throw new Error(
            `Expected "${hexString}" hex string in pkpSignature. Signing Scheme: ${signingScheme}`
          );
        }
      }
      // Verify correct recoveryId
      if (
        signingSchemeConfig.hasRecoveryId
          ? ![0, 1].includes(pkpSignature.recoveryId)
          : pkpSignature.recoveryId !== null
      ) {
        throw new Error(
          `Expected "recoveryId" to be 0/1 for ECDSA and "null" for the rest of curves. Signing Scheme: ${signingScheme}`
        );
      }

      if (signingSchemeConfig.recoversPublicKey) {
        const curve = ecdsaCurveFunctions[signingScheme];
        const signatureBytes = hexToBytes(
          pkpSignature.signature.replace(/^0x/, '')
        );
        const signature = curve.Signature.fromCompact(
          signatureBytes
        ).addRecoveryBit(pkpSignature.recoveryId);

        const msgHash = hexToBytes(pkpSignature.signedData.replace(/^0x/, ''));
        const recoveredPubKeyBytes = signature.recoverPublicKey(msgHash);
        const recoveredPubKey = recoveredPubKeyBytes.toHex(false);

        if (pkpSignature.publicKey.replace('0x', '') !== recoveredPubKey) {
          throw new Error(
            `Expected recovered public key to match nodesPublicKey`
          );
        }
        // PKP public key lives in k256, it cannot be directly compared in any other curve
        if (
          signingScheme === 'EcdsaK256Sha256' &&
          alice.pkp.publicKey !== recoveredPubKey
        ) {
          throw new Error(
            `Expected recovered public key to match alice.pkp.publicKey. Signing Scheme: ${signingSchemeConfig}`
          );
        }
      }

      const messageHash = signingSchemeConfig.hashesMessage
        ? hashLitMessage(signingScheme as EcdsaSigType, alice.loveLetter)
        : alice.loveLetter;
      const messageHashHex = Buffer.from(messageHash).toString('hex');
      if (pkpSignature.signedData.replace('0x', '') !== messageHashHex) {
        throw new Error(
          `Expected signed data to match hashLitMessage(signingScheme, alice.loveLetter). Signing Scheme: ${signingScheme}`
        );
      }

      log(`✅ testUseEoaSessionSigsToPkpSign - ${signingScheme}`);
    } catch (e) {
      throw new UnknownSignatureError(
        {
          info: {
            signingSchemeConfig,
            message: alice.loveLetter,
            pkp: alice.pkp,
          },
          cause: e,
        },
        `Signature failed with signing scheme ${signingSchemeConfig.signingScheme}`
      );
    }
  }

  log('✅ testUseEoaSessionSigsToPkpSign all signing schemes');
};
