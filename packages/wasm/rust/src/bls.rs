use std::convert::TryFrom;
use blsful::{
  Bls12381G1Impl,
  Bls12381G2Impl,
  BlsSignatureImpl,
  PublicKey,
  Signature,
  SignatureShare,
  SignatureSchemes,
  TimeCryptCiphertext,
};
use js_sys::Uint8Array;
use serde::Deserialize;
use tsify::Tsify;
use wasm_bindgen::prelude::*;
use crate::abi::{ from_js, from_uint8array, into_uint8array, JsResult };
use serde::{ de::DeserializeOwned };

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
pub enum BlsVariant {
  Bls12381G1,
  Bls12381G2,
}

struct Bls<C>(C);

impl<C: BlsSignatureImpl> Bls<C>
  where
    C::PublicKey: TryFrom<Vec<u8>>,
    C::Signature: TryFrom<Vec<u8>>,
    C::SignatureShare: TryFrom<Vec<u8>>
{
  fn parse_signature(signature: Uint8Array) -> JsResult<Signature<C>> {
    let signature_bytes = signature.to_vec();
    let signature_string = String::from_utf8(signature_bytes).map_err(|e|
      JsError::new(&format!("Failed to convert bytes to string: {}", e))
    )?;

    serde_json
      ::from_str::<Signature<C>>(&signature_string)
      .map_err(|e| JsError::new(&format!("Failed to parse signature: {}", e)))
  }

  pub fn combine<D: BlsSignatureImpl + DeserializeOwned>(
    shares: &[String]
  ) -> JsResult<Uint8Array> {
    let signature_shares: Vec<SignatureShare<D>> = shares
      .iter()
      .map(|share| {
        serde_json
          ::from_str::<SignatureShare<D>>(share)
          .map_err(|e| JsError::new(&format!("Failed to parse share: {}", e)))
      })
      .collect::<Result<Vec<_>, _>>()?;

    let signature = Signature::from_shares(&signature_shares).map_err(|e|
      JsError::new(&format!("Failed to combine signature shares: {}", e))
    )?;

    let signature_json = serde_json
      ::to_string(&signature)
      .map_err(|e|
        JsError::new(&format!("Failed to serialize signature to JSON: {}", e))
      )?;

    // Parse the signature JSON to get the ProofOfPossession value
    let signature_json: serde_json::Value = serde_json::from_str(&signature_json)?;
    let proof_of_possession = signature_json
        .get("ProofOfPossession")
        .ok_or_else(|| JsError::new("Missing ProofOfPossession field"))?
        .as_str()
        .ok_or_else(|| JsError::new("ProofOfPossession is not a string"))?;

    // Convert hex string to bytes
    let proof_bytes = hex::decode(proof_of_possession)
        .map_err(|e| JsError::new(&format!("Failed to decode hex: {}", e)))?;

    Ok(Uint8Array::from(proof_bytes.as_slice()))
  }

  pub fn verify(
    public_key: Uint8Array,
    message: Uint8Array,
    signature: Uint8Array
  ) -> JsResult<()> {
    let public_key = from_uint8array(public_key)?;
    let message = from_js::<Vec<u8>>(message)?;
    let signature = Self::parse_signature(signature)?;

    signature
      .verify(&PublicKey(public_key), &message)
      .map_err(|e|
        JsError::new(&format!("Signature verification failed: {:?}", e))
      )
  }

  pub fn encrypt(
    encryption_key: Uint8Array,
    message: Uint8Array,
    identity: Uint8Array
  ) -> JsResult<Uint8Array> {
    let encryption_key = from_uint8array(encryption_key)?;
    let encryption_key = PublicKey::<C>(encryption_key);
    let message = from_js::<Vec<u8>>(message)?;
    let identity = from_js::<Vec<u8>>(identity)?;

    let ciphertext = encryption_key.encrypt_time_lock(
      SignatureSchemes::ProofOfPossession,
      message,
      identity
    )?;
    let ciphertext = serde_bare::to_vec(&ciphertext)?;
    into_uint8array(ciphertext)
  }

  pub fn decrypt(
    ciphertext: Uint8Array,
    signature: Uint8Array
  ) -> JsResult<Uint8Array> {
    let signature = Self::parse_signature(signature)?;
    let ciphertext = from_js::<Vec<u8>>(ciphertext)?;
    let ciphertext = serde_bare::from_slice::<TimeCryptCiphertext<C>>(
      &ciphertext
    )?;

    let message = ciphertext.decrypt(&signature);
    let message = Option::<Vec<u8>>
      ::from(message)
      .ok_or_else(|| JsError::new("decryption failed"))?;

    into_uint8array(message)
  }
}

#[wasm_bindgen(js_name = "blsCombine")]
pub fn bls_combine(
  variant: BlsVariant,
  signature_shares: Vec<String>
) -> JsResult<Uint8Array> {
  match variant {
    BlsVariant::Bls12381G1 =>
      Bls::<Bls12381G1Impl>::combine::<Bls12381G1Impl>(&signature_shares),
    BlsVariant::Bls12381G2 =>
      Bls::<Bls12381G2Impl>::combine::<Bls12381G2Impl>(&signature_shares),
  }
}

#[wasm_bindgen(js_name = "blsVerify")]
pub fn bls_verify(
  variant: BlsVariant,
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
) -> JsResult<()> {
  match variant {
    BlsVariant::Bls12381G1 =>
      Bls::<Bls12381G1Impl>::verify(public_key, message, signature),
    BlsVariant::Bls12381G2 =>
      Bls::<Bls12381G2Impl>::verify(public_key, message, signature),
  }
}

#[wasm_bindgen(js_name = "blsEncrypt")]
pub fn bls_encrypt(
  variant: BlsVariant,
  encryption_key: Uint8Array,
  message: Uint8Array,
  identity: Uint8Array
) -> JsResult<Uint8Array> {
  match variant {
    BlsVariant::Bls12381G1 =>
      Bls::<Bls12381G1Impl>::encrypt(encryption_key, message, identity),
    BlsVariant::Bls12381G2 =>
      Bls::<Bls12381G2Impl>::encrypt(encryption_key, message, identity),
  }
}

#[wasm_bindgen(js_name = "blsDecrypt")]
pub fn bls_decrypt(
  variant: BlsVariant,
  ciphertext: Uint8Array,
  signature: Uint8Array
) -> JsResult<Uint8Array> {
  match variant {
    BlsVariant::Bls12381G1 =>
      Bls::<Bls12381G1Impl>::decrypt(ciphertext, signature),
    BlsVariant::Bls12381G2 =>
      Bls::<Bls12381G2Impl>::decrypt(ciphertext, signature),
  }
}
