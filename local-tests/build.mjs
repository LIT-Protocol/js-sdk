// Import the necessary plugin
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
