pub mod bytes;
pub mod sev_snp;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet() -> String {
    "Hello, wasm!".to_string()
}
