import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createHash } from 'crypto';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const execAsync = promisify(exec);

async function hashFile(filePath: string): Promise<string> {
  const content = await readFile(filePath);
  return createHash('sha256').update(content).digest('hex');
}

async function hashDirectory(directoryPath: string): Promise<Map<string, string>> {
  const files = await readdir(directoryPath);
  const hashMap = new Map<string, string>();

  for (const file of files) {
    if (file.endsWith('.ts') && !file.includes('spec')) { // Exclude test files like this one
      const filePath = path.join(directoryPath, file);
      const fileHash = await hashFile(filePath);
      hashMap.set(file, fileHash);
    }
  }

  return hashMap;
}

async function runNpmScript(command: string) {
  const { stdout, stderr } = await execAsync(command);
  console.log(stdout);
  if (stderr) {
    console.error('Error:', stderr);
  }
}

jest.setTimeout(60000);

describe('ACC interfaces', () => {
  // This test is not idempotent. Running it will update TS interfaces definitions so a second run will succeed even when first one failed.
  it('should have updated TS definitions based on JSON schemas', async () => {
    const interfacesDirectory = '../../../../types/src/generated/access-control-conditions';

    const initialHashes = await hashDirectory(path.join(__dirname, interfacesDirectory));

    // update TS interfaces based on current JSON schemas
    await runNpmScript('yarn update:encryption --gen');

    const updatedHashes = await hashDirectory(path.join(__dirname, interfacesDirectory));

    expect(initialHashes.size).toEqual(updatedHashes.size);

    let hasChanged = false;
    for (const [file, hash] of updatedHashes) {
      if (initialHashes.get(file) !== hash) {
        hasChanged = true;
        console.log(`File ${file} has changed`);
      }
    }

    expect(hasChanged).toBe(false); // No interface changed when running the script
  });
});
