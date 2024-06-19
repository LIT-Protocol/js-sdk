const esbuild = require('esbuild');

(async () => {
  await esbuild.build({
    entryPoints: [
      './src/lib/litActions/solana/src/signTransactionWithSolanaEncryptedKey.js',
      './src/lib/litActions/solana/src/signMessageWithSolanaEncryptedKey.js',
    ],
    bundle: true,
    minify: true,
    sourcemap: false,
    outdir: './src/lib/litActions/solana/dist',
    inject: ['./buffer.shim.js'],
  });
})();
