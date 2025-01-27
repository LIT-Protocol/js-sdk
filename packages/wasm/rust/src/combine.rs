use ecdsa::{
    hazmat::{DigestPrimitive, VerifyPrimitive},
    signature::hazmat::PrehashVerifier,
    RecoveryId, Signature,
};
use std::ops::Add;

use crate::abi::JsResult;
use elliptic_curve::{
    generic_array::ArrayLength,
    group::{Curve as _, GroupEncoding},
    ops::Reduce,
    pkcs8::AssociatedOid,
    point::{AffineCoordinates, DecompressPoint, PointCompression},
    sec1::{EncodedPoint, FromEncodedPoint, ModulusSize, ToEncodedPoint},
    Curve, CurveArithmetic, Field, FieldBytesSize, PrimeCurve, ScalarPrimitive,
};
use elliptic_curve_tools::{group, prime_field};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;

/// Attempts to combine the signature shares.
/// If the resulting combined signature is valid, returns the combined signature.
/// Otherwise, returns an error.
///
/// It does not distinguish between different types of signatures (e.g., ECDSA, BLS, etc.)
/// and will return the first valid signature it finds in the following order
///
/// 1. Frost
/// 2. BLS
/// 3. ECDSA
#[wasm_bindgen(js_name = "combineAndVerify")]
pub fn combine_and_verify(signature_shares: Vec<String>) -> JsResult<String> {
    let mut de_shares = Vec::with_capacity(signature_shares.len());
    for str_share in &signature_shares {
        let share = serde_json::from_str(str_share)
            .map_err(|_| JsError::new("invalid signature share format"))?;
        de_shares.push(share);
    }
    let signature = combine_and_verify_signature_shares(&de_shares)?;
    serde_json::to_string(&signature).map_err(|_| JsError::new("signature"))
}

#[derive(Serialize)]
pub struct SignedDataOutput {
    signature: String,
    verifying_key: String,
    signed_data: String,
    recovery_id: Option<u8>,
}

#[derive(Deserialize)]
enum SignableOutput {
    EcdsaSignedMessageShare(EcdsaSignedMessageShare),
    FrostSignedMessageShare(FrostSignedMessageShare),
    BlsSignedMessageShare(BlsSignedMessageShare),
}

#[derive(Clone, Deserialize)]
struct EcdsaSignedMessageShare {
    digest: String,
    result: String,
    share_id: String,
    peer_id: String,
    signature_share: String,
    big_r: String,
    compressed_public_key: String,
    public_key: String,
    sig_type: String,
}

#[derive(Deserialize)]
struct FrostSignedMessageShare {
    message: String,
    result: String,
    share_id: String,
    peer_id: String,
    signature_share: String,
    signing_commitments: String,
    verifying_share: String,
    public_key: String,
    sig_type: String,
}

#[derive(Deserialize)]
struct BlsSignedMessageShare {
    message: String,
    result: String,
    peer_id: String,
    share_id: String,
    signature_share: String,
    verifying_share: String,
    public_key: String,
    sig_type: String,
}

/// A signature share
#[derive(Deserialize)]
struct SignatureShare<C>
where
    C: PrimeCurve + CurveArithmetic + DigestPrimitive,
    C::ProjectivePoint: GroupEncoding,
    <FieldBytesSize<C> as Add>::Output: ArrayLength<u8>,
{
    /// The signature `r` component
    #[serde(with = "group")]
    r: C::ProjectivePoint,
    /// The signature `s` component
    #[serde(with = "prime_field")]
    s: C::Scalar,
}

impl<C> SignatureShare<C>
where
    C: PrimeCurve + CurveArithmetic + DigestPrimitive,
    C::ProjectivePoint: GroupEncoding,
    <FieldBytesSize<C> as Add>::Output: ArrayLength<u8>,
{
    /// Combine the signature shares into a signature
    /// Verify should be called after wards to check everything
    pub fn combine_into_signature(shares: &[SignatureShare<C>]) -> JsResult<FullSignature<C>> {
        // Ensure non-empty shares
        if shares.is_empty() {
            return Err(JsError::new("insufficient signature shares"));
        }
        // Check that all signature shares have the same r
        if shares[1..].iter().any(|s| s.r != shares[0].r) {
            return Err(JsError::new("invalid share found"));
        }
        let sig_s = shares.iter().fold(C::Scalar::ZERO, |acc, s| acc + s.s);

        Ok(FullSignature {
            r: shares[0].r,
            s: sig_s,
        })
    }
}

#[derive(Serialize)]
struct FullSignature<C>
where
    C: PrimeCurve + CurveArithmetic + DigestPrimitive,
    C::ProjectivePoint: GroupEncoding,
    <FieldBytesSize<C> as Add>::Output: ArrayLength<u8>,
{
    /// The signature `r` component
    #[serde(with = "group")]
    r: C::ProjectivePoint,
    /// The signature `s` component
    #[serde(with = "prime_field")]
    s: C::Scalar,
}

impl<C> TryFrom<FullSignature<C>> for Signature<C>
where
    C: PrimeCurve + CurveArithmetic + DigestPrimitive,
    C::ProjectivePoint: GroupEncoding,
    <FieldBytesSize<C> as Add>::Output: ArrayLength<u8>,
{
    type Error = JsError;

    fn try_from(value: FullSignature<C>) -> JsResult<Self> {
        let r = x_coordinate::<C>(&value.r);
        let r = <C::Scalar as Into<ScalarPrimitive<C>>>::into(r);
        let s = <C::Scalar as Into<ScalarPrimitive<C>>>::into(value.s);
        // from_scalars checks that both r and s are not zero
        let signature = Signature::<C>::from_scalars(r.to_bytes(), s.to_bytes())
            .map_err(|_| JsError::new("invalid signature result"))?;
        match signature.normalize_s() {
            Some(normalized) => Ok(normalized),
            None => Ok(signature),
        }
    }
}

fn x_coordinate<C>(point: &C::ProjectivePoint) -> C::Scalar
where
    C: PrimeCurve + CurveArithmetic,
{
    let pt = point.to_affine();
    <C::Scalar as Reduce<<C as Curve>::Uint>>::reduce_bytes(&pt.x())
}

/// Attempts to combine the signature shares.
/// If the resulting combined signature is valid, returns the combined signature.
/// Otherwise, returns an error.
///
/// It does not distinguish between different types of signatures (e.g., ECDSA, BLS, etc.)
/// and will return the first valid signature it finds in the following order
///
/// 1. Frost
/// 2. BLS
/// 3. ECDSA
fn combine_and_verify_signature_shares(
    signature_shares: &[SignableOutput],
) -> JsResult<SignedDataOutput> {
    let mut bls_signing_package = Vec::with_capacity(signature_shares.len());
    let mut frost_signing_package = Vec::with_capacity(signature_shares.len());
    let mut ecdsa_signing_package =
        Vec::<EcdsaSignedMessageShare>::with_capacity(signature_shares.len());

    for signature_share in signature_shares {
        match signature_share {
            SignableOutput::EcdsaSignedMessageShare(ecdsa_msg_share) => {
                if ecdsa_msg_share.result == "success" {
                    ecdsa_signing_package.push(ecdsa_msg_share.clone());
                }
            }
            SignableOutput::BlsSignedMessageShare(bls_msg_share) => {
                if bls_msg_share.result == "success" {
                    let identifier: blsful::inner_types::Scalar =
                        serde_json::from_str(&bls_msg_share.share_id)
                            .map_err(|_| JsError::new("bls share id"))?;
                    let signature_share: blsful::SignatureShare<blsful::Bls12381G2Impl> =
                        serde_json::from_str(&bls_msg_share.signature_share)
                            .map_err(|_| JsError::new("bls signature share"))?;
                    let verifying_share: blsful::PublicKeyShare<blsful::Bls12381G2Impl> =
                        serde_json::from_str(&bls_msg_share.verifying_share)
                            .map_err(|_| JsError::new("bls verifying share"))?;
                    let public_key: blsful::PublicKey<blsful::Bls12381G2Impl> =
                        serde_json::from_str(&bls_msg_share.public_key)
                            .map_err(|_| JsError::new("bls public key"))?;
                    let message = hex::decode(&bls_msg_share.message)
                        .map_err(|_| JsError::new("bls message"))?;
                    bls_signing_package.push((
                        identifier,
                        signature_share,
                        verifying_share,
                        public_key,
                        message,
                        bls_msg_share.peer_id.clone(),
                    ));
                }
            }
            SignableOutput::FrostSignedMessageShare(frost_msg_share) => {
                if frost_msg_share.result == "success" {
                    let identifier: lit_frost::Identifier =
                        serde_json::from_str(&frost_msg_share.share_id)
                            .map_err(|_| JsError::new("frost identifier"))?;
                    let signature_share: lit_frost::SignatureShare =
                        serde_json::from_str(&frost_msg_share.signature_share)
                            .map_err(|_| JsError::new("frost signature share"))?;
                    let verifying_share: lit_frost::VerifyingShare =
                        serde_json::from_str(&frost_msg_share.verifying_share)
                            .map_err(|_| JsError::new("frost verifying share"))?;
                    let public_key: lit_frost::VerifyingKey =
                        serde_json::from_str(&frost_msg_share.public_key)
                            .map_err(|_| JsError::new("frost public key"))?;
                    let signing_commitments: lit_frost::SigningCommitments =
                        serde_json::from_str(&frost_msg_share.signing_commitments)
                            .map_err(|_| JsError::new("frost signing commitments"))?;
                    let scheme = match frost_msg_share.sig_type.as_str() {
                        "SchnorrEd25519Sha512" => lit_frost::Scheme::Ed25519Sha512,
                        "SchnorrK256Sha256" => lit_frost::Scheme::K256Sha256,
                        "SchnorrP256Sha256" => lit_frost::Scheme::P256Sha256,
                        "SchnorrP384Sha384" => lit_frost::Scheme::P384Sha384,
                        "SchnorrRistretto25519Sha512" => lit_frost::Scheme::Ristretto25519Sha512,
                        "SchnorrEd448Shake256" => lit_frost::Scheme::Ed448Shake256,
                        "SchnorrRedJubjubBlake2b512" => lit_frost::Scheme::RedJubjubBlake2b512,
                        "SchnorrK256Taproot" => lit_frost::Scheme::K256Taproot,
                        "SchnorrRedDecaf377Blake2b512" => lit_frost::Scheme::RedDecaf377Blake2b512,
                        "SchnorrkelSubstrate" => lit_frost::Scheme::SchnorrkelSubstrate,
                        _ => return Err(JsError::new("frost signing scheme")),
                    };
                    let message = hex::decode(&frost_msg_share.message)
                        .map_err(|_| JsError::new("frost message"))?;
                    frost_signing_package.push((
                        identifier,
                        signature_share,
                        verifying_share,
                        public_key,
                        signing_commitments,
                        scheme,
                        message,
                        frost_msg_share.peer_id.clone(),
                    ));
                }
            }
        }
    }

    if frost_signing_package.len() > 1 {
        let first_entry = &frost_signing_package[0];
        let mut signature_shares = Vec::with_capacity(frost_signing_package.len());
        let mut verifying_shares = Vec::with_capacity(frost_signing_package.len());
        let mut signing_commitments = Vec::with_capacity(frost_signing_package.len());

        signature_shares.push((first_entry.0.clone(), first_entry.1.clone()));
        verifying_shares.push((first_entry.0.clone(), first_entry.2.clone()));
        signing_commitments.push((first_entry.0.clone(), first_entry.4.clone()));

        for entry in &frost_signing_package[1..] {
            debug_assert_eq!(
                first_entry.3, entry.3,
                "frost public keys do not match: {}, {}",
                first_entry.2, entry.2
            );
            debug_assert_eq!(
                first_entry.5, entry.5,
                "frost signing schemes do not match: {}, {}",
                first_entry.4, entry.4
            );
            debug_assert_eq!(
                first_entry.6,
                entry.6,
                "frost messages do not match: {}, {}",
                hex::encode(&first_entry.6),
                hex::encode(&entry.6)
            );
            signature_shares.push((entry.0.clone(), entry.1.clone()));
            verifying_shares.push((entry.0.clone(), entry.2.clone()));
            signing_commitments.push((entry.0.clone(), entry.4.clone()));
        }
        let res = first_entry.5.aggregate(
            &first_entry.6,
            &signing_commitments,
            &signature_shares,
            &verifying_shares,
            &first_entry.3,
        );
        if res.is_err() {
            let e = res.expect_err("frost signature from shares is invalid");
            match e {
                lit_frost::Error::Cheaters(cheaters) => {
                    let mut cheater_peer_ids = Vec::with_capacity(cheaters.len());
                    for cheater in cheaters {
                        let found = frost_signing_package
                            .iter()
                            .find(|p| p.0 == cheater)
                            .map(|cheater| cheater.7.clone());
                        if let Some(peer_id) = found {
                            cheater_peer_ids.push(peer_id);
                        }
                    }
                    return Err(JsError::new(&format!(
                        "frost signature from shares is invalid. Invalid share peer ids: {}",
                        cheater_peer_ids.join(", ")
                    )));
                }
                _ => {
                    return Err(JsError::new("frost signature from shares is invalid"));
                }
            }
        } else {
            return Ok(SignedDataOutput {
                signature: serde_json::to_string(
                    &res.expect("frost signature from shares is valid"),
                )
                .map_err(|_| JsError::new("frost signature"))?,
                verifying_key: serde_json::to_string(&first_entry.3)
                    .map_err(|_| JsError::new("frost verifying key"))?,
                signed_data: hex::encode(&first_entry.6),
                recovery_id: None,
            });
        }
    }
    if bls_signing_package.len() > 1 {
        let first_entry = &bls_signing_package[0];
        let mut signature_shares = Vec::with_capacity(bls_signing_package.len());
        let mut verifying_shares = Vec::with_capacity(bls_signing_package.len());

        signature_shares.push(first_entry.1);
        verifying_shares.push((first_entry.0, first_entry.5.clone(), first_entry.2));
        for entry in &bls_signing_package[1..] {
            debug_assert_eq!(
                first_entry.3, entry.3,
                "bls public keys do not match: {}, {}",
                first_entry.2, entry.2
            );
            debug_assert_eq!(
                first_entry.4,
                entry.4,
                "bls messages do not match: {}, {}",
                hex::encode(&first_entry.4),
                hex::encode(&entry.4)
            );
            signature_shares.push(entry.1);
            verifying_shares.push((entry.0, entry.5.clone(), entry.2));
        }
        let public_key = first_entry.3;
        let signature = blsful::Signature::<blsful::Bls12381G2Impl>::from_shares(&signature_shares)
            .expect("bls signature from shares");
        if signature.verify(&public_key, &first_entry.4).is_err() {
            // Identify which shares are invalid
            let mut invalid_shares = Vec::with_capacity(signature_shares.len());
            for (share, (_identifier, peer_id, verifier)) in
                signature_shares.iter().zip(verifying_shares.iter())
            {
                if share.verify(verifier, &first_entry.4).is_err() {
                    invalid_shares.push(peer_id.clone());
                }
            }
            return Err(JsError::new(&format!(
                "bls signature from shares is invalid. Invalid share peer ids: {}",
                invalid_shares.join(", ")
            )));
        }
        return Ok(SignedDataOutput {
            signature: serde_json::to_string(&signature)
                .map_err(|_| JsError::new("bls signature"))?,
            verifying_key: serde_json::to_string(&public_key)
                .map_err(|_| JsError::new("bls verifying key"))?,
            signed_data: hex::encode(&first_entry.4),
            recovery_id: None,
        });
    }
    if ecdsa_signing_package.len() > 1 {
        match ecdsa_signing_package[0].sig_type.as_str() {
            "EcdsaK256Sha256" => {
                return verify_ecdsa_signing_package::<k256::Secp256k1>(&ecdsa_signing_package);
            }
            "EcdsaP256Sha256" => {
                return verify_ecdsa_signing_package::<p256::NistP256>(&ecdsa_signing_package);
            }
            "EcdsaP384Sha384" => {
                return verify_ecdsa_signing_package::<p384::NistP384>(&ecdsa_signing_package);
            }
            _ => {}
        }
    }

    Err(JsError::new("no valid signature shares found"))
}

fn verify_ecdsa_signing_package<C>(shares: &[EcdsaSignedMessageShare]) -> JsResult<SignedDataOutput>
where
    C: PrimeCurve + CurveArithmetic + DigestPrimitive + AssociatedOid + PointCompression,
    C::ProjectivePoint: GroupEncoding + CompressedHex,
    C::AffinePoint: DeserializeOwned
        + FromEncodedPoint<C>
        + ToEncodedPoint<C>
        + VerifyPrimitive<C>
        + DecompressPoint<C>,
    C::Scalar: DeserializeOwned,
    <FieldBytesSize<C> as Add>::Output: ArrayLength<u8>,
    <C as Curve>::FieldBytesSize: ModulusSize,
{
    let mut sig_shares = Vec::<SignatureShare<C>>::with_capacity(shares.len());
    let first_share = &shares[0];
    sig_shares.push(SignatureShare {
        r: C::ProjectivePoint::from(
            serde_json::from_str::<C::AffinePoint>(&first_share.big_r).expect("r"),
        ),
        s: serde_json::from_str(&first_share.signature_share).expect("s"),
    });
    for share in &shares[1..] {
        debug_assert_eq!(first_share.public_key, share.public_key);
        debug_assert_eq!(first_share.digest, share.digest);
        debug_assert_eq!(first_share.big_r, share.big_r);
        debug_assert_eq!(first_share.sig_type, share.sig_type);

        sig_shares.push(SignatureShare {
            r: C::ProjectivePoint::from(
                serde_json::from_str::<C::AffinePoint>(&share.big_r).expect("r"),
            ),
            s: serde_json::from_str(&share.signature_share).expect("s"),
        });
    }
    let public_key: String = serde_json::from_str(&first_share.public_key).expect("public key");
    let public_key = <C::ProjectivePoint as CompressedHex>::from_uncompressed_hex(&public_key)
        .expect("public key");
    let signature = SignatureShare::<C>::combine_into_signature(&sig_shares).expect("signature");

    let message = hex::decode(&first_share.digest).expect("message");
    let vk = ecdsa::VerifyingKey::<C>::from_affine(public_key.to_affine()).expect("verifying key");
    let signature: Signature<C> = signature.try_into().expect("signature");
    <ecdsa::VerifyingKey<C> as PrehashVerifier<Signature<C>>>::verify_prehash(
        &vk, &message, &signature,
    )
    .map_err(|_| JsError::new("ecdsa verification failed"))?;

    let digest_bytes = hex::decode(&shares[0].digest).map_err(|_| JsError::new("digest"))?;
    let rid = RecoveryId::trial_recovery_from_prehash(&vk, &digest_bytes, &signature)
        .map_err(|_| JsError::new("recovery id"))?;

    Ok(SignedDataOutput {
        signature: serde_json::to_string(&signature)
            .map_err(|_| JsError::new("ecdsa signature"))?,
        verifying_key: serde_json::to_string(&vk)
            .map_err(|_| JsError::new("ecdsa verifying key"))?,
        signed_data: shares[0].digest.clone(),
        recovery_id: Some(rid.to_byte()),
    })
}

trait CompressedHex: Sized {
    fn from_uncompressed_hex(hex: &str) -> Option<Self>;
}

impl CompressedHex for k256::ProjectivePoint {
    fn from_uncompressed_hex(hex: &str) -> Option<Self> {
        let bytes = hex::decode(hex).ok()?;
        let pt = EncodedPoint::<k256::Secp256k1>::from_bytes(bytes).ok()?;
        Option::from(Self::from_encoded_point(&pt))
    }
}

impl CompressedHex for p256::ProjectivePoint {
    fn from_uncompressed_hex(hex: &str) -> Option<Self> {
        let bytes = hex::decode(hex).ok()?;
        let pt = EncodedPoint::<p256::NistP256>::from_bytes(bytes).ok()?;
        Option::from(Self::from_encoded_point(&pt))
    }
}

impl CompressedHex for p384::ProjectivePoint {
    fn from_uncompressed_hex(hex: &str) -> Option<Self> {
        let bytes = hex::decode(hex).ok()?;
        let pt = EncodedPoint::<p384::NistP384>::from_bytes(bytes).ok()?;
        Option::from(Self::from_encoded_point(&pt))
    }
}
