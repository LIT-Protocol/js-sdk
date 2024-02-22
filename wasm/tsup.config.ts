import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  format: 'esm',
  target: 'es2022',
  dts: true,
  platform: 'neutral',
  esbuildOptions: (options) => {
    options.loader ??= {};
    options.loader['.wasm'] = 'binary';
    options.logOverride ??= {};
    options.logOverride['empty-import-meta'] = 'silent';
  },
  tsconfig: 'tsconfig.lib.json',
});
