use crate::abi::JsResult;
use crate::combine::{
    x_coordinate, BlsSignedMessageShare, EcdsaSignedMessageShare, FrostSignedMessageShare,
    SignableOutput,
};
use blsful::SignatureSchemes;
use ecdsa::hazmat::DigestPrimitive;
use elliptic_curve::group::Curve as _;
use elliptic_curve::ops::{Invert, Reduce};
use elliptic_curve::sec1::{ModulusSize, ToEncodedPoint};
use elliptic_curve::{Curve, CurveArithmetic, Field, Group, PrimeCurve};
use sha2::digest::{Digest, FixedOutput};
use std::collections::BTreeMap;
use std::num::NonZeroU16;
use vsss_rs::{
    shamir, DefaultShare, IdentifierPrimeField, ParticipantIdGeneratorType, ValuePrimeField,
};
use wasm_bindgen::prelude::wasm_bindgen;
use wasm_bindgen::JsError;

/// This will create shares for a given message using the specified signing scheme.
/// The keys will be generated on demand and returned
#[wasm_bindgen(js_name = "createShares")]
pub fn create_shares(
    message: String,
    signing_scheme: String,
    threshold: usize,
) -> JsResult<Vec<String>> {
    match signing_scheme.as_str() {
        "Bls12381" => create_bls_shares(message, signing_scheme, threshold),
        "EcdsaK256Sha256" => {
            create_ecdsa_shares::<k256::Secp256k1>(message, signing_scheme, threshold)
        }
        "EcdsaP256Sha256" => {
            create_ecdsa_shares::<p256::NistP256>(message, signing_scheme, threshold)
        }
        "EcdsaP384Sha384" => {
            create_ecdsa_shares::<p384::NistP384>(message, signing_scheme, threshold)
        }
        "SchnorrEd25519Sha512" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::Ed25519Sha512,
        ),
        "SchnorrK256Sha256" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::K256Sha256,
        ),
        "SchnorrP256Sha256" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::P256Sha256,
        ),
        "SchnorrP384Sha384" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::P384Sha384,
        ),
        "SchnorrRistretto25519Sha512" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::Ristretto25519Sha512,
        ),
        "SchnorrEd448Shake256" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::Ed448Shake256,
        ),
        "SchnorrRedJubjubBlake2b512" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::RedJubjubBlake2b512,
        ),
        "SchnorrK256Taproot" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::K256Taproot,
        ),
        "SchnorrRedDecaf377Blake2b512" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::RedDecaf377Blake2b512,
        ),
        "SchnorrkelSubstrate" => create_frost_shares(
            message,
            signing_scheme,
            threshold,
            lit_frost::Scheme::SchnorrkelSubstrate,
        ),
        "Bls12381G1ProofOfPossession" => create_bls_shares(message, signing_scheme, threshold),
        _ => Err(JsError::new("Invalid signing scheme")),
    }
}

fn create_bls_shares(
    message: String,
    signing_scheme: String,
    threshold: usize,
) -> JsResult<Vec<String>> {
    let sk = blsful::Bls12381G2::new_secret_key();
    let pk = sk.public_key();
    let public_key = serde_json::to_string(&pk)?;

    let shares = sk.split(threshold, threshold)?;
    let mut signature_shares = Vec::with_capacity(threshold);
    let hex_msg = hex::encode(message.as_bytes());
    for (i, share) in shares.iter().enumerate() {
        let verifying_share = share.public_key()?;
        let signature = share
            .sign(SignatureSchemes::ProofOfPossession, message.as_bytes())
            .map_err(|e| JsError::new(&format!("Error signing message: {:?}", e)))?;
        signature_shares.push(serde_json::to_string(
            &SignableOutput::BlsSignedMessageShare(BlsSignedMessageShare {
                message: hex_msg.clone(),
                result: "success".to_string(),
                peer_id: (i + 1).to_string(),
                share_id: serde_json::to_string(&share.0.identifier).unwrap(),
                signature_share: serde_json::to_string(&signature).unwrap(),
                verifying_share: serde_json::to_string(&verifying_share).unwrap(),
                public_key: public_key.clone(),
                sig_type: signing_scheme.clone(),
            }),
        )?);
    }
    Ok(signature_shares)
}

fn create_frost_shares(
    message: String,
    signing_scheme: String,
    threshold: usize,
    scheme: lit_frost::Scheme,
) -> JsResult<Vec<String>> {
    let signers = threshold as u16;
    let mut rng = rand::rngs::OsRng;
    let (secret_shares, vk) = scheme
        .generate_with_trusted_dealer(signers, signers, &mut rng)
        .map_err(|e| JsError::new(&format!("Error generating scheme: {:?}", e)))?;

    let verifying_key = serde_json::to_string(&vk)?;

    let mut signing_package = BTreeMap::new();
    let mut signing_commitments = Vec::with_capacity(threshold);

    for (id, secret_share) in &secret_shares {
        let res = scheme.signing_round1(&secret_share, &mut rng);
        let (nonces, commitments) = res.unwrap();
        signing_package.insert(id.clone(), (nonces, secret_share));
        signing_commitments.push((id.clone(), commitments));
    }

    let mut signature_shares = Vec::with_capacity(threshold);
    let hex_msg = hex::encode(message.as_bytes());
    for (i, (id, (nonces, secret_share))) in signing_package.iter().enumerate() {
        let res = scheme.signing_round2(
            message.as_bytes(),
            &signing_commitments,
            &nonces,
            &lit_frost::KeyPackage {
                identifier: id.clone(),
                secret_share: (*secret_share).clone(),
                verifying_key: vk.clone(),
                threshold: NonZeroU16::new(signers).unwrap(),
            },
        );
        let signature = res?;
        let vks = scheme.verifying_share(&secret_share)?;
        signature_shares.push(serde_json::to_string(
            &SignableOutput::FrostSignedMessageShare(FrostSignedMessageShare {
                message: hex_msg.clone(),
                result: "success".to_string(),
                share_id: serde_json::to_string(id).unwrap(),
                peer_id: (i + 1).to_string(),
                signature_share: serde_json::to_string(&signature).unwrap(),
                signing_commitments: serde_json::to_string(&signing_commitments[i].1).unwrap(),
                verifying_share: serde_json::to_string(&vks).unwrap(),
                public_key: verifying_key.clone(),
                sig_type: signing_scheme.clone(),
            }),
        )?);
    }
    Ok(signature_shares)
}

fn create_ecdsa_shares<C>(
    message: String,
    signing_scheme: String,
    threshold: usize,
) -> JsResult<Vec<String>>
where
    C: PrimeCurve + CurveArithmetic + DigestPrimitive,
    C::ProjectivePoint: ToEncodedPoint<C>,
    C::AffinePoint: serde::Serialize,
    C::Scalar: serde::Serialize,
    <C as elliptic_curve::Curve>::FieldBytesSize: ModulusSize,
{
    let secret = C::Scalar::random(rand::rngs::OsRng);
    let public: C::ProjectivePoint = C::ProjectivePoint::generator() * secret;
    let public_key =
        serde_json::to_string(&hex::encode(public.to_encoded_point(false).to_bytes()))?;
    let compressed_public_key =
        serde_json::to_string(&hex::encode(public.to_encoded_point(true).to_bytes()))?;

    let wrapped_secret = IdentifierPrimeField(secret);
    let ids = (0..threshold)
        .map(|_| IdentifierPrimeField(C::Scalar::random(rand::rngs::OsRng)))
        .collect::<Vec<_>>();
    let list_ids = ParticipantIdGeneratorType::list(&ids);

    let shares = shamir::split_secret_with_participant_generator::<
        DefaultShare<IdentifierPrimeField<C::Scalar>, ValuePrimeField<C::Scalar>>,
    >(
        threshold,
        threshold,
        &wrapped_secret,
        rand::rngs::OsRng,
        &[list_ids],
    )
    .map_err(|e| JsError::new(&format!("Error splitting secret: {:?}", e)))?;

    let k = C::Scalar::random(rand::rngs::OsRng);
    let big_r: C::ProjectivePoint = C::ProjectivePoint::generator() * k;
    let big_r_str = serde_json::to_string(&big_r.to_affine())?;
    let k_inv = elliptic_curve::ops::Invert::invert(&k).unwrap();
    let r = x_coordinate::<C>(&big_r);

    let digest = <C as DigestPrimitive>::Digest::new_with_prefix(message.as_bytes());
    let m_bytes = digest.finalize_fixed();
    let z = <C::Scalar as Reduce<<C as Curve>::Uint>>::reduce_bytes(&m_bytes);

    let digest = hex::encode(m_bytes);
    let mut signature_shares = Vec::with_capacity(threshold);
    let lagrange_ids = ids.iter().map(|i| i.0).collect::<Vec<_>>();
    for (i, share) in shares.iter().enumerate() {
        let l = lagrange::<C>(&share.identifier.0, &lagrange_ids);
        let sig_share = l * k_inv * (z + share.value.0 * r);

        signature_shares.push(serde_json::to_string(
            &SignableOutput::EcdsaSignedMessageShare(EcdsaSignedMessageShare {
                digest: digest.clone(),
                result: "success".to_string(),
                share_id: serde_json::to_string(&share.identifier).unwrap(),
                peer_id: (i + 1).to_string(),
                signature_share: serde_json::to_string(&sig_share).unwrap(),
                big_r: big_r_str.clone(),
                compressed_public_key: compressed_public_key.clone(),
                public_key: public_key.clone(),
                sig_type: signing_scheme.clone(),
            }),
        )?);
    }

    Ok(signature_shares)
}

pub(crate) fn lagrange<C>(xi: &C::Scalar, participants: &[C::Scalar]) -> C::Scalar
where
    C: CurveArithmetic,
{
    let xi = *(xi.as_ref());
    let mut num = C::Scalar::ONE;
    let mut den = C::Scalar::ONE;
    for xj in participants {
        let xj = *(xj.as_ref());
        if xi == xj {
            continue;
        }
        num *= xj;
        den *= xj - xi;
    }
    num * Field::invert(&den).expect("Denominator should not be zero")
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::combine::combine_and_verify;

    // run with `cargo test --no-default-features --features=test-shares -- --nocapture`
    // to get a print out of all signature share types and the expected signature output
    //
    // To just run the test without printing, use
    // `cargo test --no-default-features --features=test-shares`
    #[test]
    fn create_shares_test() {
        const THRESHOLD: usize = 3;
        let message = "Hello, world!".to_string();
        let signing_schemes = [
            "Bls12381",
            "EcdsaK256Sha256",
            "EcdsaP256Sha256",
            "EcdsaP384Sha384",
            "SchnorrEd25519Sha512",
            "SchnorrK256Sha256",
            "SchnorrP256Sha256",
            "SchnorrP384Sha384",
            "SchnorrRistretto25519Sha512",
            "SchnorrEd448Shake256",
            "SchnorrRedJubjubBlake2b512",
            "SchnorrK256Taproot",
            "SchnorrRedDecaf377Blake2b512",
            "SchnorrkelSubstrate",
            "Bls12381G1ProofOfPossession",
        ];

        for signing_scheme in signing_schemes {
            let signing_scheme = signing_scheme.to_string();
            let shares = create_shares(message.clone(), signing_scheme.to_string(), THRESHOLD);
            assert!(shares.is_ok());
            let shares = shares.unwrap();
            println!("{:?}", shares);
            let sig = combine_and_verify(shares);
            assert!(sig.is_ok());
            println!("{:?}", sig.unwrap());
        }
    }
}
