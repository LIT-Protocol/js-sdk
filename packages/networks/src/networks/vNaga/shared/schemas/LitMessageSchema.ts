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
import { BytesArraySchema, SigningChainSchema } from '@lit-protocol/schemas';
import { sha256, sha384 } from '@noble/hashes/sha2';
import { keccak_256, keccak_384 } from '@noble/hashes/sha3';
import { z } from 'zod';

// Only want the EcdsaSigType from the SigningSchemeSchema
// Example:
// [
//   'EcdsaK256Sha256',
//   'EcdsaP256Sha256',
//   'EcdsaP384Sha384',
// ]
type DesiredEcdsaSchemes = Extract<
  z.infer<typeof SigningSchemeSchema>,
  EcdsaSigType
>;

// Example:
// ethereum: {
//   EcdsaK256Sha256: <hash_function>,
//   EcdsaP256Sha256: <hash_function>,
//   EcdsaP384Sha384: <hash_function>,
// },
type EcdsaHashMapper = Record<
  DesiredEcdsaSchemes,
  (arg0: Uint8Array) => Uint8Array
>;

// Hash function mapping by chain:
// - Ethereum: Uses keccak256 (SHA-3 variant) for all ECDSA schemes
// - Bitcoin: Uses SHA-256 for all ECDSA schemes
// - Cosmos: Supports multiple curves but primarily uses SHA-256
// - Solana: Uses Edwards curves (Ed25519) which has its own hashing mechanism
type ChainHashMapper = {
  [key in z.infer<typeof SigningChainSchema>]: EcdsaHashMapper;
};

export const chainHashMapper: ChainHashMapper = {
  ethereum: {
    EcdsaK256Sha256: keccak_256,
    EcdsaP256Sha256: keccak_256,
    EcdsaP384Sha384: keccak_384,
  },
  bitcoin: {
    EcdsaK256Sha256: sha256,
    EcdsaP256Sha256: sha256,
    EcdsaP384Sha384: sha384,
  },

  cosmos: {
    EcdsaK256Sha256: sha256,
    EcdsaP256Sha256: sha256,
    EcdsaP384Sha384: sha384,
  },

  // Solana signatures use Ed25519 (handled by the FROST branch),
  // so we intentionally omit it from the ECDSA mapper.
  // @ts-ignore
  solana: undefined,
};

export const LitMessageSchema = z
  .object({
    toSign: BytesArraySchema,
    signingScheme: SigningSchemeSchema,
    chain: SigningChainSchema,
  })
  .transform(({ toSign, signingScheme, chain }) => {
    if (CURVE_GROUP_BY_CURVE_TYPE[signingScheme] === 'FROST') {
      return toSign;
    }

    if (CURVE_GROUP_BY_CURVE_TYPE[signingScheme] === 'ECDSA') {
      const chainHasher = chainHashMapper[chain];

      if (!chainHasher) {
        throw new Error(
          `Chain "${chain}" does not support ECDSA signing with Lit yet.`
        );
      }

      const hashFn = chainHasher[signingScheme as DesiredEcdsaSchemes];

      if (!hashFn) {
        throw new Error(
          `Signing scheme "${signingScheme}" is not enabled for chain "${chain}".`
        );
      }

      const hashedMessage = hashFn(new Uint8Array(toSign));
      return BytesArraySchema.parse(hashedMessage);
    }

    throw new Error(
      `Invalid or unsupported signing scheme for message transformation: ${signingScheme}`
    );
  });
