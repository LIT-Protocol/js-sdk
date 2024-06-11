const esbuild = require('esbuild');

(async () => {
  await esbuild.build({
    entryPoints: [
      './src/lib/litActions/solana/src/signAndSendTxWithSolanaEncryptedKey.js',
      './src/lib/litActions/solana/src/signMessageWithSolanaEncryptedKey.js',
    ],
    bundle: true,
    minify: false,
    sourcemap: false,
    outdir: './src/lib/litActions/solana/dist',
    inject: ['./buffer.shim.js'],
  });
})();
