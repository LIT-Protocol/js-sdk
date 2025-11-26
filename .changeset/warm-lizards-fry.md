---
'@lit-protocol/lit-client': patch
'@lit-protocol/networks': patch
'@lit-protocol/e2e': patch
---

SDK exposes typed Shiva env helpers (`createShivaEnvVars`, `waitForTestnetInfo`, `SUPPORTED_NETWORKS`) so QA suites can spin up testnets without bespoke env plumbing, and the new `executeWithHandshake` runner automatically retry failures for more stable Lit action execution.
