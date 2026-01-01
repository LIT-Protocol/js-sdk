pub mod abi;
pub mod bls;
pub mod combine;
pub mod ecdsa;
pub mod sev_snp;
#[cfg(feature = "test-shares")]
pub mod test;

use wasm_bindgen::prelude::*;

pub use combine::combine_and_verify;

#[wasm_bindgen]
pub fn greet() -> String {
    "Hello, wasm!".to_string()
}
