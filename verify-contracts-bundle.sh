#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
BUNDLE_DIR="$ROOT_DIR/tmp/bundle-test"
ESBUILD="$ROOT_DIR/node_modules/.bin/esbuild"

if [[ ! -x "$ESBUILD" ]]; then
  echo "esbuild not found at $ESBUILD; run yarn install first." >&2
  exit 1
fi

mkdir -p "$BUNDLE_DIR"

# Ensure entry files exist so the script is self-contained.
cat >"$BUNDLE_DIR/constants-entry.js" <<'JS'
const { NETWORK_CONTEXT_BY_NETWORK } = require('@lit-protocol/constants');

if (!NETWORK_CONTEXT_BY_NETWORK?.datil) {
  throw new Error('datil context missing');
}

console.log('datil contracts count:', NETWORK_CONTEXT_BY_NETWORK.datil.data.length);
JS

cat >"$BUNDLE_DIR/contracts-sdk-entry.js" <<'JS'
const { LitContracts } = require('@lit-protocol/contracts-sdk');

if (typeof LitContracts !== 'function') {
  throw new Error('LitContracts constructor not found');
}

console.log('LitContracts ready');
JS

echo "Bundling constants mapper (browser)..."
"$ESBUILD" "$BUNDLE_DIR/constants-entry.js" \
  --bundle \
  --platform=browser \
  --format=esm \
  --outfile="$BUNDLE_DIR/constants-bundle.js" \
  --metafile="$BUNDLE_DIR/constants-meta.json" \
  --log-level=info >/dev/null

echo "Bundling contracts SDK (node target for CJS)..."
"$ESBUILD" "$BUNDLE_DIR/contracts-sdk-entry.js" \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile="$BUNDLE_DIR/contracts-sdk-bundle.cjs" \
  --metafile="$BUNDLE_DIR/contracts-sdk-meta.json" \
  --log-level=info >/dev/null

summarise_meta () {
  local label="$1"
  local meta_path="$2"
  echo ""
  echo "$label"
  META_PATH="$meta_path" node - <<'NODE'
const path = require('path');
const metaPath = process.env.META_PATH;
const meta = require(metaPath);
const entries = Object.entries(meta.inputs)
  .filter(([p]) => p.includes(path.join('@lit-protocol', 'contracts')));

if (entries.length === 0) {
  console.log('  <no @lit-protocol/contracts files detected>');
  process.exit(0);
}

let total = 0;
for (const [file, info] of entries) {
  total += info.bytes;
  console.log(
    `  ${file} -> ${(info.bytes / 1024).toFixed(2)} KiB`
  );
}

console.log(
  `  Total -> ${(total / 1024 / 1024).toFixed(3)} MiB`
);
NODE
}

summarise_meta "Constants bundle includes:" "$BUNDLE_DIR/constants-meta.json"
summarise_meta "Contracts SDK bundle includes:" "$BUNDLE_DIR/contracts-sdk-meta.json"

echo ""
echo "Artifacts written to $BUNDLE_DIR"
