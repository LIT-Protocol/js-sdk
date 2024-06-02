import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.require = require;
