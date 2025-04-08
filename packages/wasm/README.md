# WASM

This package provides high-performance cryptographic operations for the Lit Protocol by implementing core utilities in Rust and compiling them to WebAssembly. It enables efficient cross-platform execution of critical cryptographic functions while maintaining security and performance. The package handles the compilation process through wasm-pack and provides JavaScript bindings for seamless integration.

For detailed implementation information, see the [rust](./rust/README.md) directory.

### Building

This package contanis scripts for building the `rust` souce into `WebAssembly` and correctly encoding the binary artifact.
To perform the entire build / encoding operations you can run `rust:build`. If you wish to only produce the `WebAssembly` binding you can see the `rust` [README](./rust//README.md) for build information.
