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
        allowList: ['ethers', '@lit-protocol/accs-schemas', 'crypto'],
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
    const content = `import fetch from 'cross-fetch';
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

// Go!
(async () => {
  const start = Date.now();
  await build();
  postBuildPolyfill();
  console.log(`[build.mjs] 🚀 Build time: ${Date.now() - start}ms`);
})();
