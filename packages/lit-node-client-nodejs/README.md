# Getting Started

This `LitNodeClientNodeJs` is created solely to run on Node.js.

The usual `checkAndSignAuthMessage` is not included in this package, so you need to add it manually to the constructor if you decide to use it on a browser, or with any custom auth callback.

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
