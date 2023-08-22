const { build } = require('esbuild');
const path = require('path');
const fs = require('fs');

const entryPoint = path.resolve(__dirname, 'src/modal.js');
const outputDir = 'packages/auth-browser/src/lib/connect-modal/modal.ts';

build({
  entryPoints: [entryPoint],
  bundle: true,
  // minify: true,
  sourcemap: false,
  outfile: outputDir,
  globalName: 'LitConnectModal',
  loader: {
    '.svg': 'dataurl',
    '.css': 'text',
  },
  sourceRoot: './',
  format: 'esm',
}).then(() => {
  // append @ts-nocheck to the top of the file
  const file = fs.readFileSync(outputDir, 'utf8');
  const newFileContent = `// @ts-nocheck\n${file}`;
  fs.writeFileSync(outputDir, newFileContent, 'utf8');
});
