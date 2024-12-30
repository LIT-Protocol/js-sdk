import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/**
 * Build the CLI enabled version of Tinny.
 * @returns {Promise<void>} A promise that resolves when the build is complete.
 */
export const build = async () => {
  await esbuild.build({
    entryPoints: [fileURLToPath(new URL('./test.ts', import.meta.url))],
    outfile: fileURLToPath(new URL('./build/test.mjs', import.meta.url)),
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
    inject: [fileURLToPath(new URL('./shim.mjs', import.meta.url))],
    mainFields: ['module', 'main'],
  });
};

/**
 * Bundle Tinny to be a standalone package.
 */
export const bundle = async () => {
  await esbuild.build({
    entryPoints: [fileURLToPath(new URL('./index.ts', import.meta.url))],
    outfile: fileURLToPath(new URL('./index.js', import.meta.url)),
    bundle: true,
    globalName: 'tinnySdk',
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
    inject: [fileURLToPath(new URL('./shim.mjs', import.meta.url))],
    mainFields: ['module', 'main'],
  });
};

// Go!
(async () => {
  const start = Date.now();
  await build();
  await bundle();
  console.log(`[build.mjs] 🚀 Build time: ${Date.now() - start}ms`);
})();
