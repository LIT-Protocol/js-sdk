const esbuild = require('esbuild');

(async () => {
  await esbuild.build({
    entryPoints: [
      './src/lib/litActions/solana/src/signAndSendTxWithSolanaEncryptedKey.js',
    ],
    bundle: true,
    minify: false,
    sourcemap: false,
    outfile:
      './src/lib/litActions/solana/dist/signAndSendTxWithSolanaEncryptedKey.js',
    inject: ['./buffer.shim.js'],
  });
})();
