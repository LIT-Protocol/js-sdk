# Quick Start

This submodule provides encryption and decryption of contents (string, zip, etc.) respectively using a symmetric key, with the encrypted content returned as a Blob and the symmetric key as a Uint8Array

### node.js / browser

```
yarn add @lit-protocol/encryption
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/encryption-vanilla/encryption.js"></script>
<script>
  console.log(LitJsSdk_encryption);
</script>
```

### Update TS interfaces

After updating the JSON schema definitions for any access control conditions, run the following command to update the TS interfaces:

```bash
node ./packages/encryption/tools.mjs --gen
```
