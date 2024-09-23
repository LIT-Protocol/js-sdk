# Quick Start

This submodule is used with the Wrapped Keys package, to include LIT action source code in your deployed frontend bundle instead of relying on LIT nodes to fetch the LIT action source code using internally defined IPFS CIDs; this can provide a performance benefit under certain circumstances due to the variable nature of IPFS performance.

### Usage

1. Install the wrapped keys LIT actions package as a dependency

```
yarn add @lit-protocol/wrapped-keys-lit-actions
```

2. In your app, provide the litActionRepository or individual lit actions to the wrapped keys package. This only needs to be done once, before you use the `api` methods exposed by wrapped-keys.

```javascript
// import all lit actions code
import { litActionRepository } from '@lit-protocol/wrapped-keys-lit-actions';
// or import individual lit actions
import { generateEncryptedEthereumPrivateKey } from '@lit-protocol/wrapped-keys-lit-actions';
import { config, api } from '@lit-protocol/wrapped-keys';

// set the litActionRepository to set all lit actions
config.setLitActionsCode({ litActionRepository });
// or set individual lit actions
config.setLitActionsCode({
  generateEncryptedKey: {
    evm: generateEncryptedEthereumPrivateKey.code,
  },
});

// Now this call will use the lit action code from the litActionRepository instead of making nodes fetch it from IPFS
api.generatePrivateKey(/* params */);
```
