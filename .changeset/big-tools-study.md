---
'@lit-protocol/lit-client': patch
'@lit-protocol/networks': patch
---

Node operations (pkpSign, decrypt, executeJs, session key signing) now emit request-aware errors, letting users share a requestID for log correlation.
