import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packagesToPack = [
  {
    name: '@lit-protocol/auth',
    distDir: resolve('dist/packages/auth'),
  },
  {
    name: '@lit-protocol/crypto',
    distDir: resolve('dist/packages/crypto'),
  },
];

const packPackage = ({ distDir, name }) => {
  const packOutput = execSync('npm pack --json', {
    cwd: distDir,
    encoding: 'utf8',
  });

  const [packResult] = JSON.parse(packOutput);

  if (!packResult?.filename) {
    throw new Error(`npm pack did not return a tarball filename for ${name}.`);
  }

  return `file:../../dist/packages/${name.split('/')[1]}/${packResult.filename}`;
};

const tarballPaths = new Map();

for (const pkg of packagesToPack) {
  tarballPaths.set(pkg.name, packPackage(pkg));
}

const appPackagePaths = [
  resolve('app-tests/nextjs/package.json'),
  resolve('app-tests/tanstack/package.json'),
];

for (const appPackagePath of appPackagePaths) {
  if (!existsSync(appPackagePath)) {
    continue;
  }

  const appPackage = JSON.parse(readFileSync(appPackagePath, 'utf8'));
  const dependencies = appPackage.dependencies ?? {};

  for (const [name, tarballPath] of tarballPaths.entries()) {
    dependencies[name] = tarballPath;
  }

  appPackage.dependencies = dependencies;
  writeFileSync(appPackagePath, JSON.stringify(appPackage, null, 2) + '\n');
}
