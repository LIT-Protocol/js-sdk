#!/usr/bin/env node

/**
 * Dependency Checker Script
 * 
 * This script scans node_modules for missing dependencies that could cause
 * "Failed to resolve module specifier" errors in production builds.
 * 
 * Usage: node check-deps.js
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Scanning for missing dependencies...\n');

// Read current package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentDeps = {
  ...packageJson.dependencies || {},
  ...packageJson.devDependencies || {}
};

// Function to extract require/import statements
function extractDependencies(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const requireMatches = content.match(/require\(["']([^"']+)["']\)/g) || [];
    const importMatches = content.match(/import\s+.*?\s+from\s+["']([^"']+)["']/g) || [];
    
    const deps = new Set();
    
    // Extract require dependencies
    requireMatches.forEach(match => {
      const dep = match.match(/require\(["']([^"']+)["']\)/)[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        // Get package name (handle scoped packages)
        const packageName = dep.startsWith('@') 
          ? dep.split('/').slice(0, 2).join('/')
          : dep.split('/')[0];
        deps.add(packageName);
      }
    });
    
    // Extract import dependencies
    importMatches.forEach(match => {
      const dep = match.match(/from\s+["']([^"']+)["']/)[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        const packageName = dep.startsWith('@') 
          ? dep.split('/').slice(0, 2).join('/')
          : dep.split('/')[0];
        deps.add(packageName);
      }
    });
    
    return Array.from(deps);
  } catch (error) {
    return [];
  }
}

// Function to scan directory recursively
function scanDirectory(dir, extensions = ['.js', '.ts', '.tsx', '.jsx']) {
  const allDeps = new Set();
  
  function scanRecursive(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanRecursive(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          const deps = extractDependencies(fullPath);
          deps.forEach(dep => allDeps.add(dep));
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  scanRecursive(dir);
  return Array.from(allDeps);
}

// Scan specific directories for dependencies
const directories = [
  'node_modules/@lit-protocol',
  'src'
];

const allFoundDeps = new Set();

directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Scanning ${dir}...`);
    const deps = scanDirectory(dir);
    deps.forEach(dep => allFoundDeps.add(dep));
  }
});

// Filter out built-in Node.js modules and current dependencies
const builtInModules = new Set([
  'fs', 'path', 'crypto', 'stream', 'buffer', 'util', 'events', 'os', 'url',
  'http', 'https', 'querystring', 'zlib', 'worker_threads', 'fs/promises'
]);

const missingDeps = Array.from(allFoundDeps).filter(dep => 
  !currentDeps[dep] && 
  !builtInModules.has(dep) &&
  dep !== 'react' && // Common false positives
  dep !== 'node_modules'
);

console.log('\n📊 Results:');
console.log(`Total dependencies found: ${allFoundDeps.size}`);
console.log(`Missing dependencies: ${missingDeps.length}`);

if (missingDeps.length > 0) {
  console.log('\n❌ Missing Dependencies:');
  console.log('Add these to your package.json:\n');
  
  const suggestions = {};
  
  // Common version suggestions
  const versionMap = {
    'siwe': '^2.3.2',
    'siwe-recap': '^0.0.2-alpha.0',
    'jose': '^4.14.4',
    'ethers': '5.7.2',
    'viem': '^2.29.4',
    '@noble/curves': '^1.2.0',
    '@noble/hashes': '^1.3.0',
    'base64url': '^3.0.1',
    'cbor-web': '^9.0.2',
    'elysia': '^1.2.25',
    'tslib': '^2.3.0',
    'zod-validation-error': '^3.4.0',
    '@openagenda/verror': '^3.1.4',
    '@simplewebauthn/browser': '^7.2.0'
  };
  
  missingDeps.forEach(dep => {
    const version = versionMap[dep] || '^latest';
    suggestions[dep] = version;
    console.log(`  "${dep}": "${version}",`);
  });
  
  console.log('\n💡 Or run this command to install them all:');
  const installCmd = `pnpm add ${missingDeps.map(dep => `${dep}@${versionMap[dep] || 'latest'}`).join(' ')}`;
  console.log(`\n${installCmd}\n`);
  
} else {
  console.log('\n✅ All dependencies appear to be present!');
}

console.log('\n🔧 Current package.json dependencies:');
Object.keys(currentDeps).sort().forEach(dep => {
  console.log(`  ${dep}: ${currentDeps[dep]}`);
}); 
