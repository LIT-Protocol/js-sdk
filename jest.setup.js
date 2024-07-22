require('dotenv').config({ path: __dirname + '/.env' });
console.log('loaded configuration from .env', __dirname);
const crypto = require('crypto');

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.crypto = crypto;
