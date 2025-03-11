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
use serde_bytes::Bytes;
use tsify::Tsify;
use wasm_bindgen::{prelude::*, JsError};

use crate::abi::{from_js, into_js, into_uint8array, JsResult};

struct Ecdsa<C>(C);

trait HdCtx {
    const CTX: &'static [u8];
}

impl HdCtx for Secp256k1 {
    const CTX: &'static [u8] = b"LIT_HD_KEY_ID_K256_XMD:SHA-256_SSWU_RO_NUL_";
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
        let (big_r, s, was_flipped) = Self::combine_inner(presignature, signature_shares)?;
        Self::signature_into_js(big_r.to_affine(), s, was_flipped)
    }

    pub(crate) fn combine_inner(
        presignature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
    ) -> JsResult<(C::ProjectivePoint, C::Scalar, bool)> {
        let signature_shares = signature_shares
            .into_iter()
            .map(Self::scalar_from_js)
            .collect::<JsResult<Vec<_>>>()?;

        let big_r: C::AffinePoint = Self::point_from_js(presignature)?;
        let (s, was_flipped) = Self::sum_scalars(signature_shares)?;
        Ok((C::ProjectivePoint::from(big_r), s, was_flipped))
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

    fn sum_scalars(values: Vec<C::Scalar>) -> JsResult<(C::Scalar, bool)> {
        if values.is_empty() {
            return Err(JsError::new("no shares provided"));
        }
        let mut acc: C::Scalar = values.into_iter().sum();
        let acc_flipped = acc.is_high().into();
        acc.conditional_assign(&(-acc), acc.is_high());
        Ok((acc, acc_flipped))
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

    fn signature_into_js(big_r: C::AffinePoint, s: C::Scalar, was_flipped: bool) -> JsResult<EcdsaSignature> {
        let r = Self::x_coordinate(&big_r).to_repr();
        let s = s.to_repr();
        let mut v = u8::conditional_select(&0, &1, big_r.y_is_odd());

        // Flip v if s was normalized (flipped, low-s rule)
        if was_flipped {
            v = 1 - v;
        }

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
        let (big_r, s, was_flipped) = Self::combine_inner(pre_signature, signature_shares)?;
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
            Self::signature_into_js(big_r.to_affine(), s, was_flipped)
        } else {
            Err(JsError::new("invalid signature"))
        }
    }
}

#[wasm_bindgen(js_name = "ecdsaDeriveKey")]
pub fn ecdsa_derive_key(
    id: Uint8Array,
    public_keys: Vec<Uint8Array>,
) -> JsResult<Uint8Array> {
    Ecdsa::<Secp256k1>::derive_key(id, public_keys)
}
