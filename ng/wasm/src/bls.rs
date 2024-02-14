use std::{
    array::TryFromSliceError,
    convert::{TryFrom, TryInto as _},
};

use blsful::{
    Bls12381G1Impl, Bls12381G2Impl, BlsSignatureImpl, InnerPointShareG1, InnerPointShareG2,
    PublicKey, Signature, SignatureSchemes, TimeCryptCiphertext,
};
use elliptic_curve::group::GroupEncoding;
use js_sys::Uint8Array;
use serde::Deserialize;
use serde_bytes::Bytes;
use tsify::Tsify;
use wasm_bindgen::prelude::*;

use crate::abi::{from_js, into_js, JsResult};

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
pub enum BlsVariant {
    Bls12381G1,
    Bls12381G2,
}

struct Bls<C>(C);

// TODO(cairomassimo): add missing `TryFrom` impls to `blsful` and remove ours once merged

pub trait TryFrom2<T>: Sized {
    type Error;

    fn try_from2(value: T) -> Result<Self, Self::Error>;
}

impl<'a> TryFrom2<&'a [u8]> for InnerPointShareG1 {
    type Error = TryFromSliceError;

    fn try_from2(bytes: &'a [u8]) -> Result<Self, Self::Error> {
        Ok(Self(bytes.try_into()?))
    }
}

impl<'a> TryFrom2<&'a [u8]> for InnerPointShareG2 {
    type Error = TryFromSliceError;

    fn try_from2(bytes: &'a [u8]) -> Result<Self, Self::Error> {
        Ok(Self(bytes.try_into()?))
    }
}

impl<C: BlsSignatureImpl> Bls<C>
where
    C::PublicKey: for<'a> TryFrom<&'a [u8]>,
    C::Signature: for<'a> TryFrom<&'a [u8]>,
    C::SignatureShare: for<'a> TryFrom2<&'a [u8]>,
{
    pub fn combine(signature_shares: Vec<Uint8Array>) -> JsResult<Uint8Array> {
        let signature_shares = signature_shares
            .into_iter()
            .map(Self::signature_share_from_js)
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
        let public_key = Self::public_key_from_js(public_key)?;
        let signature = Self::signature_from_js(signature)?;
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
        let encryption_key = Self::public_key_from_js(encryption_key)?;
        let encryption_key = PublicKey::<C>(encryption_key);

        let message = from_js::<Vec<u8>>(message)?;
        let identity = from_js::<Vec<u8>>(identity)?;

        let ciphertext = encryption_key.encrypt_time_lock(
            SignatureSchemes::ProofOfPossession,
            message,
            identity,
        )?;
        let ciphertext = serde_bare::to_vec(&ciphertext)?;
        let ciphertext = into_js(Bytes::new(&ciphertext))?;

        Ok(ciphertext)
    }

    pub fn decrypt(ciphertext: Uint8Array, decryption_key: Uint8Array) -> JsResult<Uint8Array> {
        let decryption_key = Self::signature_from_js(decryption_key)?;

        let ciphertext = from_js::<Vec<u8>>(ciphertext)?;
        let ciphertext = serde_bare::from_slice::<TimeCryptCiphertext<C>>(&ciphertext)?;

        let message = ciphertext.decrypt(&Signature::ProofOfPossession(decryption_key));
        let message =
            Option::<Vec<u8>>::from(message).ok_or_else(|| JsError::new("decryption failed"))?;
        let message = into_js(Bytes::new(&message))?;

        Ok(message)
    }

    fn public_key_from_js(k: Uint8Array) -> JsResult<C::PublicKey> {
        let k = from_js::<Vec<u8>>(k)?;
        let k = C::PublicKey::try_from(&k);
        let k = k
            .ok()
            .ok_or_else(|| JsError::new("cannot deserialize public key"))?;
        Ok(k)
    }

    fn signature_from_js(s: Uint8Array) -> JsResult<C::Signature> {
        let s = from_js::<Vec<u8>>(s)?;
        let s = C::Signature::try_from(&s);
        let s = s
            .ok()
            .ok_or_else(|| JsError::new("cannot deserialize signature"))?;
        Ok(s)
    }

    fn signature_share_from_js(s: Uint8Array) -> JsResult<C::SignatureShare> {
        let s = from_js::<Vec<u8>>(s)?;
        let s = C::SignatureShare::try_from2(&s);
        let s = s
            .ok()
            .ok_or_else(|| JsError::new("cannot deserialize signature share"))?;
        Ok(s)
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
