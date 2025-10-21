---
'@lit-protocol/lit-client': minor
---

LitClient now offers `getIpfsId` via `@lit-protocol/lit-client/ipfs`, letting apps compute CIDv0 hashes (e.g., `await getIpfsId('hello')`) while keeping bundles lean.

```ts
import { getIpfsId } from '@lit-protocol/lit-client/ipfs';
const cid = await getIpfsId('hello');
```
