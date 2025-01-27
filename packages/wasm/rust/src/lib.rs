pub mod abi;
pub mod bls;
mod combine;
pub mod ecdsa;
pub mod sev_snp;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet() -> String {
    "Hello, wasm!".to_string()
}
