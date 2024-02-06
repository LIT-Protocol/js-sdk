use serde::{Deserialize, Serialize};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

/// Wraps a binary type, transferred as a Uint8Array to/from JavaScript
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bytes<T: serde_bytes::Serialize + for<'a> serde_bytes::Deserialize<'a>>(
    #[serde(with = "serde_bytes")] pub T,
);

impl<T: serde_bytes::Serialize + for<'a> serde_bytes::Deserialize<'a> + AsRef<[u8]>> AsRef<[u8]>
    for Bytes<T>
{
    fn as_ref(&self) -> &[u8] {
        self.0.as_ref()
    }
}

impl<T: serde_bytes::Serialize + for<'a> serde_bytes::Deserialize<'a>> Tsify for Bytes<T> {
    type JsType = js_sys::Uint8Array;

    const DECL: &'static str = "";
}

#[wasm_bindgen(typescript_custom_section)]
const _: &'static str = r#"
type Bytes<T extends number[] = number[]> = Uint8Array;
"#;
