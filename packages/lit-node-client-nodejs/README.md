# Getting Started

This package provides a Node.js-specific implementation of the Lit Protocol client, enabling server-side applications to interact with the Lit network. It offers optimized Node.js performance while maintaining all core Lit Protocol functionality, excluding browser-specific authentication which can be manually added if needed.

```js
import * as LitJsSdkNodeJs from '@lit-protocol/lit-node-client-nodejs';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';

const client = new LitJsSdkNodeJs.LitNodeClientNodeJs({
  litNetwork: 'serrano',
  defaultAuthCallback: checkAndSignAuthMessage,
});

await client.connect();

const authSig = await checkAndSignAuthMessage({
  chain: 'ethereum',
});
```
