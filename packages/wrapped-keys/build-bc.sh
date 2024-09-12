#!/bin/bash

# This script is used to build the bundle for the BC
# Should be executed as part of the build process

set -e

cp -r ../../dist/packages/wrapped-keys ../../dist/packages/wrapped-keys-bc
yarn bundle
cp -r ../wrapped-keys/src/lib/generated/litActions ../../dist/packages/wrapped-keys-bc/src/lib/generated
sed -i 's/wrapped-keys/wrapped-keys-bc/' ../../dist/packages/wrapped-keys-bc/package.json
