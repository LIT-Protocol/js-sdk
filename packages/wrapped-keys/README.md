# Quick Start

This submodule provides Wrapped Keys which includes storing & fetching encrypted private keys from Lit's DynamoDB service. It additionally includes a repository of Lit Actions that accept encrypted keys, use `decryptAndCombine` to decrypt the keys inside the Lit Action (TEE), sign with that key and return either a signed transaction or broadcasts it using the node's RPC.

### node.js / browser

```
yarn add @lit-protocol/wrapped-keys
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/wrapped-keys-vanilla/wrapped-keys.js"></script>
<script>
  console.log(LitJsSdk_wrapped-keys);
</script>
```
