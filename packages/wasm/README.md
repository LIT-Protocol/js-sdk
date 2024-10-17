# WASM

Core lit utilities implemented in `Rust` and compiled to `WebAssembly` through `wasm-pack` implementations within this package wrap the compiled implementations from `rust` and provides functionality for converting the compiled artifact to a `base64` encoded string for binding to the generated bridge. the functionality contained within this package exposes the functinoality provided from the wasm utilities.

For information on implementations see the [rust](./rust/README.md) directory.

### Building

This package contanis scripts for building the `rust` souce into `WebAssembly` and correctly encoding the binary artifact.
To perform the entire build / encoding operations you can run `rust:build`. If you wish to only produce the `WebAssembly` binding you can see the `rust` [README](./rust//README.md) for build information.
