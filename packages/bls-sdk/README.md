# Installation

```
yarn add @lit-protocol/bls-sdk
```

# Usage

```js
import { initWasmBlsSdk } from '@lit-protocol/bls-sdk';

initWasmBlsSdk().then((exports) => {
  globalThis.wasmExports = exports;
  log(
    `✅ [BLS SDK] wasmExports loaded. ${
      Object.keys(exports).length
    } functions available. Run 'wasmExports' in the console to see them.`
  );
});
```

# Then

```js
// set decryption shares bytes in wasm
decryptionShares.forEach((s: any, idx: any) => {

    wasmExports.set_share_indexes(idx, s.shareIndex);

    const shareAsBytes = uint8arrayFromString(s.decryptionShare, 'base16');

    for (let i = 0; i < shareAsBytes.length; i++) {
        wasmExports.set_decryption_shares_byte(i, idx, shareAsBytes[i]);
    }
});
```