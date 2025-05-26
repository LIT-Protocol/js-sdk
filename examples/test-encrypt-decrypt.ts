#!/usr/bin/env npx tsx

import { encryptDecryptFlow } from './src/encrypt-decrypt-flow.spec';

async function main() {
  try {
    await encryptDecryptFlow();
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 