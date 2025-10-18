#!/usr/bin/env bash

# Quick sanity check for consumers of @lit-protocol/constants and contracts-sdk.
# We spin up two tiny entry points, bundle them with esbuild, and dump which
# @lit-protocol/contracts artifacts actually end up in the output. That makes it
# easy to see whether only the intended network blobs are being shipped.

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

# Modules that are Node-only; when bundling for browsers we treat them as
# externals so esbuild doesn't error on builtins like `crypto`.
BROWSER_EXTERNALS=(
  assert buffer child_process crypto fs http https module net os path stream
  timers tls tty url util zlib
)
BROWSER_EXTERNAL_ARGS=()
for mod in "${BROWSER_EXTERNALS[@]}"; do
  BROWSER_EXTERNAL_ARGS+=(--external:"$mod")
done

# Generate the constants entry: loads NETWORK_CONTEXT_BY_NETWORK so the mapper
# import path is exercised the same way a consuming app would.
cat >"$BUNDLE_DIR/constants-entry.js" <<'JS'
const { NETWORK_CONTEXT_BY_NETWORK } = require('@lit-protocol/constants');

if (!NETWORK_CONTEXT_BY_NETWORK?.datil) {
  throw new Error('datil context missing');
}

console.log('datil contracts count:', NETWORK_CONTEXT_BY_NETWORK.datil.data.length);
JS

# Generate the contracts SDK entry: touches LitContracts to mimic a typical SDK
# consumer without pulling in unrelated code.
cat >"$BUNDLE_DIR/contracts-sdk-entry.js" <<'JS'
const { LitContracts } = require('@lit-protocol/contracts-sdk');

if (typeof LitContracts !== 'function') {
  throw new Error('LitContracts constructor not found');
}

console.log('LitContracts ready');
JS

# Bundle both entries for browser + node targets so we catch regressions in
# either environment.
echo "⭐️ [Browser] Bundling @lit-protocol/constants mapper..."
"$ESBUILD" "$BUNDLE_DIR/constants-entry.js" \
  --bundle \
  --platform=browser \
  --format=esm \
  --outfile="$BUNDLE_DIR/constants-browser-bundle.js" \
  --metafile="$BUNDLE_DIR/constants-browser-meta.json" \
  "${BROWSER_EXTERNAL_ARGS[@]}" \
  --log-level=info >/dev/null

echo "⭐️ [CJS] Bundling @lit-protocol/constants mapper..."
"$ESBUILD" "$BUNDLE_DIR/constants-entry.js" \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile="$BUNDLE_DIR/constants-node-bundle.cjs" \
  --metafile="$BUNDLE_DIR/constants-node-meta.json" \
  --log-level=info >/dev/null

echo "⭐️ [Browser] Bundling @lit-protocol/contracts-sdk..."
"$ESBUILD" "$BUNDLE_DIR/contracts-sdk-entry.js" \
  --bundle \
  --platform=browser \
  --format=esm \
  --outfile="$BUNDLE_DIR/contracts-sdk-browser-bundle.js" \
  --metafile="$BUNDLE_DIR/contracts-sdk-browser-meta.json" \
  "${BROWSER_EXTERNAL_ARGS[@]}" \
  --log-level=info >/dev/null

echo "⭐️ [CJS] Bundling @lit-protocol/contracts-sdk..."
"$ESBUILD" "$BUNDLE_DIR/contracts-sdk-entry.js" \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile="$BUNDLE_DIR/contracts-sdk-node-bundle.cjs" \
  --metafile="$BUNDLE_DIR/contracts-sdk-node-meta.json" \
  --log-level=info >/dev/null

# Pretty-print the relevant portion of esbuild's metafile so it's obvious which
# contract blobs made it into the bundle and their combined size.
summarise_meta () {
  local label="$1"
  local meta_path="$2"
  local indent="${3:-}"
  echo ""
  echo "${indent}${label}"
  echo "${indent}  (Every line below lists a bundled @lit-protocol/contracts file and its raw size)"
  META_PATH="$meta_path" INDENT="$indent" node - <<'NODE'
const path = require('path');
const metaPath = process.env.META_PATH;
const meta = require(metaPath);
const indent = process.env.INDENT || '';
const entries = Object.entries(meta.inputs)
  .filter(([p]) => p.includes(path.join('@lit-protocol', 'contracts')));

if (entries.length === 0) {
  console.log(`${indent}  <no @lit-protocol/contracts files detected>`);
  process.exit(0);
}

let total = 0;
for (const [file, info] of entries) {
  total += info.bytes;
  console.log(`${indent}  ${file} -> ${(info.bytes / 1024).toFixed(2)} KiB`);
}

console.log(`${indent}  Total -> ${(total / 1024 / 1024).toFixed(3)} MiB`);
NODE
  echo "${indent}  (Total reflects the sum of those files before compression/minification)"
}

summarise_package () {
  local package_label="$1"
  local browser_meta="$2"
  local node_meta="$3"

  echo ""
  echo "⭐️ ${package_label} bundles:"
  summarise_meta "Browser includes:" "$browser_meta" "  "
  summarise_meta "Node includes:" "$node_meta" "  "
}

summarise_package "@lit-protocol/constants" \
  "$BUNDLE_DIR/constants-browser-meta.json" \
  "$BUNDLE_DIR/constants-node-meta.json"

summarise_package "@lit-protocol/contracts-sdk" \
  "$BUNDLE_DIR/contracts-sdk-browser-meta.json" \
  "$BUNDLE_DIR/contracts-sdk-node-meta.json"

echo ""
echo "Artifacts written to $BUNDLE_DIR"
