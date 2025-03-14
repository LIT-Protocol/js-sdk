const crypto = require('crypto');

global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;
global.crypto = crypto;

if (!global.crypto.subtle) {
  global.crypto.subtle = {
    digest: async (algorithm, data) => {
      const algo = algorithm.toLowerCase().replace('-', '');
      const hash = crypto.createHash(algo);
      hash.update(Buffer.from(data));
      return hash.digest().buffer;
    },
  };
}
