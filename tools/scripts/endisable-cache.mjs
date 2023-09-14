import fs from 'fs';
import path from 'path';
import { greenLog } from './utils.mjs';

/**
 * This script enables or disables the cache in the nx.json file.
 * Usage: node endisable-cache.mjs --enable=true
 * --enable: Set to true to enable the cache, false to disable it.
 */

const args = process.argv.slice(2);
const enableCache =
  args.find((arg) => arg.startsWith('--enable'))?.split('=')[1] === 'true';

const nxConfigPath = path.join(process.cwd(), 'nx.json');
const nxConfig = JSON.parse(fs.readFileSync(nxConfigPath, 'utf-8'));

if (enableCache) {
  nxConfig.tasksRunnerOptions.default.options = {
    cacheableOperations: ['build', "test"],
    // cacheableDirectories: ['node_modules'],
  };
} else {
  delete nxConfig.tasksRunnerOptions.default.options;
}

fs.writeFileSync(nxConfigPath, JSON.stringify(nxConfig, null, 2));

greenLog('\n📝 This script enables or disables the cache in the nx.json file.\n', true);
greenLog('--enable=true: Enable the cache', true);
greenLog('--enable=false: Disable the cache', true);
process.exit();