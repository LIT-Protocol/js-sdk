pub mod abi;
pub mod bls;
pub mod ecdsa;
pub mod sev_snp;
pub mod frost;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet() -> String {
    "Hello, wasm!".to_string()
}
