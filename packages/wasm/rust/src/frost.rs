use std::convert::TryFrom;

use js_sys::Uint8Array;
use lit_frost::{
    Identifier,
    Scheme,
    Signature,
    SignatureShare,
    SigningCommitments,
    VerifyingKey,
    VerifyingShare,
};

use serde::{ Deserialize, Serialize };
use serde_bytes::Bytes;
use tsify::Tsify;
use wasm_bindgen::{prelude::*, JsError};

use crate::abi::{ from_js, into_js, JsResult };

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "[FrostVariant, Uint8Array]")]
    pub type FrostSignature;
}

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

struct Frost();

trait FromSchemeAndBytes {
    fn from_scheme_and_bytes(scheme: Scheme, bytes: Vec<u8>) -> Self;
}

impl FromSchemeAndBytes for SigningCommitments {
    fn from_scheme_and_bytes(scheme: Scheme, bytes: Vec<u8>) -> Self {
        SigningCommitments {
            scheme: scheme.clone(),
            value: bytes,
        }
    }
}

impl FromSchemeAndBytes for SignatureShare {
    fn from_scheme_and_bytes(scheme: Scheme, bytes: Vec<u8>) -> Self {
        SignatureShare {
            scheme: scheme.clone(),
            value: bytes,
        }
    }
}

impl FromSchemeAndBytes for VerifyingKey {
    fn from_scheme_and_bytes(scheme: Scheme, bytes: Vec<u8>) -> Self {
        VerifyingKey {
            scheme: scheme.clone(),
            value: bytes,
        }
    }
}

impl FromSchemeAndBytes for VerifyingShare {
    fn from_scheme_and_bytes(scheme: Scheme, bytes: Vec<u8>) -> Self {
        VerifyingShare {
            scheme: scheme.clone(),
            value: bytes,
        }
    }
}

impl Frost {
    pub fn aggregate(
        variant: FrostVariant,
        message: Uint8Array,
        identifiers: Vec<Uint8Array>,
        signing_commitments: Vec<Uint8Array>,
        signature_shares: Vec<Uint8Array>,
        signer_pubkeys: Vec<Uint8Array>,
        verifying_key: Uint8Array,
    ) -> JsResult<FrostSignature> {
        let scheme = Scheme::from(variant);
        let message = from_js::<Vec<u8>>(message)?;
        let identifiers = Self::parse_with_scheme::<Identifier>(scheme.clone(), &identifiers);
        let identified_signing_commitments = Self::parse_identified_vec::<SigningCommitments>(scheme, &identifiers, signing_commitments)?;
        let identified_signature_shares = Self::parse_identified_vec::<SignatureShare>(scheme, &identifiers, signature_shares)?;
        let identified_signer_pubkeys = Self::parse_identified_vec::<VerifyingShare>(scheme, &identifiers, signer_pubkeys)?;
        let verifying_key = VerifyingKey::from_scheme_and_bytes(scheme, from_js::<Vec<u8>>(verifying_key)?);

        let signature = scheme.aggregate(
            &message,
            &identified_signing_commitments,
            &identified_signature_shares,
            &identified_signer_pubkeys,
            &verifying_key,
        )?;

        Self::signature_into_js(&scheme, &signature)
    }

    pub fn verify(
        message: Uint8Array,
        verifying_key: Uint8Array,
        signature: FrostSignature,
    ) -> JsResult<()> {
        let message = from_js::<Vec<u8>>(message)?;
        let signature = Self::signature_from_js(signature)?;
        let verifying_key = VerifyingKey::from_scheme_and_bytes(signature.scheme.clone(), from_js::<Vec<u8>>(verifying_key)?);

        let result = signature.scheme.verify(&message, &verifying_key, &signature);

        match result {
            Ok(_) => Ok(()),
            Err(e) => Err(JsError::new(&format!("Frost verification failed: {}", e))),
        }
    }

    fn parse_with_scheme<T>(scheme: Scheme, vec: &Vec<Uint8Array>) -> Vec<T>
    where
        T: From<(Scheme, Vec<u8>)>
    {
        vec
            .into_iter()
            .map(from_js::<Vec<u8>>)
            .map(| e | T::from((scheme, e.unwrap())))
            .collect::<Vec<T>>()
    }

    fn parse_identified_vec<T: FromSchemeAndBytes>(scheme: Scheme, identifiers: &Vec<Identifier>, vec: Vec<Uint8Array>) -> Result<Vec<(Identifier, T)>, JsError> {
        if identifiers.len() != vec.len() {
            return Err(JsError::new("Identifiers and related vectors must have equal length"));
        }

        let merged_vector = identifiers
            .iter()
            .zip(vec.iter().map(from_js::<Vec<u8>>))
            .map(|(id, val)| (id.clone(), T::from_scheme_and_bytes(scheme.clone(), val.unwrap())))
            .collect();
        Ok(merged_vector)
    }

    fn signature_from_js(signature: FrostSignature) -> JsResult<Signature> {
        let (variant, signature_hex): (FrostVariant, Vec<u8>) = from_js(signature)?;
        let scheme = Scheme::from(variant);

        Ok(Signature {
            scheme,
            value: signature_hex,
        })
    }

    fn signature_into_js(scheme: &Scheme, signature: &Signature) -> JsResult<FrostSignature> {
        Ok(FrostSignature {
            obj: into_js(&(scheme, Bytes::new(&signature.value)))?,
        })
    }
}

/// Combine FROST signatures shares
#[wasm_bindgen(js_name = "frostAggregate")]
pub fn frost_aggregate(
    variant: FrostVariant,
    message: Uint8Array,
    identifiers: Vec<Uint8Array>,
    signing_commitments: Vec<Uint8Array>,
    signature_shares: Vec<Uint8Array>,
    signer_pubkeys: Vec<Uint8Array>,
    verifying_key: Uint8Array,
) -> JsResult<FrostSignature> {
    Frost::aggregate(
        variant,
        message,
        identifiers,
        signing_commitments,
        signature_shares,
        signer_pubkeys,
        verifying_key,
    )
}

#[wasm_bindgen(js_name = "frostVerify")]
pub fn frost_verify(
    message: Uint8Array,
    verifying_key: Uint8Array,
    signature: FrostSignature,
) -> JsResult<()> {
    Frost::verify(
        message,
        verifying_key,
        signature,
    )
}
