/*
    Copyright Michael Lodder. All Rights Reserved.
    SPDX-License-Identifier: Apache-2.0
*/
//! Extra Rust Crypto elliptic-curve adaptors, functions, and macros
//!
//! This crate is vendored to patch a missing bound in `sum_of_products`
//! which prevented native compilation of downstream crates (e.g. `lit-bls-wasm`).
#![deny(
    clippy::unwrap_used,
    clippy::panic,
    clippy::panic_in_result_fn,
    missing_docs,
    unused_import_braces,
    unused_qualifications,
    unused_parens,
    unused_lifetimes,
    unconditional_recursion,
    unused_extern_crates,
    trivial_casts,
    trivial_numeric_casts
)]
#![no_std]
#![cfg_attr(docsrs, feature(doc_auto_cfg))]

mod serdes;
mod sum_of_products;

#[cfg(all(feature = "alloc", not(feature = "std")))]
extern crate alloc;

#[cfg(feature = "std")]
#[cfg_attr(feature = "std", macro_use)]
extern crate std;

#[cfg(all(feature = "alloc", not(feature = "std")))]
use alloc::{boxed::Box, string::String, vec::Vec};
#[cfg(feature = "std")]
use std::{boxed::Box, string::String, vec::Vec};

pub use serdes::*;
pub use sum_of_products::*;

