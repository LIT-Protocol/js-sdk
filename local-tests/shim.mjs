import { createRequire } from 'module';
import { webcrypto } from 'node:crypto';

const require = createRequire(import.meta.url);
global.require = require;

// Add crypto polyfill for Node.js
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
