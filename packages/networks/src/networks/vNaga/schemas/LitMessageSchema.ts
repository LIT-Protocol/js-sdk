/**
 * @note 🔐 Quantum Vulnerabilities of Supported Signature Schemes
 *
 * Most signature schemes currently supported (ECDSA, Schnorr, FROST variants) are based on elliptic curve cryptography (ECC),
 * which relies on the hardness of the Elliptic Curve Discrete Logarithm Problem (ECDLP).
 * While this is secure against classical adversaries, it is fundamentally broken by quantum algorithms.
 *
 * ⛔ Key implications:
 * - A sufficiently powerful quantum computer (~2,500–4,000 logical qubits) running Shor's Algorithm can efficiently recover private keys from public keys
 * - This impacts all ECDSA and Schnorr-based schemes, including secp256k1, P-256, P-384, Ed25519, Ed448, Ristretto25519, Jubjub, and others
 * - Public keys become vulnerable **after** signature broadcast, making post-quantum readiness essential for long-term key safety
 * - FROST does not provide post-quantum guarantees unless combined with a post-quantum signature primitive
 *
 * ⚠️ The choice of hash function (e.g., SHA256, SHA384, SHA512, Blake2b, SHAKE256) does **not** mitigate the quantum threat.
 * Hashes are not a defence if the underlying signature algorithm is broken.
 *
 * @warning None of the currently supported signature types are post-quantum secure.
 */
import {
  CURVE_GROUP_BY_CURVE_TYPE,
  EcdsaSigType,
  SigningSchemeSchema,
} from '@lit-protocol/constants';
import { BytesArraySchema } from '@lit-protocol/schemas';
import { sha256, sha384 } from '@noble/hashes/sha2';
import { z } from 'zod';

// only want the EcdsaSigType from the SigningSchemeSchema
type DesiredEcdsaSchemes = Extract<
  z.infer<typeof SigningSchemeSchema>,
  EcdsaSigType
>;

export const ecdsaHashFunctions: Record<
  DesiredEcdsaSchemes,
  (arg0: Uint8Array) => Uint8Array
> = {
  EcdsaK256Sha256: sha256,
  EcdsaP256Sha256: sha256,
  EcdsaP384Sha384: sha384,
} as const;

export const LitMessageSchema = z
  .object({
    toSign: BytesArraySchema,
    signingScheme: SigningSchemeSchema,
  })
  .transform(({ toSign, signingScheme }) => {
    if (CURVE_GROUP_BY_CURVE_TYPE[signingScheme] === 'FROST') {
      return toSign;
    }

    if (CURVE_GROUP_BY_CURVE_TYPE[signingScheme] === 'ECDSA') {
      const hashedMessage = ecdsaHashFunctions[
        signingScheme as DesiredEcdsaSchemes
      ](new Uint8Array(toSign));
      return BytesArraySchema.parse(hashedMessage);
    }

    throw new Error(
      `Invalid or unsupported signing scheme for message transformation: ${signingScheme}`
    );
  });
