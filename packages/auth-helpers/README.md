# Quick Start

This submodule manages permissions and capabilities related to accessing specific resources on the blockchain. It utilizes features from the 'siwe' and 'siwe-recap' libraries to verify and handle data, allowing users to encode and decode session capabilities, add proofs and attenuations (specific resource permissions), and verify whether certain capabilities for a resource are supported. It also provides the ability to add capabilities to 'siwe' messages and provides methods specifically tailored to the LIT protocol, enabling adding and verifying capabilities for specific LIT resources.

### node.js / browser

```
yarn add @lit-protocol/auth-helpers
```

### Vanilla JS (UMD)

```js
<script src="https://cdn.jsdelivr.net/npm/@lit-protocol/auth-helpers-vanilla/auth-helpers.js"></script>
<script>
  console.log(LitJsSdk_authHelpers);
</script>
```
