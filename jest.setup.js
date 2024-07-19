require('dotenv').config({path: '../../.env'});
console.log("loaded configuration from .env");
const crypto = require('crypto');

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.crypto = crypto;
