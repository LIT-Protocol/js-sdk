import { Hex } from './types';

// TODO these types are defined in @lit-protocol/constants -> curves.ts. Unify them.
export type BlsSigType = 'BLS';

export type EcdsaSigType =
  | 'K256'
  | 'ECDSA_CAIT_SITH'
  | 'EcdsaCaitSithP256'
  | 'EcdsaK256Sha256'
  | 'EcdsaP256Sha256'
  | 'EcdsaP384Sha384';

export type FrostSigType =
  | 'Ed25519Sha512'
  | 'Ed448Shake256'
  | 'Ristretto25519Sha512'
  | 'K256Sha256'
  | 'P256Sha256'
  | 'P384Sha384'
  | 'RedJubjubBlake2b512'
  | 'K256Taproot';

export type SigType = BlsSigType | EcdsaSigType | FrostSigType;

// See src/p2p_comms/web/models.rs > BlsSignedMessageShare
// Example output:
// "BlsSignedMessageShare": {
//    TODO
// }
// Notice how some values are double quoted, and some are not. We need to clean this up.
export interface BlsSignedMessageShareRaw {
  message: string;
  peer_id: string;
  public_key: string;
  result: string;
  share_id: string;
  sig_type: string;
  signature_share: string;
  verifying_share: string;
}

// See src/p2p_comms/web/models.rs > EcdsaSignedMessageShare
// Example output:
// "EcdsaSignedMessageShare": {
//   "digest": "7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4",
//   "result": "success",
//   "share_id": "\"1A0369823607C6EF403D86BA41534DDB1420730C696060EAD7931DE5DB603937\"",
//   "signature_share": "\"034ABD450B174E9627E904651F172EDEC02C09409C40394D9234334F5630110B\"",
//   "big_r": "\"02C9E772791F423556F9D3E8852EB66D522C8161C71CC0771B3DD4A3F0F120851E\"",
//   "compressed_public_key": "\"0381ff5b9f673837eacd4dca7e9377084250dccfc13ebf13913e662182027d1482\"",
//   "public_key": "\"0481ff5b9f673837eacd4dca7e9377084250dccfc13ebf13913e662182027d148243a12fd2835de355660b1b21abdf42efe47cd2871ed9df15a055e67ac2adae43\"",
//   "sig_type": "EcdsaK256Sha256"
// }
// Notice how some values are double quoted, and some are not. We need to clean this up.
export interface EcdsaSignedMessageShareRaw {
  big_r: string;
  compressed_public_key: string;
  digest: string;
  peer_id: string;
  public_key: string;
  result: string;
  share_id: string;
  sig_type: string;
  signature_share: string;
}

// See src/p2p_comms/web/models.rs > FrostSignedMessageShare
// Example output:
// "FrostSignedMessageShare": {
//   "message": "74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0",
//   "result": "success",
//   "share_id": "[\"K256Sha256\",[28,83,244,149,198,207,111,220,44,220,74,216,54,7,202,161,147,157,222,84,171,8,173,91,30,9,57,98,156,191,84,42]]",
//   "peer_id": "800ca9780644bb7e1908efa6bd1a0686f1095158c3ba6f1649ef9d2d67bfaf34",
//   "signature_share": "[\"K256Sha256\",\"09034b241e322919c7f1a8fc6c7769d90844bba01febe264356fdff464e900ce\"]",
//   "signing_commitments": "[\"K256Sha256\",\"00eed6b1b103f4098428b12c87b285db4e97c724acc56bb64092fa68e3ca5574d1d439bcfca60210ead79349531ca2122fcf23a20c00a9ed37f51a2d892e65907406d0eae7e46e\"]",
//   "verifying_share": "[\"K256Sha256\",\"0242ba4e80200df40c08c3e595469d7d4a1a01c994f9b8681c365c5306754c80e8\"]",
//   "public_key": "[\"K256Sha256\",\"031a1bfda858360318640d402f495e782b61215d866438d0f02a547fbaed152de6\"]",
//   "sig_type": "SchnorrK256Sha256"
// }
// Notice how some values are double quoted, and some are not. We need to clean this up.
export interface FrostSignedMessageShareRaw {
  message: string;
  peer_id: string;
  public_key: string;
  result: string;
  share_id: string;
  sig_type: string;
  signature_share: string;
  signing_commitments: string;
  verifying_share: string;
}

type SignatureShare =
  | {
      BlsSignedMessageShare: BlsSignedMessageShareRaw;
    }
  | {
      EcdsaSignedMessageShare: EcdsaSignedMessageShareRaw;
    }
  | {
      FrostSignedMessageShare: FrostSignedMessageShareRaw;
    };

/**
 * This is what the /web/pkp/sign endpoint returns
 */
export interface PKPSignEndpointResponse {
  success: boolean;
  signedData: Uint8Array;
  signatureShare: SignatureShare;
}

export interface LitActionSignedData {
  publicKey: string;
  signatureShare: string; // JSON.stringify(SignatureShare)
  sigName: string;
  sigType: EcdsaSigType; // TODO can it be another <>SigType?
}

export interface ParsedLitActionSignedData extends Omit<LitActionSignedData, 'signatureShare'> {
  signatureShare: SignatureShare;
}

/**
 * This is what the /web/execute/v2 endpoint returns
 */
export interface ExecuteJsValueResponse {
  claimData: any; // TODO check
  decryptedData: any; // TODO check
  logs: string;
  response: string;
  signedData: Record<string, LitActionSignedData>;
  success: boolean;
}

/**
 * This is the cleaned up version of the BlsSignedMessageShareRaw
 *
 * @example
 * {
 *   TODO
 * }
 */
export interface BlsSignedMessageShareParsed {
  dataSigned: Hex;
  message: Hex;
  peerId: Hex;
  publicKey: Hex;
  shareId: Uint8Array;
  signatureShare: Hex;
  signingCommitments: Hex;
  sigType: BlsSigType;
  verifyingShare: Hex;
}

/**
 * This is the cleaned up version of the EcdsaSignedMessageShareRaw
 *
 * @example
 * {
 *   "digest": "7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4",
 *   "shareId": "1A0369823607C6EF403D86BA41534DDB1420730C696060EAD7931DE5DB603937",
 *   "signatureShare": "6F103C0E9632E39CE4BEB3CEE162E2E1E5514CC6D8B5F5700E9B88DDE91A7AB0",
 *   "bigR": "0295635836AED7FDE834F5B835B2D3500070FDF22174A717C91D5375C6EFDDE167",
 *   "compressedPublicKey": "021b922522df1c30b64f0bc53554fd2be50fe75287574f273fd944122c54518c85",
 *   "publicKey": "041b922522df1c30b64f0bc53554fd2be50fe75287574f273fd944122c54518c850768f5eb6e7c9aeef54e07c89df578ace291f58a34bbe32187d60cb12882343a",
 *   "sigType": "EcdsaK256Sha256",
 *   "dataSigned": "7d87c5ea75f7378bb701e404c50639161af3eff66293e9f375b5f17eb50476f4"
 * }
 */
export interface EcdsaSignedMessageShareParsed {
  bigR: Hex;
  compressedPublicKey: Hex;
  dataSigned: Hex;
  digest: Hex;
  peerId: Hex;
  publicKey: Hex;
  shareId: Hex;
  signatureShare: Hex;
  sigType: EcdsaSigType;
}

/**
 * This is the cleaned up version of the FrostSignedMessageShareRaw
 *
 * @example
 * {
 *   TODO
 * }
 */
export interface FrostSignedMessageShareParsed {
  dataSigned: Hex;
  message: Hex;
  peerId: Hex;
  publicKey: Hex;
  shareId: Uint8Array;
  signatureShare: Hex;
  signingCommitments: Hex;
  sigType: FrostSigType;
  verifyingShare: Hex;
}

export type PKPSignEndpointSharesParsed =
  | BlsSignedMessageShareParsed
  | EcdsaSignedMessageShareParsed
  | FrostSignedMessageShareParsed;
