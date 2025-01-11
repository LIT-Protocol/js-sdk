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
use elliptic_curve::group::GroupEncoding;
use js_sys::Uint8Array;
use serde::Deserialize;
use tsify::Tsify;
use wasm_bindgen::prelude::*;
use web_sys::console;
use crate::abi::{ from_js, from_uint8array, into_uint8array, JsResult };
use serde::{ de::DeserializeOwned, Serialize };

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
  pub fn combine<D: BlsSignatureImpl + DeserializeOwned>(
    shares: &[String]
  ) -> JsResult<Uint8Array> {
    let signature_shares: Vec<SignatureShare<D>> = shares
      .iter()
      .map(|share| {
        match serde_json::from_str::<SignatureShare<D>>(share) {
          Ok(parsed_share) => { Ok(parsed_share) }
          Err(e) => {
            Err(JsError::new(&format!("Failed to parse share: {}", e)))
          }
        }
      })
      .collect::<Result<Vec<_>, _>>()?;

    let signature = Signature::from_shares(&signature_shares).map_err(|_e| {
      JsError::new(&format!("Failed to combine signature shares: {}", _e))
    })?;

    // Serialize the signature to JSON
    let signature_json = serde_json::to_string(&signature).map_err(|e| {
      JsError::new(&format!("Failed to serialize signature to JSON: {}", e))
    })?;

    let signature_bytes = signature_json.as_bytes().to_vec();
    let signature_uint8array = Uint8Array::from(signature_bytes.as_slice());

    Ok(signature_uint8array)
  }

  pub fn verify(
    public_key: Uint8Array,
    message: Uint8Array,
    signature: Uint8Array
  ) -> JsResult<()> {
    console::log_1(&"1. Starting verification process".into());

    let public_key = from_uint8array(public_key).map_err(|e| {
      console::log_1(&format!("Failed to convert public_key: {:?}", e).into());
      e
    })?;
    console::log_1(&"2. Public key converted successfully".into());

    // Convert Uint8Array back to a Vec<u8>
    let signature_bytes = signature.to_vec();

    // Convert Vec<u8> back to a String
    let signature_string = String::from_utf8(signature_bytes).map_err(|e| {
      JsError::new(&format!("Failed to convert bytes to string: {}", e))
    })?;

    console::log_1(
      &format!("3. Signature string: {}", signature_string).into()
    );

    let signature = serde_json
      ::from_str::<Signature<C>>(&signature_string)
      .map_err(|e| {
        JsError::new(&format!("Failed to parse signature: {}", e))
      })?;

    console::log_1(&format!("4. Signature: {:?}", signature).into());

    console::log_1(&"Signature converted successfully".into());

    let message = from_js::<Vec<u8>>(message).map_err(|e| {
      console::log_1(&format!("Failed to convert message: {:?}", e).into());
      e
    })?;
    console::log_1(&"5. Message converted successfully".into());

    // Log the public key and message for verification
    console::log_1(&format!("Public Key: {:?}", public_key).into());
    console::log_1(&format!("Message: {:?}", message).into());

    // Ensure the signature verification is done correctly
    let verification_result = signature.verify(
      &PublicKey(public_key),
      &message
    );

    match verification_result {
      Ok(_) => {
        console::log_1(&"6. Signature verified successfully".into());
        Ok(())
      }
      Err(e) => {
        console::log_1(
          &format!("Signature verification failed: {:?}", e).into()
        );
        // Log additional context about the failure
        console::log_1(&format!("Public Key Type: {:?}", public_key).into());
        console::log_1(&format!("Message Type: {:?}", message).into());
        console::log_1(&format!("Signature Type: {:?}", signature).into());
        Err(JsError::new(&format!("Signature verification failed: {:?}", e)))
      }
    }
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
    decryption_key: Uint8Array
  ) -> JsResult<Uint8Array> {
    let decryption_key = from_uint8array(decryption_key)?;

    let ciphertext = from_js::<Vec<u8>>(ciphertext)?;
    let ciphertext = serde_bare::from_slice::<TimeCryptCiphertext<C>>(
      &ciphertext
    )?;

    let message = ciphertext.decrypt(
      &Signature::ProofOfPossession(decryption_key)
    );
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
  decryption_key: Uint8Array
) -> JsResult<Uint8Array> {
  match variant {
    BlsVariant::Bls12381G1 =>
      Bls::<Bls12381G1Impl>::decrypt(ciphertext, decryption_key),
    BlsVariant::Bls12381G2 =>
      Bls::<Bls12381G2Impl>::decrypt(ciphertext, decryption_key),
  }
}
