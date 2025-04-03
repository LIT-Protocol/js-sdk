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

// If this is not included, you will get the following error when running it in Jest:
// (Error) Details: Request is not defined
// The problem is that Jest is running in a Node.js environment where the global Request API (part of the Fetch API) might not be available or properly configured. Bun, on the other hand, has this API built into its runtime by default, which is why it works.
const { default: fetch, Request, Response } = require('node-fetch');
global.fetch = fetch;
global.Request = Request;
global.Response = Response;
