import fs from 'fs';
import {
  greenLog,
  readFile,
  redLog,
  writeFile,
} from '../../tools/scripts/utils.mjs';

const TARGET_FILE = 'dist/packages/ecdsa-sdk/src/lib/ecdsa-sdk.js';

const fileContent = await readFile(TARGET_FILE);

const newContent = fileContent.replace(
  `var input = pako_1.default.inflate(base64ToUint8Array(b));`,
  `// The following line is automatically modified by encryption/postbuild.mjs
    var input = pako_1.inflate(base64ToUint8Array(b));
    // The above line is automatically modified by encryption/postbuild.mjs`
);

try {
  await writeFile(TARGET_FILE, newContent);
  greenLog(`✅ Successfully wrote to ${TARGET_FILE}`, true);
} catch (e) {
  redLog(`Failed to write to ${TARGET_FILE}!`, true);
}

process.exit();
