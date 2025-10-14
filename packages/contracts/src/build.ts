import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function cleanDir(dir: string) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

function copyArtifacts({
  packageRoot,
  localDistPath,
  workspaceDistPath,
}: {
  packageRoot: string;
  localDistPath: string;
  workspaceDistPath: string;
}) {
  ensureDir(path.dirname(workspaceDistPath));
  cleanDir(workspaceDistPath);
  ensureDir(workspaceDistPath);
  cpSync(localDistPath, path.join(workspaceDistPath, 'dist'), {
    recursive: true,
  });
  cpSync(
    path.join(packageRoot, 'package.json'),
    path.join(workspaceDistPath, 'package.json')
  );
  const readmePath = path.join(packageRoot, 'README.md');
  if (existsSync(readmePath)) {
    cpSync(readmePath, path.join(workspaceDistPath, 'README.md'));
  }
}

async function main() {
  const currentFile = fileURLToPath(import.meta.url);
  const srcDir = path.dirname(currentFile);
  const packageRoot = path.resolve(srcDir, '..');
  const localDistPath = path.join(packageRoot, 'dist');
  const workspaceDistPath = path.resolve(
    packageRoot,
    '../../dist/packages/contracts'
  );

  if (!existsSync(localDistPath) || !statSync(localDistPath).isDirectory()) {
    throw new Error(
      'Local dist artifacts not found. Generate contracts manually before running the build.'
    );
  }

  console.log('📦 Syncing prebuilt contracts artifacts...');
  copyArtifacts({ packageRoot, localDistPath, workspaceDistPath });
  console.log('✅ Contracts artifacts synced to workspace dist.');
}

main().catch((error) => {
  console.error('💥 Contracts build failed:', error);
  process.exit(1);
});
