use elliptic_curve::{
    generic_array::typenum::Unsigned,
    group::{cofactor::CofactorGroup, Curve, GroupEncoding},
    ops::{Invert as _, Reduce},
    point::AffineCoordinates,
    scalar::IsHigh as _,
    sec1::{EncodedPoint, FromEncodedPoint, ModulusSize, ToEncodedPoint},
    subtle::ConditionallySelectable as _,
    Curve as ECurve, CurveArithmetic, Field as _, Group, PrimeCurve, PrimeField,
};
use hd_keys_curves_wasm::{HDDerivable, HDDeriver};
use js_sys::Uint8Array;
use k256::Secp256k1;
use p256::NistP256;
use serde::Deserialize;
use serde_bytes::Bytes;
use tsify::Tsify;
use wasm_bindgen::{prelude::*, JsError};

use crate::abi::{from_js, into_js, into_uint8array, JsResult};

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
    const CTX: &'static [u8] = b"LIT_HD_KEY_ID_P256_XMD:SHA-256_SSWU_RO_NUL_";
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(typescript_type = "[Uint8Array, Uint8Array, number]")]
    pub type EcdsaSignature;
}

impl<C> Ecdsa<C>
where
    C: PrimeCurve + CurveArithmetic + HdCtx,
    C::AffinePoint: GroupEncoding + FromEncodedPoint<C>,
    C::Scalar: HDDeriver,
    C::FieldBytesSize: ModulusSize,
    C::ProjectivePoint: CofactorGroup + HDDerivable + FromEncodedPoint<C> + ToEncodedPoint<C>,
{
    pub fn combine(
        presignature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
    ) -> JsResult<EcdsaSignature> {
        let (big_r, s) = Self::combine_inner(presignature, signature_shares)?;
        Self::signature_into_js(big_r.to_affine(), s)
    }

    pub(crate) fn combine_inner(
        presignature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
    ) -> JsResult<(C::ProjectivePoint, C::Scalar)> {
        let signature_shares = signature_shares
            .into_iter()
            .map(Self::scalar_from_js)
            .collect::<JsResult<Vec<_>>>()?;

        let big_r: C::AffinePoint = Self::point_from_js(presignature)?;
        let s = Self::sum_scalars(signature_shares)?;
        Ok((C::ProjectivePoint::from(big_r), s))
    }

    pub fn verify(
        message_hash: Uint8Array,
        public_key: Uint8Array,
        signature: EcdsaSignature,
    ) -> JsResult<()> {
        let (r, s, _) = Self::signature_from_js(signature)?;

        let z = Self::scalar_from_hash(message_hash)?;
        let public_key: C::ProjectivePoint = Self::point_from_js(public_key)?;

        if r.is_zero().into() {
            return Err(JsError::new("invalid signature"));
        }
        // This will fail if s == 0
        let s_inv = Option::<C::Scalar>::from(s.invert_vartime())
            .ok_or_else(|| JsError::new("invalid signature"))?;

        if z.is_zero().into() {
            return Err(JsError::new("invalid message digest"));
        }

        let reproduced =
            (<C::ProjectivePoint as Group>::generator() * (z * s_inv)) + (public_key * (r * s_inv));
        let reproduced_x = Self::x_coordinate(&reproduced.to_affine());

        if reproduced_x != r {
            return Err(JsError::new("invalid signature"));
        }

        Ok(())
    }

    fn sum_scalars(values: Vec<C::Scalar>) -> JsResult<C::Scalar> {
        if values.is_empty() {
            return Err(JsError::new("no shares provided"));
        }
        let mut acc: C::Scalar = values.into_iter().sum();
        acc.conditional_assign(&(-acc), acc.is_high());
        Ok(acc)
    }

    pub fn derive_key(id: Uint8Array, public_keys: Vec<Uint8Array>) -> JsResult<Uint8Array> {
        let k = Self::derive_key_inner(id, public_keys)?;
        let k = k.to_encoded_point(false);

        into_uint8array(k.as_bytes())
    }

    fn derive_key_inner(
        id: Uint8Array,
        public_keys: Vec<Uint8Array>,
    ) -> JsResult<C::ProjectivePoint> {
        let id = from_js::<Vec<u8>>(id)?;
        let public_keys = public_keys
            .into_iter()
            .map(Self::point_from_js::<C::ProjectivePoint>)
            .collect::<JsResult<Vec<_>>>()?;

        let deriver = C::Scalar::create(&id, C::CTX);
        Ok(deriver.hd_derive_public_key(&public_keys))
    }

    fn scalar_from_js(s: Uint8Array) -> JsResult<C::Scalar> {
        let s = from_js::<Vec<u8>>(s)?;
        Self::scalar_from_bytes(s)
    }

    fn scalar_from_bytes(s: Vec<u8>) -> JsResult<C::Scalar> {
        let s = C::Scalar::from_repr(<C::Scalar as PrimeField>::Repr::from_slice(&s).clone());
        let s = Option::from(s);
        let s = s.ok_or_else(|| JsError::new("cannot deserialize"))?;

        Ok(s)
    }

    fn point_from_js<T: FromEncodedPoint<C>>(q: Uint8Array) -> JsResult<T> {
        let q = from_js::<Vec<u8>>(q)?;
        let q = EncodedPoint::<C>::from_bytes(q)?;
        let q = T::from_encoded_point(&q);
        let q = Option::<T>::from(q);
        let q = q.ok_or_else(|| JsError::new("cannot deserialize"))?;

        Ok(q)
    }

    fn signature_from_js(signature: EcdsaSignature) -> JsResult<(C::Scalar, C::Scalar, u8)> {
        let (r, s, v): (Vec<u8>, Vec<u8>, u8) = from_js(signature)?;
        let r = Self::scalar_from_bytes(r)?;
        let s = Self::scalar_from_bytes(s)?;
        Ok((r, s, v))
    }

    fn signature_into_js(big_r: C::AffinePoint, s: C::Scalar) -> JsResult<EcdsaSignature> {
        let r = Self::x_coordinate(&big_r).to_repr();
        let s = s.to_repr();
        let v = u8::conditional_select(&0, &1, big_r.y_is_odd());

        Ok(EcdsaSignature {
            obj: into_js(&(Bytes::new(&r), Bytes::new(&s), v))?,
        })
    }

    pub(crate) fn x_coordinate(pt: &C::AffinePoint) -> C::Scalar {
        <C::Scalar as Reduce<<C as ECurve>::Uint>>::reduce_bytes(&pt.x())
    }

    pub fn scalar_from_hash(msg_digest: Uint8Array) -> JsResult<C::Scalar> {
        let digest = from_js::<Vec<u8>>(msg_digest)?;
        if digest.len() != C::FieldBytesSize::to_usize() {
            return Err(JsError::new("invalid message digest length"));
        }
        let z_bytes =
            <C::Scalar as Reduce<<C as ECurve>::Uint>>::Bytes::from_slice(digest.as_slice());
        Ok(<C::Scalar as Reduce<<C as ECurve>::Uint>>::reduce_bytes(
            z_bytes,
        ))
    }

    pub fn combine_and_verify_with_derived_key(
        pre_signature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
        message_hash: Uint8Array,
        id: Uint8Array,
        public_keys: Vec<Uint8Array>,
    ) -> JsResult<EcdsaSignature> {
        let public_key = Self::derive_key_inner(id, public_keys)?;
        Self::combine_and_verify(pre_signature, signature_shares, message_hash, public_key)
    }

    pub fn combine_and_verify_with_specified_key(
        pre_signature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
        message_hash: Uint8Array,
        public_key: Uint8Array,
    ) -> JsResult<EcdsaSignature> {
        let public_key: C::ProjectivePoint = Self::point_from_js(public_key)?;
        Self::combine_and_verify(pre_signature, signature_shares, message_hash, public_key)
    }

    fn combine_and_verify(
        pre_signature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
        message_hash: Uint8Array,
        public_key: C::ProjectivePoint,
    ) -> JsResult<EcdsaSignature> {
        let z = Self::scalar_from_hash(message_hash)?;
        let (big_r, s) = Self::combine_inner(pre_signature, signature_shares)?;
        let r = Self::x_coordinate(&big_r.to_affine());

        if z.is_zero().into() {
            return Err(JsError::new("invalid message digest"));
        }
        if (s.is_zero() | big_r.is_identity()).into() {
            return Err(JsError::new("invalid signature"));
        }
        if r.is_zero().into() {
            return Err(JsError::new("invalid r coordinate"));
        }
        // sR == zG * rY =
        // (z + rx/k) * k * G == zG + rxG =
        // (z + rx) G == (z + rx) G
        if (big_r * s - (public_key * r + C::ProjectivePoint::generator() * z))
            .is_identity()
            .into()
        {
            Self::signature_into_js(big_r.to_affine(), s)
        } else {
            Err(JsError::new("invalid signature"))
        }
    }
}

/// Perform all three functions at once
#[wasm_bindgen(js_name = "ecdsaCombineAndVerifyWithDerivedKey")]
pub fn ecdsa_combine_and_verify_with_derived_key(
    variant: EcdsaVariant,
    pre_signature: Uint8Array,
    signature_shares: Vec<Uint8Array>,
    message_hash: Uint8Array,
    id: Uint8Array,
    public_keys: Vec<Uint8Array>,
) -> JsResult<EcdsaSignature> {
    match variant {
        EcdsaVariant::K256 => Ecdsa::<Secp256k1>::combine_and_verify_with_derived_key(
            pre_signature,
            signature_shares,
            message_hash,
            id,
            public_keys,
        ),
        EcdsaVariant::P256 => Ecdsa::<NistP256>::combine_and_verify_with_derived_key(
            pre_signature,
            signature_shares,
            message_hash,
            id,
            public_keys,
        ),
    }
}

/// Perform combine and verify with a specified public key
#[wasm_bindgen(js_name = "ecdsaCombineAndVerify")]
pub fn ecdsa_combine_and_verify(
    variant: EcdsaVariant,
    pre_signature: Uint8Array,
    signature_shares: Vec<Uint8Array>,
    message_hash: Uint8Array,
    public_key: Uint8Array,
) -> JsResult<EcdsaSignature> {
    match variant {
        EcdsaVariant::K256 => Ecdsa::<Secp256k1>::combine_and_verify_with_specified_key(
            pre_signature,
            signature_shares,
            message_hash,
            public_key,
        ),
        EcdsaVariant::P256 => Ecdsa::<NistP256>::combine_and_verify_with_specified_key(
            pre_signature,
            signature_shares,
            message_hash,
            public_key,
        ),
    }
}

/// Combine ECDSA signatures shares
#[wasm_bindgen(js_name = "ecdsaCombine")]
pub fn ecdsa_combine(
    variant: EcdsaVariant,
    presignature: Uint8Array,
    signature_shares: Vec<Uint8Array>,
) -> JsResult<EcdsaSignature> {
    match variant {
        EcdsaVariant::K256 => Ecdsa::<Secp256k1>::combine(presignature, signature_shares),
        EcdsaVariant::P256 => Ecdsa::<NistP256>::combine(presignature, signature_shares),
    }
}

#[wasm_bindgen(js_name = "ecdsaVerify")]
pub fn ecdsa_verify(
    variant: EcdsaVariant,
    message_hash: Uint8Array,
    public_key: Uint8Array,
    signature: EcdsaSignature,
) -> JsResult<()> {
    match variant {
        EcdsaVariant::K256 => Ecdsa::<Secp256k1>::verify(message_hash, public_key, signature),
        EcdsaVariant::P256 => Ecdsa::<NistP256>::verify(message_hash, public_key, signature),
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
