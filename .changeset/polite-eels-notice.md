---
'@lit-protocol/access-control-conditions': patch
'@lit-protocol/wrapped-keys-lit-actions': patch
'@lit-protocol/auth-services': patch
'@lit-protocol/auth-helpers': patch
'@lit-protocol/wrapped-keys': patch
'@lit-protocol/lit-client': patch
'@lit-protocol/artillery': patch
'@lit-protocol/constants': patch
'@lit-protocol/contracts': patch
'@lit-protocol/networks': patch
'@lit-protocol/crypto': patch
'@lit-protocol/logger': patch
'@lit-protocol/types': patch
'@lit-protocol/explorer': patch
'@lit-protocol/auth': patch
'@lit-protocol/e2e': patch
---

Centralized logging for the Lit Protocol SDK. The default backend is structured pino logging, but you can attach custom transports (DataDog, Sentry, your own system) and it works in both Node.js and browsers.
