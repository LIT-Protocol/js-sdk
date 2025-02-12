import { hexToBytes } from '@noble/hashes/utils';

import { UnknownSignatureError } from '@lit-protocol/constants';
import {
  curveFunctions,
  hashLitMessage,
  verifyLitSignature,
} from '@lit-protocol/crypto';
import { log } from '@lit-protocol/misc';
import { SigningScheme } from '@lit-protocol/types';

import { getEoaAuthContext } from 'local-tests/setup/session-sigs/get-eoa-session-sigs';
import { TinnyEnvironment } from 'local-tests/setup/tinny-environment';

interface SigningSchemeConfig {
  hasRecoveryId?: boolean;
  hashesMessage: boolean;
  recoversPublicKey?: boolean;
  signingScheme: SigningScheme;
}

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
    //   signingScheme: 'Bls12381', // TODO NodeErrror: Unsupported key type when for Signable. No esta en tss_state.rs::TssState::get_signing_state, puede que no sea posible firmar con esto?
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'Bls12381G1ProofOfPossession', // TODO pkpSignature.signature: '{ProofOfPossession:984ffb9ef7a0e6225dd074bade4b9494fab3487ff543f25a90d86f794cbf190ed20179df6eb6dd3eb9a285838d3cf4980e5e7028688e0461bd1cb95c075046fcafa343d3702e7edff70fb8eb8ada130f58fa45140ab2d90f24b1309b026d98d6}'
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
    // {
    //   signingScheme: 'SchnorrK256Sha256', // TODO signature of length 64 expected, got 65
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'SchnorrP256Sha256', // TODO Expected pkpSignature to consistently verify its components
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'SchnorrP384Sha384', // TODO Expected pkpSignature to consistently verify its components
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'SchnorrRistretto25519Sha512', // TODO curve.verify is not a function
    //   hashesMessage: false,
    // },
    {
      signingScheme: 'SchnorrEd448Shake256',
      hashesMessage: false,
    },
    // {
    //   signingScheme: 'SchnorrRedJubjubBlake2b512', // TODO Expected pkpSignature to consistently verify its components
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'SchnorrK256Taproot', // TODO Expected pkpSignature to consistently verify its components
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'SchnorrRedDecaf377Blake2b512', // TODO Expected pkpSignature to consistently verify its components
    //   hashesMessage: false,
    // },
    // {
    //   signingScheme: 'SchnorrkelSubstrate', // TODO Expected pkpSignature to consistently verify its components
    //   hashesMessage: false,
    // },
  ];

  for (const signingSchemeConfig of signingSchemeConfigs) {
    try {

      const signingScheme = signingSchemeConfig.signingScheme;
      log(`Checking testUseEoaSessionSigsToPkpSign for ${signingSchemeConfig}`);
      // const eoaSessionSigs = await getEoaSessionSigs(devEnv, alice);

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
            `Expected "${hexString}" hex string in pkpSignature. SigningScheme: ${signingScheme}`
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
          `Expected "recoveryId" to be 0/1 for ECDSA and "null" for the rest of curves. SigningScheme: ${signingScheme}`
        );
      }

      // Signature, public key and signed data verification
      const signatureVerification = verifyLitSignature(
        signingSchemeConfig.signingScheme,
        pkpSignature.publicKey.replace('0x', ''),
        pkpSignature.signedData.replace('0x', ''),
        pkpSignature.signature.replace('0x', '')
      );
      if (!signatureVerification) {
        throw new Error(
          `Expected pkpSignature to consistently verify its components. SigningScheme: ${signingScheme}`
        );
      }

      if (signingSchemeConfig.recoversPublicKey) {
        const curve = curveFunctions[signingScheme];
        const signatureBytes = hexToBytes(
          pkpSignature.signature.replace(/^0x/, '')
        );
        // @ts-expect-error In progress. ECDSA works, not yet Frost
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
            `Expected recovered public key to match alice.pkp.publicKey. SigningScheme: ${signingSchemeConfig}`
          );
        }
      }

      const messageHash = signingSchemeConfig.hashesMessage ? hashLitMessage(signingScheme, alice.loveLetter) : alice.loveLetter;
      const messageHashHex = Buffer.from(messageHash).toString('hex');
      if (pkpSignature.signedData.replace('0x', '') !== messageHashHex) {
        throw new Error(
          `Expected signed data to match hashLitMessage(signingScheme, alice.loveLetter). SigningScheme: ${signingScheme}`
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
