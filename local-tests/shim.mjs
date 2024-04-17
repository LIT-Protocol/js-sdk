// shims.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url); // Properly shim 'require' for use in ESM

global.require = require; // Make shimmed require globally available if needed
