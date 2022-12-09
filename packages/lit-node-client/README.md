# Quick Start

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