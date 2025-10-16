---
'@lit-protocol/auth-helpers': minor
'@lit-protocol/lit-client': minor
'@lit-protocol/contracts': minor
'@lit-protocol/networks': minor
'@lit-protocol/auth': minor
---

Converted viem from a bundled dependency to a peer dependency to avoid build errors from version conflicts (e.g., missing exports like sendCallsSync) and improve compatibility by reducing dependency lock-in. Consumers must now install compatible versions manually.
