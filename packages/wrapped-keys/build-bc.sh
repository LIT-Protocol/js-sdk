#!/bin/bash

# This script is used to build the bundle for the BC
# Should be executed as part of the build process

set -e

cp -r ../../dist/packages/wrapped-keys ../../dist/packages/wrapped-keys-bc
yarn bundle
cp -r ../wrapped-keys/src/lib/generated/litActions ../../dist/packages/wrapped-keys-bc/src/lib/generated

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  sed -i 's/wrapped-keys/wrapped-keys-bc/' ../../dist/packages/wrapped-keys-bc/package.json
elif [[ "$OSTYPE" == "darwin"* ]]; then
  # Mac OSX
  sed -i '' 's/wrapped-keys/wrapped-keys-bc/' ../../dist/packages/wrapped-keys-bc/package.json
elif [[ "$OSTYPE" == "cygwin" ]]; then
  # POSIX compatibility layer and Linux environment emulation for Windows
  sed -i 's/wrapped-keys/wrapped-keys-bc/' ../../dist/packages/wrapped-keys-bc/package.json
elif [[ "$OSTYPE" == "msys" ]]; then
  # Lightweight shell and GNU utilities compiled for Windows (part of MinGW)
  sed -i 's/wrapped-keys/wrapped-keys-bc/' ../../dist/packages/wrapped-keys-bc/package.json
elif [[ "$OSTYPE" == "win32" ]]; then
  # I'm not sure this can happen.
  echo "win32 detected, sed might not be supported in this environment."
elif [[ "$OSTYPE" == "freebsd"* ]]; then
  # FreeBSD
  echo "FreeBSD detected, sed -i might not be supported."
else
  # Unknown OS
  echo "Unknown operating system: $OSTYPE. sed -i might not be supported."
fi