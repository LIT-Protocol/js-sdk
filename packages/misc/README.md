# Quick Start

This submodule contains various utility functions for error handling, logging, type checking, and other operations in the JavaScript SDK for the Lit Protocol.

### node.js / browser

```
yarn add @lit-protocol/misc
```

## Description

The `@lit-protocol/misc` package provides a collection of utility functions that are commonly used across different modules of the Lit Protocol SDK. These utilities include functions for error handling, logging, type checking, and other miscellaneous operations that help in the development and maintenance of the SDK.

## Installation

To install the `@lit-protocol/misc` package, you can use either npm or yarn:

```bash
npm install @lit-protocol/misc
```

or

```bash
yarn add @lit-protocol/misc
```

## Usage

Here are some examples of how to use the utility functions provided by the `@lit-protocol/misc` package:

### Error Handling

The `@lit-protocol/misc` package provides utility functions for error handling, such as creating custom error classes and handling errors in a consistent manner.

```javascript
import { createCustomError } from '@lit-protocol/misc';

class MyCustomError extends createCustomError('MyCustomError') {}

try {
  throw new MyCustomError('Something went wrong');
} catch (error) {
  console.error(error.message); // Output: Something went wrong
}
```

### Logging

The `@lit-protocol/misc` package includes utility functions for logging messages with different log levels, such as info, warning, and error.

```javascript
import { logInfo, logWarning, logError } from '@lit-protocol/misc';

logInfo('This is an informational message');
logWarning('This is a warning message');
logError('This is an error message');
```

### Type Checking

The `@lit-protocol/misc` package provides utility functions for type checking, such as checking if a value is of a specific type.

```javascript
import { isString, isNumber, isArray } from '@lit-protocol/misc';

console.log(isString('Hello')); // Output: true
console.log(isNumber(123)); // Output: true
console.log(isArray([1, 2, 3])); // Output: true
```

## Contributing

We welcome contributions to the `@lit-protocol/misc` package. If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request on the GitHub repository.

## License

The `@lit-protocol/misc` package is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
