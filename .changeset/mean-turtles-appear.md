---
'@lit-protocol/contracts': patch
---

Consumers now get lazy-loaded CommonJS contract exports with "sideEffects": false, enabling bundlers to drop unused network artifacts and shrink application bundles.
