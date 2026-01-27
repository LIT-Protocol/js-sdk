import { execSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
import { resolve } from 'node:path';

const npmCacheDir = resolve('tmp/npm-cache');
if (!existsSync(npmCacheDir)) {
  mkdirSync(npmCacheDir, { recursive: true });
}

const appPaths = [
  resolve('app-tests/nextjs'),
  resolve('app-tests/tanstack'),
  resolve('app-tests/vite-react'),
  resolve('app-tests/svelte'),
];

const getTarballPaths = (dependencies, baseDir) =>
  Object.values(dependencies ?? {})
    .filter((value) => value.startsWith('file:'))
    .map((value) => resolve(baseDir, value.slice('file:'.length)));

const shouldInstall = (appPath, appPackage, lockPath) => {
  const nodeModulesPath = resolve(appPath, 'node_modules');
  if (!existsSync(nodeModulesPath)) {
    return true;
  }

  if (!existsSync(lockPath)) {
    return true;
  }

  const lockMtime = statSync(lockPath).mtimeMs;
  if (statSync(resolve(appPath, 'package.json')).mtimeMs > lockMtime) {
    return true;
  }

  const tarballPaths = getTarballPaths(appPackage.dependencies, appPath);
  return tarballPaths.some(
    (tarballPath) =>
      existsSync(tarballPath) && statSync(tarballPath).mtimeMs > lockMtime
  );
};

const cleanupExistingInstall = (appPath) => {
  const nodeModulesPath = resolve(appPath, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    rmSync(nodeModulesPath, {
      recursive: true,
      force: true,
      maxRetries: 3,
      retryDelay: 100,
    });
  }

  const lockPath = resolve(appPath, 'package-lock.json');
  if (existsSync(lockPath)) {
    rmSync(lockPath, { force: true });
  }
};

for (const appPath of appPaths) {
  if (!existsSync(appPath)) {
    continue;
  }

  const packageJsonPath = resolve(appPath, 'package.json');
  if (!existsSync(packageJsonPath)) {
    continue;
  }

  const packageLockPath = resolve(appPath, 'package-lock.json');
  const appPackage = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  if (!shouldInstall(appPath, appPackage, packageLockPath)) {
    continue;
  }

  cleanupExistingInstall(appPath);

  const runInstall = (allowRetry, force) => {
    try {
      execSync(
        `npm install --no-audit --no-fund --progress=false${force ? ' --force' : ''}`,
        {
          cwd: appPath,
          stdio: 'inherit',
          env: {
            ...process.env,
            npm_config_cache: npmCacheDir,
          },
        }
      );
    } catch (error) {
      if (!allowRetry) {
        throw error;
      }

      cleanupExistingInstall(appPath);
      runInstall(false, true);
    }
  };

  runInstall(true, false);
}
