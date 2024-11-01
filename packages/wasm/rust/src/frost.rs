use std::collections::BTreeMap;
use std::convert::TryFrom;
use std::num::NonZeroU16;

use js_sys::Uint8Array;
use lit_frost::{
  Identifier,
  KeyPackage,
  Scheme,
  Signature,
  SignatureShare,
  SigningCommitments,
  SigningNonces,
  VerifyingKey,
};

use serde::{ Deserialize, Serialize };
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use frost_core::keys::SigningShare as CoreSigningShare;
use frost_ed25519::keys::{ SigningShare as Ed25519SigningShare };
use frost_ed448::keys::{ SigningShare as Ed448SigningShare };
use frost_p256::keys::{ SigningShare as P256SigningShare };

use crate::abi::{ from_js, into_uint8array, JsResult };
use gennaro_dkg::*;
use std::num::NonZeroU8;
use rand::rngs::OsRng;
// use lit_frost::Scheme;
// use crate::abi::JsResult;


impl From<FrostVariant> for Scheme {
  fn from(variant: FrostVariant) -> Self {
    match variant {
      FrostVariant::Ed25519Sha512 => Self::Ed25519Sha512,
      FrostVariant::Ed448Shake256 => Self::Ed448Shake256,
      FrostVariant::Ristretto25519Sha512 => Self::Ristretto25519Sha512,
      FrostVariant::K256Sha256 => Self::K256Sha256,
      FrostVariant::P256Sha256 => Self::P256Sha256,
      FrostVariant::P384Sha384 => Self::P384Sha384,
      FrostVariant::RedJubjubBlake2b512 => Self::RedJubjubBlake2b512,
      FrostVariant::K256Taproot => Self::K256Taproot,
    }
  }
}

#[derive(Serialize)]
struct KeygenOutput {
  scheme: FrostVariant,
  shares: Vec<ParticipantShare>,
  group_verifying_key: String, // Hex encoded
  threshold: u16,
  limit: u16,
}

#[derive(Serialize, Clone, Deserialize)]
struct ParticipantShare {
  participant_id: String, // Hex encoded
  signing_share: String, // Hex encoded
  verifying_share: String, // Hex encoded
  hiding_nonce: String, // Hex encoded
  binding_nonce: String, // Hex encoded
}

#[derive(Tsify, Deserialize, Clone, Serialize)]
#[tsify(from_wasm_abi)]
pub enum FrostVariant {
  Ed25519Sha512,
  Ed448Shake256,
  Ristretto25519Sha512,
  K256Sha256,
  P256Sha256,
  P384Sha384,
  RedJubjubBlake2b512,
  K256Taproot,
}

// 1. Key Generation and Distribution (DKG)
#[wasm_bindgen(js_name = "frostDkg")]
pub fn frost_dkg(
  variant: FrostVariant,
  threshold: u16,
  num_participants: u16
) -> JsResult<JsValue> {
  let scheme: Scheme = variant.clone().into();
  let mut rng = OsRng;

  let (secret_shares, verifying_key) = scheme
    .generate_with_trusted_dealer(threshold, num_participants, &mut rng)
    .map_err(|e| JsError::new(&format!("DKG failed: {}", e)))?;

  let mut shares = Vec::new();
  for (id, secret_share) in secret_shares {
    // Generate initial nonces for each participant
    let (nonces, _) = scheme
      .pregenerate_signing_nonces(
        NonZeroU8::new(1).unwrap(),
        &secret_share,
        &mut rng
      )
      .map_err(|e| JsError::new(&format!("Nonce generation failed: {}", e)))?;

    let verifying_share = scheme
      .verifying_share(&secret_share)
      .map_err(|e|
        JsError::new(&format!("Verifying share generation failed: {}", e))
      )?;

    shares.push(ParticipantShare {
      participant_id: hex::encode(&id.id),
      signing_share: hex::encode(&secret_share.value),
      verifying_share: hex::encode(&verifying_share.value),
      hiding_nonce: hex::encode(&nonces[0].hiding),
      binding_nonce: hex::encode(&nonces[0].binding),
    });
  }

  let output = KeygenOutput {
    scheme: variant,
    shares,
    group_verifying_key: hex::encode(&verifying_key.value),
    threshold,
    limit: num_participants,
  };

  Ok(serde_wasm_bindgen::to_value(&output)?)
}
