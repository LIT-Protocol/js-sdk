#!/usr/bin/env node

/**
 * E2E Published Package Test Script
 *
 * This script replaces peer dependency versions in ./e2e/package.json with a specified version
 * and then runs the e2e tests in the naga-local network environment.
 *
 * Usage: bun run test:e2e:published <version_number>
 * Example: bun run test:e2e:published 8.0.0-prealpha-886.4
 */

import { readFile, writeFile, rm } from 'fs/promises';
import { spawn } from 'child_process';

import path from 'path';
import { existsSync } from 'fs';

// Configuration
const E2E_PACKAGE_JSON_PATH = './e2e/package.json';
const E2E_DIRECTORY = './e2e';

// Global state to track if cleanup is needed
let needsCleanup = false;
let isCleaningUp = false;
let currentTestProcess = null;
let isShuttingDown = false;

/**
 * Main execution function
 */
async function main() {
  const version = process.argv[2];

  if (!version) {
    console.error('❌ Error: Version number is required');
    console.log('Usage: bun run test:e2e:published <version_number>');
    console.log('Example: bun run test:e2e:published 8.0.0-prealpha-886.4');
    process.exit(1);
  }

  console.log(
    `🚀 Starting E2E published package test with version: ${version}`
  );

  let testsPassed = false;

  try {
    // Step 1: Update peer dependencies in e2e/package.json
    await updatePeerDependencies(version);
    needsCleanup = true; // Mark that cleanup is needed after this point

    // Step 2: Install dependencies to ensure we're using published packages
    await installDependencies();

    // Step 3: Verify installed package versions
    await verifyInstalledVersions(version);

    // Step 4: Run e2e tests in naga-local network
    await runE2ETests();

    testsPassed = true;
    console.log('✅ E2E published package test completed successfully!');
  } catch (error) {
    console.error('❌ E2E published package test failed:', error.message);
    testsPassed = false;
  } finally {
    // Step 3: Always cleanup regardless of success or failure
    if (needsCleanup && !isCleaningUp) {
      try {
        await cleanup();
      } catch (cleanupError) {
        console.error('⚠️  Cleanup failed:', cleanupError.message);
      }
    }
  }

  if (!testsPassed) {
    process.exit(1);
  }
}

/**
 * Updates peer dependencies in e2e/package.json
 * @param {string} version - The version to replace "*" with
 */
async function updatePeerDependencies(version) {
  console.log('📝 Updating peer dependencies in e2e/package.json...');

  try {
    // Read the current package.json
    const packageJsonContent = await readFile(E2E_PACKAGE_JSON_PATH, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    // Replace all "*" versions in peerDependencies with the specified version
    if (packageJson.peerDependencies) {
      for (const [depName, depVersion] of Object.entries(
        packageJson.peerDependencies
      )) {
        if (depVersion === '*') {
          packageJson.peerDependencies[depName] = version;
          console.log(`   ✓ Updated ${depName}: "*" → "${version}"`);
        }
      }
    }

    // Write the updated package.json
    await writeFile(
      E2E_PACKAGE_JSON_PATH,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log('✅ Peer dependencies updated successfully');
  } catch (error) {
    throw new Error(`Failed to update peer dependencies: ${error.message}`);
  }
}

/**
 * Installs dependencies to ensure we're using published packages
 */
async function installDependencies() {
  console.log('📦 Installing dependencies from npm...');

  return new Promise((resolve, reject) => {
    const command = 'bun';
    const args = ['install'];

    console.log(`   Running: ${command} ${args.join(' ')}`);
    console.log('📋 Install Output:');
    console.log('─'.repeat(60));

    const installProcess = spawn(command, args, {
      cwd: E2E_DIRECTORY,
      stdio: 'inherit',
    });

    currentTestProcess = installProcess; // Track for signal handling

    installProcess.on('close', (code) => {
      currentTestProcess = null;
      console.log('─'.repeat(60));
      if (code === 0) {
        console.log('✅ Dependencies installed successfully');
        resolve();
      } else {
        reject(
          new Error(`Dependency installation failed with exit code ${code}`)
        );
      }
    });

    installProcess.on('error', (error) => {
      currentTestProcess = null;
      reject(
        new Error(`Failed to start dependency installation: ${error.message}`)
      );
    });
  });
}

/**
 * Verifies that the correct package versions are installed
 */
async function verifyInstalledVersions(expectedVersion) {
  console.log('🔍 Verifying installed package versions...');

  try {
    const nodeModulesPath = path.join(E2E_DIRECTORY, 'node_modules');
    const packagesToCheck = [
      '@lit-protocol/auth',
      '@lit-protocol/lit-client',
      '@lit-protocol/networks',
    ];

    for (const packageName of packagesToCheck) {
      const packageJsonPath = path.join(
        nodeModulesPath,
        packageName,
        'package.json'
      );

      if (existsSync(packageJsonPath)) {
        const packageContent = await readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        const installedVersion = packageJson.version;

        if (installedVersion === expectedVersion) {
          console.log(`   ✅ ${packageName}: ${installedVersion} ✓`);
        } else {
          console.log(
            `   ❌ ${packageName}: expected ${expectedVersion}, got ${installedVersion}`
          );
          throw new Error(
            `Version mismatch for ${packageName}: expected ${expectedVersion}, got ${installedVersion}`
          );
        }
      } else {
        throw new Error(`Package ${packageName} not found in node_modules`);
      }
    }

    console.log('✅ All package versions verified successfully');
  } catch (error) {
    throw new Error(`Failed to verify package versions: ${error.message}`);
  }
}

/**
 * Runs the e2e tests in the naga-local network environment
 */
async function runE2ETests() {
  console.log('🧪 Running E2E tests in naga-local network...');

  return new Promise((resolve, reject) => {
    const command = 'bun';
    const args = ['run', 'test:e2e', 'all', '--timeout', '50000000'];

    console.log(`   Running: NETWORK=naga-local ${command} ${args.join(' ')}`);
    console.log('📋 Test Output (real-time):');
    console.log('─'.repeat(60));

    const testProcess = spawn(command, args, {
      cwd: E2E_DIRECTORY,
      env: { ...process.env, NETWORK: 'naga-local' },
      stdio: 'inherit', // This enables real-time output
    });

    currentTestProcess = testProcess; // Store reference for signal handling

    testProcess.on('close', (code) => {
      currentTestProcess = null; // Clear reference
      console.log('─'.repeat(60));
      if (code === 0) {
        console.log('✅ E2E tests completed successfully');
        resolve();
      } else {
        reject(new Error(`E2E tests failed with exit code ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      currentTestProcess = null; // Clear reference
      reject(new Error(`Failed to start E2E tests: ${error.message}`));
    });
  });
}

/**
 * Reverts peer dependencies back to "*" in e2e/package.json
 */
async function revertPeerDependencies() {
  console.log('🔄 Reverting peer dependencies back to "*"...');

  try {
    // Read the current package.json
    const packageJsonContent = await readFile(E2E_PACKAGE_JSON_PATH, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);

    // Revert all @lit-protocol peer dependencies back to "*"
    if (packageJson.peerDependencies) {
      for (const [depName, depVersion] of Object.entries(
        packageJson.peerDependencies
      )) {
        if (depName.startsWith('@lit-protocol/') && depVersion !== '*') {
          packageJson.peerDependencies[depName] = '*';
          console.log(`   ✓ Reverted ${depName}: "${depVersion}" → "*"`);
        }
      }
    }

    // Write the reverted package.json
    await writeFile(
      E2E_PACKAGE_JSON_PATH,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log('✅ Peer dependencies reverted successfully');
  } catch (error) {
    throw new Error(`Failed to revert peer dependencies: ${error.message}`);
  }
}

/**
 * Cleans up files and directories created during the test
 */
async function cleanup() {
  if (isCleaningUp) return; // Prevent multiple cleanup attempts
  isCleaningUp = true;

  console.log('🧹 Starting cleanup...');

  // Step 1: Remove node_modules in e2e directory
  const nodeModulesPath = path.join(E2E_DIRECTORY, 'node_modules');
  if (existsSync(nodeModulesPath)) {
    console.log('   🗑️  Removing ./e2e/node_modules...');
    await rm(nodeModulesPath, { recursive: true, force: true });
    console.log('   ✓ node_modules removed');
  } else {
    console.log('   ℹ️  node_modules not found, skipping');
  }

  // Step 2: Remove bun.lock in e2e directory
  const bunLockPath = path.join(E2E_DIRECTORY, 'bun.lock');
  if (existsSync(bunLockPath)) {
    console.log('   🗑️  Removing ./e2e/bun.lock...');
    await rm(bunLockPath, { force: true });
    console.log('   ✓ bun.lock removed');
  } else {
    console.log('   ℹ️  bun.lock not found, skipping');
  }

  // Step 3: Revert peer dependencies back to "*"
  await revertPeerDependencies();

  console.log('✅ Cleanup completed successfully');
}

/**
 * Handles graceful shutdown when the process is interrupted
 */
async function handleGracefulShutdown(signal) {
  // Prevent multiple signal handlers from running
  if (isShuttingDown) {
    console.log(`\n⏳ Already shutting down, ignoring ${signal}...`);
    return;
  }

  isShuttingDown = true;
  console.log(`\n⚠️  Received ${signal}. Performing cleanup before exit...`);

  // Kill the test process if it's running
  if (currentTestProcess && !currentTestProcess.killed) {
    console.log('🛑 Terminating running test process...');
    try {
      currentTestProcess.kill('SIGTERM');
      // Give it a moment to terminate gracefully
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (!currentTestProcess.killed) {
        currentTestProcess.kill('SIGKILL');
      }
    } catch (error) {
      console.log('⚠️  Error terminating test process:', error.message);
    }
  }

  // Only cleanup if we haven't already started
  if (needsCleanup && !isCleaningUp) {
    try {
      // Temporarily ignore signals during cleanup to prevent interruption
      process.removeAllListeners('SIGINT');
      process.removeAllListeners('SIGTERM');
      process.removeAllListeners('SIGHUP');
      
      await cleanup();
    } catch (cleanupError) {
      console.error('❌ Cleanup failed during shutdown:', cleanupError.message);
    }
  }

  console.log('👋 Cleanup completed. Exiting...');
  process.exit(0);
}

// Register signal handlers for graceful shutdown
process.on('SIGINT', handleGracefulShutdown.bind(null, 'SIGINT')); // Ctrl+C
process.on('SIGTERM', handleGracefulShutdown.bind(null, 'SIGTERM')); // Termination signal
process.on('SIGHUP', handleGracefulShutdown.bind(null, 'SIGHUP')); // Hang up signal

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught exception:', error);
  if (needsCleanup && !isCleaningUp) {
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error(
        '❌ Cleanup failed during exception handling:',
        cleanupError.message
      );
    }
  }
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  if (needsCleanup && !isCleaningUp) {
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error(
        '❌ Cleanup failed during rejection handling:',
        cleanupError.message
      );
    }
  }
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
