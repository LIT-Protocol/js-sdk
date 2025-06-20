import { generateSignaturesFromContext } from '@lit-protocol/contracts/custom-network-signatures';

const JSON_FILE_PATH = process.env['NETWORK_CONFIG'] as string;

console.log('JSON_FILE_PATH:', JSON_FILE_PATH);

if (!JSON_FILE_PATH) {
  throw new Error(
    '❌ NETWORK_CONFIG is not set. Please set it in your .env file.'
  );
}

async function main() {
  await generateSignaturesFromContext({
    jsonFilePath: JSON_FILE_PATH,
    networkName: 'naga-develop',
    outputDir: '../generated',
    useScriptDirectory: true,

    // @ts-ignore
    callerPath: import.meta.url,
  });
}

// gogogo!
main().catch(console.error);
