import { exit } from 'process';
import { compile } from 'json-schema-to-typescript';

import {
  getFiles,
  greenLog,
  readJsonFile,
  writeFile,
} from '../../tools/scripts/utils.mjs';

const INPUT_DIR = './packages/encryption/src/lib/schemas';
const OUTPUT_DIR = './packages/types/src/generated/access-control-conditions';

const files = (await getFiles(INPUT_DIR))
  .filter((file) => file.includes('.json'));

const jsonFiles = await Promise.all(files
  .map((file) => readJsonFile(`${INPUT_DIR}/${file}`)));

const tsFiles = jsonFiles.map(async (jsonFile) => {
  const ts = await compile(jsonFile, jsonFile.title);
  await writeFile(`${OUTPUT_DIR}/${jsonFile.title}.ts`, ts);
});
await Promise.all(tsFiles);

greenLog('✅ Successfully generated interfaces from schemas', true);

const indexFileContent = jsonFiles.map((jsonFile) => `export * from './${jsonFile.title}';`).join('\n');
await writeFile(`${OUTPUT_DIR}/index.ts`, indexFileContent);

greenLog('✅ Successfully generated index.ts', true);

exit();
