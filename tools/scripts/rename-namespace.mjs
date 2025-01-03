// Usage: node tools/scripts/rename-namespace.mjs <new-namespace>
// Example: node tools/scripts/rename-namespace.mjs my-new-namespace

import { exit } from 'process';
import fs from 'fs';
import path from 'path';
import {
  getArgs,
  redLog,
  greenLog,
  yellowLog,
  readJsonFile,
  writeJsonFile,
  listDirsRecursive,
  asyncForEach,
} from './utils.mjs';

const OLD_NAMESPACE = '@lit-protocol';
const args = getArgs();
const NEW_NAMESPACE = args[0];

if (!NEW_NAMESPACE) {
  redLog('New namespace is required. Usage: node tools/scripts/rename-namespace.mjs <new-namespace>');
  exit(1);
}

// Validate namespace format
if (!/^@?[a-z0-9-]+$/.test(NEW_NAMESPACE.replace('/', ''))) {
  redLog('Invalid namespace format. Must contain only lowercase letters, numbers, and hyphens.');
  exit(1);
}

// Add @ prefix if not provided
const newNamespace = NEW_NAMESPACE.startsWith('@') ? NEW_NAMESPACE : `@${NEW_NAMESPACE}`;

/**
 * Update package.json files
 * @param {string} packagePath Path to package.json
 */
async function updatePackageJson(packagePath) {
  const pkg = await readJsonFile(packagePath);
  let modified = false;

  // Update package name
  if (pkg.name && pkg.name.startsWith(OLD_NAMESPACE)) {
    pkg.name = pkg.name.replace(OLD_NAMESPACE, newNamespace);
    modified = true;
  }

  // Update dependencies
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies'];
  for (const depType of depTypes) {
    if (pkg[depType]) {
      const updatedDeps = {};
      for (const [dep, version] of Object.entries(pkg[depType])) {
        if (dep.startsWith(OLD_NAMESPACE)) {
          updatedDeps[dep.replace(OLD_NAMESPACE, newNamespace)] = version;
          modified = true;
        } else {
          updatedDeps[dep] = version;
        }
      }
      pkg[depType] = updatedDeps;
    }
  }

  if (modified) {
    await writeJsonFile(packagePath, pkg);
    greenLog(`Updated ${packagePath}`);
  }
}

/**
 * Update import statements in source files
 * @param {string} filePath Path to source file
 */
async function updateSourceFile(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  let modified = false;
  let updatedContent = content;

  // Simple string replacements
  const simplePatterns = [
    // ES Module imports/exports
    `from '${OLD_NAMESPACE}/`,
    `from "${OLD_NAMESPACE}/`,
    `export * from '${OLD_NAMESPACE}/`,
    `export * from "${OLD_NAMESPACE}/`,
    // CommonJS requires
    `require('${OLD_NAMESPACE}/`,
    `require("${OLD_NAMESPACE}/`,
    // Direct string references
    `'${OLD_NAMESPACE}/`,
    `"${OLD_NAMESPACE}/`,
    // Package references in strings
    `@lit-protocol/`,
    // Test-specific patterns
    `import { } from '${OLD_NAMESPACE}/`,
    `import { } from "${OLD_NAMESPACE}/`,
    `const { } = require('${OLD_NAMESPACE}/`,
    `const { } = require("${OLD_NAMESPACE}/`,
    // Package references in comments
    `* @package ${OLD_NAMESPACE}/`,
    `* @see ${OLD_NAMESPACE}/`,
  ];

  for (const pattern of simplePatterns) {
    if (updatedContent.includes(pattern)) {
      updatedContent = updatedContent.replaceAll(pattern, pattern.replace(OLD_NAMESPACE, newNamespace));
      modified = true;
    }
  }

  // Regex-based replacements for more complex patterns
  const regexPatterns = [
    // TypeScript type imports
    new RegExp(`import\\s+type\\s+{[^}]*}\\s+from\\s+['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
    // Named imports
    new RegExp(`import\\s+{[^}]*}\\s+from\\s+['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
    // Default imports
    new RegExp(`import\\s+[^{\\s]+\\s+from\\s+['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
    // Re-exports
    new RegExp(`export\\s+{[^}]*}\\s+from\\s+['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
    // Dynamic imports
    new RegExp(`import\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)\\)`, 'g'),
    // Jest/Test imports
    new RegExp(`jest\\.mock\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
    // Test-specific imports
    new RegExp(`import\\s+{[^}]*}\\s+from\\s+['"]local-tests/([^'"]*)['"](;?)`, 'g'),
    // Test assertions and expectations
    new RegExp(`expect\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)\\)`, 'g'),
    // Test mocks and spies
    new RegExp(`mock\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)\\)`, 'g'),
    new RegExp(`spyOn\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)\\)`, 'g'),
    // Test setup and configuration
    new RegExp(`setupTestFromEnv\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)\\)`, 'g'),
  ];

  for (const regex of regexPatterns) {
    const matches = updatedContent.match(regex);
    if (matches) {
      updatedContent = updatedContent.replace(regex, (match) => 
        match.replace(new RegExp(OLD_NAMESPACE, 'g'), newNamespace)
      );
      modified = true;
    }
  }

  if (modified) {
    await fs.promises.writeFile(filePath, updatedContent);
    greenLog(`Updated imports in ${filePath}`);
  } else {
    yellowLog(`No changes needed in ${filePath}`);
  }
  return modified;
}

async function updateDocFile(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf8');
  let modified = false;
  let updatedContent = content;

  // Replace package references in code blocks and text
  const patterns = [
    // Package installation examples
    new RegExp(`@lit-protocol/([a-zA-Z0-9-]+)`, 'g'),
    // URLs in markdown links
    new RegExp(`\\[([^\\]]*)\\]\\(https://(?:www\\.)?npmjs\\.com/package/@lit-protocol/([^)]+)\\)`, 'g'),
    // Badge URLs
    new RegExp(`https://img\\.shields\\.io/npm/v/@lit-protocol/([^"\\s]+)`, 'g'),
    // GitHub repository links
    new RegExp(`https://github\\.com/LIT-Protocol/js-sdk/tree/[^/]+/packages/([^)\\s]+)`, 'g'),
  ];

  // Replace all occurrences
  for (const pattern of patterns) {
    if (updatedContent.match(pattern)) {
      updatedContent = updatedContent.replace(pattern, (match) => 
        match.replace(/@lit-protocol/g, newNamespace)
      );
      modified = true;
    }
  }

  if (modified) {
    await fs.promises.writeFile(filePath, updatedContent);
    greenLog(`Updated documentation in ${filePath}`);
  } else {
    yellowLog(`No changes needed in ${filePath}`);
  }
  return modified;

  if (modified) {
    await fs.promises.writeFile(filePath, updatedContent);
    greenLog(`Updated imports in ${filePath}`);
  }
}

/**
 * Update TypeScript configuration
 * @param {string} configPath Path to tsconfig file
 */
async function updateTsConfig(configPath) {
  const config = await readJsonFile(configPath);
  let modified = false;

  if (config.compilerOptions?.paths) {
    const oldPath = `${OLD_NAMESPACE}/*`;
    if (config.compilerOptions.paths[oldPath]) {
      config.compilerOptions.paths[`${newNamespace}/*`] = config.compilerOptions.paths[oldPath];
      delete config.compilerOptions.paths[oldPath];
      modified = true;
    }
  }

  if (modified) {
    await writeJsonFile(configPath, config);
    greenLog(`Updated ${configPath}`);
  }
}

async function main() {
  try {
    // Update package.json files
    const packagesDir = path.resolve(process.cwd(), 'packages');
    const packageDirs = await listDirsRecursive(packagesDir, false);
    
    yellowLog('\nUpdating package.json files...');
    await updatePackageJson(path.resolve(process.cwd(), 'package.json')); // Root package.json
    await asyncForEach(packageDirs, async (dir) => {
      const packageJsonPath = path.join(dir, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        await updatePackageJson(packageJsonPath);
      }
    });

    // Update source files and documentation
    yellowLog('\nUpdating source files and documentation...');
    const dirsToCheck = [
      path.resolve(process.cwd(), 'src'),
      path.resolve(process.cwd(), 'lib'),
      path.resolve(process.cwd(), 'local-tests'),
      path.resolve(process.cwd(), 'tools'),
      path.resolve(process.cwd(), '.'),  // Root directory for README.md and other docs
      ...packageDirs.map(dir => path.join(dir, 'src')),
      ...packageDirs.map(dir => path.join(dir, 'lib')),
      ...packageDirs.map(dir => path.join(dir, 'test')),
      ...packageDirs.map(dir => path.join(dir, '__tests__')),
      ...packageDirs.map(dir => path.join(dir, '.')),  // Package root directories
    ];

    await asyncForEach(dirsToCheck, async (dir) => {
      if (fs.existsSync(dir)) {
        const files = await listDirsRecursive(dir);
        await asyncForEach(files, async (file) => {
          // Skip node_modules, .nx, and dist directories
          if (file.includes('node_modules') || file.includes('.nx') || file.includes('dist')) {
            return;
          }

          try {
            const stats = await fs.promises.stat(file);
            if (!stats.isDirectory()) {
              if (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.md') || file.endsWith('.json')) {
                if (file.endsWith('.json')) {
                  // Handle JSON files
                  const content = await fs.promises.readFile(file, 'utf8');
                  if (content.includes('@lit-protocol')) {
                    try {
                      const jsonContent = JSON.parse(content);
                      const updatedContent = JSON.stringify(jsonContent, null, 2).replace(
                        new RegExp('@lit-protocol', 'g'),
                        newNamespace
                      );
                      await fs.promises.writeFile(file, updatedContent);
                      greenLog(`Updated JSON file: ${file}`);
                    } catch (error) {
                      redLog(`Error processing JSON file ${file}: ${error.message}`);
                    }
                  }
                } else if (file.endsWith('.md')) {
                  await updateDocFile(file);
                  // Double-check for any missed references in code blocks
                  const content = await fs.promises.readFile(file, 'utf8');
                  if (content.includes('@lit-protocol')) {
                    await updateSourceFile(file);
                  }
                } else if (file.includes('local-tests')) {
                  // Handle test files with additional patterns
                  await updateSourceFile(file);
                  // Double-check local-tests specific patterns
                  const content = await fs.promises.readFile(file, 'utf8');
                  const testPatterns = [
                    // Basic imports and requires
                    new RegExp(`from\\s+['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`require\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)\\)`, 'g'),
                    // Test-specific patterns
                    new RegExp(`import\\s+type\\s+{[^}]*}\\s+from\\s+['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`jest\\.mock\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`describe\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`test\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`it\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    // Test utility functions
                    new RegExp(`setupTest\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`mockFunction\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                    new RegExp(`spyOn\\(['"]${OLD_NAMESPACE}/([^'"]*)['"](;?)`, 'g'),
                  ];
                  let modified = false;
                  let updatedContent = content;
                  
                  for (const pattern of testPatterns) {
                    if (updatedContent.match(pattern)) {
                      updatedContent = updatedContent.replace(pattern, (match) =>
                        match.replace(new RegExp(OLD_NAMESPACE, 'g'), newNamespace)
                      );
                      modified = true;
                    }
                  }
                  
                  if (modified) {
                    await fs.promises.writeFile(file, updatedContent);
                    greenLog(`Updated test imports in ${file}`);
                  }
                } else {
                  await updateSourceFile(file);
                }
              }
            }
          } catch (error) {
            redLog(`Error processing ${file}: ${error.message}`);
          }
        });
      }
    });

    // Update TypeScript configs
    yellowLog('\nUpdating TypeScript configurations...');
    const tsConfigPaths = [
      path.resolve(process.cwd(), 'tsconfig.json'),
      path.resolve(process.cwd(), 'tsconfig.base.json'),
    ];

    await asyncForEach(tsConfigPaths, async (configPath) => {
      if (fs.existsSync(configPath)) {
        await updateTsConfig(configPath);
      }
    });

    // Update build scripts
    yellowLog('\nUpdating build scripts...');
    const mapDepsScript = path.resolve(process.cwd(), 'tools/scripts/map-deps-to-dist.mjs');
    if (fs.existsSync(mapDepsScript)) {
      const content = await fs.promises.readFile(mapDepsScript, 'utf8');
      if (content.includes(OLD_NAMESPACE)) {
        const updated = content.replace(
          new RegExp(`${OLD_NAMESPACE}(['"\\s])`, 'g'),
          `${newNamespace}$1`
        );
        await fs.promises.writeFile(mapDepsScript, updated);
        greenLog(`Updated ${mapDepsScript}`);
      }
    }

    greenLog('\n✨ Namespace update complete!');
    yellowLog(`\nPlease review the changes and run 'yarn build:packages' to verify everything works correctly.`);
  } catch (error) {
    redLog(`\nError: ${error.message}`);
    exit(1);
  }
}

main();
