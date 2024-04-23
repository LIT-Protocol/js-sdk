// yarn remove cross-fetch -W && yarn && yarn add esbuild-node-externals ipfs-http-client@56.0.0 node-fetch -W -D && rm yarn.lock && yarn && yarn build:dev
// node ./local-tests/build.mjs && node ./local-tests/build/test.mjs

// ✅ This is working
// 1. git checkout d0a54556fa62cddda6be091b6f091655c77b49f3
// 2. yarn add esbuild-node-externals -W -D
// 3. node ./local-tests/build.mjs && node ./local-tests/build/test.mjs

// ❌ This is not working
// 1. git checkout ed3806a6bc8fc792f29e126996cbf180395ee967
// 2. yarn add esbuild-node-externals -W -D
// ❌ Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './to-string' is not defined by "exports" in /Users/anson/Projects/test-build/node_modules/uint8arrays/package.json
// 3. yarn add ipfs-http-client@56.0.0 -W -D
// ❌ Error: Error fetching data from https://lit-general-worker.getlit.dev/manzano-contract-addresses: TypeError: fetch is not a function
// 4. yarn add node-fetch@2.6.1 -W -D
// ✅ Solution
// - yarn add esbuild-node-externals ipfs-http-client@56.0.0 node-fetch@2.6.1 -W -D

// ❌ This is not working
// 1. git checkout fe87372c4fd2c825639215176e9c1aff48915d62
// 2. yarn add esbuild-node-externals ipfs-http-client@56.0.0 node-fetch@2.6.1 -W -D
// ❌ Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/Users/anson/Projects/test-build/node_modules/cross-fetch/polyfill' is not supported resolving ES modules imported from /Users/anson/Projects/test-build/local-tests/build/test.mjs Did you mean to import cross-fetch/dist/node-polyfill.js?
// 3. Go to `./packages/lit-node-client-nodejs/src/index.ts and change `import 'cross-fetch/polyfill';` to `import 'cross-fetch/dist/node-polyfill.js';`
// ❌ Error: could not detect network (event="noNetwork", code=NETWORK_ERROR, version=providers/5.7.2) at _Logger.makeError (file:///Users/anson/Projects/test-build/local-tests/build/test.mjs:3165:23)

// Note: Tried on Node version 18, 19, 20, 21

import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

await esbuild.build({
  entryPoints: ['local-tests/test.ts'],
  outfile: 'local-tests/build/test.mjs',
  bundle: true,
  plugins: [
    nodeExternalsPlugin({
      allowList: ['ethers', '@lit-protocol/accs-schemas', 'crypto'],
    }),
  ],
  platform: 'node',
  target: 'esnext',
  format: 'esm',
  inject: ['./local-tests/shim.mjs'],
  external: ['crypto'],
  mainFields: ['module', 'main'],
});
