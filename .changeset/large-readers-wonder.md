---
'@lit-protocol/access-control-conditions': patch
'@lit-protocol/access-control-conditions-schemas': patch
'@lit-protocol/auth': patch
'@lit-protocol/auth-helpers': patch
'@lit-protocol/auth-services': patch
'@lit-protocol/constants': patch
'@lit-protocol/crypto': patch
'@lit-protocol/lit-client': patch
'@lit-protocol/logger': patch
'@lit-protocol/networks': patch
'@lit-protocol/schemas': patch
'@lit-protocol/types': patch
'@lit-protocol/wasm': patch
---

withOverrides no longer monkey-patches methods nor wraps every chain API. It now builds an overridden networkConfig with the resolved RPC URL and a cloned chainConfig whose rpcUrls.default.http and rpcUrls['public'].http use the override. So all downstream consumers (state manager, chain APIs, contracts) automatically use the overridden RPC via the standard construction path. No per-method wrapping needed.
