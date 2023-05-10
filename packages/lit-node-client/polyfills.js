// This field will be automatically injected into the ./dist/packages/<package-name>/index.js file
// between the autogen:polyfills:start/end comments

try {
  globalThis.crypto = require('crypto').webcrypto;
} catch (e) {
  // swallow
}
