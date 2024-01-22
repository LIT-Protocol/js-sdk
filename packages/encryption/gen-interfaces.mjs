import { exit } from 'process';
import { compile } from 'json-schema-to-typescript';

import {
  getFiles,
  greenLog,
  readJsonFile,
  writeFile,
} from '../../tools/scripts/utils.mjs';

const INPUT_DIR = './packages/encryption/src/lib/schemas';
const OUTPUT_DIR = './packages/encryption/src/lib/generated';

const files = (await getFiles(INPUT_DIR))
  .filter((file) => file.includes('.json'));

const jsonFiles = await Promise.all(files
  .map((file) => readJsonFile(`${INPUT_DIR}/${file}`)));

jsonFiles.forEach(async (jsonFile) => {
  const ts = await compile(jsonFile, jsonFile.title);
  await writeFile(`${OUTPUT_DIR}/${jsonFile.title}.ts`, ts);
});

greenLog('✅ Successfully generated interfaces from schemas', true);

const indexFileContent = jsonFiles.map((jsonFile) => `export * from './${jsonFile.title}';`).join('\n');
await writeFile(`${OUTPUT_DIR}/index.ts`, indexFileContent);

greenLog('✅ Successfully generated index.ts', true);

exit();
