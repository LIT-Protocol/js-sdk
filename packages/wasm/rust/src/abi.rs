//! Utilities from converting to/from JS

use std::convert::TryFrom;

use js_sys::Uint8Array;
use serde::{de::DeserializeOwned, Serialize};
use serde_bytes::Bytes;
use wasm_bindgen::{JsCast, JsError, JsValue};

pub type JsResult<T> = Result<T, JsError>;

pub fn from_js<T: DeserializeOwned>(value: impl Into<JsValue>) -> JsResult<T> {
    serde_wasm_bindgen::from_value::<T>(value.into()).map_err(Into::into)
}

pub fn into_js<T: JsCast>(value: &(impl Serialize + ?Sized)) -> JsResult<T> {
    let value = serde_wasm_bindgen::to_value(value)?;
    let value = value
        .dyn_into()
        .map_err(|v| JsError::new(&format!("unexpected serializer output type: {:?}", v)))?;
    Ok(value)
}

pub fn from_uint8array<T: TryFrom<Vec<u8>>>(value: Uint8Array) -> JsResult<T> {
    let value = from_js::<Vec<u8>>(value)?;
    let value = T::try_from(value);
    let value = value
        .ok()
        .ok_or_else(|| JsError::new("cannot deserialize"))?;

    Ok(value)
}

pub fn into_uint8array<T: JsCast>(value: impl AsRef<[u8]>) -> JsResult<T> {
    into_js(Bytes::new(value.as_ref()))
}
