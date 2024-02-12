use elliptic_curve::{
    group::{cofactor::CofactorGroup, GroupEncoding},
    hash2curve::{ExpandMsgXmd, FromOkm, GroupDigest},
    point::AffineCoordinates as _,
    scalar::IsHigh as _,
    sec1::{EncodedPoint, FromEncodedPoint, ModulusSize, ToEncodedPoint},
    subtle::ConditionallySelectable as _,
    CurveArithmetic, Field as _, Group as _, PrimeCurve, PrimeField, ScalarPrimitive,
};
use js_sys::Uint8Array;
use k256::Secp256k1;
use p256::NistP256;
use serde::Deserialize;
use serde_bytes::Bytes;
use tsify::Tsify;
use wasm_bindgen::{prelude::*, JsError};

use crate::abi::{from_js, into_js, JsResult};

#[derive(Tsify, Deserialize)]
#[tsify(from_wasm_abi)]
pub enum EcdsaVariant {
    K256,
    P256,
}

struct Ecdsa<C>(C);

trait HdCtx {
    const CTX: &'static [u8];
}

impl HdCtx for Secp256k1 {
    const CTX: &'static [u8] = b"LIT_HD_KEY_ID_K256_XMD:SHA-256_SSWU_RO_NUL_";
}

impl HdCtx for NistP256 {
    // TODO(cairomassimo): I just made this up, double-check
    const CTX: &'static [u8] = b"LIT_HD_KEY_ID_P256_XMD:SHA-256_SSWU_RO_NUL_";
}

impl<C: PrimeCurve + CurveArithmetic + GroupDigest> Ecdsa<C>
where
    C::AffinePoint: GroupEncoding + FromEncodedPoint<C>,
    C::Scalar: FromOkm,
    C::FieldBytesSize: ModulusSize,
    C::ProjectivePoint: CofactorGroup + FromEncodedPoint<C> + ToEncodedPoint<C>,
    C: HdCtx,
{
    pub fn combine(
        presignature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
    ) -> JsResult<Uint8Array> {
        let signature_shares = signature_shares
            .into_iter()
            .map(|s| {
                let s = from_js::<Vec<u8>>(s)?;
                let s =
                    C::Scalar::from_repr(<C::Scalar as PrimeField>::Repr::from_slice(&s).clone());
                let s = Option::from(s);
                let s = s.ok_or_else(|| JsError::new("cannot parse signature share"))?;

                Ok(s)
            })
            .collect::<JsResult<Vec<_>>>()?;

        let big_r = presignature;
        let big_r = from_js::<Vec<u8>>(big_r)?;
        let big_r = EncodedPoint::<C>::from_bytes(big_r)?;
        let big_r = C::AffinePoint::from_encoded_point(&big_r);
        let big_r = Option::<C::AffinePoint>::from(big_r)
            .ok_or_else(|| JsError::new("cannot parse input public key"))?;

        let r = big_r.x();
        let v = u8::conditional_select(&0, &1, big_r.y_is_odd());

        let s = Self::sum_scalars(signature_shares)?;
        let s = s.to_repr();

        let mut signature = Vec::new();
        signature.extend_from_slice(&r);
        signature.extend_from_slice(&s);
        signature.push(v);
        let signature = into_js(Bytes::new(signature.as_ref()))?;

        Ok(signature)
    }

    fn sum_scalars(values: Vec<C::Scalar>) -> JsResult<C::Scalar> {
        let mut values = values.into_iter();
        let mut acc = values
            .next()
            .ok_or_else(|| JsError::new("no shares provided"))?;
        for other in values {
            acc += other;
        }
        acc.conditional_assign(&(-acc), acc.is_high());
        Ok(acc)
    }

    pub fn derive_key(id: Uint8Array, public_keys: Vec<Uint8Array>) -> JsResult<Uint8Array> {
        let id = from_js::<Vec<u8>>(id)?;
        let public_keys = public_keys
            .into_iter()
            .map(|k| {
                let k = from_js::<Vec<u8>>(k)?;
                let k = EncodedPoint::<C>::from_bytes(k)?;
                let k = C::ProjectivePoint::from_encoded_point(&k);
                let k =
                    Option::from(k).ok_or_else(|| JsError::new("cannot parse input public key"))?;

                Ok(k)
            })
            .collect::<JsResult<Vec<_>>>()?;

        let k = Self::derive_key_inner(id, public_keys)?;

        let k = k.to_encoded_point(false);
        let k = Bytes::new(k.as_bytes().as_ref());
        let k = into_js(&k)?;

        Ok(k)
    }

    fn derive_key_inner(
        id: Vec<u8>,
        public_keys: Vec<C::ProjectivePoint>,
    ) -> JsResult<C::ProjectivePoint> {
        let scalar = C::hash_to_scalar::<ExpandMsgXmd<sha2::Sha256>>(&[&id], &[&C::CTX])?;
        let mut powers = vec![C::Scalar::ONE; public_keys.len()];
        powers[1] = scalar;
        for i in 2..powers.len() {
            powers[i] = powers[i - 1] * scalar;
        }
        let k = Self::sum_of_products_pippenger(&public_keys, &powers);
        Ok(k)
    }

    fn sum_of_products_pippenger(
        points: &[C::ProjectivePoint],
        scalars: &[C::Scalar],
    ) -> C::ProjectivePoint {
        const WINDOW: usize = 4;
        const NUM_BUCKETS: usize = 1 << WINDOW;
        const EDGE: usize = WINDOW - 1;
        const MASK: u64 = (NUM_BUCKETS - 1) as u64;

        let scalars = Self::convert_scalars(scalars);
        let num_components = std::cmp::min(points.len(), scalars.len());
        let mut buckets = [C::ProjectivePoint::identity(); NUM_BUCKETS];
        let mut res = C::ProjectivePoint::identity();
        let mut num_doubles = 0;
        let mut bit_sequence_index = 255usize;

        loop {
            for _ in 0..num_doubles {
                res = res.double();
            }

            let mut max_bucket = 0;
            let word_index = bit_sequence_index >> 6;
            let bit_index = bit_sequence_index & 63;

            if bit_index < EDGE {
                // we are on the edge of a word; have to look at the previous word, if it exists
                if word_index == 0 {
                    // there is no word before
                    let smaller_mask = ((1 << (bit_index + 1)) - 1) as u64;
                    for i in 0..num_components {
                        let bucket_index: usize = (scalars[i][word_index] & smaller_mask) as usize;
                        if bucket_index > 0 {
                            buckets[bucket_index] += points[i];
                            if bucket_index > max_bucket {
                                max_bucket = bucket_index;
                            }
                        }
                    }
                } else {
                    // there is a word before
                    let high_order_mask = ((1 << (bit_index + 1)) - 1) as u64;
                    let high_order_shift = EDGE - bit_index;
                    let low_order_mask = ((1 << high_order_shift) - 1) as u64;
                    let low_order_shift = 64 - high_order_shift;
                    let prev_word_index = word_index - 1;
                    for i in 0..num_components {
                        let mut bucket_index = ((scalars[i][word_index] & high_order_mask)
                            << high_order_shift)
                            as usize;
                        bucket_index |= ((scalars[i][prev_word_index] >> low_order_shift)
                            & low_order_mask) as usize;
                        if bucket_index > 0 {
                            buckets[bucket_index] += points[i];
                            if bucket_index > max_bucket {
                                max_bucket = bucket_index;
                            }
                        }
                    }
                }
            } else {
                let shift = bit_index - EDGE;
                for i in 0..num_components {
                    let bucket_index: usize = ((scalars[i][word_index] >> shift) & MASK) as usize;
                    if bucket_index > 0 {
                        buckets[bucket_index] += points[i];
                        if bucket_index > max_bucket {
                            max_bucket = bucket_index;
                        }
                    }
                }
            }
            res += &buckets[max_bucket];
            for i in (1..max_bucket).rev() {
                buckets[i] += buckets[i + 1];
                res += buckets[i];
                buckets[i + 1] = C::ProjectivePoint::identity();
            }
            buckets[1] = C::ProjectivePoint::identity();
            if bit_sequence_index < WINDOW {
                break;
            }
            bit_sequence_index -= WINDOW;
            num_doubles = {
                if bit_sequence_index < EDGE {
                    bit_sequence_index + 1
                } else {
                    WINDOW
                }
            };
        }
        res
    }

    #[cfg(target_pointer_width = "32")]
    fn convert_scalars(scalars: &[C::Scalar]) -> Vec<[u64; 4]> {
        scalars
            .iter()
            .map(|s| {
                let mut out = [0u64; 4];
                let primitive: ScalarPrimitive<C> = (*s).into();
                let small_limbs = primitive
                    .as_limbs()
                    .iter()
                    .map(|l| l.0 as u64)
                    .collect::<Vec<_>>();
                let mut i = 0;
                let mut j = 0;
                while i < small_limbs.len() && j < out.len() {
                    out[j] = small_limbs[i + 1] << 32 | small_limbs[i];
                    i += 2;
                    j += 1;
                }
                out
            })
            .collect::<Vec<_>>()
    }

    #[cfg(target_pointer_width = "64")]
    fn convert_scalars(scalars: &[C::Scalar]) -> Vec<[u64; 4]> {
        scalars
            .iter()
            .map(|s| {
                let mut out = [0u64; 4];
                let primitive: ScalarPrimitive<C> = (*s).into();
                out.copy_from_slice(
                    primitive
                        .as_limbs()
                        .iter()
                        .map(|l| l.0 as u64)
                        .collect::<Vec<_>>()
                        .as_slice(),
                );
                out
            })
            .collect::<Vec<_>>()
    }
}

/// Combine ECDSA signatures shares
/// The signature is returned in the format `r || s || v`, i.e., 65-bytes, Ethereum-compatible.
#[wasm_bindgen(js_name = "ecdsaCombine")]
pub fn ecdsa_combine(
    variant: EcdsaVariant,
    presignature: Uint8Array,
    signature_shares: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    match variant {
        EcdsaVariant::K256 => Ecdsa::<Secp256k1>::combine(presignature, signature_shares),
        EcdsaVariant::P256 => Ecdsa::<NistP256>::combine(presignature, signature_shares),
    }
}

#[wasm_bindgen(js_name = "ecdsaDeriveKey")]
pub fn ecdsa_derive_key(
    variant: EcdsaVariant,
    id: Uint8Array,
    public_keys: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    match variant {
        EcdsaVariant::K256 => Ecdsa::<Secp256k1>::derive_key(id, public_keys),
        EcdsaVariant::P256 => Ecdsa::<NistP256>::derive_key(id, public_keys),
    }
}
