/** @type {import('esbuild').BuildOptions} */
const config = {
  loader: {
    '.wasm': 'binary',
  },
  logOverride: {
    'empty-import-meta': 'silent',
  },
};

module.exports = config;
