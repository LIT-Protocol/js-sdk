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

#[derive(Clone, Serialize)]
struct KeygenOutput {
  scheme: FrostVariant,
  shares: Vec<ParticipantShare>,
  group_verifying_key: String, // Hex encoded
  threshold: u16,
  max_signers: u16,
}

#[derive(Serialize, Clone, Deserialize)]
struct ParticipantShare {
  scheme: FrostVariant,
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

#[wasm_bindgen(js_name = "frostGenerateKeys")]
pub fn frost_generate_keys(
  variant: FrostVariant,
  min_signers: u16,
  max_signers: u16
) -> JsResult<JsValue> {
  let mut rng = rand::thread_rng();
  let scheme = Scheme::from(variant.clone());

  // Generate the secret shares and public key
  let (shares, verifying_key) = scheme
    .generate_with_trusted_dealer(min_signers, max_signers, &mut rng)
    .map_err(|e| JsError::new(&e.to_string()))?;

  let mut shares_vec = Vec::with_capacity(shares.len());

  // Process each participant's shares
  for (id, secret_share) in shares {
    // Generate signing nonces
    let (nonces, _commitments) = scheme
      .signing_round1(&secret_share, &mut rng)
      .map_err(|e| JsError::new(&e.to_string()))?;

    // Get the public share for this participant
    let verifying_share = scheme
      .verifying_share(&secret_share)
      .map_err(|e| JsError::new(&e.to_string()))?;

    // Create the participant's complete share package
    let share = ParticipantShare {
      scheme: variant.clone(),
      participant_id: hex::encode(Vec::<u8>::from(&id)),
      signing_share: hex::encode(Vec::<u8>::from(&secret_share)),
      verifying_share: hex::encode(Vec::<u8>::from(&verifying_share)),
      hiding_nonce: hex::encode(&nonces.hiding),
      binding_nonce: hex::encode(&nonces.binding),
    };

    shares_vec.push(share);
  }

  // Create the complete output
  let output = KeygenOutput {
    shares: shares_vec,
    group_verifying_key: hex::encode(Vec::<u8>::from(&verifying_key)),
    threshold: min_signers,
    max_signers,
    scheme: variant,
  };

  Ok(serde_wasm_bindgen::to_value(&output)?)
}
