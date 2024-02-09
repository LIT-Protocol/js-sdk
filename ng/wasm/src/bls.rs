use std::convert::TryInto as _;

use bls12_381_plus::{G1Projective, G2Projective};
use blsful::{
    Bls12381G1Impl, Bls12381G2Impl, BlsSignatureImpl, InnerPointShareG1, InnerPointShareG2,
    PublicKey, Signature, SignatureSchemes, TimeCryptCiphertext,
};
use elliptic_curve::group::GroupEncoding;
use js_sys::Uint8Array;
use serde_bytes::Bytes;
use wasm_bindgen::prelude::*;

use crate::abi::{from_js, into_js, JsResult};

struct Bls<C>(C);

// We have to create this trait because G1/G2 implementations do not use a common trait for all the methods we need.
// TODO(cairomassimo): can we fix blsful and/or bls12_381_plus so that they do?

trait FromBytesRepr
where
    Self: Sized,
{
    fn try_from_bytes(bytes: &[u8]) -> JsResult<Self>;

    fn from_js(x: Uint8Array) -> JsResult<Self> {
        let x = from_js::<Vec<u8>>(x)?;
        let x = Self::try_from_bytes(&x)?;
        Ok(x)
    }
}

impl FromBytesRepr for InnerPointShareG1 {
    fn try_from_bytes(bytes: &[u8]) -> JsResult<Self> {
        let bytes = bytes
            .try_into()
            .map_err(|_| JsError::new("cannot deserialize"))?;
        Ok(Self(bytes))
    }
}

impl FromBytesRepr for InnerPointShareG2 {
    fn try_from_bytes(bytes: &[u8]) -> JsResult<Self> {
        let bytes = bytes
            .try_into()
            .map_err(|_| JsError::new("cannot deserialize"))?;
        Ok(Self(bytes))
    }
}

impl FromBytesRepr for G1Projective {
    fn try_from_bytes(bytes: &[u8]) -> JsResult<Self> {
        let x = bytes
            .try_into()
            .ok()
            .ok_or_else(|| JsError::new("cannot deserialize"))?;
        let x = Self::from_compressed(&x);
        let x = Option::from(x).ok_or_else(|| JsError::new("cannot deserialize"))?;
        Ok(x)
    }
}

impl FromBytesRepr for G2Projective {
    fn try_from_bytes(bytes: &[u8]) -> JsResult<Self> {
        let x = bytes
            .try_into()
            .ok()
            .ok_or_else(|| JsError::new("cannot deserialize"))?;
        let x = Self::from_compressed(&x);
        let x = Option::from(x).ok_or_else(|| JsError::new("cannot deserialize"))?;
        Ok(x)
    }
}

impl<C: BlsSignatureImpl> Bls<C>
where
    C::PublicKey: FromBytesRepr,
    C::Signature: FromBytesRepr,
    C::SignatureShare: FromBytesRepr,
{
    pub fn combine(signature_shares: Vec<Uint8Array>) -> JsResult<Uint8Array> {
        let signature_shares = signature_shares
            .into_iter()
            .map(|s| {
                let s = from_js::<Vec<u8>>(s)?;
                let s = C::SignatureShare::try_from_bytes(&s)?;

                Ok(s)
            })
            .collect::<JsResult<Vec<_>>>()?;

        let signature = C::core_combine_signature_shares(&signature_shares)?;
        let signature = into_js(Bytes::new(signature.to_bytes().as_ref()))?;

        Ok(signature)
    }

    pub fn verify(
        public_key: Uint8Array,
        message: Uint8Array,
        signature: Uint8Array,
    ) -> JsResult<()> {
        let public_key = C::PublicKey::from_js(public_key)?;
        let signature = C::Signature::from_js(signature)?;
        let message = from_js::<Vec<u8>>(message)?;

        let signature = Signature::<C>::ProofOfPossession(signature);

        signature.verify(&PublicKey(public_key), message)?;

        Ok(())
    }

    pub fn encrypt(
        encryption_key: Uint8Array,
        message: Uint8Array,
        identity: Uint8Array,
    ) -> JsResult<Uint8Array> {
        let encryption_key = C::PublicKey::from_js(encryption_key)?;
        let message = from_js::<Vec<u8>>(message)?;
        let identity = from_js::<Vec<u8>>(identity)?;

        let ciphertext = PublicKey::<C>(encryption_key).encrypt_time_lock(
            SignatureSchemes::ProofOfPossession,
            message,
            identity,
        )?;
        let ciphertext = serde_bare::to_vec(&ciphertext)?;
        let ciphertext = into_js(&ciphertext)?;

        Ok(ciphertext)
    }

    pub fn decrypt(ciphertext: Uint8Array, decryption_key: Uint8Array) -> JsResult<Uint8Array> {
        let decryption_key = C::Signature::from_js(decryption_key)?;
        let ciphertext = from_js::<Vec<u8>>(ciphertext)?;
        let ciphertext = serde_bare::from_slice::<TimeCryptCiphertext<C>>(&ciphertext)?;

        let message = ciphertext.decrypt(&Signature::ProofOfPossession(decryption_key));
        let message =
            Option::<Vec<u8>>::from(message).ok_or_else(|| JsError::new("decryption failed"))?;
        let message = into_js(Bytes::new(&message))?;

        Ok(message)
    }
}

#[wasm_bindgen(js_name = "blsG1Combine")]
pub fn bls_g1_combine(signature_shares: Vec<Uint8Array>) -> JsResult<Uint8Array> {
    Bls::<Bls12381G1Impl>::combine(signature_shares)
}

#[wasm_bindgen(js_name = "blsG2Combine")]
pub fn bls_g2_combine(signature_shares: Vec<Uint8Array>) -> JsResult<Uint8Array> {
    Bls::<Bls12381G2Impl>::combine(signature_shares)
}

#[wasm_bindgen(js_name = "blsG1Verify")]
pub fn bls_g1_verify(
    public_key: Uint8Array,
    message: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    Bls::<Bls12381G1Impl>::verify(public_key, message, signature)
}

#[wasm_bindgen(js_name = "blsG2Verify")]
pub fn bls_g2_verify(
    public_key: Uint8Array,
    message: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    Bls::<Bls12381G2Impl>::verify(public_key, message, signature)
}

#[wasm_bindgen(js_name = "blsG1Encrypt")]
pub fn bls_g1_encrypt(
    encryption_key: Uint8Array,
    message: Uint8Array,
    identity: Uint8Array,
) -> JsResult<Uint8Array> {
    Bls::<Bls12381G1Impl>::encrypt(encryption_key, message, identity)
}

#[wasm_bindgen(js_name = "blsG2Encrypt")]
pub fn bls_g2_encrypt(
    encryption_key: Uint8Array,
    message: Uint8Array,
    identity: Uint8Array,
) -> JsResult<Uint8Array> {
    Bls::<Bls12381G2Impl>::encrypt(encryption_key, message, identity)
}

#[wasm_bindgen(js_name = "blsG1Decrypt")]
pub fn bls_g1_decrypt(ciphertext: Uint8Array, decryption_key: Uint8Array) -> JsResult<Uint8Array> {
    Bls::<Bls12381G1Impl>::decrypt(ciphertext, decryption_key)
}

#[wasm_bindgen(js_name = "blsG2Decrypt")]
pub fn bls_g2_decrypt(ciphertext: Uint8Array, decryption_key: Uint8Array) -> JsResult<Uint8Array> {
    Bls::<Bls12381G2Impl>::decrypt(ciphertext, decryption_key)
}
