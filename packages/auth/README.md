# Quick Start

This module provides management of auth methods that are used to control LIT PKPs, and authorization primitives.

### AuthManager
An AuthManager works with `authenticators` (migrated from: @lit-protocol/lit-auth-client) to generate auth material using various methods (see: authenticators documentation).  

The `AuthManager` then uses that auth material to create session credentials, and caches the resulting credentials for use with LIT network services.  It also validates auth material and session material, and will attempt to get new auth material any time it detects that existing cached credentials have expired.

### node.js / browser

```
yarn add @lit-protocol/lit-auth
```
