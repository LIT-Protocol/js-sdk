import fs from 'fs';
import {
  greenLog,
  readFile,
  redLog,
  writeFile,
} from '../../tools/scripts/utils.mjs';

const TARGET_FILE = 'dist/packages/encryption/src/lib/encryption.js';

const fileContent = await readFile(TARGET_FILE);

const newContent = fileContent.replace(
  `const ipfsClient = require("ipfs-http-client");`,
  `// The following line is automatically modified by encryption/postbuild.mjs
  let ipfsClient = null;
  try{
    ipfsClient = require("ipfs-http-client");
  }catch(e){
    console.log("ipfs-http-client is not supported in this environment!");
  }
  // The above line is automatically modified by encryption/postbuild.mjs`
);

try {
  await writeFile(TARGET_FILE, newContent);
  greenLog(`✅ Successfully wrote to ${TARGET_FILE}`, true);
} catch (e) {
  redLog(`Failed to write to ${TARGET_FILE}!`, true);
}

process.exit();
