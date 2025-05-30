---
'@lit-protocol/auth-services': major
---

The core issue was that the auth-services package was trying to be a modern ES module package with modern dependencies, but was configured with older CommonJS/Node.js settings. Once we aligned everything to be consistently modern ES2022 with bundler resolution, TypeScript could properly:
