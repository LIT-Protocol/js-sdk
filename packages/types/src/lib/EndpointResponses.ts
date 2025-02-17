import {
  // BlsSigType
  EcdsaSigType,
  FrostSigType,
} from '@lit-protocol/constants';

import { Hex } from './types';

// See src/p2p_comms/web/models.rs > BlsSignedMessageShare
// Example output:
// "BlsSignedMessageShare": {
//   "message": "0102030405",
//   "result": "success",
//   "peer_id": "5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a",
//   "share_id": "\"19a7c43a2b7bbedcea0a40ab17fe0f4a1acf31bdecb9ebeb96c1d3a62e4885f0\"",
//   "signature_share": "{\"ProofOfPossession\":{\"identifier\":\"f085482ea6d3c196ebebb9ecbd31cf1a4a0ffe17ab400aeadcbe7b2b3ac4a719\",\"value\":\"8a56ee7b1f7c1eb93e1ccfa2ec02c0f344dcbb66d3cb0742ceaad2aa655da431575b70635db1aa6208061ebdc64442e108c6ae49eb996d72f590ac99d4edda180cb4ef4610bf58b00f75910fda6670bd58eb9b4397f38c8ea5886d9914cb2d24\"}}",
//   "verifying_share": "{\"identifier\":\"f085482ea6d3c196ebebb9ecbd31cf1a4a0ffe17ab400aeadcbe7b2b3ac4a719\",\"value\":\"911725a46083ac660d283be18965f2fc3c3f817272b8499c4b46477e868a2d515d670f4fb89cb837bc1cd0dc7c00655b\"}",
//   "public_key": "\"8fb7104e7fcfae43b77646d6ade34b116c7a69aa53cba75167e267fff36150727dd1064ca477b6cd763f8382c737a35d\"",
//   "sig_type": "Bls12381G1ProofOfPossession"
// }
// Notice how some values are double quoted, and some are not. We need to clean this up.
// export interface BlsSignedMessageShareRaw {
//   message: string;
//   peer_id: string;
//   public_key: string;
//   result: string;
//   share_id: string;
//   sig_type: string;
//   signature_share: string;
//   verifying_share: string;
// }

// See src/p2p_comms/web/models.rs > EcdsaSignedMessageShare
// Example output:
// "EcdsaSignedMessageShare": {
//   "digest": "74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0",
//   "result": "success",
//   "share_id": "\"989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1\"",
//   "peer_id": "5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a",
//   "signature_share": "\"4A862E429D8D45F693261D7A7A2003D628C172A3562F8546CD6A4E77B1C3471B\"",
//   "big_r": "\"037AAA9E30F118821CE3831B8218BF6DD0B61AB9B12D64980201E8B396C8168356\"",
//   "compressed_public_key": "\"021b11247309045cfa640cae5f75acae6b5b4e79f4990719569fcddbd026918fce\"",
//   "public_key": "\"041b11247309045cfa640cae5f75acae6b5b4e79f4990719569fcddbd026918fce13c041bb974c7ba06c78a4454babde69ddf30972ceccde8c9707f997be24cc80\"",
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
//   "message": "0102030405",
//   "result": "success",
//   "share_id": "[\"Ed25519Sha512\",[120,2,187,138,101,21,192,99,172,206,182,184,45,83,216,198,184,93,183,55,83,34,185,90,150,221,88,228,91,232,123,2]]",
//   "peer_id": "6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151",
//   "signature_share": "[\"Ed25519Sha512\",\"c5903ed6a791874dbb17dc5971a8fc1ce46aee0c1f0fa1decf496eae1a87d10b\"]",
//   "signing_commitments": "[\"Ed25519Sha512\",\"00b169f0da1b70b3886efed232a7965609b5bf485d8d2bc5c2aa529f63f9493ce6de97543247f4730e1fef2e4991d2579ab4b100b72a476c3e77ac6c7808df3e975eba913f\"]",
//   "verifying_share": "[\"Ed25519Sha512\",\"8f548f118988ef7b27789b60b627df91a50b9c8c522d9a628d89417fc8219842\"]",
//   "public_key": "[\"Ed25519Sha512\",\"87a64cc4fd848d173619bf5c4af16fd14920e8e3d04b3af03091a707e16f85d4\"]",
//   "sig_type": "SchnorrEd25519Sha512"
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
  // | {
  //     BlsSignedMessageShare: BlsSignedMessageShareRaw;
  //   }
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
  signedData: number[]; // Convertible to Uint8Array
  signatureShare: SignatureShare;
}

export interface LitActionClaimData {
  signature: string;
  derivedKeyId: string;
}

export interface LitActionSignedData {
  publicKey: string;
  signatureShare: string; // JSON.stringify(SignatureShare)
  sigName: string;
  sigType: EcdsaSigType;
}

/**
 * This is what the /web/execute/v2 endpoint returns
 */
export interface ExecuteJsValueResponse {
  claimData: Record<string, LitActionClaimData>;
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
 *   "message": "0x0102030405",
 *   "peerId": "0x5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a",
 *   "shareId": Uint8Array(...),
 *   "signatureShare": "{ProofOfPossession:{identifier:f085482ea6d3c196ebebb9ecbd31cf1a4a0ffe17ab400aeadcbe7b2b3ac4a719,value:8a56ee7b1f7c1eb93e1ccfa2ec02c0f344dcbb66d3cb0742ceaad2aa655da431575b70635db1aa6208061ebdc64442e108c6ae49eb996d72f590ac99d4edda180cb4ef4610bf58b00f75910fda6670bd58eb9b4397f38c8ea5886d9914cb2d24}}",
 *   "verifyingShare": "{identifier:f085482ea6d3c196ebebb9ecbd31cf1a4a0ffe17ab400aeadcbe7b2b3ac4a719,value:911725a46083ac660d283be18965f2fc3c3f817272b8499c4b46477e868a2d515d670f4fb89cb837bc1cd0dc7c00655b}",
 *   "publicKey": "0x8fb7104e7fcfae43b77646d6ade34b116c7a69aa53cba75167e267fff36150727dd1064ca477b6cd763f8382c737a35d",
 *   "sigType": "Bls12381G1ProofOfPossession",
 *   "dataSigned": "0x0102030405"
 * }
 */
// export interface BlsSignedMessageShareParsed {
//   dataSigned: Hex;
//   message: Hex;
//   peerId: Hex;
//   publicKey: Hex;
//   shareId: Uint8Array;
//   signatureShare: Hex;
//   signingCommitments: Hex;
//   sigType: BlsSigType;
//   verifyingShare: Hex;
// }

/**
 * This is the cleaned up version of the EcdsaSignedMessageShareRaw
 *
 * @example
 * {
 *   "digest": "0x74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0",
 *   "shareId": "0x989DD924B8821903330AC0801F99EB27E3E5235EE299B2A06A611780EC0C7AE1",
 *   "peerId": "0x5d6549a90c835b672953dec25b20f278de72b5a47019c74a2e4e8207e01b684a",
 *   "signatureShare": "0x4A862E429D8D45F693261D7A7A2003D628C172A3562F8546CD6A4E77B1C3471B",
 *   "bigR": "0x037AAA9E30F118821CE3831B8218BF6DD0B61AB9B12D64980201E8B396C8168356",
 *   "compressedPublicKey": "0x021b11247309045cfa640cae5f75acae6b5b4e79f4990719569fcddbd026918fce",
 *   "publicKey": "0x041b11247309045cfa640cae5f75acae6b5b4e79f4990719569fcddbd026918fce13c041bb974c7ba06c78a4454babde69ddf30972ceccde8c9707f997be24cc80",
 *   "sigType": "EcdsaK256Sha256",
 *   "dataSigned": "0x74f81fe167d99b4cb41d6d0ccda82278caee9f3e2f25d5e5a3936ff3dcec60d0"
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
 *   "message": "0x0102030405",
 *   "shareId": Uint8Array(...),
 *   "peerId": "0x6555c8c26671f5e21611adba0a3c31b28128443f2d76c2818db169efcff38151",
 *   "signatureShare": "0xc5903ed6a791874dbb17dc5971a8fc1ce46aee0c1f0fa1decf496eae1a87d10b",
 *   "signingCommitments": "0x00b169f0da1b70b3886efed232a7965609b5bf485d8d2bc5c2aa529f63f9493ce6de97543247f4730e1fef2e4991d2579ab4b100b72a476c3e77ac6c7808df3e975eba913f",
 *   "verifyingShare": "0x8f548f118988ef7b27789b60b627df91a50b9c8c522d9a628d89417fc8219842",
 *   "publicKey": "0x87a64cc4fd848d173619bf5c4af16fd14920e8e3d04b3af03091a707e16f85d4",
 *   "sigType": "SchnorrEd25519Sha512",
 *   "dataSigned": "0x0102030405"
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
  // | BlsSignedMessageShareParsed
  EcdsaSignedMessageShareParsed | FrostSignedMessageShareParsed;
