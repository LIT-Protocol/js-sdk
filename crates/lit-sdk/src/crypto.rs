use crate::error::LitSdkError;
use blsful::inner_types::GroupEncoding;
use blsful::{Bls12381G1Impl, Bls12381G2Impl, BlsSignatureImpl, Signature, SignatureShare};
use serde::de::DeserializeOwned;

/// Encrypt data with a BLS public key.
///
/// By default this returns `NotImplemented` unless the `bls-wasm` feature is enabled.
#[cfg(not(feature = "bls-wasm"))]
pub fn bls_encrypt(
    _public_key_hex: &str,
    _message: &[u8],
    _identity: &[u8],
) -> Result<String, LitSdkError> {
    Err(LitSdkError::NotImplemented(
        "BLS encryption requires the `bls-wasm` feature",
    ))
}

/// Verify BLS signature shares and decrypt ciphertext.
#[cfg(not(feature = "bls-wasm"))]
pub fn bls_verify_and_decrypt_with_signature_shares(
    _public_key_hex: &str,
    _identity: &[u8],
    _ciphertext_base64: &str,
    _shares_json: &[String],
) -> Result<Vec<u8>, LitSdkError> {
    Err(LitSdkError::NotImplemented(
        "BLS decrypt requires the `bls-wasm` feature",
    ))
}

pub fn combine_bls_signature_shares(shares_json: &[String]) -> Result<String, LitSdkError> {
    if shares_json.len() < 2 {
        return Err(LitSdkError::Crypto(
            "at least two BLS signature shares are required".into(),
        ));
    }

    // Prefer the modern share format; fall back to v1 (blsful v2) shares if needed.
    if let Ok(sig) = combine_signature_shares_inner::<Bls12381G2Impl>(shares_json) {
        return Ok(sig);
    }
    if let Ok(sig) = combine_signature_shares_inner::<Bls12381G1Impl>(shares_json) {
        return Ok(sig);
    }
    if let Ok(sig) =
        combine_signature_shares_inner_v1::<Bls12381G2Impl, blsful2::Bls12381G2Impl>(shares_json)
    {
        return Ok(sig);
    }
    if let Ok(sig) =
        combine_signature_shares_inner_v1::<Bls12381G1Impl, blsful2::Bls12381G1Impl>(shares_json)
    {
        return Ok(sig);
    }

    Err(LitSdkError::Crypto(
        "invalid or unsupported BLS signature share format".into(),
    ))
}

fn combine_signature_shares_inner<C>(shares: &[String]) -> Result<String, LitSdkError>
where
    C: BlsSignatureImpl + DeserializeOwned,
{
    let mut signature_shares = Vec::with_capacity(shares.len());
    for share in shares {
        let parsed = serde_json::from_str::<SignatureShare<C>>(share)
            .map_err(|e| LitSdkError::Crypto(format!("failed to parse BLS share: {e}")))?;
        signature_shares.push(parsed);
    }

    let signature = Signature::from_shares(&signature_shares)
        .map_err(|e| LitSdkError::Crypto(format!("failed to combine BLS shares: {e}")))?;
    Ok(hex::encode(signature.as_raw_value().to_bytes()))
}

fn combine_signature_shares_inner_v1<C, CC>(shares: &[String]) -> Result<String, LitSdkError>
where
    C: BlsSignatureImpl,
    CC: blsful2::BlsSignatureImpl + DeserializeOwned,
{
    let mut signature_shares = Vec::with_capacity(shares.len());
    for share in shares {
        let old_share_format = serde_json::from_str::<blsful2::SignatureShare<CC>>(share)
            .map_err(|e| LitSdkError::Crypto(format!("failed to parse v1 BLS share: {e}")))?;
        let bytes = Vec::<u8>::from(&old_share_format);
        let parsed = SignatureShare::from_v1_inner_bytes(&bytes)
            .map_err(|e| LitSdkError::Crypto(format!("failed to convert v1 BLS share: {e}")))?;
        signature_shares.push(parsed);
    }

    let signature = Signature::<C>::from_shares(&signature_shares)
        .map_err(|e| LitSdkError::Crypto(format!("failed to combine v1 BLS shares: {e}")))?;
    Ok(hex::encode(signature.as_raw_value().to_bytes()))
}

#[cfg(feature = "bls-wasm")]
pub fn bls_verify_and_decrypt_with_signature_shares(
    public_key_hex: &str,
    identity: &[u8],
    ciphertext_base64: &str,
    shares_json: &[String],
) -> Result<Vec<u8>, LitSdkError> {
    use base64ct::{Base64, Encoding};
    use blsful::{Bls12381G1Impl, Bls12381G2Impl};

    let key_hex = public_key_hex.trim_start_matches("0x");
    let ciphertext_bytes = Base64::decode_vec(ciphertext_base64)
        .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

    // Match lit-bls-wasm behavior: G2 pubkeys are 96 hex chars, G1 are 192.
    let plaintext_b64 = match key_hex.len() {
        96 => lit_bls_wasm::verify_and_decrypt::<Bls12381G2Impl>(
            key_hex,
            identity,
            &ciphertext_bytes,
            shares_json,
        ),
        192 => lit_bls_wasm::verify_and_decrypt::<Bls12381G1Impl>(
            key_hex,
            identity,
            &ciphertext_bytes,
            shares_json,
        ),
        other => {
            return Err(LitSdkError::Crypto(format!(
                "invalid BLS public key length (expected 96 or 192 hex chars, got {other})"
            )))
        }
    }
    .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

    let plaintext_bytes = Base64::decode_vec(&plaintext_b64)
        .map_err(|e| LitSdkError::Crypto(e.to_string()))?;

    Ok(plaintext_bytes)
}

#[cfg(feature = "bls-wasm")]
pub fn bls_encrypt(
    public_key_hex: &str,
    message: &[u8],
    identity: &[u8],
) -> Result<String, LitSdkError> {
    use base64ct::{Base64, Encoding};

    let key_hex = public_key_hex.trim_start_matches("0x");
    if key_hex.len() != 96 {
        return Err(LitSdkError::Crypto(format!(
            "invalid BLS public key length (expected 96 hex chars, got {})",
            key_hex.len()
        )));
    }

    let message_b64 = Base64::encode_string(message);
    let identity_b64 = Base64::encode_string(identity);

    lit_bls_wasm::encrypt(key_hex, &message_b64, &identity_b64)
        .map_err(|e| LitSdkError::Crypto(e.to_string()))
}
