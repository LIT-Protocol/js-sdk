# WASM

Our rust implementations for

- [ECDSA Signature Combining](./src/ecdsa.rs)
- [BLS Signature Combining](./src/bls.rs)
- [SEV SNP Verification](./src/sev_snp.rs)

### 🛠️ Build with `wasm-pack build`

**Note: Requires rust version 1.70.0 or higher with `wasm-pack` installed globally through cargo see [here](https://github.com/rustwasm/wasm-pack) for more info**

```
wasm-pack build ./rust --target web --release --out-name wasm-internal 
```

### Updating core libraries
The following libraries specified in the [Cargo.toml](./Cargo.toml)
- [JubJub](https://github.com/LIT-Protocol/jubjub.git)
- [hd-keys-curves-wasm](https://github.com/LIT-Protocol/hd-keys-curves-wasm)
- [blsful](https://crates.io/crates/blsful)
- [elliptic-curve](https://crates.io/crates/elliptic-curve)
- [k256](https://crates.io/crates/k256)
- [p256](https://crates.io/crates/p256)
- [sev](https://crates.io/crates/sev)

See package [crypto](../../crypto/README.md) for how this package can be consumed

