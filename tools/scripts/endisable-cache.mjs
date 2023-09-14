import fs from 'fs';
import path from 'path';

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
    cacheableOperations: ['build'],
    cacheableDirectories: ['node_modules'],
  };
} else {
  delete nxConfig.tasksRunnerOptions.default.options;
}

fs.writeFileSync(nxConfigPath, JSON.stringify(nxConfig, null, 2));

console.log('\n📝 Available commands:');
console.log('--enable=true: Enable the cache');
console.log('--enable=false: Disable the cache');
console.log('\n');
