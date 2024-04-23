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
    entryPoints: [`${TEST_DIR}/test.ts`], // Use template literals to inject the variable
    outfile: `./${TEST_DIR}/build/test.mjs`, // Modify paths to use the TEST_DIR variable
    bundle: true,
    plugins: [
      nodeExternalsPlugin({
        allowList: ['ethers', '@lit-protocol/accs-schemas', 'crypto'],
      }),
    ],
    platform: 'node',
    target: 'esnext',
    format: 'esm',
    inject: [`./${TEST_DIR}/shim.mjs`], // Update inject path to use TEST_DIR
    mainFields: ['module', 'main'],
  });
};

/**
 * Inserts a polyfill at the beginning of a file.
 * The polyfill ensures that the global `fetch` function is available.
 * @returns {void}
 */
export const postBuildPolyfill = () => {
  const file = fs.readFileSync(`./${TEST_DIR}/build/test.mjs`, 'utf8'); // Use the TEST_DIR variable in the file path
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
  fs.writeFileSync(`./${TEST_DIR}/build/test.mjs`, newFile); // Use the TEST_DIR variable in the file path
};

// Go!
(async () => {
  const start = Date.now();
  await build();
  postBuildPolyfill();
  console.log(`[build.mjs] 🚀 Build time: ${Date.now() - start}ms`);
})();
