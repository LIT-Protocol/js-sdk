# Quick Start

This submodule provides functionalities from various modules within the Lit SDK, enabling users to authenticate in the browser and connect to different blockchain networks (Ethereum, Cosmos, and Solana) with convenience, while also providing a function to disconnect from the Ethereum network.

### node.js / browser

```
yarn add @lit-protocol/auth-browser
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/auth-browser-vanilla/auth-browser.js"></script>
<script>
  console.log(LitJsSdk_authBrowser);
</script>
```

## Generate an authSig with long expiration

```
const expiration = new Date(Date.now() + 1000 * 60 * 60 * 99999).toISOString();

const authSig = LitJsSdk_authBrowser.checkAndSignAuthMessage({chain: 'ethereum', expiration: expiration});

```
