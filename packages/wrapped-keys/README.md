# Quick Start

This submodule is used for Wrapped Keys which allows you to import any existing keys. You can also export these keys to the user. These keys are encrypted and stored in a DynamoDB instance managed by Lit. You can use functions to sign a message/transaction within a Lit Action as even broadcast it to the required blockchain.

### node.js / browser

```
yarn add @lit-protocol/wrapped-keys
```

### Lit Actions Code

By default, this package uses IPFS CIDs to indicate the Lit Actions involved, which tells LIT nodes to fetch our internally managed and IPFS-published LIT action source code from IPFS internally, when they receive requests from your users.

This behaviour can be modified by calling `config.setLitActionsCode({ litActionRepository })` and providing your own source code for LIT actions, which allows you to either embed your LIT action source code into your app bundle or even fetch it dynamically during app load.

When setting an explicit Lit Action source code repository, Lit Action source code will be sent to the LIT nodes in each request from your users, instead of relying on the nodes fetching the code from IPFS.

This can provide performance improvements in some circumstances due to the variable nature of IPFS performance, but with an added overhead in bandwidth used for each request your users make, bundle size and/or app load time depending on your use case.

To use LIT-provided Lit Actions and bundle their source code into your app, use `@lit-protocol/wrapped-keys-lit-actions` or define your own LIT action source code dictionary,

Example using LIT-provided action source code:

```javascript
import { litActionRepository } from '@lit-protocol/wrapped-keys-lit-actions';
import { config, api } from '@lit-protocol/wrapped-keys';

config.setLitActionsCode({ litActionRepository });
```
