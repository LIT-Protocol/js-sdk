# Getting Started

This `LitNodeClientNodeJs` is created solely to run on Node.js.

The usual `checkAndSignAuthMessage` is not included in this package, so you need to add it manually to the constructor if you decide to use it on a browser, or with any custom auth callback.

This package provides functionalities to interact with the Lit network in a Node.js environment.

## Installation

```bash
yarn add @lit-protocol/lit-node-client-nodejs
```

## Usage

```js
import * as LitJsSdkNodeJs from '@lit-protocol/lit-node-client-nodejs';
import { checkAndSignAuthMessage } from '@lit-protocol/auth-browser';

const client = new LitJsSdkNodeJs.LitNodeClientNodeJs({
  litNetwork: 'serrano',
  defaultAuthCallback: checkAndSignAuthMessage,
});

await client.connect();

const authSig = await checkAndSignAuthMessage({
  chain: 'ethereum',
});
```

## Contributing

We welcome contributions to the `lit-node-client-nodejs` package. Please follow the guidelines below to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Ensure all tests pass.
5. Submit a pull request.

## License

This project is licensed under the MIT License.
