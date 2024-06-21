# WASM

Our rust implementations for

- [ECDSA Signature Combining](./src/ecdsa.rs)
- [BLS Singature Combining](./src/bls.rs)
- [SEV SNP Verification](./src/sev_snp.rs)

### 🛠️ Build with `wasm-pack build`

**Note: Requires rust version 1.70.0 or higher with `wasm-pack` installed see [here](https://github.com/rustwasm/wasm-pack) for more info**

```
wasm-pack build ./rust --target web --release --out-name wasm-internal 
```

See package [crypto](../../crypto/README.md) for how this package can be consumed

