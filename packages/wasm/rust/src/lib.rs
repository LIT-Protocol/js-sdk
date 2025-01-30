pub mod abi;
pub mod bls;
mod combine;
pub mod ecdsa;
pub mod sev_snp;
#[cfg(feature = "test-shares")]
pub mod test;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn greet() -> String {
    "Hello, wasm!".to_string()
}
