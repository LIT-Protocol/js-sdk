import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { fileURLToPath } from 'url';

const ALLOW_LIST = [
  'ethers',
  '@lit-protocol/accs-schemas',
  '@lit-protocol/contracts',
  'crypto',
  'secp256k1',
  'cross-fetch',
];

const getPath = (relativePath) =>
  fileURLToPath(new URL(relativePath, import.meta.url));

/**
 * Common esbuild configuration options.
 * @param {string} entry - Entry file path.
 * @param {string} outfile - Output file path.
 * @param {string} [globalName] - Optional global name for the bundle.
 * @returns {esbuild.BuildOptions} Esbuild configuration object.
 */
const createBuildConfig = (entry, outfile, globalName) => ({
  entryPoints: [getPath(entry)],
  outfile: getPath(outfile),
  bundle: true,
  plugins: [
    nodeExternalsPlugin({
      allowList: ALLOW_LIST,
    }),
  ],
  platform: 'node',
  target: 'esnext',
  format: 'esm',
  inject: [getPath('./shim.mjs')],
  mainFields: ['module', 'main'],
  ...(globalName ? { globalName } : {}),
});

/**
 * Builds the CLI-enabled version of Tinny.
 */
export const build = async () => {
  await esbuild.build(createBuildConfig('./test.ts', './build/test.mjs'));
};

/**
 * Bundles Tinny as a standalone package.
 */
export const bundle = async () => {
  await esbuild.build(
    createBuildConfig('./index.ts', './index.js', 'tinnySdk')
  );
};

// Go!
(async () => {
  const start = Date.now();
  try {
    await build();
    await bundle();
    console.log(`[build.mjs] 🚀 Build time: ${Date.now() - start}ms`);
  } catch (error) {
    console.error(`[build.mjs] ❌ Build failed:`, error);
  }
})();
