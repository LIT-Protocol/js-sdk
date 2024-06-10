import fs from 'fs';
import * as pako from 'pako';

const WASM_MODULE_PATH = 'rust/pkg/wasm-internal_bg.wasm';
const WASM_BINDING_PATH = 'rust/pkg/wasm-internal.js';
const CHUNK_SIZE = 100;
const REMOVE_LINES = [
  `
    if (typeof input === 'undefined') {
        input = new URL('wasm-internal_bg.wasm', import.meta.url);
    }
`,
  `
    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }
`,
];

function main() {
  const wasmModule = fs.readFileSync(WASM_MODULE_PATH);
  const wasmBindingModule = fs.readFileSync(WASM_BINDING_PATH);

  let wasmModuleBuffer = Buffer.from(wasmModule);
  wasmModuleBuffer = pako.deflate(new Uint8Array(wasmModuleBuffer));
  const wasmModuleB64 = Buffer.from(wasmModuleBuffer).toString('base64');
  let buffer = `let moduleBuffer = "";`;
  for (let i = 0; i < wasmModuleB64.length; i += CHUNK_SIZE) {
    const chunk = wasmModuleB64.slice(i, i + CHUNK_SIZE);
    buffer += `\nmoduleBuffer += "${chunk}";`;
  }

  let bindingModuleString = `
// @ts-nocheck
import * as pako from 'pako';
  `;
  bindingModuleString += '\n';
  bindingModuleString += buffer;
  bindingModuleString += '\n';
  bindingModuleString += `
export function getModule() {
  let module = pako.inflate(new Uint8Array(Buffer.from(moduleBuffer, 'base64')));
  return Uint8Array.from(module);
}
`;

  bindingModuleString += wasmBindingModule;

  for (const removeItem of REMOVE_LINES) {
    const regex = new RegExp(
      removeItem.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'),
      'g'
    ); // Escape special characters

    bindingModuleString = bindingModuleString.replace(regex, '');
  }

  console.log('Writing wasm module');
  fs.writeFileSync(WASM_BINDING_PATH, bindingModuleString);
}

main();
