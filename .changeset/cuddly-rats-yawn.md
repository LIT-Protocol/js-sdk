---
'@lit-protocol/auth': patch
---

Allows `WalletClientAuthenticator.authenticate` to build SIWE messages with user-specified fields (`domain`, `uri`, `statement`, etc.) while still managing the nonce internally.
