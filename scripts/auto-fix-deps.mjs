#!/usr/bin/env node

/**
 * Auto-fix Dependencies Script
 *
 * This script automatically detects missing dependencies using depcheck
 * and adds them to the respective package.json files with correct versions
 * from the workspace root.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Packages to process (excluding wrapped-keys)
const PACKAGES = [
  'auth-services',
  'networks',
  'auth',
  'lit-client',
  'auth-helpers',
  'crypto',
  'types',
  'logger',
  'schemas',
  'constants',
  'wasm',
  'access-control-conditions',
  'access-control-conditions-schemas',
];

async function main() {
  console.log('🔍 Auto-fixing dependencies...\n');

  // Load root package.json for version references
  const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const allRootDeps = { ...rootPkg.dependencies, ...rootPkg.devDependencies };
  const rootDevDeps = rootPkg.devDependencies || {};

  for (const pkg of PACKAGES) {
    console.log(`📦 Processing ${pkg}...`);

    try {
      // Run depcheck and capture output (ignore exit code since missing deps = status 1)
      let output;
      let result;

      try {
        output = execSync(`cd packages/${pkg} && depcheck --json`, {
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        });
        result = JSON.parse(output);
      } catch (error) {
        // depcheck exits with status 1 when it finds issues, but still provides valid JSON
        if (error.stdout) {
          try {
            result = JSON.parse(error.stdout);
          } catch (parseError) {
            console.log(
              `  ❌ Failed to parse depcheck output for ${pkg}: ${parseError.message}\n`
            );
            continue;
          }
        } else {
          console.log(
            `  ❌ Failed to run depcheck for ${pkg}: ${error.message}\n`
          );
          continue;
        }
      }

      const missingDeps = Object.keys(result.missing || {});

      // Filter out dev dependencies and type definitions
      const realMissingDeps = missingDeps.filter((dep) => {
        // Ignore if it's in root devDependencies
        if (rootDevDeps[dep]) {
          console.log(`    🚫 Ignoring ${dep} (dev dependency)`);
          return false;
        }

        // Ignore TypeScript type definitions
        if (dep.startsWith('@types/')) {
          console.log(`    🚫 Ignoring ${dep} (type definition)`);
          return false;
        }

        return true;
      });

      if (realMissingDeps.length > 0) {
        console.log(
          `  ➕ Adding ${realMissingDeps.length} missing dependencies`
        );

        // Load package.json
        const pkgPath = `packages/${pkg}/package.json`;
        const pkgJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

        // Initialize dependencies if not exists
        if (!pkgJson.dependencies) pkgJson.dependencies = {};

        // Add missing dependencies
        for (const dep of realMissingDeps) {
          let version;

          // Handle workspace dependencies
          if (dep.startsWith('@lit-protocol/')) {
            // version = 'workspace:*';
          }
          // Get version from root package.json
          else if (allRootDeps[dep]) {
            version = allRootDeps[dep];
          }
          // Default to latest for external deps
          else {
            // throw new Error(`${dep}: no version found, using ^1.0.0`);
            // version = '^1.0.0';
            // console.log(`    ⚠️  ${dep}: no version found, using ^1.0.0`);
          }

          pkgJson.dependencies[dep] = version;
          console.log(`    ✅ ${dep}@${version}`);
        }

        // Sort dependencies alphabetically
        const sortedDeps = {};
        Object.keys(pkgJson.dependencies)
          .sort()
          .forEach((key) => {
            sortedDeps[key] = pkgJson.dependencies[key];
          });
        pkgJson.dependencies = sortedDeps;

        // Write back to file
        fs.writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');

        console.log(`  ✅ Updated ${pkg}/package.json\n`);
      } else {
        console.log(`  ✅ No missing dependencies\n`);
      }
    } catch (error) {
      console.log(
        `  ❌ Unexpected error processing ${pkg}: ${error.message}\n`
      );
    }
  }

  console.log('🎉 Auto-fix complete! Run build now.');
}

main().catch(console.error);
