//! Utilities from converting to/from JS

use serde::{de::DeserializeOwned, Serialize};
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
