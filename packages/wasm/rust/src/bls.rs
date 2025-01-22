use wasm_bindgen::prelude::*;
use js_sys::Uint8Array;
use serde::{ Deserialize };
use base64_light::{ base64_decode, base64_encode_bytes };
use tsify::Tsify;
use lit_bls_wasm::{
  encrypt,
  decrypt_with_signature_shares,
  combine_signature_shares,
  verify_signature,
};

type JsResult<T> = Result<T, JsValue>;
#[derive(Tsify, Deserialize, Debug)]
#[tsify(from_wasm_abi)]
pub enum BlsVariant {
  Bls12381G1,
  Bls12381G2,
}

// -----------------------------------------------------------------------
// 1. blsCombine
// -----------------------------------------------------------------------
#[wasm_bindgen(js_name = "blsCombine")]
pub fn bls_combine(
  signature_shares: JsValue
) -> Result<String, String> {
  let shares: Vec<String> = serde_wasm_bindgen
    ::from_value(signature_shares)
    .map_err(|e| format!("Failed to parse shares: {}", e))?;

  let combined_signature = combine_signature_shares(
    serde_wasm_bindgen::to_value(&shares).unwrap()
  ).map_err(|e| format!("Failed to combine signature shares: {}", e))?;

  Ok(combined_signature)
}

// -----------------------------------------------------------------------
// 2. blsVerify
// -----------------------------------------------------------------------
#[wasm_bindgen(js_name = "blsVerify")]
pub fn bls_verify(
  variant: BlsVariant,
  public_key: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
) -> JsResult<()> {
  let public_key_hex = hex::encode(public_key.to_vec());
  let message_base64: String = base64_encode_bytes(&message.to_vec());

  // Verify signature length based on variant
  let expected_length = match variant {
    BlsVariant::Bls12381G1 => 48, // 96 hex chars
    BlsVariant::Bls12381G2 => 96, // 192 hex chars
  };

  let signature_bytes = hex
    ::decode(signature.to_vec())
    .map_err(|e|
      JsValue::from_str(&format!("Failed to decode hex signature: {}", e))
    )?;

  web_sys::console::log_1(
    &JsValue::from_str(&format!("Signature length: {}", signature_bytes.len()))
  );

  if signature_bytes.len() != expected_length {
    return Err(
      JsValue::from_str(
        &format!(
          "Invalid signature length for {:?}. Expected {} bytes, got {} bytes",
          variant,
          expected_length,
          signature_bytes.len()
        )
      )
    );
  }

  let signature_base64 = base64_encode_bytes(&signature_bytes);

  verify_signature(&public_key_hex, &message_base64, &signature_base64).map_err(
    |e| JsValue::from_str(&format!("Verification failed: {}", e))
  )
}

// -----------------------------------------------------------------------
// 3. blsEncrypt
// -----------------------------------------------------------------------
#[wasm_bindgen(js_name = "blsEncrypt")]
pub fn bls_encrypt(
  variant: BlsVariant,
  encryption_key: Uint8Array,
  message: Uint8Array,
  identity: Uint8Array
) -> JsResult<Uint8Array> {
  let encryption_key_hex = hex::encode(encryption_key.to_vec());
  let message_base64 = base64_encode_bytes(&message.to_vec());
  let identity_base64 = base64_encode_bytes(&identity.to_vec());

  let ciphertext = encrypt(
    &encryption_key_hex,
    &message_base64,
    &identity_base64
  ).map_err(|e| JsValue::from_str(&format!("Encryption failed: {}", e)))?;

  let decoded_ciphertext = base64_decode(&ciphertext);

  Ok(Uint8Array::from(decoded_ciphertext.as_slice()))
}

// -----------------------------------------------------------------------
// 4. blsDecrypt
// -----------------------------------------------------------------------
#[wasm_bindgen(js_name = "blsDecrypt")]
pub fn bls_decrypt(
  variant: BlsVariant,
  ciphertext: Uint8Array,
  signature_shares: JsValue
) -> JsResult<Uint8Array> {
  let ciphertext_base64 = base64_encode_bytes(&ciphertext.to_vec());

  let shares: Vec<String> = serde_wasm_bindgen
    ::from_value(signature_shares)
    .map_err(|e| JsValue::from_str(&format!("Failed to parse shares: {}", e)))?;

  let shares_json = serde_wasm_bindgen::to_value(&shares).unwrap();

  web_sys::console::log_1(&JsValue::from_str(&format!("Shares: {:?}", shares)));

  let plaintext = (
    match variant {
      BlsVariant::Bls12381G1 =>
        decrypt_with_signature_shares(&ciphertext_base64, shares_json),
      BlsVariant::Bls12381G2 =>
        decrypt_with_signature_shares(&ciphertext_base64, shares_json),
    }
  ).map_err(|e| JsValue::from_str(&format!("Decryption failed: {}", e)))?;

  let decoded_plaintext = base64_decode(&plaintext);

  Ok(Uint8Array::from(decoded_plaintext.as_slice()))
}
