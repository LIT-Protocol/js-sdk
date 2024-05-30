import * as esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs';

const TEST_DIR = 'local-tests';

const log = (message) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

/**
 * Builds the project using esbuild.
 * @returns {Promise<void>} A promise that resolves when the build is complete.
 */
export const build = async () => {
  log('Starting build process...');
  try {
    await esbuild.build({
      entryPoints: [`${TEST_DIR}/test.ts`],
      outfile: `./${TEST_DIR}/build/test.mjs`,
      bundle: true,
      plugins: [
        nodeExternalsPlugin({
          allowList: [
            'ethers',
            '@lit-protocol/accs-schemas',
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
    log('✅ Build process completed successfully.');
  } catch (e) {
    log(`❌ Build process failed: ${error}`);
    throw error;
  }
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
    log('✅ Polyfill added successfully.');
  } catch (e) {
    log(`❌ Error in postBuildPolyfill: ${e}`);
    throw new Error(`Error in postBuildPolyfill: ${e}`);
  }
};

/**
 * Copies the package.json file to the build directory and adds the root package.json dependencies to the build package.json.
 * @throws {Error} If there is an error in copying the package.json file or updating the dependencies.
 */
export const postBuildMoveAndSetupPackageJsonToBuildDir = () => {
  const ROOT_PACKAGEJSON = './package.json';
  const COPY_FROM = `./${TEST_DIR}/package.temp.json`;
  const COPY_TO = `./${TEST_DIR}/build/package.json`;

  // -- Copy the package.json file to the build directory
  try {
    fs.copyFileSync(COPY_FROM, COPY_TO);
    log('✅ package.json copied successfully.');
  } catch (e) {
    log(`❌ Error in copying package.json: ${e}`);
    throw new Error(
      `Error in postBuildMoveAndSetupPackageJsonToBuildDir: ${e}`
    );
  }

  // -- Copy the root package.json dependencies to the build package.json
  try {
    const rootPackageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGEJSON));
    const buildPackageJson = JSON.parse(fs.readFileSync(COPY_TO));

    // Add the dependencies to the build package.json
    buildPackageJson.dependencies = rootPackageJson.dependencies;

    // Write the updated package.json
    fs.writeFileSync(COPY_TO, JSON.stringify(buildPackageJson, null, 2));
    log('✅ Dependencies added to build package.json successfully.');
  } catch (e) {
    log(`❌ Error in setting up build package.json: ${e}`);
    throw new Error(
      `Error in postBuildMoveAndSetupPackageJsonToBuildDir: ${e}`
    );
  }
};

// Go!
(async () => {
  log('Build script started.');
  const start = Date.now();
  try {
    await build();
    postBuildPolyfill();
    postBuildMoveAndSetupPackageJsonToBuildDir();
    log(`🚀 Build time: ${Date.now() - start}ms`);
  } catch (error) {
    log(`❌ Build script failed: ${error}`);
  }
})();
