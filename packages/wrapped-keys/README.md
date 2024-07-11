# Quick Start

This submodule is used for Wrapped Keys which allows you to import any existing keys. You can also export these keys to the user. These keys are encrypted and stored in a DynamoDB instance managed by Lit. You can use functions to sign a message/transaction within a Lit Action as even broadcast it to the required blockchain.

### node.js / browser

```
yarn add @lit-protocol/wrapped-keys
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/wrapped-keys-vanilla/wrapped-keys.js"></script>
<script>
  console.log(LitJsSdk_wrappedKeys);
</script>
```
