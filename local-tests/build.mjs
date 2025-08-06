import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs';

const TEST_DIR = 'local-tests';

/**
 * Builds the project using esbuild.
 * @returns {Promise<void>} A promise that resolves when the build is complete.
 */
export const build = async () => {
  await esbuild.build({
    entryPoints: [`${TEST_DIR}/test.ts`],
    outfile: `./${TEST_DIR}/build/test.mjs`,
    bundle: true,
    plugins: [
      nodeExternalsPlugin({
        allowList: [
          'ethers',
          '@lit-protocol/accs-schemas',
          '@lit-protocol/contracts',
          'crypto',
          'secp256k1',
        ],
      }),
    ],
    platform: 'node',
    target: 'esnext',
    format: 'esm',
    inject: [`./${TEST_DIR}/shim.mjs`],
    mainFields: ['module', 'main'],
  });

  await esbuild.build({
    entryPoints: [`${TEST_DIR}/health/index.ts`],
    outfile: `./${TEST_DIR}/build/health/index.mjs`,
    bundle: true,
    plugins: [
      nodeExternalsPlugin({
        allowList: [
          'ethers',
          '@lit-protocol/accs-schemas',
          '@lit-protocol/contracts',
          'crypto',
          'secp256k1',
        ],
      }),
    ],
    platform: 'node',
    target: 'esnext',
    format: 'esm',
    inject: [`./${TEST_DIR}/shim.mjs`],
    mainFields: ['module', 'main'],
  });
};

/**
 * Inserts a polyfill at the beginning of a file.
 * The polyfill ensures that the global `fetch` function is available.
 * @returns {void}
 */
export const postBuildPolyfill = () => {
  try {
    const file = fs.readFileSync(`./${TEST_DIR}/build/test.mjs`, 'utf8');
    const content = `import fetch from 'node-fetch';
try {
  if (!globalThis.fetch) {
    globalThis.fetch = fetch;
  }
} catch (error) {
  console.error('❌ Error in polyfill', error);
}
`;
    const newFile = content + file;
    fs.writeFileSync(`./${TEST_DIR}/build/test.mjs`, newFile);
  } catch (e) {
    throw new Error(`Error in postBuildPolyfill: ${e}`);
  }
};

/**
 * Adds crypto polyfill to health check build
 */
export const postBuildHealthPolyfill = () => {
  try {
    const file = fs.readFileSync(`./${TEST_DIR}/build/health/index.mjs`, 'utf8');
    const content = `// Additional crypto polyfill check
try {
  if (!globalThis.crypto && typeof webcrypto !== 'undefined') {
    globalThis.crypto = webcrypto;
  }
} catch (error) {
  console.error('❌ Error in crypto polyfill', error);
}
`;
    const newFile = content + file;
    fs.writeFileSync(`./${TEST_DIR}/build/health/index.mjs`, newFile);
  } catch (e) {
    throw new Error(`Error in postBuildHealthPolyfill: ${e}`);
  }
};

// Go!
(async () => {
  const start = Date.now();
  await build();
  postBuildPolyfill();
  postBuildHealthPolyfill();
  console.log(`[build.mjs] 🚀 Build time: ${Date.now() - start}ms`);
})();
