use std::convert::TryFrom;

use blsful::{
    Bls12381G1Impl, Bls12381G2Impl, BlsSignatureImpl, PublicKey, Signature, SignatureSchemes,
    TimeCryptCiphertext,
};
use elliptic_curve::group::GroupEncoding;
use js_sys::Uint8Array;
use serde::Deserialize;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::abi::{from_js, from_uint8array, into_uint8array, JsResult};

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
    C::SignatureShare: TryFrom<Vec<u8>>,
{
    pub fn combine(signature_shares: Vec<Uint8Array>) -> JsResult<Uint8Array> {
        let signature_shares = signature_shares
            .into_iter()
            .map(from_uint8array)
            .collect::<JsResult<Vec<_>>>()?;

        let signature = C::core_combine_signature_shares(&signature_shares)?;

        into_uint8array(signature.to_bytes())
    }

    pub fn verify(
        public_key: Uint8Array,
        message: Uint8Array,
        signature: Uint8Array,
    ) -> JsResult<()> {
        let public_key = from_uint8array(public_key)?;
        let signature = from_uint8array(signature)?;
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
        let encryption_key = from_uint8array(encryption_key)?;
        let encryption_key = PublicKey::<C>(encryption_key);

        let message = from_js::<Vec<u8>>(message)?;
        let identity = from_js::<Vec<u8>>(identity)?;

        let ciphertext = encryption_key.encrypt_time_lock(
            SignatureSchemes::ProofOfPossession,
            message,
            identity,
        )?;
        let ciphertext = serde_bare::to_vec(&ciphertext)?;

        into_uint8array(ciphertext)
    }

    pub fn decrypt(ciphertext: Uint8Array, decryption_key: Uint8Array) -> JsResult<Uint8Array> {
        let decryption_key = from_uint8array(decryption_key)?;

        let ciphertext = from_js::<Vec<u8>>(ciphertext)?;
        let ciphertext = serde_bare::from_slice::<TimeCryptCiphertext<C>>(&ciphertext)?;

        let message = ciphertext.decrypt(&Signature::ProofOfPossession(decryption_key));
        let message =
            Option::<Vec<u8>>::from(message).ok_or_else(|| JsError::new("decryption failed"))?;

        into_uint8array(message)
    }
}

#[wasm_bindgen(js_name = "blsCombine")]
pub fn bls_combine(variant: BlsVariant, signature_shares: Vec<Uint8Array>) -> JsResult<Uint8Array> {
    match variant {
        BlsVariant::Bls12381G1 => Bls::<Bls12381G1Impl>::combine(signature_shares),
        BlsVariant::Bls12381G2 => Bls::<Bls12381G2Impl>::combine(signature_shares),
    }
}

#[wasm_bindgen(js_name = "blsVerify")]
pub fn bls_verify(
    variant: BlsVariant,
    public_key: Uint8Array,
    message: Uint8Array,
    signature: Uint8Array,
) -> JsResult<()> {
    match variant {
        BlsVariant::Bls12381G1 => Bls::<Bls12381G1Impl>::verify(public_key, message, signature),
        BlsVariant::Bls12381G2 => Bls::<Bls12381G2Impl>::verify(public_key, message, signature),
    }
}

#[wasm_bindgen(js_name = "blsEncrypt")]
pub fn bls_encrypt(
    variant: BlsVariant,
    encryption_key: Uint8Array,
    message: Uint8Array,
    identity: Uint8Array,
) -> JsResult<Uint8Array> {
    match variant {
        BlsVariant::Bls12381G1 => Bls::<Bls12381G1Impl>::encrypt(encryption_key, message, identity),
        BlsVariant::Bls12381G2 => Bls::<Bls12381G2Impl>::encrypt(encryption_key, message, identity),
    }
}

#[wasm_bindgen(js_name = "blsDecrypt")]
pub fn bls_decrypt(
    variant: BlsVariant,
    ciphertext: Uint8Array,
    decryption_key: Uint8Array,
) -> JsResult<Uint8Array> {
    match variant {
        BlsVariant::Bls12381G1 => Bls::<Bls12381G1Impl>::decrypt(ciphertext, decryption_key),
        BlsVariant::Bls12381G2 => Bls::<Bls12381G2Impl>::decrypt(ciphertext, decryption_key),
    }
}
