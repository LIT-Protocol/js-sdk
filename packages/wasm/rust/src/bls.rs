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

// -----------------------------------------------------------------------
// 1. blsCombine
// -----------------------------------------------------------------------
#[wasm_bindgen(js_name = "blsCombine")]
pub fn bls_combine(signature_shares: JsValue) -> Result<String, String> {
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
  public_key: Uint8Array, // buffer, but will be converted to hex string
  message: Uint8Array, // buffer, but will be converted to hex string
  signature: String // this is the result from bls_combine. It's a hex string
) -> JsResult<()> {
  // check if signature is a valid hex string
  if !signature.chars().all(|c| c.is_ascii_hexdigit()) {
    return Err(JsValue::from_str("Signature must be a hex string"));
  }
  // convert public_key to hex string
  let public_key_hex = hex::encode(public_key.to_vec());

  // convert message to base64 string
  let message_base64 = base64_encode_bytes(&message.to_vec());

  // Validate all inputs are hex
  if !public_key_hex.chars().all(|c| c.is_ascii_hexdigit()) {
    return Err(JsValue::from_str("Public key must be a hex string"));
  }

  if !signature.chars().all(|c| c.is_ascii_hexdigit()) {
    return Err(JsValue::from_str("Signature must be a hex string"));
  }

  let signature_bytes = hex
    ::decode(&signature)
    .map_err(|e|
      JsValue::from_str(&format!("Failed to decode signature hex: {}", e))
    )?;

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
  ciphertext: Uint8Array,
  signature_shares: JsValue // this is the result from bls_combine. It's a hex string
) -> JsResult<Uint8Array> {
  let ciphertext_base64 = base64_encode_bytes(&ciphertext.to_vec());

  let shares: Vec<String> = serde_wasm_bindgen
    ::from_value(signature_shares)
    .map_err(|e| format!("[blsDecrypt] Failed to parse shares: {}", e))?;

  let plaintext = decrypt_with_signature_shares(
    &ciphertext_base64,
    serde_wasm_bindgen::to_value(&shares).unwrap()
  ).map_err(|e| JsValue::from_str(&format!("Decryption failed: {}", e)))?;

  let decoded_plaintext = base64_decode(&plaintext);

  Ok(Uint8Array::from(decoded_plaintext.as_slice()))
}
