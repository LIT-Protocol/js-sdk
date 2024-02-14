use elliptic_curve::{
    group::{cofactor::CofactorGroup, GroupEncoding},
    point::AffineCoordinates,
    scalar::IsHigh as _,
    sec1::{EncodedPoint, FromEncodedPoint, ModulusSize, ToEncodedPoint},
    subtle::ConditionallySelectable as _,
    CurveArithmetic, PrimeCurve, PrimeField,
};
use hd_keys_curves::{HDDerivable, HDDeriver};
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

impl<C: PrimeCurve + CurveArithmetic> Ecdsa<C>
where
    C::AffinePoint: GroupEncoding + FromEncodedPoint<C>,
    C::Scalar: HDDeriver,
    C::FieldBytesSize: ModulusSize,
    C::ProjectivePoint: CofactorGroup + HDDerivable + FromEncodedPoint<C> + ToEncodedPoint<C>,
    C: HdCtx,
{
    pub fn combine(
        presignature: Uint8Array,
        signature_shares: Vec<Uint8Array>,
    ) -> JsResult<Uint8Array> {
        let signature_shares = signature_shares
            .into_iter()
            .map(Self::scalar_from_js)
            .collect::<JsResult<Vec<_>>>()?;

        let big_r = Self::point_from_js(presignature)?;
        let s = Self::sum_scalars(signature_shares)?;

        Self::signature_into_js(big_r, s)
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
            .map(Self::point_from_js::<C::ProjectivePoint>)
            .collect::<JsResult<Vec<_>>>()?;

        let deriver = C::Scalar::create(&id, C::CTX);

        let k = deriver.hd_derive_public_key(&public_keys);
        let k = k.to_encoded_point(false);
        let k = Bytes::new(k.as_bytes().as_ref());
        let k = into_js(&k)?;

        Ok(k)
    }

    fn scalar_from_js(s: Uint8Array) -> JsResult<C::Scalar> {
        let s = from_js::<Vec<u8>>(s)?;
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

    fn signature_into_js(big_r: C::AffinePoint, s: C::Scalar) -> JsResult<Uint8Array> {
        let r = big_r.x();
        let v = u8::conditional_select(&0, &1, big_r.y_is_odd());
        let s = s.to_repr();

        let bytes = Self::concat_rsv(r, s, v);
        let signature = into_js(Bytes::new(&bytes))?;

        Ok(signature)
    }

    fn concat_rsv(
        r: <C::AffinePoint as AffineCoordinates>::FieldRepr,
        s: <C::AffinePoint as AffineCoordinates>::FieldRepr,
        v: u8,
    ) -> Vec<u8>
    where
        C: HdCtx,
    {
        let mut bytes = Vec::new();
        bytes.extend_from_slice(&r);
        bytes.extend_from_slice(&s);
        bytes.push(v);
        bytes
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
