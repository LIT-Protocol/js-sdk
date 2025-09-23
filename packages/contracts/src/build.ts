import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build as runEsbuild } from 'esbuild';
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import { runContractsSync } from './index';

async function main() {
  const currentFile = fileURLToPath(import.meta.url);
  const srcDir = path.dirname(currentFile);
  const packageRoot = path.resolve(srcDir, '..');
  const localDistPath = path.join(packageRoot, 'dist');
  const workspaceDistPath = path.resolve(
    packageRoot,
    '../../dist/packages/contracts'
  );
  const customSignaturesEntry = path.join(
    packageRoot,
    'src/custom-network-signatures.ts'
  );

  process.chdir(packageRoot);

  const ensureDir = (dir: string) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  };

  const cleanDir = (dir: string) => {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  };

  const buildCustomSignatures = async () => {
    ensureDir(localDistPath);
    await runEsbuild({
      entryPoints: [customSignaturesEntry],
      outfile: path.join(localDistPath, 'custom-network-signatures.js'),
      platform: 'node',
      target: 'node20',
      format: 'esm',
      bundle: true,
      sourcemap: false,
    });

    await runEsbuild({
      entryPoints: [customSignaturesEntry],
      outfile: path.join(localDistPath, 'custom-network-signatures.cjs'),
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      bundle: true,
      sourcemap: false,
    });
  };

  const emitDeclarations = () => {
    const require = createRequire(import.meta.url);
    const tscPath = require.resolve('typescript/bin/tsc');
    execFileSync(
      process.execPath,
      [tscPath, '-p', path.join(packageRoot, 'tsconfig.lib.json')],
      {
        stdio: 'inherit',
      }
    );
  };

  const copyToWorkspaceDist = () => {
    ensureDir(path.dirname(workspaceDistPath));
    cleanDir(workspaceDistPath);
    cpSync(localDistPath, workspaceDistPath, { recursive: true });
    cpSync(
      path.join(packageRoot, 'package.json'),
      path.join(workspaceDistPath, 'package.json')
    );
    const readmePath = path.join(packageRoot, 'README.md');
    if (existsSync(readmePath)) {
      cpSync(readmePath, path.join(workspaceDistPath, 'README.md'));
    }
  };

  cleanDir(localDistPath);
  await buildCustomSignatures();
  await runContractsSync();
  emitDeclarations();
  copyToWorkspaceDist();
}

main().catch((error) => {
  console.error('💥 Contracts build failed:', error);
  process.exit(1);
});
