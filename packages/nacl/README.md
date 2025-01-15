# Quick Start

This submodule provides a re-export of the `nacl` package, which is a cryptographic library for handling various encryption and decryption operations.

### node.js / browser

```
yarn add @lit-protocol/nacl
```

## Description

The `@lit-protocol/nacl` package is a wrapper around the `nacl` library, providing cryptographic functionalities such as public-key encryption, secret-key encryption, digital signatures, and hashing. It is designed to be used in both Node.js and browser environments.

## Installation

To install the `@lit-protocol/nacl` package, you can use either npm or yarn:

```bash
npm install @lit-protocol/nacl
```

or

```bash
yarn add @lit-protocol/nacl
```

## Usage

Here are some examples of how to use the cryptographic functions provided by the `@lit-protocol/nacl` package:

### Public-Key Encryption

The `@lit-protocol/nacl` package provides functions for public-key encryption, allowing you to encrypt and decrypt messages using a pair of public and private keys.

```javascript
import nacl from '@lit-protocol/nacl';

// Generate a new key pair
const keyPair = nacl.box.keyPair();

// Encrypt a message
const message = new TextEncoder().encode('Hello, world!');
const nonce = nacl.randomBytes(nacl.box.nonceLength);
const encryptedMessage = nacl.box(message, nonce, keyPair.publicKey, keyPair.secretKey);

// Decrypt the message
const decryptedMessage = nacl.box.open(encryptedMessage, nonce, keyPair.publicKey, keyPair.secretKey);
console.log(new TextDecoder().decode(decryptedMessage)); // Output: Hello, world!
```

### Secret-Key Encryption

The `@lit-protocol/nacl` package also provides functions for secret-key encryption, allowing you to encrypt and decrypt messages using a shared secret key.

```javascript
import nacl from '@lit-protocol/nacl';

// Generate a new secret key
const secretKey = nacl.randomBytes(nacl.secretbox.keyLength);

// Encrypt a message
const message = new TextEncoder().encode('Hello, world!');
const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
const encryptedMessage = nacl.secretbox(message, nonce, secretKey);

// Decrypt the message
const decryptedMessage = nacl.secretbox.open(encryptedMessage, nonce, secretKey);
console.log(new TextDecoder().decode(decryptedMessage)); // Output: Hello, world!
```

### Digital Signatures

The `@lit-protocol/nacl` package provides functions for creating and verifying digital signatures, allowing you to sign messages and verify the authenticity of signed messages.

```javascript
import nacl from '@lit-protocol/nacl';

// Generate a new key pair
const keyPair = nacl.sign.keyPair();

// Sign a message
const message = new TextEncoder().encode('Hello, world!');
const signedMessage = nacl.sign(message, keyPair.secretKey);

// Verify the signed message
const verifiedMessage = nacl.sign.open(signedMessage, keyPair.publicKey);
console.log(new TextDecoder().decode(verifiedMessage)); // Output: Hello, world!
```

### Hashing

The `@lit-protocol/nacl` package provides functions for hashing messages, allowing you to create cryptographic hashes of messages.

```javascript
import nacl from '@lit-protocol/nacl';

// Hash a message
const message = new TextEncoder().encode('Hello, world!');
const hash = nacl.hash(message);
console.log(hash);
```

## Contributing

We welcome contributions to the `@lit-protocol/nacl` package. If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request on the GitHub repository.

## License

The `@lit-protocol/nacl` package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
