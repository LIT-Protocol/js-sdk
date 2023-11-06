# Quick Start

This module is the main module of this monorepo. It sets a default authentication callback using the `checkAndSignAuthMessage` function from the auth-browser submodule, which is designed to work in both browser and Node.js environments, facilitating interaction with Lit nodes.

### node.js / browser

```
yarn add @lit-protocol/lit-node-client
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/lit-node-client-vanilla/lit-node-client.js"></script>
<script>
  const authSig = LitJsSdk_litNodeClient.checkAndSignAuthMessage({chain: 'ethereum'});
</script>
```
